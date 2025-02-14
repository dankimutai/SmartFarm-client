import { Link } from 'react-router-dom';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Farm1 from '../../assets/farm-1.jpg';

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      setIsLoading(true);
      // Implement password reset logic here
      console.log('Sending reset email to:', email);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8">
        {/* Back Button */}
        <div className="flex items-center mb-8">
          <Link to="/auth/login" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to login
          </Link>
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              FORGOT YOUR PASSWORD? 🔐
            </h2>
            <p className="text-sm text-gray-600">
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 p-6 rounded-lg text-center">
              <div className="text-emerald-600 text-lg font-medium mb-4">
                Check your email
              </div>
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to your email address.
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center text-emerald-600 hover:text-emerald-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="EMAIL ADDRESS"
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

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending Reset Instructions...' : 'Send Reset Instructions'}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block md:w-1/2 bg-gray-200 relative">
        <img
          src={Farm1}
          alt="Agricultural landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-semibold mb-2">Marcus Cato</p>
          <p className="text-lg">
            "Agriculture is a science which teaches us what crops are to be planted in each kind of soil, and what operations are to be carried out to maximize yields."
          </p>
        </div>
      </div>
    </div>
  );
};