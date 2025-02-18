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
import { knowledgeApi } from '../../store/api/knowledgeApi';
import Farm1 from '../../assets/farm-2.jpg';


const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  

  

  const { data: response, isLoading, error } = knowledgeApi.useGetPostByIdQuery(Number(id), {
    skip: !id || isNaN(Number(id))
  });

  const article = response?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Article</h2>
          <p className="text-gray-600 mb-4">The article could not be found.</p>
          <button
            onClick={() => navigate('/knowledge')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Return to Knowledge Hub
          </button>
        </div>
      </div>
    );
  }

  // Split content into sections based on headings
  const sections = article.content.split('\n').reduce((acc: string[], line: string) => {
    if (line.trim().startsWith('#') || !acc.length) {
      acc.push(line);
    } else {
      acc[acc.length - 1] += '\n' + line;
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/knowledge')}
          className="flex items-center text-gray-600 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Articles
        </button>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-sm rounded-full">
                  {article.category}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(article.createdAt)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {article.title}
              </h1>
              
              <div className="flex items-center border-b pb-6">
                <img
                  src={Farm1}
                  alt="Author"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium text-gray-900">Author {article.authorId}</h3>
                  <p className="text-sm text-gray-500">Contributor</p>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-emerald max-w-none">
              {sections.map((section, index) => {
                const lines = section.split('\n');
                const heading = lines[0];
                const content = lines.slice(1).join('\n');

                return (
                  <div key={index} className="mb-8">
                    {heading.startsWith('#') ? (
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {heading.replace(/^#+\s/, '')}
                      </h2>
                    ) : null}
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {content || heading}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Article Footer */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-emerald-600">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span>Comment</span>
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