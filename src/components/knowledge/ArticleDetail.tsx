// src/components/knowledge/ArticleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import {
  ArrowLeft,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
} from 'lucide-react';

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

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    // In a real app, fetch article data based on id
    // For now, using mock data
    const mockArticle: Article = {
      id: 1,
      authorId: 1,
      title: 'Maximizing Tomato Yield: Expert Tips for Small-Scale Farmers',
      content: `
        Learn the best practices for growing tomatoes in small-scale farming operations.
        
        Introduction:
        Tomatoes are one of the most popular vegetables to grow, and with good reason. 
        They're versatile, nutritious, and can be highly profitable for small-scale farmers. 
        This guide will walk you through expert techniques to maximize your tomato yield.

        Soil Preparation:
        The foundation of successful tomato growing lies in proper soil preparation. 
        Your soil should be:
        - Well-draining
        - Rich in organic matter
        - pH between 6.0 and 6.8
        
        Planting Techniques:
        When planting tomatoes, consider these key factors:
        1. Spacing: Plant tomatoes 18-36 inches apart
        2. Depth: Plant deep enough to cover 2/3 of the stem
        3. Support: Install stakes or cages at planting time
        
        Watering Schedule:
        Consistent watering is crucial for tomato development:
        - Water deeply 2-3 times per week
        - Maintain even soil moisture
        - Avoid overhead watering to prevent disease
        
        Pest Management:
        Implement these organic pest control methods:
        - Companion planting with basil and marigolds
        - Regular inspection for early detection
        - Removal of affected leaves and plants
        
        Harvesting Tips:
        For the best results:
        - Pick tomatoes when they're firm and fully colored
        - Harvest in the morning for best flavor
        - Handle fruits carefully to avoid bruising
        
        [Additional sections with detailed content...]
      `,
      category: 'Farming Tips',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-02-15T10:00:00Z',
      author: {
        name: 'John Doe',
        avatar: '/api/placeholder/32/32',
        role: 'Expert Farmer'
      }
    };

    setArticle(mockArticle);
  }, [id]);

  if (!article) {
    return <div>Loading...</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Articles
        </button>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* Article Header */}
            <div className="mb-8">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-sm rounded-full">
                {article.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between border-b pb-6">
                <div className="flex items-center">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{article.author.name}</h3>
                    <p className="text-sm text-gray-500">{article.author.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(article.createdAt)}
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-emerald max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Article Footer */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    <span>24 Likes</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>12 Comments</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <Bookmark className="w-5 h-5 mr-2" />
                    <span>Save</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <Share2 className="w-5 h-5 mr-2" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleDetail;