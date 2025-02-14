import { LoginForm } from '../../components/auth/LoginForm';
import Farm2 from '../../assets/farm-2.jpg';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <LoginForm />

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-gray-200 relative">
        <img
          src={Farm2}
          alt="Agricultural landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-semibold mb-2">Thomas Jefferson</p>
          <p className="text-lg">
            "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals & happiness."
          </p>
        </div>
      </div>
    </div>
  );
};