import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast'; // Import toast
import { RegisterCredentials } from '../../types/auth.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../store/api/authApi';
import { setUser } from '../../store/slices/authSlice';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = api.useRegisterMutation();
  const { register: registerField, handleSubmit, formState: { errors }} = useForm<RegisterCredentials>();

  // State for handling server errors and success messages
  const [serverErrors, setServerErrors] = useState<{
    general?: string;
    fields?: Record<string, string>;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.startsWith('254') ? phoneNumber : '254' + phoneNumber;
  };

  const onSubmit = async (data: RegisterCredentials) => {
    // Clear previous errors and messages
    setServerErrors({});
    setSuccessMessage(null);
    
    const formattedData = {
      ...data,
      phoneNumber: formatPhoneNumber(data.phoneNumber)
    };

    console.log('Submitting registration data:', {
      ...formattedData,
      password: '[REDACTED]'
    });

    try {
      const result = await registerUser(formattedData).unwrap();
      console.log('Registration response:', result);

      // Get success message from response or use default
      const message = result.message || 'Your account has been successfully created!';
      
      // Display success message in the form
      setSuccessMessage(message);
      
      // Display toast notification for success
      toast.success(message, {
        duration: 4000,
        position: 'top-right',
        icon: '🌾',
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#064e3b',
          backgroundColor: '#ecfdf5'
        },
      });

      if (result?.token && result?.user) {
        dispatch(setUser({
          isAuthenticated: true,
          user: result.user,
          token: result.token
        }));
        
        // Short delay to show success message before navigation
        setTimeout(() => {
          navigate(result.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
        }, 1500); // Slightly longer delay to ensure the user sees both the message and toast
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = '';
      
      // Handle structured error responses
      if (error.status === 409) {
        // Direct handling for conflict errors (typically duplicate email)
        errorMessage = error.message || 'This email is already registered. Please use a different email or try logging in.';
        setServerErrors({
          general: errorMessage
        });
      } else if (error.data) {
        const newErrors: {
          general?: string;
          fields?: Record<string, string>;
        } = {};
        
        // Extract general error message
        if (error.data.message) {
          errorMessage = error.data.message;
          newErrors.general = errorMessage;
        } else if (typeof error.data.error === 'string') {
          errorMessage = error.data.error;
          newErrors.general = errorMessage;
        } else {
          errorMessage = 'An error occurred during registration. Please try again.';
          newErrors.general = errorMessage;
        }
        
        // Extract field-specific errors if they exist
        if (error.data.errors && Array.isArray(error.data.errors)) {
          newErrors.fields = {};
          error.data.errors.forEach((fieldError: any) => {
            if (fieldError.field && fieldError.message) {
              newErrors.fields![fieldError.field] = fieldError.message;
            }
          });
        }
        
        setServerErrors(newErrors);
      } else {
        // Handle non-structured errors (network issues, etc.)
        errorMessage = error.message || 'Unable to connect to the server. Please check your internet connection and try again.';
        setServerErrors({
          general: errorMessage
        });
      }
      
      // Show error toast notification
      if (errorMessage) {
        toast.error(errorMessage, {
          duration: 5000,
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
      <div className="absolute top-8 left-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back to website
        </Link>
      </div>

      <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="mb-12">
          <Link to="/" className="flex items-center">
            <div className="text-emerald-600 flex items-center text-2xl font-bold">
              <svg 
                viewBox="0 0 24 24" 
                className="w-8 h-8 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3L4 9V21H20V9L12 3Z" />
                <path d="M8 12H16" />
                <path d="M8 16H16" />
              </svg>
              SmartFarm
            </div>
          </Link>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to SmartFarm Platform! 🌾
          </h1>
          <p className="text-gray-600">
            Let's get you set up with an account
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        {/* General Error Message */}
        {serverErrors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-800 text-sm">{serverErrors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="FULL NAME"
            {...registerField('name', {
              required: 'Name is required'
            })}
            error={errors.name?.message || serverErrors.fields?.name}
          />

          <Input
            label="EMAIL ADDRESS"
            type="email"
            {...registerField('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message || serverErrors.fields?.email}
          />

          <Input
            label="PHONE NUMBER"
            type="tel"
            placeholder="254XXXXXXXXX"
            {...registerField('phoneNumber', {
              required: 'Phone number is required',
              validate: {
                validFormat: (value) => {
                  const phone = formatPhoneNumber(value);
                  return /^254\d{9}$/.test(phone) || 'Please enter a valid Kenyan phone number (254XXXXXXXXX)';
                }
              },
              onChange: (e) => {
                e.target.value = formatPhoneNumber(e.target.value);
              }
            })}
            error={errors.phoneNumber?.message || serverErrors.fields?.phoneNumber}
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              ACCOUNT TYPE
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  value="farmer"
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  {...registerField('role', { required: 'Please select a role' })}
                />
                <span className="ml-3 font-medium text-gray-900">Farmer</span>
              </label>
              <label className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <input
                  type="radio"
                  value="buyer"
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  {...registerField('role', { required: 'Please select a role' })}
                />
                <span className="ml-3 font-medium text-gray-900">Buyer</span>
              </label>
            </div>
            {(errors.role || serverErrors.fields?.role) && (
              <p className="text-red-500 text-sm mt-1">{errors.role?.message || serverErrors.fields?.role}</p>
            )}
          </div>

          <Input
            label="PASSWORD"
            type="password"
            {...registerField('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            error={errors.password?.message || serverErrors.fields?.password}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-base font-medium"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
