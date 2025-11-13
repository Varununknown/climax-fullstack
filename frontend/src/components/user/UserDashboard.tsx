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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
                  {banners.map((banner) => (
                    <div 
                      key={banner._id}
                      onClick={() => {
                        if (banner.link) {
                          window.location.href = banner.link;
                        }
                      }}
                      className="relative overflow-hidden rounded-xl cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-40 sm:h-48 md:h-56"
                    >
                      {/* Background Image */}
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                      
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* Content - Bottom */}
                      <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-6 z-10">
                        <h3 className="text-white text-sm sm:text-base md:text-lg font-bold mb-1 line-clamp-2">{banner.title}</h3>
                        {banner.description && (
                          <p className="text-gray-200 text-xs sm:text-sm md:text-base line-clamp-2 opacity-90">{banner.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-blue-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Tap to explore</span>
                          <span>→</span>
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
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-md border border-gray-600/30 text-gray-300 rounded-lg text-xs md:text-sm hover:border-gray-400/50 hover:text-white hover:from-gray-700/50 hover:to-gray-600/50 transition-all whitespace-nowrap shadow-lg"
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
    </div>
  );
};

export default UserDashboard;
