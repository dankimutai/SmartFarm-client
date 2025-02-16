import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LoginCredentials } from '../../types/auth.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {api} from '../../store/api/authApi';
import { setUser } from '../../store/slices/authSlice';
import { ArrowLeft } from 'lucide-react';

export const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = api.useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const result = await login(data).unwrap();
      
      // Store auth data in Redux
      dispatch(setUser({
        isAuthenticated: true,
        user: result.user,
        token: result.token
      }));

      // Navigate based on user role
      navigate(result.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard' );
    } catch (err) {
      console.error('Login failed:', err);
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error instanceof Error ? error.message : 'Login failed'}
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
            error={errors.email?.message}
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
            error={errors.password?.message}
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