import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Car, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, CreditCard, IdCard, Moon, Sun } from 'lucide-react';

const Login = () => {
  const [loginMode, setLoginMode] = useState(''); // '' | 'admin' | 'cliente'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMode === 'admin') {
        await login(email, password);
        navigate('/dashboard');
      } else {
        // Login de cliente con cédula
        await loginCliente(cedula);
        // loginCliente hace su propia navegación, no necesitamos navigate aquí
      }
    } catch (err) {
      setError(err.response?.data?.error || err.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const loginCliente = async (cedula) => {
    const response = await fetch('http://localhost:5000/api/auth/login-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula })
    });

    if (!response.ok) {
      const data = await response.json();
      throw { error: data.error };
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Los clientes van directo a ver sus cuotas
    window.location.href = '/pagos';
  };

  const resetForm = () => {
    setLoginMode('');
    setError('');
    setEmail('');
    setPassword('');
    setCedula('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Botón de cambio de tema en la esquina superior derecha */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-50 group"
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        <div className="relative w-5 h-5 sm:w-6 sm:h-6">
          <Moon 
            className={`w-5 h-5 sm:w-6 sm:h-6 absolute text-gray-700 dark:text-gray-300 transition-all duration-300 ${
              theme === 'light' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 rotate-90 scale-0'
            }`} 
          />
          <Sun 
            className={`w-5 h-5 sm:w-6 sm:h-6 absolute text-amber-500 transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-0'
            }`} 
          />
        </div>
        {/* Tooltip en hover (solo desktop) */}
        <span className="absolute -bottom-10 right-0 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none hidden sm:block">
          {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
        </span>
      </button>

      <div className="max-w-md w-full">
        {/* Logo y título minimalista */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black mb-2 tracking-tight">
            <span className="text-red-600 dark:text-red-500">RV</span>
          </h1>
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-3">
            Automoviles
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Gestión Automotora
          </p>
        </div>

        {/* Formulario de login minimalista */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loginMode ? (
            /* Selección de tipo de usuario */
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white text-center mb-6">¿Cómo deseas ingresar?</h2>
              
              <button
                type="button"
                onClick={() => setLoginMode('admin')}
                className="w-full flex items-center justify-center gap-3 bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-medium text-base transition-all duration-200"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Soy Administrador</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMode('cliente')}
                className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 px-6 rounded-lg font-medium text-base transition-all duration-200"
              >
                <CreditCard className="w-5 h-5" />
                <span>Soy Cliente (Ver mis cuotas)</span>
              </button>

              <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-4">
                Los clientes solo pueden acceder si tienen pagos pendientes
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Botón para volver */}
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center gap-2 transition-all duration-200"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Volver</span>
              </button>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
                {loginMode === 'admin' ? (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400 dark:text-blue-500" />
                    Acceso Administrativo
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Acceso Cliente
                  </span>
                )}
              </h3>

              {loginMode === 'admin' ? (
                /* Formulario para admin */
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="admin@automanager.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Formulario para cliente */
                <div className="space-y-2">
                  <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de Cédula
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      id="cedula"
                      type="text"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej: 1234567890"
                      required
                    />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                    Ingresa tu número de cédula (8-13 dígitos) para ver tus pagos pendientes
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              {loginMode === 'admin' && (
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Credenciales de Prueba
                    </p>
                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Admin:</span>
                        <code className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">admin@automanager.com</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pass:</span>
                        <code className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">admin123</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loginMode === 'cliente' && (
                <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cédulas de Prueba
                    </p>
                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Juan Pérez:</span>
                        <code className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">1234567890</code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ana Martínez:</span>
                        <code className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">5544332211</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
