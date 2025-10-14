import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeTransitionOverlay = () => {
  const { isTransitioning } = useTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      setShow(true);
      // Ocultar después de la animación
      const timer = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.03) 0%, transparent 70%)',
        opacity: show ? 1 : 0
      }}
    />
  );
};

export default ThemeTransitionOverlay;
