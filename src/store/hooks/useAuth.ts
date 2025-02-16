import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Dispatch logout action
    dispatch(logout());
    
    // Clear any additional storage if needed
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to home page
    navigate('/');
  };

  return {
    handleLogout,
  };
};