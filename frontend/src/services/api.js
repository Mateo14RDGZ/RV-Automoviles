import axios from 'axios';

// Obtener la URL de la API desde las variables de entorno
// En desarrollo: http://localhost:5000/api
// En producción: /api (ruta relativa)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Validar que la URL sea válida
if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
  console.error('❌ VITE_API_URL inválida:', API_URL);
  throw new Error(`URL de API inválida: ${API_URL}. Debe comenzar con http:// o /`);
}

console.log('🔗 API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Buscar el token en localStorage o sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Request con token a:', config.url);
    } else {
      console.warn('⚠️ Request sin token a:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar ambos storages
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('rememberMe');
      window.location.href = '/login';
    }
    // Normalizar el formato del error para evitar problemas con React
    const normalizedError = {
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido',
      status: error.response?.status,
      data: error.response?.data
    };
    return Promise.reject(normalizedError);
  }
);

export default api;
