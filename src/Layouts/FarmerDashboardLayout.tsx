import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Leaf,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  User,
  MessageSquare,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { RiPlantLine } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const navItems = [
  { name: 'Dashboard', path: '/farmer/dashboard', icon: <Home className="w-5 h-5" /> },
  { name: 'Crops', path: '/farmer/crops', icon: <Leaf className="w-5 h-5" /> },
  { name: 'Products', path: '/farmer/products', icon: <Package className="w-5 h-5" /> },
  { name: 'Orders', path: '/farmer/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  { name: 'Transactions', path: '/farmer/transactions', icon: <CreditCard className="w-5 h-5" /> },
  { name: 'Analytics', path: '/farmer/analytics', icon: <BarChart2 className="w-5 h-5" /> },
  { name: 'Messages', path: '/farmer/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { name: 'Profile', path: '/farmer/profile', icon: <User className="w-5 h-5" /> },
  { name: 'Settings', path: '/farmer/settings', icon: <Settings className="w-5 h-5" /> },
];

const FarmerDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const profileImage = user?.image;
  const userName = user?.name || 'Farmer';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full w-64 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/farmer/dashboard" className="flex items-center">
               <RiPlantLine className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-semibold">SmartFarm</span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm
                  ${location.pathname === item.path
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

          {/* User Profile & Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center px-4 py-2 mb-2">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full mr-3 object-cover" 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mr-3">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500">Farmer</p>
              </div>
            </div>
            <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`
        ${isSidebarOpen ? 'md:ml-64' : ''}
        flex flex-col min-h-screen transition-all duration-300
      `}>
        {/* Top Header */}
        <header className="bg-white border-b h-16 flex items-center px-4 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Home Button */}
          <button
            onClick={() => navigate('/')}
            className="ml-4 flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <div className="ml-auto flex items-center space-x-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
            <Link to="/farmer/profile">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full hover:opacity-80 object-cover" 
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 hover:opacity-80">
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

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default FarmerDashboardLayout;