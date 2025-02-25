import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Home,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
  LucideIcon,
  User
} from 'lucide-react';
import { RootState } from '../../../store/store';
import { logout } from '../../../store/slices/authSlice';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

interface IconWrapperProps {
  icon: LucideIcon;
  className?: string;
}

// Create a wrapper component for icons
const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, className }) => {
  return <Icon className={className} />;
};

const iconMap: { [key: string]: LucideIcon } = {
  dashboard: Home,
  user: Users,
  'shopping-cart': ShoppingBag,
  list: Package,
  settings: Settings,
};

const Sidebar = ({ items }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Home;
    return <IconWrapper icon={IconComponent} className="h-5 w-5" />;
  };

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    
    // Navigate to login page
    navigate('/login');
  };

  // Extract user info - use optional chaining to prevent errors
  const userName = user?.firstName || user?.name || user?.username || 'User';
  const userRole = user?.role || user?.userType || 'User';

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/api/placeholder/32/32" 
            alt="Logo" 
            className="h-8 w-8 mr-2" 
          />
          <span className="text-xl font-semibold">SmartFarm</span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
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
            {getIcon(item.icon)}
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg w-full transition-colors"
        >
          <IconWrapper icon={LogOut} className="h-5 w-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;