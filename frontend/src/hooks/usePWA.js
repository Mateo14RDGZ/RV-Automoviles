// Hook personalizado para PWA
import { useEffect, useState } from 'react';

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detectar plataforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsiOS(ios);
    setIsAndroid(android);
    
    console.log('[PWA] Plataforma detectada:', { ios, android, userAgent });
    
    // Verificar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      console.log('[PWA] App ejecutándose como PWA instalada');
      return;
    }
    
    // En iOS, siempre es "instalable" (manualmente vía Safari)
    if (ios) {
      console.log('[PWA] iOS detectado - Banner manual disponible');
      setIsInstallable(true);
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registrado:', registration.scope);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[PWA] Nueva versión encontrada');
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nueva versión disponible');
                // Podrías mostrar un mensaje al usuario aquí
              }
            });
          });
        })
        .catch((error) => {
          console.error('[PWA] Error al registrar Service Worker:', error);
        });
    }

    // Escuchar evento de instalación
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] Evento beforeinstallprompt disparado');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No hay prompt de instalación disponible');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] Usuario eligió:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Error al mostrar prompt de instalación:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    isiOS,
    isAndroid,
    deferredPrompt
  };
};
