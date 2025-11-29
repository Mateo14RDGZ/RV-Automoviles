import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/Layout';
import ThemeTransitionOverlay from './components/ThemeTransitionOverlay';
import InstallPWABanner from './components/InstallPWABanner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Autos from './pages/Autos';
import Clientes from './pages/Clientes';
import Pagos from './pages/Pagos';
import Reportes from './pages/Reportes';
import ClienteDashboard from './pages/ClienteDashboard';

function App() {
  return (
    <ThemeProvider>
      <ThemeTransitionOverlay />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<RoleBasedRedirect />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/autos" element={<Autos />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/pagos" element={<Pagos />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/mi-dashboard" element={<ClienteDashboard />} />
              </Route>
            </Route>
          </Routes>
          
          {/* Banner de instalación PWA */}
          <InstallPWABanner />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
