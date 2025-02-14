// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5" /> },
  { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Products', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 h-screen transition-transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      >
        <div className="flex flex-col h-full w-64 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/admin/dashboard" className="flex items-center">
              <img src="/api/placeholder/32/32" alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-semibold">SmartFarm</span>
            </Link>
            <button onClick={toggleSidebar} className="md:hidden p-2 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm
                  ${
                    location.pathname === item.path
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg w-full">
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`
        ${isSidebarOpen ? 'md:ml-64' : ''}
        flex flex-col min-h-screen
      `}
      >
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center px-4 sticky top-0">
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 md:hidden">
            <Menu className="w-5 h-5" />
          </button>

          {/* Home Button */}
          <button
            onClick={handleHomeClick}
            className="ml-4 flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <img src="/api/placeholder/32/32" alt="Profile" className="h-8 w-8 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
