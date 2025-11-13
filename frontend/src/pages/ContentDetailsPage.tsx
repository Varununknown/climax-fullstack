import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Share, X } from 'lucide-react';
import API from '../services/api';
import { Content } from '../types';

/*
  High-fidelity OTT-style Content Details Page
  - Matches screenshots: large poster, pill 'Watch First Episode', meta row, tabs, season list
  - Keeps navigation to `/watch/:id` untouched
  - Lightweight placeholders for cast/gallery/videos
  - Quiz is accessible via "Participate Now" button only
*/

export const ContentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'synopsis' | 'videos'>('synopsis');
  const [scrolled, setScrolled] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

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
    // Navigate to new Quiz page with the new quiz system
    navigate(`/quiz/${id}`);
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
            <button onClick={() => setShowJoinModal(true)} className="bg-gradient-to-r from-gray-900 via-purple-700 to-gray-800 hover:from-gray-800 hover:via-purple-600 hover:to-gray-700 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-base font-medium transition-all shadow-lg border border-purple-500/30 whitespace-nowrap">
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6 pb-4 sm:pb-6">
            <img src={content.thumbnail} alt={content.title} className="w-32 sm:w-36 md:w-48 lg:w-56 rounded-lg shadow-2xl object-cover flex-shrink-0" />

            <div className="flex-1 min-w-0">
              {/* Title with Watch Now beside it */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight flex-1">{content.title}</h1>
                {/* Watch Now Button - Professional Disney/Amazon style */}
                <button onClick={handleWatch} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-400 text-white rounded-lg py-3 px-6 sm:px-8 flex items-center justify-center sm:justify-start gap-2 shadow-lg hover:shadow-blue-600/50 font-bold text-sm sm:text-base transition-all transform hover:scale-105 border border-blue-400/30 hover:border-blue-300/50">
                  <Play size={18} />
                  <span>Watch Now</span>
                </button>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 mb-4">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs">{new Date().getFullYear()}</span>
                <span className="bg-gray-800 px-2 py-1 rounded text-xs">UA 16+</span>
                <span className="text-xs">{durationText}</span>
                <span className="hidden sm:inline text-xs">{content.genre?.slice(0,3).join(' • ')}</span>
              </div>

              {/* Share and Plus buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button onClick={handleShare} className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all transform hover:scale-110">
                  <Share size={16} className="sm:size-5" />
                </button>

                <button className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all transform hover:scale-110">
                  <Plus size={16} className="sm:size-5" />
                </button>
              </div>

              <p className="text-gray-300 mt-4 text-sm sm:text-base leading-relaxed hidden sm:block">{content.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="mx-auto px-4 sm:px-6 py-6 max-w-5xl">
        <div className="border-b border-gray-800">
          <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto">
            {['synopsis', 'videos'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 pb-4 whitespace-nowrap transition-all ${activeTab===tab? 'text-white border-b-2 border-purple-500':'text-gray-400 hover:text-white'}`}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          {activeTab === 'synopsis' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">More Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-900/40 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase font-semibold">Genre</span>
                  <p className="text-white text-sm sm:text-base mt-1">{content.genre?.join(', ')}</p>
                </div>
                <div className="bg-gray-900/40 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase font-semibold">Duration</span>
                  <p className="text-white text-sm sm:text-base mt-1">{durationText}</p>
                </div>
                <div className="bg-gray-900/40 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase font-semibold">Rating</span>
                  <p className="text-white text-sm sm:text-base mt-1">UA 16+</p>
                </div>
                <div className="bg-gray-900/40 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase font-semibold">Year</span>
                  <p className="text-white text-sm sm:text-base mt-1">{new Date().getFullYear()}</p>
                </div>
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

        </div>
      </div>

      {/* Events Section - Single Event Card with Participate Button */}
      <div className="mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Live Events</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-400/60 transition-all">
            <div className="flex flex-col sm:flex-row">
              <img src={content.thumbnail} alt="Live Event" className="w-full sm:w-48 h-32 sm:h-40 object-cover" />
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Fan Fest</h3>
                  <p className="text-gray-300 text-sm sm:text-base mb-3">Join us for an exclusive live event with the cast and crew</p>
                  <div className="flex gap-3 text-xs sm:text-sm text-gray-400">
                    <span>📅 Today at 8:00 PM</span>
                    <span>👥 2.5K Watching</span>
                  </div>
                </div>
                <button onClick={handleParticipate} className="mt-4 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-400 hover:to-pink-500 text-white rounded-lg py-2 px-4 font-semibold shadow-lg hover:scale-[1.02] transition-all border border-orange-400/30 w-full sm:w-auto text-center">
                  Participate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Climax Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-purple-900/20 to-slate-900 border-b border-purple-500/20 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Unlock the Climax</h2>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Business Logic Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  🎬 The Climax Stamp
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  When your curiosity peaks and you're ready to unlock the most exciting content, our exclusive <span className="font-semibold text-purple-300">Climax Stamp</span> system activates payment for premium viewing. Only when it gets exciting do you pay—not for standard details.
                </p>
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-gray-200 text-sm">
                    <span className="font-semibold text-purple-300">How it works:</span> Watch standard content for free. When you want the premium experience, your curiosity triggers the payment gateway, unlocking exclusive excitement.
                  </p>
                </div>
              </div>

              {/* Promotional Images Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Exclusive Offers</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                  {/* Image 1 - Logo 3 */}
                  <div className="rounded-lg overflow-hidden border border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
                    <img 
                      src="/logo3.jpg" 
                      alt="Unlock Climax for just ₹2" 
                      className="w-full h-auto object-cover aspect-square"
                      onError={(e) => { e.currentTarget.src = '/images/logo3.jpg'; }}
                    />
                    <div className="bg-slate-900/60 p-2 sm:p-3 backdrop-blur-sm">
                      <p className="text-cyan-300 text-xs sm:text-sm font-semibold text-center">UNLOCK FOR ₹2</p>
                    </div>
                  </div>

                  {/* Image 2 - Logo 5 */}
                  <div className="rounded-lg overflow-hidden border border-orange-500/30 hover:border-orange-500/60 transition-all hover:shadow-lg hover:shadow-orange-500/20">
                    <img 
                      src="/logo5.jpg" 
                      alt="Only pay when it gets exciting" 
                      className="w-full h-auto object-cover aspect-square"
                      onError={(e) => { e.currentTarget.src = '/images/logo5.jpg'; }}
                    />
                    <div className="bg-slate-900/60 p-2 sm:p-3 backdrop-blur-sm">
                      <p className="text-orange-300 text-xs sm:text-sm font-semibold text-center">PAY WHEN EXCITING</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-lg p-6 mb-6">
                <h4 className="text-white font-semibold mb-3">Ready to Join?</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Get premium access to exclusive content and unlock the full Climax experience.
                </p>
                <button onClick={() => { setShowJoinModal(false); handleWatch(); }} className="w-full bg-gradient-to-r from-black via-purple-600 to-white hover:from-gray-900 hover:via-purple-500 hover:to-gray-100 text-white hover:text-black font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
                  Join Climax Now
                </button>
              </div>

              {/* Close Button */}
              <button onClick={() => setShowJoinModal(false)} className="w-full bg-slate-800/50 hover:bg-slate-700/50 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-all font-medium">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};