import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import AdminOnlyRoute from './components/AdminOnlyRoute';
import Layout from './components/Layout';
import ThemeTransitionOverlay from './components/ThemeTransitionOverlay';
import InstallPWABanner from './components/InstallPWABanner';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmpleadoDashboard from './pages/EmpleadoDashboard';
import Autos from './pages/Autos';
import Clientes from './pages/Clientes';
import Pagos from './pages/Pagos';
import Comprobantes from './pages/Comprobantes';
import Reportes from './pages/Reportes';
import ClienteDashboard from './pages/ClienteDashboard';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <ThemeTransitionOverlay />
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<RoleBasedRedirect />} />
                  
                  {/* Rutas solo para admin */}
                  <Route element={<AdminOnlyRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reportes" element={<Reportes />} />
                  </Route>
                  
                  {/* Dashboard para empleados */}
                  <Route path="/empleado-dashboard" element={<EmpleadoDashboard />} />
                  
                  {/* Rutas para staff (admin y empleado) */}
                  <Route path="/autos" element={<Autos />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/pagos" element={<Pagos />} />
                  <Route path="/comprobantes" element={<Comprobantes />} />
                  
                  {/* Ruta para clientes */}
                  <Route path="/mi-dashboard" element={<ClienteDashboard />} />
                </Route>
              </Route>
            </Routes>
            
            {/* Banner de instalación PWA */}
            <InstallPWABanner />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
