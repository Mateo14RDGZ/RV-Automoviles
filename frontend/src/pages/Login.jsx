import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, Sparkles, ShieldCheck, CreditCard, IdCard, Briefcase } from 'lucide-react';

const Login = () => {
  const [loginMode, setLoginMode] = useState(''); // '' | 'admin' | 'empleado' | 'cliente'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const { login, loginCliente } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMode === 'admin' || loginMode === 'empleado') {
        // Login de admin o empleado con email y password
        const result = await login(email, password);
        if (result && result.token && result.user) {
          navigate('/', { replace: true });
        } else {
          setError('Error al iniciar sesión: respuesta inválida del servidor');
          setLoading(false);
        }
      } else {
        // Login de cliente con cédula
        const result = await loginCliente(cedula);
        if (result && result.token && result.user) {
          navigate('/', { replace: true });
        } else {
          setError('Error al iniciar sesión: respuesta inválida del servidor');
          setLoading(false);
        }
      }
    } catch (err) {
      const errorMessage = err?.message || err?.response?.data?.error || err?.error || err?.data?.error || 'Error al iniciar sesión';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLoginMode('');
    setError('');
    setEmail('');
    setPassword('');
    setCedula('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative animate-fadeIn">
      <div className="max-w-md w-full animate-zoomIn">
        {/* Logo y título minimalista */}
        <div className="text-center mb-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <div className="text-6xl mb-3">
            🚗
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Gestión Automotora
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sistema de Gestión Demo
          </p>
        </div>

        {/* Formulario de login minimalista */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loginMode ? (
            /* Selección de tipo de usuario */
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">¿Cómo deseas ingresar?</h2>
              
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
                onClick={() => setLoginMode('empleado')}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-4 px-6 rounded-lg font-medium text-base transition-all duration-200"
              >
                <Briefcase className="w-5 h-5" />
                <span>Soy Empleado</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMode('cliente')}
                className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 px-6 rounded-lg font-medium text-base transition-all duration-200"
              >
                <CreditCard className="w-5 h-5" />
                <span>Soy Cliente (Ver mis cuotas)</span>
              </button>

              <p className="text-gray-500 text-xs text-center mt-4">
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

              <h3 className="text-lg font-semibold text-gray-800 text-center">
                {loginMode === 'admin' ? (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Acceso Administrativo
                  </span>
                ) : loginMode === 'empleado' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-500" />
                    Acceso Empleado
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Acceso Cliente
                  </span>
                )}
              </h3>

              {(loginMode === 'admin' || loginMode === 'empleado') ? (
                /* Formulario para admin o empleado */
                <>
                  {/* Credenciales de prueba */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Credenciales de Prueba
                    </h4>
                    <div className="space-y-1 text-xs text-blue-700">
                      {loginMode === 'admin' && (
                        <>
                          <div className="pb-2 border-b border-blue-200">
                            <p className="font-semibold mb-1">👑 Administrador</p>
                            <p><span className="font-medium">Email:</span> admin@demo.com</p>
                            <p><span className="font-medium">Contraseña:</span> admin123</p>
                          </div>
                          <div className="pt-2">
                            <p className="font-semibold mb-1">👤 Empleado</p>
                            <p><span className="font-medium">Email:</span> empleado@demo.com</p>
                            <p><span className="font-medium">Contraseña:</span> admin123</p>
                            <p className="text-[10px] text-blue-600 mt-1 italic">
                              Sin acceso a Dashboard ni Reportes
                            </p>
                          </div>
                        </>
                      )}
                      {loginMode === 'empleado' && (
                        <div>
                          <p className="font-semibold mb-1">👤 Empleado</p>
                          <p><span className="font-medium">Email:</span> empleado@demo.com</p>
                          <p><span className="font-medium">Contraseña:</span> admin123</p>
                          <p className="text-[10px] text-blue-600 mt-1 italic">
                            Acceso limitado: Autos, Clientes y Pagos (sin Dashboard ni Reportes)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : loginMode === 'cliente' ? (
                /* Formulario para cliente */
                <>
                  {/* Cédulas de prueba para clientes */}
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Cédulas de Prueba
                    </h4>
                    <div className="space-y-1 text-xs text-gray-700">
                      <p><span className="font-medium">Juan Pérez:</span> 12345678</p>
                      <p><span className="font-medium">María González:</span> 23456789</p>
                      <p><span className="font-medium">Carlos Rodríguez:</span> 34567890</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
                      Número de Cédula
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="cedula"
                        type="text"
                        value={cedula}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 8) {
                            setCedula(value);
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        placeholder="Ej: 12345678"
                        maxLength="8"
                        pattern="[0-9]{8}"
                        required
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Ingresa tu número de cédula (8 dígitos) para ver tus pagos pendientes
                    </p>
                  </div>
                </>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
