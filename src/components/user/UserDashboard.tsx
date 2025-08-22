import React, { useState } from 'react';
import { Header } from '../common/Header';
import { ContentGrid } from './ContentGrid';
import { CategoryFilter } from './CategoryFilter';
import { HeroSection } from './HeroSection';
import { useContent } from '../../context/ContentContext';
import BottomNav from './BottomNav';
import ProfilePage from './ProfilePage'; // relative to components/user

export const UserDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { contents, categories } = useContent();

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage('browse');
  };

  // Handle page navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'home') setSearchQuery(''); // ✅ Reset search when navigating home
  };

  // Filter content based on search and current page
  const getFilteredContent = () => {
    let filtered = contents;

    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (currentPage === 'movies') filtered = filtered.filter(c => c.type === 'movie');
    else if (currentPage === 'series') filtered = filtered.filter(c => c.type === 'series');
    else if (currentPage === 'shows') filtered = filtered.filter(c => c.type === 'show');
    else if (selectedCategory !== 'all') filtered = filtered.filter(c => c.category === selectedCategory);

    return filtered;
  };

  // Determine page title
  const getPageTitle = () => {
    if (searchQuery && currentPage === 'search') return `Search Results for "${searchQuery}"`;
    switch (currentPage) {
      case 'movies': return 'Movies';
      case 'series': return 'TV Shows';
      case 'shows': return 'Shows';
      case 'browse': return selectedCategory === 'all' ? 'Browse All' : selectedCategory;
      default: return 'Popular Content';
    }
  };

  // Categorize content for home sections
  const primeContent = contents.filter(c => c.premiumPrice === 0);
  const rentContent = contents.filter(c => c.premiumPrice > 0);
  const actionContent = contents.filter(c => c.genre.includes('Action'));
  const dramaContent = contents.filter(c => c.genre.includes('Drama'));

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        onSearch={handleSearch}
        currentPage={currentPage}
        onNavigate={handleNavigate} // updated
      />

      {currentPage === 'home' && !searchQuery && <HeroSection />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {(currentPage !== 'home' || searchQuery) && currentPage !== 'profile' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">{getPageTitle()}</h1>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              showAll={currentPage === 'browse' || currentPage === 'search'}
            />
          </div>
        )}

        {currentPage === 'profile' ? (
          <ProfilePage />  // ✅ Render ProfilePage here
        ) : currentPage === 'home' && !searchQuery ? (
          <div className="space-y-8">
            <ContentGrid contents={contents.slice(0, 8)} title="Continue watching" layout="horizontal" cardSize="large" />
            <ContentGrid contents={primeContent} title="Free - Included with Prime" layout="horizontal" cardSize="large" showAll={() => setCurrentPage('movies')} />
            <ContentGrid contents={rentContent} title="Rent or buy" layout="horizontal" cardSize="large" showAll={() => handleCategorySelect('Action')} />
            {/*
            <ContentGrid contents={actionContent} title="Action movies" layout="horizontal" cardSize="large" showAll={() => handleCategorySelect('Action')} />
            <ContentGrid contents={dramaContent} title="Drama series" layout="horizontal" cardSize="large" showAll={() => handleCategorySelect('Drama')} />  
            */}
            <ContentGrid contents={contents.filter(c => c.type === 'movie')} title="Movies we think you'll like" layout="horizontal" cardSize="large" showAll={() => setCurrentPage('movies')} />
            <ContentGrid contents={contents.filter(c => c.type === 'series')} title="TV shows we think you'll like" layout="horizontal" cardSize="large" showAll={() => setCurrentPage('series')} />
          </div>
        ) : (
          <ContentGrid contents={getFilteredContent()} layout="grid" cardSize="large" showCategories={currentPage === 'home'} />
        )}
      </main>

      <BottomNav
        currentPage={currentPage}
        onNavigate={handleNavigate} // updated
        onSearch={handleSearch}
      />
    </div>
  );
};

export default UserDashboard;
