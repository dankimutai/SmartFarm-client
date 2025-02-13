import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { HiMail, HiLocationMarker } from 'react-icons/hi';
import { RiPlantLine, RiStoreLine, RiCommunityLine, RiCustomerService2Line } from 'react-icons/ri';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { path: '/', label: 'Home', icon: <RiPlantLine className="mr-2" /> },
    { path: '/marketplace', label: 'Marketplace', icon: <RiStoreLine className="mr-2" /> },
    { path: '/community', label: 'Community', icon: <RiCommunityLine className="mr-2" /> },
    { path: '/support', label: 'Support', icon: <RiCustomerService2Line className="mr-2" /> },
  ];

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
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Login
                </Button>
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
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
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 px-4 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-emerald-600 text-emerald-600"
                >
                  Login
                </Button>
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};