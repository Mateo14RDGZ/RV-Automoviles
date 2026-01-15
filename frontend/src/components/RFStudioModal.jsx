import { X, Globe, Instagram, MessageCircle, ExternalLink } from 'lucide-react';

const RFStudioModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contactInfo = {
    web: 'rfstudiodigital.github.io',
    webUrl: 'https://rfstudiodigital.github.io/rf_studiodigital/index.html',
    instagram: '@rf_digitalstudio',
    instagramUrl: 'https://www.instagram.com/rf_digitalstudio/',
    whatsapp: '(+598) 092 870 198',
    whatsappNumber: '598092870198'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header minimalista con gradiente sutil */}
        <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:rotate-90"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse-slow">
              RF Studio Digital
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              Desarrollo Web & Software
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3">
          {/* Enlaces de contacto con diseño moderno */}
          <div className="space-y-3">
            {/* Web */}
            <a
              href={contactInfo.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-blue-200 dark:border-blue-800/50"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">Sitio Web</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{contactInfo.web}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Instagram */}
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-pink-200 dark:border-pink-800/50"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-pink-600 dark:text-pink-400 font-semibold uppercase tracking-wider">Instagram</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{contactInfo.instagram}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${contactInfo.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-green-200 dark:border-green-800/50"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wider">WhatsApp</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{contactInfo.whatsapp}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Footer minimalista */}
          <div className="pt-6 mt-2">
            <p className="text-center text-xs text-gray-400 dark:text-gray-600">
              © 2026 RF Studio Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFStudioModal;
