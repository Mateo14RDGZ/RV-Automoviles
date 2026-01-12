import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones de entrada después de un breve delay
    setTimeout(() => setAnimate(true), 200);
    
    // Iniciar animación de salida después de 2 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 900);
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
        {/* "Powered by" - entra desde la izquierda, sale a la derecha */}
        <div 
          style={{
            opacity: !isVisible ? 0 : animate ? 1 : 0,
            transform: !isVisible 
              ? 'translate3d(300px, 0, 0)' 
              : animate 
                ? 'translate3d(0, 0, 0)' 
                : 'translate3d(-300px, 0, 0)',
            transition: 'all 1s ease-out',
            willChange: 'transform, opacity'
          }}
        >
          <p className="text-sm md:text-base font-light text-white/70 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
        </div>

        {/* "RF Digital Studio" - entra desde la derecha, sale a la izquierda */}
        <div 
          style={{
            opacity: !isVisible ? 0 : animate ? 1 : 0,
            transform: !isVisible 
              ? 'translate3d(-300px, 0, 0)' 
              : animate 
                ? 'translate3d(0, 0, 0)' 
                : 'translate3d(300px, 0, 0)',
            transition: 'all 1s ease-out',
            willChange: 'transform, opacity'
          }}
        >
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Spinner de carga - solo aparece con fade, sin movimiento */}
        <div 
          className="mt-10 flex justify-center"
          style={{
            opacity: !isVisible ? 0 : animate ? 1 : 0,
            transition: 'opacity 0.8s ease-out 0.3s'
          }}
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
  );
}

export default SplashScreen;
