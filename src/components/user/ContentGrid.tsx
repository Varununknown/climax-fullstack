import React from 'react';
import { ContentCard } from './ContentCard';
import { Content } from '../../types';
import { ChevronRight } from 'lucide-react';

interface ContentGridProps {
  contents: Content[];
  title?: string;
  showAll?: () => void;
  showCategories?: boolean;
  layout?: 'horizontal' | 'grid';
  cardSize?: 'small' | 'medium' | 'large';
}

export const ContentGrid: React.FC<ContentGridProps> = ({ 
  contents, 
  title, 
  showAll,
  showCategories = false,
  layout = 'horizontal',
  cardSize = 'medium'
}) => {
  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No content found matching your criteria.</p>
      </div>
    );
  }

  const displayContents = showAll ? contents : contents.slice(0, layout === 'horizontal' ? 8 : 12);

  return (
    <div className="mb-8">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-white">{title}</h2>
          {showAll && contents.length > (layout === 'horizontal' ? 8 : 12) && (
            <button
              onClick={showAll}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              <span>See all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {layout === 'horizontal' ? (
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {displayContents.map((content) => (
            <div key={content._id} className="flex-shrink-0 w-48 lg:w-56">
              <ContentCard
                content={content}
                showCategory={showCategories}
                size={cardSize}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {displayContents.map((content) => (
            <ContentCard
              key={content._id}
              content={content}
              showCategory={showCategories}
              size={cardSize}
            />
          ))}
        </div>
      )}
    </div>
  );
};
