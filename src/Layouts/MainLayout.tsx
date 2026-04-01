import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/navigation/Navbar';
import { Footer } from '../components/common/navigation/Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
