import React, { createContext, useContext, useState, useEffect } from 'react';
import { Content, Category, User as UserType } from '../types';
import API from '../services/api';

interface ContentContextType {
  contents: Content[];
  categories: Category[];
  user?: UserType;
  logout: () => void;
  addContent: (content: Omit<Content, '_id' | 'createdAt'>) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  getContentById: (id: string) => Content | undefined;
  getContentsByCategory: (category: string) => Content[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Action', description: 'High-octane action movies and shows' },
    { id: '2', name: 'Drama', description: 'Compelling dramatic content' },
    { id: '3', name: 'Comedy', description: 'Laugh-out-loud entertainment' },
    { id: '4', name: 'Thriller', description: 'Edge-of-your-seat suspense' },
    { id: '5', name: 'Romance', description: 'Heartwarming romantic stories' },
    { id: '6', name: 'Sci-Fi', description: 'Science fiction adventures' }
  ]);

  const [user, setUser] = useState<UserType | undefined>(undefined);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await API.get('/contents');
        setContents(res.data);
      } catch (err) {
        console.error('❌ Error loading contents:', err);
        console.log('🔄 Loading mock content as fallback...');
        
        // Fallback mock data when API fails
        const mockContents: Content[] = [
          {
            _id: '1',
            title: 'The Dark Knight',
            description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
            category: 'Action',
            type: 'movie',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500',
            duration: 152,
            genre: ['Action', 'Crime', 'Drama'],
            rating: 9.0,
            releaseYear: 2008,
            isPremium: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Stranger Things',
            description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
            category: 'Drama',
            type: 'series',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
            duration: 45,
            genre: ['Drama', 'Fantasy', 'Horror'],
            rating: 8.7,
            releaseYear: 2016,
            isPremium: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            title: 'The Office',
            description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes and inappropriate behavior.',
            category: 'Comedy',
            type: 'series',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500',
            duration: 22,
            genre: ['Comedy'],
            rating: 8.9,
            releaseYear: 2005,
            isPremium: false,
            createdAt: new Date().toISOString()
          },
          {
            _id: '4',
            title: 'Avengers: Endgame',
            description: 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos\' actions.',
            category: 'Action',
            type: 'movie',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500',
            duration: 181,
            genre: ['Action', 'Adventure', 'Drama'],
            rating: 8.4,
            releaseYear: 2019,
            isPremium: true,
            createdAt: new Date().toISOString()
          }
        ];
        
        setContents(mockContents);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await API.get('/auth/me'); // ✅ endpoint to get logged-in user
        setUser(res.data);
      } catch (err) {
        console.error('❌ Error loading user info:', err);
        setUser(undefined);
      }
    };

    fetchContents();
    fetchUser();
  }, []);

  const logout = () => {
    API.post('/auth/logout'); // optional if backend needs it
    setUser(undefined);
    // Optional: clear localStorage or redirect to login
  };

  const addContent = async (data: Omit<Content, '_id' | 'createdAt'>) => {
    try {
      const res = await API.post('/contents', data);
      setContents((prev) => [res.data, ...prev]);
    } catch (err) { console.error(err); }
  };

  const updateContent = async (id: string, contentData: Partial<Content>) => {
    try {
      const res = await API.put(`/contents/${id}`, contentData);
      setContents((prev) => prev.map(c => (c._id === id ? res.data : c)));
    } catch (err) { console.error(err); }
  };

  const deleteContent = async (id: string) => {
    try {
      await API.delete(`/contents/${id}`);
      setContents((prev) => prev.filter(c => c._id !== id));
    } catch (err) { console.error(err); }
  };

  const getContentById = (id: string) => contents.find(c => c._id === id);
  const getContentsByCategory = (category: string) =>
    contents.filter(c => c.category === category && c.isActive);

  return (
    <ContentContext.Provider
      value={{
        contents,
        categories,
        user,
        logout,
        addContent,
        updateContent,
        deleteContent,
        getContentById,
        getContentsByCategory
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export { ContentProvider, useContent };
