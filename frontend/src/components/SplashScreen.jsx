import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones después de montar
    setTimeout(() => setAnimate(true), 50);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0A1929] via-[#1565C0] to-[#0D47A1] transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transition-all duration-1000 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl transition-all duration-1000 delay-300 ${animate ? 'scale-150 opacity-100' : 'scale-0 opacity-0'}`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl transition-all duration-1000 delay-150 ${animate ? 'scale-125 opacity-100' : 'scale-0 opacity-0'}`}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative text-center px-8">
        {/* Texto principal animado minimalista */}
        <div className={`transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-sm md:text-base font-light text-white/60 tracking-[0.3em] uppercase mb-3">
            Powered by
          </p>
          
          <h2 className={`text-2xl md:text-3xl font-medium tracking-wide transition-all duration-700 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="bg-gradient-to-r from-white/90 via-blue-100 to-white/90 bg-clip-text text-transparent">
              RF Digital Studio
            </span>
          </h2>
        </div>

        {/* Línea decorativa sutil */}
        <div className={`mt-8 transition-all duration-700 delay-400 ${animate ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            transform: translateX(0);
          }
          50% {
            width: 70%;
            transform: translateX(0);
          }
          100% {
            width: 0%;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;
