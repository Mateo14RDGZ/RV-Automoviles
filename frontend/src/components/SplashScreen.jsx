import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones de entrada
    setTimeout(() => setAnimate(true), 200);
    
    // Iniciar animación de salida después de 2 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 1000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ 
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        background: 'linear-gradient(to bottom right, #0A1929, #1565C0, #0D47A1)'
      }}
    >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transition-all duration-1000 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 delay-150 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-8 w-full">
        {/* Texto principal - entra desde arriba */}
        <div 
          style={{
            opacity: !isVisible ? 0 : animate ? 1 : 0,
            transform: !isVisible 
              ? 'translate3d(0, -200px, 0)' 
              : animate 
                ? 'translate3d(0, 0, 0)' 
                : 'translate3d(0, -300px, 0)',
            transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform, opacity'
          }}
        >
          <p className="text-sm md:text-base font-light text-white/60 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
          
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide">
            <span className="bg-gradient-to-r from-white/90 via-blue-100 to-white/90 bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Spinner de carga - entra desde abajo */}
        <div 
          className="mt-8 flex justify-center"
          style={{
            opacity: !isVisible ? 0 : animate ? 1 : 0,
            transform: !isVisible 
              ? 'translate3d(0, 200px, 0)' 
              : animate 
                ? 'translate3d(0, 0, 0)' 
                : 'translate3d(0, 300px, 0)',
            transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            willChange: 'transform, opacity'
          }}
        >
          <div className="relative w-12 h-12">
            {/* Círculo exterior */}
            <div className="absolute inset-0 border-3 border-white/30 rounded-full"></div>
            {/* Arco animado giratorio */}
            <div className="absolute inset-0 border-3 border-transparent border-t-white rounded-full animate-spin" style={{ animationDuration: '0.6s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
