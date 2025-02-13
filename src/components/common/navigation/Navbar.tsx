import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../Button';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header>
      {/* Top Info Bar */}
      <div className="bg-emerald-400 text-white py-2 px-4 text-sm">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📧 info@smartfarm.io</span>
            <span>📍 Kenya</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:text-emerald-100">Facebook</a>
            <a href="#" className="hover:text-emerald-100">Twitter</a>
            <a href="#" className="hover:text-emerald-100">Instagram</a>
            <a href="#" className="hover:text-emerald-100">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-emerald-600">SmartFarm</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-emerald-600">Home</Link>
              <Link to="/solutions" className="text-gray-700 hover:text-emerald-600">Solutions</Link>
              <Link to="/sectors" className="text-gray-700 hover:text-emerald-600">Sectors</Link>
              <Link to="/support" className="text-gray-700 hover:text-emerald-600">Support</Link>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
              <Link to="/" className="block py-2 text-gray-700 hover:text-emerald-600">Home</Link>
              <Link to="/solutions" className="block py-2 text-gray-700 hover:text-emerald-600">Solutions</Link>
              <Link to="/sectors" className="block py-2 text-gray-700 hover:text-emerald-600">Sectors</Link>
              <Link to="/support" className="block py-2 text-gray-700 hover:text-emerald-600">Support</Link>
              <Button variant="primary" size="sm" className="w-full mt-2">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};