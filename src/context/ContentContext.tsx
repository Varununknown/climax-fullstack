import React, { createContext, useContext, useState, useEffect } from 'react';
import { Content, Category } from '../types';
import API from '../services/api'; // ✅ Adjust if path differs

interface ContentContextType {
  contents: Content[];
  categories: Category[];
  addContent: (content: Omit<Content, '_id' | 'createdAt'>) => void;
  updateContent: (id: string, content: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  getContentById: (id: string) => Content | undefined;
  getContentsByCategory: (category: string) => Content[];
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
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

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await API.get('/contents');
        setContents(res.data);
      } catch (err) {
        console.error('❌ Error loading contents:', err);
        setContents([]);
      }
    };

    fetchContents();
  }, []);

  const addContent = async (data: Omit<Content, '_id' | 'createdAt'>) => {
    try {
      const res = await API.post('/contents', data);
      const newContent = res.data;
      setContents((prev) => [newContent, ...prev]);
    } catch (error: any) {
      console.error('❌ Error adding content:', error);
      throw new Error(error?.response?.data?.message || 'Failed to add content');
    }
  };

  const updateContent = async (id: string, contentData: Partial<Content>) => {
    try {
      const res = await API.put(`/contents/${id}`, contentData);
      const updated = res.data;
      setContents((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error('❌ Error updating content:', err);
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await API.delete(`/contents/${id}`);
      setContents((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error('❌ Error deleting content:', err);
    }
  };

  const getContentById = (id: string) => contents.find((c) => c._id === id);
  const getContentsByCategory = (category: string) =>
    contents.filter((c) => c.category === category && c.isActive);

  return (
    <ContentContext.Provider
      value={{
        contents,
        categories,
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
