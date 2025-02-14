import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  RiDashboardLine, 
  RiStore2Line, 
  RiShoppingCartLine,
  RiUserLine,
  RiPlantLine,
  RiHeartLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine
} from 'react-icons/ri';

interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

const iconMap = {
  'dashboard': RiDashboardLine,
  'chart-bar': RiDashboardLine,
  'list': RiStore2Line,
  'shopping-cart': RiShoppingCartLine,
  'user': RiUserLine,
  'leaf': RiPlantLine,
  'heart': RiHeartLine,
};

export const Sidebar = ({ items }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || RiDashboardLine;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <aside
      className={`
        ${collapsed ? 'w-20' : 'w-64'}
        ${isMobile ? 'absolute' : 'relative'}
        transition-all duration-300 ease-in-out
        min-h-screen bg-white shadow-lg z-20
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-4 translate-x-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
      >
        {collapsed ? (
          <RiMenuUnfoldLine className="w-5 h-5 text-gray-600" />
        ) : (
          <RiMenuFoldLine className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Logo Area */}
      <div className={`
        px-6 py-8 flex items-center
        ${collapsed ? 'justify-center' : 'justify-start'}
      `}>
        <Link to="/" className="flex items-center space-x-2">
          <RiPlantLine className="w-8 h-8 text-emerald-600" />
          {!collapsed && (
            <span className="text-xl font-bold text-emerald-600">SmartFarm</span>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="px-4 py-4">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-3 rounded-lg mb-2
                ${isActive 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                transition-colors duration-200
              `}
            >
              {getIcon(item.icon)}
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
              {collapsed && (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-4
        ${collapsed ? 'text-center' : 'px-6'}
      `}>
        <div className="py-4 border-t border-gray-200">
          <Link
            to="/profile"
            className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <RiUserLine className="w-6 h-6" />
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">Profile</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
};