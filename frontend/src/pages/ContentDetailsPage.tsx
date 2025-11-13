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
          {/* Main Content Container */}
          <div className="flex flex-col gap-8">
            {/* Top Section: Poster + Title + Meta + CTA */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Poster Image */}
              <div className="flex-shrink-0">
                <img 
                  src={content.thumbnail} 
                  alt={content.title} 
                  className="w-40 sm:w-44 md:w-52 rounded-xl shadow-2xl object-cover aspect-[3/4]" 
                />
              </div>

              {/* Title, Meta & CTA Section */}
              <div className="flex-1">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                  {content.title}
                </h1>

                {/* Meta Tags - Professional Row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-block px-3 py-1 bg-gray-700 text-gray-100 text-xs font-semibold rounded-full">{new Date().getFullYear()}</span>
                  <span className="inline-block px-3 py-1 bg-orange-600/20 text-orange-300 text-xs font-semibold rounded-full border border-orange-500/30">UA 16+</span>
                  <span className="inline-block px-3 py-1 bg-gray-700 text-gray-100 text-xs font-semibold rounded-full">{durationText}</span>
                  <span className="hidden sm:inline-block px-3 py-1 bg-gray-700 text-gray-100 text-xs font-semibold rounded-full">{content.genre?.slice(0,2).join(' • ')}</span>
                </div>

                {/* Watch Now CTA Button - Large and Prominent */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button 
                    onClick={handleWatch} 
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-red-500/50 transition-all transform hover:scale-105 border border-red-400/30"
                  >
                    <Play size={20} />
                    <span className="text-base sm:text-lg">Watch Now</span>
                  </button>
                  
                  <button 
                    className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all border border-gray-600/50"
                  >
                    <Plus size={20} />
                    <span>Watchlist</span>
                  </button>
                </div>

                {/* Action Buttons - Share & More */}
                <div className="flex gap-2 sm:gap-3">
                  <button 
                    onClick={handleShare} 
                    className="flex items-center justify-center w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all hover:scale-110 border border-gray-600/50"
                    title="Share"
                  >
                    <Share size={18} />
                  </button>

                  <button 
                    className="flex items-center justify-center w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg transition-all hover:scale-110 border border-gray-600/50"
                    title="More Options"
                  >
                    <span className="text-xl">⋮</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Overview</h3>
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-3xl">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="mx-auto px-4 sm:px-6 py-12 max-w-5xl">
        <div className="border-b border-gray-800">
          <nav className="flex gap-8 text-sm font-medium">
            {['synopsis', 'videos'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`py-4 px-1 transition-all border-b-2 ${
                  activeTab === tab 
                    ? 'text-white border-b-red-500' 
                    : 'text-gray-400 border-b-transparent hover:text-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8">
          {activeTab === 'synopsis' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-2">Genre</p>
                  <p className="text-white font-medium">{content.genre?.slice(0,2).join(', ')}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-2">Duration</p>
                  <p className="text-white font-medium">{durationText}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-2">Rating</p>
                  <p className="text-white font-medium">UA 16+</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-2">Year</p>
                  <p className="text-white font-medium">{new Date().getFullYear()}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Videos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden bg-gray-900/50 border border-gray-800/50 group hover:border-gray-700 transition-all">
                  <div className="relative h-40 overflow-hidden">
                    <img src={content.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <button className="bg-white text-black p-3 rounded-full hover:bg-gray-100 transition-all"><Play size={20} /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-white font-medium text-sm">Official Trailer</p>
                    <p className="text-gray-400 text-xs mt-1">2:30</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Events Section */}
      <div className="mx-auto px-4 sm:px-6 py-12 max-w-5xl">
        <h2 className="text-2xl font-bold text-white mb-8">Live Events</h2>
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all hover:shadow-xl hover:shadow-red-500/10">
          <div className="flex flex-col sm:flex-row">
            {/* Event Image */}
            <div className="flex-shrink-0 w-full sm:w-64 h-48 sm:h-52 overflow-hidden bg-gray-800">
              <img 
                src={content.thumbnail} 
                alt="Live Event" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Fan Fest</h3>
                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  Join us for an exclusive live event with the cast and crew. Participate in interactive sessions, Q&A, and win amazing prizes!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2">📅 <span>Today at 8:00 PM</span></span>
                  <span className="flex items-center gap-2">👥 <span>2.5K Watching</span></span>
                </div>
              </div>

              {/* Event CTA */}
              <button 
                onClick={handleParticipate} 
                className="mt-6 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-700 hover:via-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-red-500/50 transition-all hover:scale-105 border border-red-400/30 w-full sm:w-auto text-center"
              >
                Participate Now
              </button>
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