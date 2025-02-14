// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import {MainLayout} from './Layouts/MainLayout';
import {DashboardLayout} from './Layouts/DashboardLayout';
import{ HomePage} from './components/home/HomePage';
import {LoginPage }from './pages/auth/LoginPage';
import {RegisterPage }from './pages/auth/RegisterPage';
import {ForgotPasswordPage} from './pages/auth/ForgotPasswordPage';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import Settings from './pages/admin/Settings';
import NotFound from './components/common/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true, // Use index instead of empty path
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <MainLayout />, // Wrap auth routes in MainLayout if needed
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
    path: '/admin', // Protect all admin routes
    children: [
      {
        element: <DashboardLayout />,
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