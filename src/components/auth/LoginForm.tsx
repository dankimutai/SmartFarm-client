import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import toast from 'react-hot-toast'; // Import toast
import { LoginCredentials } from '../../types/auth.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../store/api/authApi';
import { setUser } from '../../store/slices/authSlice';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = api.useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();
  
  // State for handling server errors and success messages
  const [serverErrors, setServerErrors] = useState<{
    general?: string;
    fields?: Record<string, string>;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: LoginCredentials) => {
    // Clear previous errors and messages
    setServerErrors({});
    setSuccessMessage(null);
    
    try {
      const result = await login(data).unwrap();
      
      // Get success message from response or use default
      const message = result.message || 'Successfully logged in!';
      
      // Display success message if it exists in the response
      setSuccessMessage(message);
      
      // Show toast notification
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        icon: '👋',
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#064e3b',
          backgroundColor: '#ecfdf5'
        },
      });
      
      // Store auth data in Redux
      ddispatch(setUser({
  isAuthenticated: true,
  user: {
    ...result.user,
    farmerId: result.user.farmerId,
    buyerId: result.user.buyerId,
  },
  token: result.token
}));

      // Short delay to show success message before navigation
      setTimeout(() => {
        // Navigate based on user role
        navigate(result.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
      }, 800);
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // Create a container for our error information
      const newErrors: {
        general?: string;
        fields?: Record<string, string>;
      } = {};
      
      // Check if the error has a direct message property
      if (err.message) {
        newErrors.general = err.message;
      }
      // Also check for data.message structure (for backward compatibility)
      else if (err.data?.message) {
        newErrors.general = err.data.message;
      } 
      // Check for data.error string
      else if (typeof err.data?.error === 'string') {
        newErrors.general = err.data.error;
      } 
      // Default fallback error message
      else {
        newErrors.general = 'An error occurred during login. Please try again.';
      }
      
      // Handle field-specific errors if they exist
      if (err.errors && Array.isArray(err.errors)) {
        newErrors.fields = {};
        err.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            newErrors.fields![fieldError.field] = fieldError.message;
          }
        });
      } else if (err.data?.errors && Array.isArray(err.data.errors)) {
        newErrors.fields = {};
        err.data.errors.forEach((fieldError: any) => {
          if (fieldError.field && fieldError.message) {
            newErrors.fields![fieldError.field] = fieldError.message;
          }
        });
      }
      
      setServerErrors(newErrors);
      
      // Show error toast for general errors
      if (newErrors.general) {
        toast.error(newErrors.general, {
          duration: 4000,
          position: 'top-right',
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#7f1d1d',
            backgroundColor: '#fef2f2'
          },
        });
      }
    }
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col p-8">
      {/* Back Button */}
      <div className="flex items-center mb-8">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go back to website
        </Link>
      </div>

      <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            WELCOME BACK TO SMARTFARM MARKETPLACE! 👋
          </h2>
          <p className="text-sm text-gray-600">
            Login to access your dashboard
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-md flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        {/* General Error Message */}
        {serverErrors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-800 text-sm">{serverErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="EMAIL OR PHONE NUMBER"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message || serverErrors.fields?.email}
          />

          <Input
            label="PASSWORD"
            type="password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message || serverErrors.fields?.password}
          />

          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Reset password
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
