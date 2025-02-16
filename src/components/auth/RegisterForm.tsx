import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RegisterCredentials } from '../../types/auth.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../store/api/authApi';
import { setUser } from '../../store/slices/authSlice';
import { ArrowLeft } from 'lucide-react';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading, error: registerError }] = api.useRegisterMutation();
  const { register: registerField, handleSubmit, formState: { errors }} = useForm<RegisterCredentials>();

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    return phoneNumber.startsWith('254') ? phoneNumber : '254' + phoneNumber;
  };

  const onSubmit = async (data: RegisterCredentials) => {
    const formattedData = {
      ...data,
      phoneNumber: formatPhoneNumber(data.phoneNumber)
    };

    console.log('Submitting registration data:', {
      ...formattedData,
      password: '[REDACTED]'
    });

    try {
      const result = await register(formattedData).unwrap();
      console.log('Registration response:', result);

      if (result?.token && result?.user) {
        dispatch(setUser({
          isAuthenticated: true,
          user: result.user,
          token: result.token
        }));
        navigate(result.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
    }
  };

  const getErrorMessage = () => {
    if (registerError) {
      if ('data' in registerError) {
        return (registerError.data as { message?: string })?.message || 'Registration failed';
      }
      if ('error' in registerError) {
        return registerError.error;
      }
      return 'An unexpected error occurred';
    }
    return null;
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

        {getErrorMessage() && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
            {getErrorMessage()}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="FULL NAME"
            {...registerField('name', {
              required: 'Name is required'
            })}
            error={errors.name?.message}
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
            error={errors.email?.message}
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
            error={errors.phoneNumber?.message}
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
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
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
            error={errors.password?.message}
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