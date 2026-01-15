import { X, Globe, Instagram, MessageCircle, Code, Sparkles } from 'lucide-react';

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Code className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">RF Studio Digital</h2>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Desarrollo Web & Software
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mb-6">
            Soluciones digitales profesionales para tu negocio
          </p>

          {/* Enlaces de contacto */}
          <div className="space-y-3">
            {/* Web */}
            <a
              href={contactInfo.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sitio Web</p>
                <p className="font-medium text-gray-900 dark:text-white">{contactInfo.web}</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Instagram</p>
                <p className="font-medium text-gray-900 dark:text-white">{contactInfo.instagram}</p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${contactInfo.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</p>
                <p className="font-medium text-gray-900 dark:text-white">{contactInfo.whatsapp}</p>
              </div>
            </a>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © 2026 RF Studio Digital. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFStudioModal;
