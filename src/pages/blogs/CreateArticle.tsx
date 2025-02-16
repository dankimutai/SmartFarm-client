import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Save, Image as ImageIcon, Link, Type, Tag, Eye, AlertTriangle } from 'lucide-react';

const categories = [
  'Farming Tips',
  'Market Insights',
  'Technology',
  'Best Practices',
  'Success Stories',
  'Product Guides',
];

const CreateArticle = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle article submission
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Article</h1>
            <p className="text-gray-500 mt-1">Share your knowledge with the community</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title
                  </label>
                  <div className="relative">
                    <Type className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title"
                      className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <button
                      type="button"
                      onClick={() => setIsPreview(!isPreview)}
                      className="flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      {isPreview ? (
                        <>
                          <Type className="h-4 w-4 mr-1" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </>
                      )}
                    </button>
                  </div>

                  {!isPreview ? (
                    <>
                      {/* Editor Toolbar */}
                      <div className="flex items-center space-x-2 mb-2 p-2 border rounded-lg bg-gray-50">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Add Image"
                        >
                          <ImageIcon className="h-5 w-5 text-gray-600" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Add Link"
                        >
                          <Link className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-2" />
                        <select
                          className="px-3 py-1 border rounded bg-white text-sm"
                          defaultValue="paragraph"
                        >
                          <option value="paragraph">Normal</option>
                          <option value="h2">Heading 2</option>
                          <option value="h3">Heading 3</option>
                          <option value="bullet">Bullet List</option>
                        </select>
                      </div>

                      {/* Editor */}
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your article content here..."
                        className="w-full h-96 p-4 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </>
                  ) : (
                    /* Preview */
                    <div className="w-full h-96 p-4 border rounded-lg bg-white overflow-y-auto prose prose-emerald max-w-none">
                      {content || <p className="text-gray-400">No content to preview</p>}
                    </div>
                  )}
                </div>

                {/* Warning Message */}
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Before submitting:</p>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Ensure your content is original and helpful</li>
                      <li>Proofread for any spelling or grammatical errors</li>
                      <li>Make sure all information is accurate and up-to-date</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    onClick={() => {
                      // Handle draft saving
                    }}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Publish Article
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Guidelines Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Writing Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-4">
                    <Type className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Keep it Clear and Concise</h4>
                    <p className="text-sm text-gray-600">
                      Write in simple, easy-to-understand language. Break down complex topics into
                      digestible sections.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-4">
                    <ImageIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Use Visual Elements</h4>
                    <p className="text-sm text-gray-600">
                      Include relevant images, diagrams, or charts to illustrate your points when
                      possible.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="p-2 bg-emerald-100 rounded-lg mr-4">
                    <Tag className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Choose the Right Category</h4>
                    <p className="text-sm text-gray-600">
                      Select the most appropriate category to help readers find your content easily.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
