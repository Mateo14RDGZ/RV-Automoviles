// Componente de banner de instalación PWA
import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const InstallPWABanner = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya rechazó el banner
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    
    if (!bannerDismissed && isInstallable && !isInstalled) {
      // Mostrar banner después de 3 segundos
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    // Recordar que el usuario rechazó por 7 días
    const dismissedDate = new Date();
    dismissedDate.setDate(dismissedDate.getDate() + 7);
    localStorage.setItem('pwa-banner-dismissed', dismissedDate.toISOString());
  };

  if (!showBanner || dismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slideUp">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              ¡Instala RV Autos!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Accede más rápido desde tu pantalla de inicio. Sin ocupar espacio.
            </p>

            <button
              onClick={handleInstall}
              className="w-full btn btn-primary flex items-center justify-center gap-2 text-sm py-2"
            >
              <Download className="w-4 h-4" />
              Instalar Aplicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPWABanner;
