import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Iniciar animaciones después de montar
    setTimeout(() => setAnimate(true), 50);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Espera a que termine la animación
    }, 2500); // Muestra el splash por 2.5 segundos

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
      </div>

      {/* Contenido principal */}
      <div className="relative text-center px-8">
        {/* Logo RF con animación */}
        <div className={`mb-8 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="relative inline-block">
            {/* Anillo exterior giratorio */}
            <div className="absolute inset-0 -m-4">
              <div className="w-32 h-32 border-2 border-white/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            
            {/* Círculo principal con letras RF */}
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
              <span className="text-5xl font-black text-white tracking-tighter">RF</span>
            </div>
            
            {/* Puntos decorativos */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Título principal */}
        <h1 className={`text-4xl md:text-5xl font-black text-white mb-3 tracking-tight transition-all duration-700 delay-200 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            RF Digital Studio
          </span>
        </h1>

        {/* Subtítulo */}
        <div className={`transition-all duration-700 delay-400 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-300"></div>
            <p className="text-blue-100 text-sm font-light tracking-[0.2em] uppercase">
              Powered by
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-300"></div>
          </div>
          <p className="text-white/80 text-xs tracking-wider">
            Soluciones Web Profesionales
          </p>
        </div>

        {/* Barra de carga */}
        <div className={`mt-8 transition-all duration-700 delay-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-48 h-1 mx-auto bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
