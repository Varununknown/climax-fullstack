import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Share, Heart, Download } from 'lucide-react';
import API from '../services/api';
import { Content } from '../types';
import QuizSystem from '../components/common/QuizSystem';

/*
  High-fidelity OTT-style Content Details Page
  - Matches screenshots: large poster, pill 'Watch First Episode', meta row, tabs, season list
  - Keeps navigation to `/watch/:id` untouched
  - Lightweight placeholders for cast/gallery/videos
*/

export const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synopsis'|'cast'|'videos'>('synopsis');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchContent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await API.get(`/contents/${id}`);
        if (!mounted) return;
        setContent(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load content');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchContent();
    return () => { mounted = false; };
  }, [id]);

  const handleWatch = () => {
    // Important: navigate to watch page which uses existing VideoPlayer component
    navigate(`/watch/${id}`);
  };

  const handleParticipate = () => {
    // Navigate to Participate page with debug mode to see API response
    navigate(`/participate/${id}?debug=true`);
  };

  const handleShare = async () => {
    if (navigator.share && content) {
      try { await navigator.share({ title: content.title, text: content.description, url: window.location.href }); }
      catch (e) { /* ignore */ }
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(()=>{});
      alert('Link copied to clipboard');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <div>Loading content...</div>
      </div>
    </div>
  );

  if (error || !content) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-semibold mb-3">Content unavailable</h2>
        <p className="text-gray-400 mb-6">{error || 'Not found'}</p>
        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 px-4 py-2 rounded-lg font-medium transition-all">Go Home</button>
      </div>
    </div>
  );

  const durationText = (() => {
    const mins = Math.round((content.duration || 90));
    const h = Math.floor(mins/60); const m = mins%60;
    return h>0? `${h} hr ${m} min` : `${m} min`;
  })();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Amazon Prime Style Header - Text Always Visible, Background Appears on Scroll */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/90 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text font-bold text-2xl sm:text-3xl tracking-widest font-mono">CLIMAX</div>
            </div>
            <nav className="hidden md:flex space-x-6 lg:space-x-8 text-sm lg:text-base">
              <a href="/" className="text-white/90 hover:text-white transition-colors font-medium">Home</a>
              <a href="/" className="text-white/90 hover:text-white transition-colors font-medium">Movies</a>
              <a href="/" className="text-white/90 hover:text-white transition-colors font-medium">TV Shows</a>
              <a href="/" className="text-white/90 hover:text-white transition-colors font-medium">Live TV</a>
              <span className="text-white/40">|</span>
              <a href="/" className="text-white/90 hover:text-white transition-colors font-medium">Subscriptions</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-gray-900 via-purple-700 to-gray-800 hover:from-gray-800 hover:via-purple-600 hover:to-gray-700 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-base font-medium transition-all shadow-lg border border-purple-500/30 whitespace-nowrap">
              Join Climax
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="fixed top-16 left-6 z-50">
        <button onClick={() => navigate('/')} className="bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md hover:from-gray-900/80 hover:to-black/80 text-white p-3 rounded-full shadow-lg transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Top Poster */}
      <div className="relative">
        <div className="h-64 sm:h-72 md:h-96 lg:h-[420px] bg-cover bg-center" style={{backgroundImage:`linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.95)), url(${content.thumbnail})`}}/>
      </div>

      {/* Content Section - Below Background */}
      <div className="relative -mt-20 sm:-mt-32 md:-mt-40 lg:-mt-48 z-10 pt-2 sm:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6 pb-4 sm:pb-6">
          <img src={content.thumbnail} alt={content.title} className="w-32 sm:w-36 md:w-48 lg:w-56 rounded-lg shadow-2xl object-cover flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{content.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 mt-2 mb-3">
              <span className="px-2 py-1 bg-gray-800 rounded text-xs">{new Date().getFullYear()}</span>
              <span className="bg-gray-800 px-2 py-1 rounded text-xs">UA 16+</span>
              <span className="text-xs">{durationText}</span>
              <span className="hidden sm:inline text-xs">{content.genre?.slice(0,3).join(' • ')}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onClick={handleWatch} className="bg-gradient-to-r from-black/90 via-slate-200/80 to-white/90 backdrop-blur-lg text-black rounded-full py-2 sm:py-3 px-3 sm:px-6 flex items-center gap-2 sm:gap-3 shadow-lg hover:from-white hover:via-slate-100 hover:to-white hover:scale-[1.01] transition-all border border-white/20 text-xs sm:text-base">
                <Play size={16} className="sm:size-5" />
                <span className="font-semibold">Watch Now</span>
              </button>

              <button onClick={handleShare} className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all">
                <Share size={16} className="sm:size-5" />
              </button>

              <button className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all">
                <Plus size={16} className="sm:size-5" />
              </button>
            </div>

            <p className="text-gray-300 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed hidden sm:block">{content.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        <div className="border-b border-gray-800">
          <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto">
            {['synopsis','cast','videos'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 pb-4 whitespace-nowrap transition-all ${activeTab===tab? 'text-white border-b-2 border-purple-500':'text-gray-400 hover:text-white'}`}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          {activeTab === 'synopsis' && (
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-gray-300 leading-relaxed mb-6">{content.description}</p>
                
                <div className="border-t border-gray-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">More Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Genre:</span>
                      <span className="ml-2 text-white">{content.genre?.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="ml-2 text-white">{durationText}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rating:</span>
                      <span className="ml-2 text-white">UA 16+</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Year:</span>
                      <span className="ml-2 text-white">{new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Section - Right Side */}
              <div className="w-full lg:w-96 mt-4 lg:mt-0 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Events</h3>
                <div className="space-y-2 sm:space-y-3">
                  {/* Example episode row - in your real data you would map episodes */}
                  <div className="bg-gray-900/60 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-16 sm:w-20 h-10 sm:h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        <img src={content.thumbnail} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm truncate">Event 1 · Skeletons in the Closet</div>
                        <div className="text-xs text-gray-400">10 Oct 2025 · 42m</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleParticipate} className="flex-1 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-400 hover:to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg">
                        Participate Now
                      </button>
                      <button onClick={handleShare} className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 rounded-lg transition-all">
                        <Share size={16} className="sm:size-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/60 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-16 sm:w-20 h-10 sm:h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        <img src={content.thumbnail} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs sm:text-sm truncate">Event 2 · Mystery Unfolds</div>
                        <div className="text-xs text-gray-400">12 Oct 2025 · 38m</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleParticipate} className="flex-1 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-400 hover:to-pink-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg">
                        Participate Now
                      </button>
                      <button onClick={handleShare} className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 rounded-lg transition-all">
                        <Share size={16} className="sm:size-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Cast & Crew</h2>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-20 sm:w-28 text-center flex-shrink-0">
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full overflow-hidden mx-auto mb-2">
                      <img src={content.thumbnail} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs sm:text-sm">Actor {i}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded overflow-hidden bg-gray-900/60">
                  <img src={content.thumbnail} className="w-full h-32 sm:h-44 object-cover" />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Official Trailer</div>
                      <div className="text-xs text-gray-400">2:30</div>
                    </div>
                    <button className="p-2 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-black rounded-lg transition-all shadow-lg"><Play size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NEW INDEPENDENT QUIZ SYSTEM */}
          <div className="mt-8">
            <QuizSystem contentId={content._id} contentTitle={content.title} />
          </div>

        </div>
      </div>
    </div>
  );
};