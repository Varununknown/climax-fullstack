import React from 'react';
import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  showAll?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  showAll = true
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {showAll && (
        <button
          onClick={() => onCategorySelect('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          All Categories
        </button>
      )}
      
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategorySelect(category.name)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.name
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
