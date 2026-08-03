import { useEffect } from 'react';

function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Cerrar splash después de que termine la animación del logo.
    const timer = setTimeout(() => {
      onFinish();
    }, 2600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <>
      <style>{`
        @keyframes splashLogoReveal {
          0% {
            clip-path: circle(0% at 50% 50%);
            opacity: 0;
            transform: scale(0.92);
          }
          24% {
            clip-path: circle(72% at 50% 50%);
            opacity: 1;
            transform: scale(1);
          }
          72% {
            clip-path: circle(72% at 50% 50%);
            opacity: 1;
            transform: scale(1);
          }
          86% {
            clip-path: circle(72% at 50% 50%);
            opacity: 1;
            transform: scale(1.015);
          }
          100% {
            clip-path: circle(72% at 50% 50%);
            opacity: 0;
            transform: scale(0.97);
          }
        }

        @keyframes splashAura {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          30% { opacity: 0.42; transform: scale(1); }
          74% { opacity: 0.28; transform: scale(1.06); }
        }

        @keyframes splashBackdropExit {
          0%, 84% { opacity: 1; }
          100% { opacity: 0; }
        }

        .splash-backdrop {
          animation: splashBackdropExit 2.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .splash-logo {
          animation: splashLogoReveal 2.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, clip-path;
        }

        .splash-aura {
          animation: splashAura 2.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-backdrop,
          .splash-logo,
          .splash-aura {
            animation: none;
          }
        }
      `}</style>

      <div
        className="splash-backdrop fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        role="status"
        aria-label="Cargando RV Automóviles"
        style={{
          width: '100vw',
          height: '100dvh',
          background: 'linear-gradient(to bottom right, #0A1929, #1565C0, #0D47A1)'
        }}
      >
        {/* Halo de profundidad detrás del logo */}
        <div className="splash-aura absolute h-[min(82vw,25rem)] w-[min(82vw,25rem)] rounded-full bg-white/35 blur-3xl" />

        {/* Logo transparente, mostrado en blanco para contrastar con el fondo */}
        <div className="splash-logo relative z-10 h-[min(72vw,20rem)] w-[min(72vw,20rem)]">
          <img
            src="/mr14-logo.png"
            alt="MR14"
            className="h-full w-full object-contain brightness-0 invert drop-shadow-[0_16px_32px_rgba(0,0,0,0.28)]"
            fetchPriority="high"
            draggable="false"
          />
        </div>
      </div>
    </>
  );
}

export default SplashScreen;
