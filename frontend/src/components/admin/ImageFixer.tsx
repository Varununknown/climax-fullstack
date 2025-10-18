import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

export const ImageFixer: React.FC = () => {
  const { contents, updateContent } = useContent();
  const [isFixing, setIsFixing] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);

  const fixBrokenImages = async () => {
    setIsFixing(true);
    setFixedCount(0);
    
    let fixed = 0;
    
    for (const content of contents) {
      if (content.thumbnail && content.thumbnail.includes('via.placeholder.com')) {
        try {
          await updateContent(content._id, {
            ...content,
            thumbnail: 'https://images.unsplash.com/photo-1489599808050-e1d2b7c9fec0?w=400&h=225&fit=crop&auto=format'
          });
          fixed++;
        } catch (error) {
          console.error('Failed to fix image for:', content.title, error);
        }
      }
    }
    
    setFixedCount(fixed);
    setIsFixing(false);
    
    if (fixed > 0) {
      alert(`✅ Fixed ${fixed} broken image URLs!`);
    } else {
      alert('✅ No broken images found - all good!');
    }
  };

  const brokenImagesCount = contents.filter(content => 
    content.thumbnail && content.thumbnail.includes('via.placeholder.com')
  ).length;

  if (brokenImagesCount === 0) {
    return null; // Don't show if no broken images
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wrench className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Broken Image URLs Detected
            </h3>
            <p className="text-sm text-yellow-600">
              Found {brokenImagesCount} content items with broken placeholder images
            </p>
          </div>
        </div>
        <button
          onClick={fixBrokenImages}
          disabled={isFixing}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-yellow-400 transition-colors"
        >
          {isFixing ? 'Fixing...' : 'Fix All Images'}
        </button>
      </div>
      {fixedCount > 0 && (
        <div className="mt-3 text-sm text-green-600">
          ✅ Successfully fixed {fixedCount} images!
        </div>
      )}
    </div>
  );
};