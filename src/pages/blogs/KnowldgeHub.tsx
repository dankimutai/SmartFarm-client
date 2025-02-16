import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import {
  Search,
  Plus,
  Calendar,
  ChevronRight,
  Tag,
  ThumbsUp,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Article {
  id: number;
  authorId: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
}

const categories = [
  'All Categories',
  'Farming Tips',
  'Market Insights',
  'Technology',
  'Best Practices',
  'Success Stories',
  'Product Guides',
];

const mockArticles: Article[] = [
  {
    id: 1,
    authorId: 1,
    title: 'Maximizing Tomato Yield: Expert Tips for Small-Scale Farmers',
    content: 'Learn the best practices for growing tomatoes...',
    category: 'Farming Tips',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    author: {
      name: 'John Doe',
      avatar: '/api/placeholder/32/32',
      role: 'Expert Farmer',
    },
  },
  {
    id: 2,
    authorId: 2,
    title: 'Understanding Market Trends: A Guide to Better Pricing',
    content: 'Analyze current market trends...',
    category: 'Market Insights',
    createdAt: '2024-02-14T15:30:00Z',
    updatedAt: '2024-02-14T15:30:00Z',
    author: {
      name: 'Sarah Wilson',
      avatar: '/api/placeholder/32/32',
      role: 'Market Analyst',
    },
  },
];

const KnowledgeHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('newest');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Knowledge Hub</h1>
              <p className="text-emerald-100 text-lg">
                Share knowledge, learn from others, and grow together
              </p>
            </div>
            <button className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              Share Knowledge
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Featured Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{article.author.name}</h3>
                        <p className="text-sm text-gray-500">{article.author.role}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-sm rounded-full">
                      {article.category}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3">{article.title}</h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(article.createdAt)}
                    </div>
                    <Link
                      to={`/knowledge/articles/${article.id}`}
                      className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Read More
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-emerald-600">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        24
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-emerald-600">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        12
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-emerald-600">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => (
              <Card key={category} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 text-emerald-600 mr-2" />
                      <span className="font-medium">{category}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Latest Articles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          <div className="space-y-6">
            {mockArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <span className="font-medium text-gray-900">{article.author.name}</span>
                        <span className="mx-2">·</span>
                        <span className="text-gray-500">{formatDate(article.createdAt)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-4">{article.content}</p>
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-sm rounded-full">
                          {article.category}
                        </span>
                        <div className="ml-auto flex items-center space-x-4">
                          <button className="flex items-center text-gray-500 hover:text-emerald-600">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            24
                          </button>
                          <button className="flex items-center text-gray-500 hover:text-emerald-600">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            12
                          </button>
                          <button className="flex items-center text-gray-500 hover:text-emerald-600">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to {mockArticles.length} of {mockArticles.length} articles
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Previous</button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHub;
