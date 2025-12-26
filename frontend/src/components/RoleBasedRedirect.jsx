import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  // Redirigir según el rol del usuario
  if (user?.rol === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (user?.rol === 'empleado') {
    return <Navigate to="/empleado-dashboard" replace />;
  }
  
  // Los clientes van a su dashboard personal
  return <Navigate to="/mi-dashboard" replace />;
};

export default RoleBasedRedirect;
