import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones de entrada con delay mínimo
    const animateTimer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    
    // Iniciar animación de salida después de 2 segundos
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);
    
    // Cerrar splash después de que termine la animación de salida
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(animateTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  // Calcular estados de transformación
  const getPoweredByTransform = () => {
    if (!isVisible) return 'translate3d(500px, 0, 0)'; // Sale a la derecha
    if (animate) return 'translate3d(0, 0, 0)'; // Posición central
    return 'translate3d(-500px, 0, 0)'; // Entra desde la izquierda
  };

  const getRFTransform = () => {
    if (!isVisible) return 'translate3d(-500px, 0, 0)'; // Sale a la izquierda
    if (animate) return 'translate3d(0, 0, 0)'; // Posición central
    return 'translate3d(500px, 0, 0)'; // Entra desde la derecha
  };

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
            opacity: (animate && isVisible) ? 1 : 0,
            transform: getPoweredByTransform(),
            transition: 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1.1s ease-out',
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
            opacity: (animate && isVisible) ? 1 : 0,
            transform: getRFTransform(),
            transition: 'transform 1.1s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1.1s ease-out',
            willChange: 'transform, opacity'
          }}
        >
          <h2 className="text-2xl md:text-3xl font-medium tracking-wide">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Spinner de carga - siempre visible, sin animaciones de entrada/salida */}
        <div 
          className="mt-10 flex justify-center"
          style={{
            opacity: 1
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
