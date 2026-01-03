import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageTransition from './PageTransition';
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
  History
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Items del menú según el rol
  const getNavItems = () => {
    if (user?.rol === 'admin') {
      return [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Escritorio' },
        { to: '/autos', icon: Car, label: 'Autos' },
        { to: '/clientes', icon: Users, label: 'Clientes' },
        { to: '/pagos', icon: CreditCard, label: 'Pagos' },
        { to: '/reportes', icon: FileText, label: 'Reportes' },
      ];
    }
    
    if (user?.rol === 'empleado') {
      return [
        { to: '/empleado-dashboard', icon: LayoutDashboard, label: 'Escritorio' },
        { to: '/autos', icon: Car, label: 'Autos' },
        { to: '/clientes', icon: Users, label: 'Clientes' },
        { to: '/pagos', icon: CreditCard, label: 'Pagos' },
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
          <div className="flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-900 to-blue-800 py-5 px-4">
            <div className="text-center w-full">
              <img 
                src="/logo-nicolas-tejera.png" 
                alt="Nicolas Tejera Automoviles" 
                className="h-28 w-auto mx-auto object-contain mb-2 drop-shadow-lg"
                onError={(e) => {
                  // Si la imagen no carga, mostrar emoji como fallback
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="text-3xl mb-1 hidden">🚗</div>
              <h1 className="text-white text-base font-bold">Nicolas Tejera</h1>
              <p className="text-white text-xs opacity-90">Automoviles</p>
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
          </nav>

          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.cliente?.nombre || user?.email}
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
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 py-3 px-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src="/logo-nicolas-tejera.png" 
                    alt="Nicolas Tejera Automoviles" 
                    className="h-14 w-auto object-contain drop-shadow-lg flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-2xl hidden">🚗</div>
                  <h1 className="text-white text-xs font-bold leading-tight">Nicolas Tejera<br/>Automoviles</h1>
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
            </nav>

            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
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
    </div>
  );
};

export default Layout;
