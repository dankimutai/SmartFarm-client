import { Outlet } from 'react-router-dom';
import { Logo } from '../components/common/Logo';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  );
};