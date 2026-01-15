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
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-md w-full shadow-2xl transform transition-all border border-slate-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Header profesional */}
        <div className="relative bg-gradient-to-r from-blue-900 via-slate-800 to-blue-900 p-8 text-center border-b border-slate-700/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 group"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
          </button>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              RF Studio Digital
            </h2>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Desarrollo Web & Software
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-3 bg-slate-900">
          {/* Enlaces de contacto profesionales */}
          <div className="space-y-3">
            {/* Web */}
            <a
              href={contactInfo.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-200 border border-slate-700/50 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-900/20"
              style={{ transform: 'translateZ(0)' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-blue-900/50">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-0.5">Sitio Web</p>
                <p className="font-semibold text-white text-sm">{contactInfo.web}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
            </a>

            {/* Instagram */}
            <a
              href={contactInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-200 border border-slate-700/50 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/30"
              style={{ transform: 'translateZ(0)' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-slate-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-slate-900/50">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Instagram</p>
                <p className="font-semibold text-white text-sm">{contactInfo.instagram}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${contactInfo.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all duration-200 border border-slate-700/50 hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-900/20"
              style={{ transform: 'translateZ(0)' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600 rounded-lg blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-emerald-900/50">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">WhatsApp</p>
                <p className="font-semibold text-white text-sm">{contactInfo.whatsapp}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Footer */}
          <div className="pt-6 mt-2">
            <p className="text-center text-xs text-slate-500">
              © 2026 RF Studio Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFStudioModal;
