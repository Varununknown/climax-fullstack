import React, { useState, useEffect } from 'react';
import { Header } from '../common/Header';
import { ContentGrid } from './ContentGrid';
import { CategoryFilter } from './CategoryFilter';
import { HeroSection } from './HeroSection';
import { useContent } from '../../context/ContentContext';
import BottomNav from './BottomNav';
import ProfilePage from './ProfilePage'; // relative to components/user
import API from '../../services/api';

export const UserDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [banners, setBanners] = useState<any[]>([]);
  const [exploreEnabled, setExploreEnabled] = useState(true);

  const { contents, categories } = useContent();

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await API.get('/settings');
        setExploreEnabled(response.data?.exploreEnabled ?? true);
      } catch (error) {
        console.warn('⚠️  Could not fetch settings:', error);
        // Default to true if fetch fails
        setExploreEnabled(true);
      }
    };
    fetchSettings();
  }, []);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await API.get('/banners');
        if (response.data && Array.isArray(response.data)) {
          setBanners(response.data);
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch banners:', error);
        // Silently fail - app will work without banners
      }
    };
    fetchBanners();
  }, []);

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
    else if (selectedCategory === 'latest') {
      // Latest Releases: Full-length movies with video URLs added recently
      filtered = filtered.filter(c => c.type === 'movie' && c.videoUrl);
    }
    else if (selectedCategory === 'upcoming') {
      // Upcoming movies: Content without video URLs (thumbnail only)
      filtered = filtered.filter(c => c.type === 'movie' && !c.videoUrl);
    }
    else if (['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'].includes(selectedCategory)) {
      // Language filter
      filtered = filtered.filter(c => c.language === selectedCategory || c.genre.includes(selectedCategory));
    }
    else if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    return filtered;
  };

  // Determine page title
  const getPageTitle = () => {
    if (searchQuery && currentPage === 'search') return `Search Results for "${searchQuery}"`;
    switch (currentPage) {
      case 'movies': return 'Movies';
      case 'series': return 'TV Shows';
      case 'shows': return 'Shows';
      case 'browse': 
        if (selectedCategory === 'latest') return 'Latest Releases';
        if (selectedCategory === 'upcoming') return 'Upcoming Movies';
        if (['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'].includes(selectedCategory)) {
          return `${selectedCategory} Content`;
        }
        return selectedCategory === 'all' ? 'Browse All' : selectedCategory;
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
            {/* EXPLORE Section - Conditional Rendering */}
            {exploreEnabled && (
            <div>
              <div className="flex items-center justify-center mb-4 md:mb-8">
                <div className="flex-1 h-px bg-gray-600 max-w-32"></div>
                <h2 className="text-gray-400 font-light text-sm md:text-lg mx-4 md:mx-6 tracking-widest">EXPLORE</h2>
                <div className="flex-1 h-px bg-gray-600 max-w-32"></div>
              </div>
              
              {banners.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-12">
                  {banners.map((banner) => (
                    <div 
                      key={banner._id}
                      onClick={() => {
                        if (banner.link) {
                          window.location.href = banner.link;
                        }
                      }}
                      className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 rounded-xl p-3 md:p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group shadow-lg relative overflow-hidden"
                    >
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-50 group-hover:opacity-70 transition-opacity duration-200" 
                      />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-white text-sm md:text-xl font-semibold mb-1">{banner.title}</h3>
                          {banner.description && (
                            <p className="text-gray-300 text-xs md:text-sm">{banner.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:gap-6 mb-8 md:mb-12">
                  {/* Empty state - show nothing or placeholder */}
                </div>
              )}
            </div>
            )}

            {/* Enjoy in Your Own Language Section */}
            <div>
              <div className="flex items-center justify-center mb-4 md:mb-8">
                <div className="flex-1 h-px bg-gray-600 max-w-32"></div>
                <h2 className="text-gray-400 font-light text-xs md:text-lg mx-3 md:mx-6 tracking-widest">ENJOY IN YOUR OWN LANGUAGE</h2>
                <div className="flex-1 h-px bg-gray-600 max-w-32"></div>
              </div>
              
              <div className="overflow-x-auto scrollbar-hide mb-6">
                <div className="flex gap-2 md:gap-3 pb-2 min-w-max">
                  {['Kannada', 'Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'].map((language) => (
                    <button
                      key={language}
                      onClick={() => handleCategorySelect(language)}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gray-800/40 to-gray-700/40 border border-gray-600/30 text-gray-300 rounded-lg text-xs md:text-sm hover:border-gray-400/50 hover:text-white hover:from-gray-700/50 hover:to-gray-600/50 transition-colors duration-150 whitespace-nowrap shadow-sm"
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
              
              <ContentGrid 
                contents={contents.filter(c => c.type === 'movie').slice(0, 6)} 
                title="" 
                layout="horizontal" 
                cardSize="large" 
                showAll={() => setCurrentPage('movies')} 
              />
            </div>

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

      {/* Performance Optimization */}
      <style>{`
        * {
          scroll-behavior: smooth;
        }
        body, html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
