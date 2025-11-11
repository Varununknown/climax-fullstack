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
        console.log('🎬 ContentContext: Fetching contents from /api/contents...');
        const res = await API.get('/contents');
        console.log('🎬 ContentContext: Contents received:', res.data);
        console.log('🎬 Number of contents:', res.data?.length || 0);
        
        if (!res.data || res.data.length === 0) {
          console.warn('⚠️  WARNING: No contents in database! You may need to run the seed endpoint.');
          console.warn('⚠️  Run this in browser console:');
          console.warn('⚠️  fetch("https://climax-fullstack.onrender.com/api/contents/seed", {method:"POST", headers:{"Content-Type":"application/json"}}).then(r => r.json()).then(d => {console.log("Seeded:", d); location.reload();});');
        }
        
        setContents(res.data || []);
      } catch (err) {
        console.error('❌ ContentContext: Error loading contents:', err);
        console.error('❌ Make sure:');
        console.error('❌ 1. Backend is running');
        console.error('❌ 2. Database is seeded with sample content');
        console.error('❌ 3. Network request can reach the API');
        setContents([]);
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
      console.log('📝 ContentContext: Adding content...', data);
      
      // Validation
      if (!data.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!data.language) {
        throw new Error('Language is required');
      }
      if (!data.category) {
        throw new Error('Category is required');
      }
      
      console.log('📡 Sending POST request to /contents...');
      const res = await API.post('/contents', data);
      
      console.log('✅ ContentContext: Content added successfully');
      console.log('📦 Response data:', res.data);
      console.log('📦 Response status:', res.status);
      
      if (!res.data || !res.data._id) {
        console.error('❌ Invalid response format - missing _id:', res.data);
        throw new Error('Server returned invalid content data (missing _id)');
      }
      
      setContents((prev) => [res.data, ...prev]);
      console.log('✅ Updated contents list with new item');
      return res.data;
    } catch (err: any) {
      console.error('❌ ContentContext: Error adding content:', err);
      console.error('Error type:', err.constructor.name);
      console.error('Response status:', err?.response?.status);
      console.error('Response data:', err?.response?.data);
      console.error('Message:', err?.message);
      
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add content';
      const fullError = new Error(errorMsg);
      (fullError as any).originalError = err;
      throw fullError;
    }
  };

  const updateContent = async (id: string, contentData: Partial<Content>) => {
    try {
      console.log('🔄 ContentContext: Updating content:', id);
      console.log('📊 Update payload:', contentData);
      console.log('📊 Payload keys:', Object.keys(contentData));
      
      // Validation
      if (contentData.title !== undefined && !contentData.title?.trim()) {
        throw new Error('Title cannot be empty');
      }
      if (contentData.language !== undefined && !contentData.language) {
        throw new Error('Language is required');
      }
      if (contentData.category !== undefined && !contentData.category) {
        throw new Error('Category is required');
      }
      
      const url = `/contents/${id}`;
      console.log('📡 Sending PUT request to:', url);
      
      const res = await API.put(url, contentData);
      
      console.log('✅ ContentContext: Content updated successfully');
      console.log('📦 Response data:', res.data);
      console.log('📦 Response status:', res.status);
      
      if (!res.data || !res.data._id) {
        console.error('❌ Invalid response format - missing _id:', res.data);
        throw new Error('Server returned invalid content data (missing _id)');
      }
      
      setContents((prev) => prev.map(c => (c._id === id ? res.data : c)));
      console.log('✅ Updated contents list with modified item');
      return res.data;
    } catch (err: any) { 
      console.error('❌ ContentContext: Update failed:', err);
      console.error('Error type:', err.constructor.name);
      console.error('Response status:', err?.response?.status);
      console.error('Response data:', err?.response?.data);
      console.error('Message:', err?.message);
      
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const backendError = err?.response?.data?.error;
      const errorMessage = err?.message || 'Failed to update content';
      
      console.error('❌ Error details:', {
        status: status,
        statusText: statusText,
        data: backendError,
        message: errorMessage
      });
      
      // Re-throw with original error object so caller can access response
      throw err;
    }
  };

  const deleteContent = async (id: string) => {
    try {
      console.log('🗑️ ContentContext: Deleting content:', id);
      const url = `/contents/${id}`;
      console.log('📡 Sending DELETE request to:', url);
      
      await API.delete(url);
      
      console.log('✅ ContentContext: Content deleted successfully');
      setContents((prev) => prev.filter(c => c._id !== id));
      console.log('✅ Updated contents list, removed deleted item');
    } catch (err: any) { 
      console.error('❌ ContentContext: Delete failed:', err);
      console.error('Response status:', err?.response?.status);
      console.error('Response data:', err?.response?.data);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to delete content';
      throw new Error(errorMsg);
    }
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
