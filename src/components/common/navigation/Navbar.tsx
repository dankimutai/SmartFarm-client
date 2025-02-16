import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../Button';
import { DropdownMenu } from '../DropdownMenu';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { HiMail, HiLocationMarker } from 'react-icons/hi';
import { useAuth } from '../../../store/hooks/useAuth';

import {
  RiPlantLine,
  RiStoreLine,
  RiBookLine,
  RiTruckLine,
  RiFileListLine,
  RiDashboardLine,
  RiHome2Line,
} from 'react-icons/ri';
import { RootState } from '../../../store/store';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);


  const { handleLogout } = useAuth();

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user?.role) return '/';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'farmer':
        return '/farmer/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      default:
        return '/';
    }
  };

  const mainNavItems = [
    {
      path: '/',
      label: 'Home',
      icon: <RiHome2Line className="w-5 h-5" />,
    },
    ...(isAuthenticated
      ? [
          {
            path: getDashboardPath(),
            label: 'Dashboard',
            icon: <RiDashboardLine className="w-5 h-5" />,
          },
        ]
      : []),
    {
      path: '/marketplace',
      label: 'Marketplace',
      icon: <RiStoreLine className="w-5 h-5" />,
    },
    {
      path: '/knowledge',
      label: 'Knowledge Hub',
      icon: <RiBookLine className="w-5 h-5" />,
    },
    {
      path: '/logistics',
      label: 'Logistics',
      icon: <RiTruckLine className="w-5 h-5" />,
    },
  ];

  const orderItems = [
    { label: 'Track Order', link: '/track-order' },
    { label: 'Order History', link: '/orders' },
  ];

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleGetStarted = () => {
    navigate('/auth/register');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Info Bar */}
      <div className="bg-emerald-600 text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <HiMail className="w-4 h-4 mr-2" />
              info@smartfarm.io
            </span>
            <span className="flex items-center">
              <HiLocationMarker className="w-4 h-4 mr-2" />
              Nairobi, Kenya
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <a href="#" className="hover:text-emerald-100 transition-colors p-1">
              <FaFacebookF className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-emerald-100 transition-colors p-1">
              <FaTwitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-emerald-100 transition-colors p-1">
              <FaInstagram className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-emerald-100 transition-colors p-1">
              <FaLinkedinIn className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <RiPlantLine className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">SmartFarm</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors
                    ${isActive ? 'text-emerald-600' : ''}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <DropdownMenu
                title={
                  <div className="flex items-center space-x-2">
                    <RiFileListLine className="w-5 h-5" />
                    <span>Orders</span>
                  </div>
                }
                items={orderItems}
              />

              <div className="flex items-center space-x-3">
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      onClick={handleLogin}
                    >
                      Login
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleGetStarted}>
                      Get Started
                    </Button>
                  </>
                ) : (
                  <DropdownMenu
                    title={
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{user?.name}</span>
                      </div>
                    }
                    items={[
                      { label: 'Profile', link: '/profile' },
                      { label: 'Settings', link: '/settings' },
                      { 
                        label: 'Logout', 
                        onClick: handleLogout // Changed from link to onClick handler
                      },
                    ]}
                  />
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-emerald-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-emerald-600 
                    hover:bg-emerald-50 rounded-lg transition-colors
                    ${isActive ? 'text-emerald-600 bg-emerald-50' : ''}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {/* Mobile Orders Menu */}
              <div className="px-4 py-2">
                <div className="font-medium text-gray-700 mb-2">Orders</div>
                {orderItems.map((item) => (
                  <Link
                    key={item.link}
                    to={item.link}
                    className="block py-2 pl-8 text-gray-600 hover:text-emerald-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 px-4 mt-4">
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-600 text-emerald-600"
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleGetStarted();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </>
                ) : (
                  <div className="col-span-2 space-y-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
