import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    // Minimal wrapper that just ensures full height
    <main className="min-h-screen">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
