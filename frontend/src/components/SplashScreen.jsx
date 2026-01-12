import { useEffect, useState } from 'react';

function SplashScreen({ onFinish }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Espera a que termine la animación
    }, 2000); // Muestra el splash por 2 segundos

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        <div className="mb-6 animate-pulse">
          <svg
            className="w-24 h-24 mx-auto text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
          RF Digital Studio
        </h1>
        <p className="text-blue-100 text-sm font-light tracking-wider">
          Powered by RF Digital Studio
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;
