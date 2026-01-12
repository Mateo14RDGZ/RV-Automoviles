import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [stage, setStage] = useState('entering'); // entering, visible, exiting

  useEffect(() => {
    // Doble requestAnimationFrame para asegurar que el DOM está completamente pintado
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Pasar a visible después de que el navegador pinte el estado inicial
        const visibleTimer = setTimeout(() => {
          setStage('visible');
        }, 200);
        
        // Iniciar animación de salida - dar tiempo suficiente para ver las letras en centro
        const exitTimer = setTimeout(() => {
          setStage('exiting');
        }, 3700);
        
        // Cerrar splash después de la salida completa
        const finishTimer = setTimeout(() => {
          onFinish();
        }, 6700);

        return () => {
          clearTimeout(visibleTimer);
          clearTimeout(exitTimer);
          clearTimeout(finishTimer);
        };
      });
    });
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
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transition-all duration-1000 ${stage !== 'entering' ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 delay-150 ${stage !== 'entering' ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-8 w-full">
        {/* "Powered by" - entra y sale por la izquierda */}
        <div 
          style={{
            transform: stage === 'entering' 
              ? 'translate3d(-1000px, 0, 0)' 
              : stage === 'visible'
                ? 'translate3d(0, 0, 0)'
                : 'translate3d(-1000px, 0, 0)',
            transition: 'transform 3s ease-in-out',
            willChange: 'transform'
          }}
        >
          <p className="text-sm md:text-base font-light text-white/70 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
        </div>

        {/* "RF Digital Studio" - entra y sale por la derecha */}
        <div 
          style={{
            transform: stage === 'entering' 
              ? 'translate3d(1000px, 0, 0)' 
              : stage === 'visible'
                ? 'translate3d(0, 0, 0)'
                : 'translate3d(1000px, 0, 0)',
            transition: 'transform 3s ease-in-out',
            willChange: 'transform'
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
