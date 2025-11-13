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
  const [showClimaxModal, setShowClimaxModal] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile Layout: Image + Button side by side */}
          <div className="flex flex-col gap-4">
            {/* Image and Content Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-6 pb-4 sm:pb-6">
              {/* Image */}
              <img src={content.thumbnail} alt={content.title} className="w-32 sm:w-36 md:w-48 rounded-lg shadow-2xl object-cover flex-shrink-0" />

              {/* Content and Button */}
              <div className="flex-1 min-w-0 w-full">
                {/* Title */}
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight mb-2">{content.title}</h1>

                {/* Description - Right below Title */}
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-3">{content.description}</p>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-300 mb-3">
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">{new Date().getFullYear()}</span>
                  <span className="bg-gray-800 px-2 py-1 rounded text-xs">UA 16+</span>
                  <span className="text-xs">{durationText}</span>
                  <span className="hidden sm:inline text-xs">{content.genre?.slice(0,2).join(' • ')}</span>
                </div>

                {/* Watch Now Button - Side by side on mobile, stacked on desktop */}
                <div className="flex flex-row sm:flex-col gap-2 mb-2">
                  <button onClick={handleWatch} className="flex-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white rounded-lg py-2 px-2 sm:px-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 font-semibold text-xs sm:text-sm transition-all transform hover:scale-105 border border-red-400/30 hover:border-red-300/50">
                    <Play size={16} />
                    <span>Watch Now</span>
                  </button>

                  {/* Climax Button - Same style as Join Climax header button */}
                  <button onClick={() => setShowClimaxModal(true)} className="flex-1 bg-gradient-to-r from-gray-900/30 via-purple-700/30 to-gray-800/30 backdrop-blur-md hover:from-gray-800/40 hover:via-purple-600/40 hover:to-gray-700/40 text-white rounded-lg py-3 px-2 sm:px-4 flex items-center justify-center gap-1 shadow-lg hover:shadow-purple-500/50 font-semibold text-xs sm:text-sm transition-all transform hover:scale-105 border border-purple-500/30 hover:border-purple-400/50">
                    <span>⚡ Climax</span>
                  </button>
                </div>

                {/* Share and Plus buttons - Inline */}
                <div className="flex gap-2">
                  <button onClick={handleShare} className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 text-xs">
                    <Share size={14} />
                  </button>

                  <button className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110 text-xs">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-gray-800">
            <nav className="flex gap-4 sm:gap-6 text-sm overflow-x-auto">
              {['synopsis', 'videos'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 pb-4 whitespace-nowrap transition-all ${activeTab===tab? 'text-white border-b-2 border-red-500':'text-gray-400 hover:text-white'}`}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="pt-4">
            {activeTab === 'synopsis' && (
              <div>
                <h3 className="text-base font-semibold mb-3">More Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Genre</span>
                    <p className="text-white text-xs sm:text-sm mt-1">{content.genre?.join(', ')}</p>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Duration</span>
                    <p className="text-white text-xs sm:text-sm mt-1">{durationText}</p>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Rating</span>
                    <p className="text-white text-xs sm:text-sm mt-1">UA 16+</p>
                  </div>
                  <div className="bg-gray-900/40 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase font-semibold">Year</span>
                    <p className="text-white text-xs sm:text-sm mt-1">{new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div>
                <h2 className="text-base sm:text-lg font-semibold mb-4">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded overflow-hidden bg-gray-900/60">
                    <img src={content.thumbnail} className="w-full h-32 sm:h-40 object-cover" />
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-xs sm:text-sm">Official Trailer</div>
                        <div className="text-xs text-gray-400">2:30</div>
                      </div>
                      <button className="p-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-all"><Play size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Events Section - Moved to bottom */}
      <div className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Live Events</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg overflow-hidden border border-purple-500/30 hover:border-purple-400/60 transition-all">
              <div className="flex flex-col sm:flex-row">
                <img src={content.thumbnail} alt="Live Event" className="w-full sm:w-40 h-32 sm:h-40 object-cover" />
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Fan Fest</h3>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2">Join us for an exclusive live event with the cast and crew</p>
                    <div className="flex gap-3 text-xs sm:text-sm text-gray-400">
                      <span>📅 Today at 8:00 PM</span>
                      <span>👥 2.5K Watching</span>
                    </div>
                  </div>
                  <button onClick={handleParticipate} className="mt-3 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 hover:from-orange-500 hover:via-red-400 hover:to-pink-500 text-white rounded-lg py-2 px-4 font-semibold shadow-lg hover:scale-[1.02] transition-all border border-orange-400/30 w-full sm:w-auto text-center text-xs sm:text-sm">
                    Participate Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Climax Modal */}
      {showClimaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-950 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/50 shadow-2xl shadow-purple-500/20">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900/80 via-pink-900/40 to-purple-900/80 border-b border-purple-500/30 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">⚡ The Climax Moment</h2>
              <button onClick={() => setShowClimaxModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Logo Display */}
              <div className="rounded-lg overflow-hidden border border-purple-500/30 bg-black/40 p-2">
                <img 
                  src="/logo4.jpg" 
                  alt="Climax Moment" 
                  className="w-full h-auto object-cover rounded"
                  onError={(e) => { e.currentTarget.src = '/images/logo4.jpg'; }}
                />
              </div>

              {/* Payment Trigger Timestamp */}
              {content?.paymentTriggerTimestamp && (
                <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-red-400 text-sm font-semibold">⏱️ Payment Triggers At</span>
                  </div>
                  <p className="text-white font-bold text-lg">{Math.floor(content.paymentTriggerTimestamp / 60)}:{String(Math.floor(content.paymentTriggerTimestamp % 60)).padStart(2, '0')}</p>
                </div>
              )}

              {/* Content Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-xs uppercase font-semibold mb-1">📺 Genre</p>
                  <p className="text-white text-sm font-medium">{content?.genre?.slice(0,2).join(', ')}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-300 text-xs uppercase font-semibold mb-1">⏱️ Duration</p>
                  <p className="text-white text-sm font-medium">{durationText}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-xs uppercase font-semibold mb-1">📅 Year</p>
                  <p className="text-white text-sm font-medium">{new Date().getFullYear()}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-xs uppercase font-semibold mb-1">⭐ Rating</p>
                  <p className="text-white text-sm font-medium">UA 16+</p>
                </div>
              </div>

              {/* Features Toggle Section */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 space-y-2">
                <p className="text-gray-300 text-xs uppercase font-semibold">✨ Features</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    4K Quality
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                    Dolby Atmos
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    HDR Support
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Theatrical
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => { setShowClimaxModal(false); handleWatch(); }}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02]"
              >
                Experience the Climax
              </button>
            </div>
          </div>
        </div>
      )}

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