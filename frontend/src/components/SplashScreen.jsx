import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones de entrada
    setTimeout(() => setAnimate(true), 50);
    
    // Iniciar animación de salida después de 1.5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0A1929] via-[#1565C0] to-[#0D47A1] transition-all duration-400 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
      }`}
    >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transition-all duration-1000 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 delay-150 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl transition-all duration-1000 delay-75 ${animate ? 'scale-125 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative text-center px-8">
        {/* Texto principal animado minimalista */}
        <div className={`transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <p className="text-sm md:text-base font-light text-white/60 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
          
          <h2 className={`text-2xl md:text-3xl font-medium tracking-wide transition-all duration-500 delay-100 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <span className="bg-gradient-to-r from-white/90 via-blue-100 to-white/90 bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Spinner de carga */}
        <div className={`mt-8 flex justify-center transition-all duration-500 delay-200 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="relative w-8 h-8">
            {/* Círculo exterior giratorio */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
            {/* Arco animado */}
            <div className="absolute inset-0 border-2 border-transparent border-t-white/80 border-r-white/60 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
