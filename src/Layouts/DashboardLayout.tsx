import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/navigation/Sidebar';
import { useLocation } from 'react-router-dom';

export const DashboardLayout = () => {
  const location = useLocation();
  const isFarmerDashboard = location.pathname.includes('/farmer');

  const sidebarItems = isFarmerDashboard
    ? [
        { path: '/farmer/dashboard', label: 'Overview', icon: 'chart-bar' },
        { path: '/farmer/listings', label: 'My Listings', icon: 'list' },
        { path: '/farmer/orders', label: 'Orders', icon: 'shopping-cart' },
        { path: '/farmer/crops', label: 'Crop Management', icon: 'leaf' },
        { path: '/farmer/profile', label: 'Profile', icon: 'user' },
      ]
    : [
        { path: '/buyer/dashboard', label: 'Overview', icon: 'chart-bar' },
        { path: '/buyer/orders', label: 'My Orders', icon: 'shopping-cart' },
        { path: '/buyer/saved', label: 'Saved Items', icon: 'heart' },
        { path: '/buyer/profile', label: 'Profile', icon: 'user' },
      ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={sidebarItems} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
