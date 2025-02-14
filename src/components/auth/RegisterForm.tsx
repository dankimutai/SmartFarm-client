import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterCredentials } from '../../types/auth.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useRegisterMutation } from '../../store/api/authApi';
import { ArrowLeft } from 'lucide-react';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const { register: registerField, handleSubmit, formState: { errors } } = useForm<RegisterCredentials>();

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      const result = await register(data).unwrap();
      navigate(result.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
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
            WELCOME TO THE SMARTFARM PLATFORM! 🌾
          </h2>
          <p className="text-sm text-gray-600">
            Let's get you set up with an account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error instanceof Error ? error.message : 'Registration failed'}
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ACCOUNT TYPE
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="farmer"
                  className="w-4 h-4 text-emerald-600"
                  {...registerField('role', { required: 'Please select a role' })}
                />
                <span className="ml-2">Farmer</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="buyer"
                  className="w-4 h-4 text-emerald-600"
                  {...registerField('role', { required: 'Please select a role' })}
                />
                <span className="ml-2">Buyer</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
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
            className="w-full"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
