import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log('AuthContext - Inicializando:', { hasToken: !!token, hasSavedUser: !!savedUser });

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('AuthContext - Usuario guardado:', parsedUser);
      setUser(parsedUser);
      
      // Verificar que el token siga siendo válido
      authService.verify()
        .then((data) => {
          console.log('AuthContext - Verify response:', data);
          if (data.valid) {
            setUser(data.user);
          } else {
            console.log('AuthContext - Token inválido, limpiando...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        })
        .catch((error) => {
          console.error('AuthContext - Error verificando token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('AuthContext - No hay token, usuario no autenticado');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      // Asegurar que siempre lanzamos un Error estándar
      const errorMessage = error?.message || error?.data?.error || error?.error || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  };

  const loginCliente = async (cedula) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/auth/login-cliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al iniciar sesión como cliente');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (error) {
      const errorMessage = error?.message || error?.data?.error || error?.error || 'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginCliente,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
