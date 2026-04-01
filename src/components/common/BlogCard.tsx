import React from 'react';
import { Link } from 'react-router-dom';

interface BlogCardProps {
  image: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  link: string;
  isMain?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  image,
  date,
  category,
  title,
  excerpt,
  link,
  isMain = false,
}) => {
  return (
    <div className={`relative rounded-xl overflow-hidden group ${isMain ? 'h-[400px]' : 'h-[300px]'}`}>
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Tags */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="px-3 py-1 bg-white/90 rounded-full text-sm">
          {date}
        </span>
        <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
        <p className="text-white/90 mb-4">{excerpt}</p>
        <Link to={link}>
          <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Read More →
          </button>
        </Link>
      </div>
    </div>
  );
};
