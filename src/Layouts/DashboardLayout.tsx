import  { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/common/navigation/Sidebar';

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'user' },
    { path: '/admin/products', label: 'Products', icon: 'list' },
    { path: '/admin/orders', label: 'Orders', icon: 'shopping-cart' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar items={navigationItems} />
      
      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'md:ml-64' : ''} flex flex-col min-h-screen`}>
        {/* Top Header */}
        <header className="bg-white border-b h-16 fixed top-0 right-0 left-0 z-30 md:left-64">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="ml-auto flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <img 
                  src="/api/placeholder/32/32" 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full" 
                />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 mt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};