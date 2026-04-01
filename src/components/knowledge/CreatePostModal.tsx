import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Textarea } from "../../components/ui/textarea";
import { knowledgeApi } from '../../store/api/knowledgeApi';
import { toast } from 'react-hot-toast';
import { RootState } from '../../store/store';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  'Farming Tips',
  'Market Insights',
  'Technology',
  'Best Practices',
  'Success Stories',
  'Product Guides',
];

const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [createPost, { isLoading }] = knowledgeApi.useCreatePostMutation();
  
  // Get auth state from Redux store
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast.error('Please login to create a post');
      onClose();
      navigate('/login');
      return;
    }
    
    try {
      await createPost({
        title,
        content,
        category,
      }).unwrap();
      
      toast.success('Post created successfully!');
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setCategory(categories[0]);
    } catch (error: any) {
      if (error.status === 401) {
        toast.error('Your session has expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.data?.message || 'Failed to create post. Please try again');
      }
    }
  };

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center text-gray-600">
              You need to be logged in to create a post
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="w-full"
            >
              Log In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Share Knowledge</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title of your article"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="text-sm font-medium text-gray-700">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                className="mt-1 min-h-[300px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="ml-2"
            >
              {isLoading ? 'Publishing...' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
