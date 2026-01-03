import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

// Función para obtener el tema inicial antes del render
// Siempre forzar modo claro
const getInitialTheme = () => {
  return 'light';
};

// Aplicar tema inmediatamente antes del render para prevenir flash
const applyThemeImmediately = () => {
  const theme = 'light'; // Siempre modo claro
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  return theme;
};

export const ThemeProvider = ({ children }) => {
  // Siempre forzar modo claro
  const [theme] = useState('light');
  const [isTransitioning] = useState(false);

  useEffect(() => {
    // Aplicar clase al HTML - siempre modo claro
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('light');
    
    // Guardar en localStorage
    localStorage.setItem('theme', 'light');
  }, []);

  // No hay toggleTheme - siempre modo claro
  const toggleTheme = () => {
    // No hacer nada - siempre modo claro
  };

  const value = {
    theme: 'light',
    setTheme: () => {}, // No hacer nada
    toggleTheme,
    isDark: false,
    isTransitioning: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
