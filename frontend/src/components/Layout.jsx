import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from './PageTransition';
import RFStudioModal from './RFStudioModal';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  CreditCard, 
  FileText,
  LogOut,
  Menu,
  X,
  TrendingUp,
  History,
  MessageCircle,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cuotasVencidas, setCuotasVencidas] = useState(0);
  const [showRFModal, setShowRFModal] = useState(false);
  const isStaff = user?.rol === 'admin' || user?.rol === 'empleado';

  // Cargar cuotas vencidas para staff
  useEffect(() => {
    if (isStaff) {
      loadCuotasVencidas();
      
      // Actualizar cada 30 segundos
      const interval = setInterval(() => {
        loadCuotasVencidas();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isStaff]);

  const loadCuotasVencidas = async () => {
    try {
      const response = await api.get('/pagos', {
        params: { vencidos: 'true' }
      });
      setCuotasVencidas(response.data.length);
    } catch (error) {
      console.error('Error al cargar cuotas vencidas:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCuotasVencidasClick = () => {
    navigate('/pagos', { state: { filterVencidos: true } });
  };

  // Items del menú según el rol
  const getNavItems = () => {
    if (user?.rol === 'admin') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Escritorio' },
        { to: '/autos', icon: Car, label: 'Autos' },
        { to: '/clientes', icon: Users, label: 'Clientes' },
        { to: '/pagos', icon: CreditCard, label: 'Pagos' },
        { to: '/comprobantes', icon: Receipt, label: 'Comprobantes' },
        { to: '/reportes', icon: FileText, label: 'Reportes' },
      ];
    }
    
    if (user?.rol === 'empleado') {
      return [
        { to: '/empleado-dashboard', icon: LayoutDashboard, label: 'Escritorio' },
        { to: '/autos', icon: Car, label: 'Autos' },
        { to: '/clientes', icon: Users, label: 'Clientes' },
        { to: '/pagos', icon: CreditCard, label: 'Pagos' },
        { to: '/comprobantes', icon: Receipt, label: 'Comprobantes' },
      ];
    }
    
    // Cliente
    return [
      { to: '/mi-dashboard', icon: TrendingUp, label: 'Mi Escritorio' },
      { to: '/pagos', icon: CreditCard, label: 'Mis Cuotas' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 bg-blue-900 py-5 px-4">
            <div className="text-center w-full">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold tracking-tight text-white">
                  RV
                </div>
                <div className="text-sm font-light text-white/90 tracking-wider -mt-1">
                  Automóviles
                </div>
                <div className="w-20 h-px bg-white/30 mt-2"></div>
              </div>
              <p className="text-white text-xs font-medium mt-3 opacity-80">Sistema de Gestión</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            ))}

            {/* Cuotas Vencidas - Solo para staff */}
            {isStaff && (
              <button
                onClick={handleCuotasVencidasClick}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700 group"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3 text-red-600 group-hover:text-red-700" />
                  <span>Cuotas Vencidas</span>
                </div>
                {cuotasVencidas > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                    {cuotasVencidas}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Botón de soporte - Solo para admin y empleado */}
          {(user?.rol === 'admin' || user?.rol === 'empleado') && (
            <div className="px-4 pb-4">
              <a
                href="https://wa.me/59892870198"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Contactar Soporte
              </a>
            </div>
          )}

          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nombre || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'empleado' ? 'Empleado' : 'Cliente'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            
            {/* Powered by RF Digital Studio */}
            <div className="text-center">
              <button
                onClick={() => setShowRFModal(true)}
                className="text-xs text-gray-400 hover:text-blue-500 transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer"
              >
                Powered by <span className="font-semibold">RF Digital Studio</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-center bg-blue-900 py-5 px-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold tracking-tight text-white">
                      RV
                    </div>
                    <div className="text-xs font-light text-white/90 tracking-wider -mt-1">
                      Automóviles
                    </div>
                  </div>
                  <p className="text-white text-xs font-medium mt-2 opacity-80">Sistema de Gestión</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white flex-shrink-0"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </NavLink>
              ))}

              {/* Cuotas Vencidas - Solo para staff (Mobile) */}
              {isStaff && (
                <button
                  onClick={() => {
                    handleCuotasVencidasClick();
                    setSidebarOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700 group"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-3 text-red-600 group-hover:text-red-700" />
                    <span>Cuotas Vencidas</span>
                  </div>
                  {cuotasVencidas > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                      {cuotasVencidas}
                    </span>
                  )}
                </button>
              )}
            </nav>

            {/* Botón de soporte mobile - Solo para admin y empleado */}
            {(user?.rol === 'admin' || user?.rol === 'empleado') && (
              <div className="px-4 pb-4">
                <a
                  href="https://wa.me/59892870198"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar Soporte
                </a>
              </div>
            )}

            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'empleado' ? 'Empleado' : 'Cliente'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
              
              {/* Powered by RF Digital Studio */}
              <div className="text-center">
                <button
                  onClick={() => setShowRFModal(true)}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  Powered by <span className="font-semibold">RF Digital Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Modal de RF Studio Digital */}
      <RFStudioModal isOpen={showRFModal} onClose={() => setShowRFModal(false)} />
    </div>
  );
};

export default Layout;
