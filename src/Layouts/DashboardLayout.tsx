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
  User,
  CreditCard,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { RiPlantLine } from 'react-icons/ri';

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
  { name: 'Transactions', path: '/admin/transactions', icon: <CreditCard className="w-5 h-5" /> },
  { name: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const profileImage = user?.image;

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
              <RiPlantLine className="w-8 h-8 text-emerald-600" />
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
                    location.pathname === item.path || 
                    (item.path.includes('/admin/transactions') && location.pathname.includes('/admin/transactions'))
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
            <Link to="/admin/settings" className="p-2 rounded-full hover:bg-gray-100">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <User className="w-5 h-5" />
                </div>
              )}
            </Link>
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
