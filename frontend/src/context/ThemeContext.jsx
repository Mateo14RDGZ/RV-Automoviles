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
const getInitialTheme = () => {
  // Primero intentar obtener de localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  
  // Si no hay tema guardado, detectar preferencia del sistema
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

// Aplicar tema inmediatamente antes del render para prevenir flash
const applyThemeImmediately = () => {
  const theme = getInitialTheme();
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  return theme;
};

export const ThemeProvider = ({ children }) => {
  // Inicializar con el tema aplicado inmediatamente
  const [theme, setTheme] = useState(() => applyThemeImmediately());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Aplicar clase al HTML con animación suave
    const root = window.document.documentElement;
    
    // Activar transición
    setIsTransitioning(true);
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    
    // Desactivar bandera de transición después de la animación
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [theme]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Solo aplicar si no hay tema guardado manualmente
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    // Agregar listener para cambios en el sistema
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isTransitioning
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
