import { useEffect } from 'react';

function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Cerrar splash después de que terminen todas las animaciones
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <>
      <style>{`
        @keyframes slideFromLeft {
          0% { transform: translate3d(-1200px, 0, 0); opacity: 1; }
          30% { transform: translate3d(0, 0, 0); opacity: 1; }
          70% { transform: translate3d(0, 0, 0); opacity: 1; }
          100% { transform: translate3d(-1200px, 0, 0); opacity: 1; }
        }
        
        @keyframes slideFromRight {
          0% { transform: translate3d(1200px, 0, 0); opacity: 1; }
          30% { transform: translate3d(0, 0, 0); opacity: 1; }
          70% { transform: translate3d(0, 0, 0); opacity: 1; }
          100% { transform: translate3d(1200px, 0, 0); opacity: 1; }
        }
        
        @keyframes slideFromBottom {
          0% { transform: translate3d(0, 200px, 0); opacity: 0; }
          30% { transform: translate3d(0, 0, 0); opacity: 1; }
          70% { transform: translate3d(0, 0, 0); opacity: 1; }
          100% { transform: translate3d(0, 200px, 0); opacity: 0; }
        }
        
        .slide-left {
          animation: slideFromLeft 3s ease-in-out forwards;
        }
        
        .slide-right {
          animation: slideFromRight 3s ease-in-out forwards;
        }
        
        .slide-bottom {
          animation: slideFromBottom 3s ease-in-out forwards;
        }
      `}</style>
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ 
          width: '100vw',
          height: '100dvh',
          background: 'linear-gradient(to bottom right, #0A1929, #1565C0, #0D47A1)'
        }}
      >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl scale-150 opacity-100"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl scale-150 opacity-100"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-8 w-full">
        {/* "Powered by" - entra y sale por la izquierda */}
        <div className="slide-left">
          <p className="text-sm md:text-base font-light text-white/70 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
        </div>

        {/* "RF Digital Studio" - entra y sale por la derecha */}
        <div className="slide-right">
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Spinner de carga - siempre visible, sin animaciones de entrada/salida */}
        <div 
          className="mt-10 flex justify-center slide-bottom"
        >
          <div className="relative w-11 h-11">
            {/* Círculo exterior */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid rgba(255, 255, 255, 0.2)'
              }}
            ></div>
            {/* Arco animado giratorio */}
            <div 
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '3px solid transparent',
                borderTopColor: 'rgba(255, 255, 255, 0.9)',
                borderRightColor: 'rgba(255, 255, 255, 0.6)',
                animationDuration: '0.7s'
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default SplashScreen;
