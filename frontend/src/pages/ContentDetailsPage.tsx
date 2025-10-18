import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Share, Heart, Download } from 'lucide-react';
import API from '../services/api';
import { Content } from '../types';

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
  const [activeTab, setActiveTab] = useState<'synopsis'|'cast'|'videos'|'posters'>('synopsis');

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
        <button onClick={() => navigate('/')} className="bg-red-600 px-4 py-2 rounded">Go Home</button>
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
      {/* Top Poster */}
      <div className="relative">
        <div className="h-72 sm:h-96 lg:h-[420px] bg-cover bg-center" style={{backgroundImage:`linear-gradient(to bottom, rgba(0,0,0,0.65), rgba(0,0,0,0.95)), url(${content.thumbnail})`}}/>
        <div className="absolute inset-0 flex items-end p-6">
          <div className="max-w-4xl w-full mx-auto flex items-end gap-6">
            <img src={content.thumbnail} alt={content.title} className="w-36 sm:w-48 md:w-56 rounded-lg shadow-2xl object-cover" />

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{content.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-300 mt-2 mb-3">
                <span className="px-2 py-1 bg-gray-800 rounded">{new Date().getFullYear()}</span>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded">UA 16+</span>
                <span>{durationText}</span>
                <span>{content.genre?.slice(0,3).join(' • ')}</span>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleWatch} className="bg-white text-black rounded-full py-3 px-6 flex items-center gap-3 shadow-lg hover:scale-[1.01] transition-transform">
                  <Play />
                  <span className="font-semibold">Watch First Episode</span>
                </button>

                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied'); }} className="text-gray-300 p-3 rounded-full bg-black/40">
                  <Share />
                </button>

                <button className="text-gray-300 p-3 rounded-full bg-black/40">
                  <Plus />
                </button>
              </div>

              <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">{content.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="border-b border-gray-800">
          <nav className="flex gap-6 text-sm">
            {['synopsis','cast','videos','posters'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`py-3 pb-4 ${activeTab===tab? 'text-white border-b-2 border-purple-500':'text-gray-400'}`}>
                {tab === 'posters' ? 'Posters & Wallpapers' : tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          {activeTab === 'synopsis' && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{content.description}</p>

              <div className="flex gap-8 items-center border-t border-gray-800 pt-6">
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Season 1</h3>
                  <div className="space-y-3">
                    {/* Example episode row - in your real data you would map episodes */}
                    <div className="flex items-center justify-between bg-gray-900/60 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-14 bg-gray-800 rounded overflow-hidden">
                          <img src={content.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">S1 E1 · Skeletons in the Closet</div>
                          <div className="text-xs text-gray-400">10 Oct 2025 · 42m</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={handleWatch} className="text-gray-100 bg-red-600 px-3 py-2 rounded">Play</button>
                        <button className="text-gray-300 p-2 rounded bg-black/40"><Download /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Cast & Crew</h2>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-28 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-2">
                      <img src={content.thumbnail} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-sm">Actor {i}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded overflow-hidden bg-gray-900/60">
                  <img src={content.thumbnail} className="w-full h-44 object-cover" />
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">Official Trailer</div>
                      <div className="text-xs text-gray-400">2:30</div>
                    </div>
                    <button className="p-2 bg-white text-black rounded"><Play /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posters' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Posters & Wallpapers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded overflow-hidden">
                    <img src={content.thumbnail} className="w-full h-40 object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};