// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { MainLayout } from './Layouts/MainLayout';
import AuthLayout from './Layouts/AuthLayout';
import { DashboardLayout } from './Layouts/DashboardLayout';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import  TrackOrder  from './pages/orders/TrackOrder';
import  OrderHistory  from './pages/orders/OrderHistory';

// Admin imports
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import Settings from './pages/admin/Settings';
import NotFound from './components/common/NotFound';

// Farmer imports
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import FarmerProducts from './pages/farmer/ProductManagement';
import FarmerOrders from './pages/farmer/OrdersManagement';
import FarmerAnalytics from './pages/farmer/Analytics';
import FarmerProfile from './pages/farmer/Profile';
import FarmerSettings from './pages/farmer/Settings';
import FarmerCrops from './pages/farmer/CropManagement';
import FarmerDashboardLayout from './Layouts/FarmerDashboardLayout';

//Buyer imports
import BuyerDashboardLayout from './Layouts/BuyerDashBoardLayout';
import BuyerDashboard from './pages/dashboard/BuyerDashBoard';
import BuyerMarketplace from './pages/buyer/MarketPlace';
import BuyerOrders from './pages/buyer/BuyerOrders';
import TrackOrders from './pages/buyer/TrackOrders';
import PurchaseHistory from './pages/buyer/PurchaseHistory';
import BuyerAnalytics from './pages/buyer/BuyerAnalytics';
import BuyerMessages from './pages/buyer/BuyerMessages';
import BuyerProfile from './pages/buyer/BuyerProfile';
import Checkout from './pages/checkout/Checkout'; 
import FarmerMessages from './pages/farmer/Messages';
import Marketplace from './components/marketplace/MarketPlace';
import KnowledgeHub from './pages/blogs/KnowldgeHub';
import ArticleDetail from './components/knowledge/ArticleDetail';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ListingDetails from './pages/marketplace/ListingDetails';
import OrderDetails from './pages/orders/OrderDetails';
import OrderTracking from './pages/orders/OrderTracking';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'marketplace',
        element: <Marketplace />,
      },
      {
        path: 'marketplace/:id',
        element: <ListingDetails/>
      },
      {
        path: 'knowledge',
        element: <KnowledgeHub />,
      },
      {
        path: 'knowledge/articles/:id',
        element: <ArticleDetail />,
      },
      {
        path: 'track-order',
        element: <TrackOrder />,
      },
      {
        path: 'orders',
        element: <OrderHistory />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['admin']}>
        <DashboardLayout />,
      </ProtectedRoute>
    ),

    children: [
      {
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <UsersManagement />,
          },
          {
            path: 'products',
            element: <ProductsManagement />,
          },
          {
            path: 'orders',
            element: <OrdersManagement />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: '/farmer',
    element: (
      <ProtectedRoute roles={['farmer']}>
        <FarmerDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        children: [
          {
            path: 'dashboard',
            element: <FarmerDashboard />,
          },
          {
            path: 'crops',
            element: <FarmerCrops />,
          },
          {
            path: 'products',
            element: <FarmerProducts />,
          },
          {
            path: 'orders',
            element: <FarmerOrders />,
          },
          {
            path: 'analytics',
            element: <FarmerAnalytics />,
          },
          {
            path: 'profile',
            element: <FarmerProfile />,
          },
          {
            path: 'settings',
            element: <FarmerSettings />,
          },
          {
            path: 'messages',
            element: <FarmerMessages />,
          },
        ],
      },
    ],
  },
  {
    path: '/buyer',
    element: (
      <ProtectedRoute roles={['buyer']}>
        <BuyerDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        children: [
          {
            path: 'dashboard',
            element: <BuyerDashboard />,
          },
          {
            path: 'marketplace',
            element: <BuyerMarketplace />,
          },
          {
            path: 'marketplace/:id',
            element: <ListingDetails />,
          },
          {
            path: 'checkout',
            element: <Checkout />,
          },
          {
            path: 'orders',
            element: <BuyerOrders />,
          },
          {
            path: 'track',
            element: <TrackOrders />,
          },
          {
            path: 'history',
            element: <PurchaseHistory />,
          },
          {
            path: 'analytics',
            element: <BuyerAnalytics />,
          },
          {
            path: 'messages',
            element: <BuyerMessages />,
          },
          {
            path: 'profile',
            element: <BuyerProfile />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
          {
            path: 'orders/:orderId',
            element: <OrderDetails/>
          },
          {
            path: 'track-order/:orderId',
            element: <OrderTracking/>

          }
        ],
      },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

export default App;