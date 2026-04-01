import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';


interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
  }
  
  export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const location = useLocation();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  
    if (roles && user && !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  
    return <>{children}</>;
  };
