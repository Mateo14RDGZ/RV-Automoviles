import { useState, useEffect } from 'react';
import { comprobantesService } from '../services/apiServices';
import { formatCurrency, formatDate } from '../utils/format';
import { 
  FileText, 
  Eye, 
  Check, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';

const Comprobantes = () => {
  const { showToast } = useToast();
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // todos, pendiente, aprobado, rechazado
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [pagoAprobado, setPagoAprobado] = useState(null);

  useEffect(() => {
    loadComprobantes();
  }, [filter]);

  const loadComprobantes = async () => {
    try {
      setLoading(true);
      const params = filter !== 'todos' ? { estado: filter } : {};
      const data = await comprobantesService.getNotificaciones(params);
      setComprobantes(data);
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      showToast('Error al cargar comprobantes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verComprobante = (comprobante) => {
    setComprobanteSeleccionado(comprobante);
    setMostrarComprobante(true);
    // Marcar como visto
    if (!comprobante.visto) {
      comprobantesService.marcarVisto(comprobante.id, true).then(() => {
        loadComprobantes();
      });
    }
  };

  const aprobarComprobante = async (id, notas = '') => {
    try {
      const resultado = await comprobantesService.actualizarEstado(id, 'aprobado', notas);
      showToast('Comprobante aprobado exitosamente', 'success');
      setMostrarComprobante(false);
      
      // Guardar información del pago para el modal de WhatsApp
      if (comprobanteSeleccionado && comprobanteSeleccionado.pago) {
        setPagoAprobado({
          ...comprobanteSeleccionado.pago,
          estado: 'pagado',
          fechaPago: new Date().toISOString()
        });
        setMostrarModalWhatsApp(true);
      }
      
      setComprobanteSeleccionado(null);
      await loadComprobantes();
    } catch (error) {
      showToast(error.message || 'Error al aprobar comprobante', 'error');
    }
  };

  const rechazarComprobante = async (id, notas = '') => {
    try {
      await comprobantesService.actualizarEstado(id, 'rechazado', notas);
      showToast('Comprobante rechazado', 'success');
      setMostrarComprobante(false);
      setComprobanteSeleccionado(null);
      await loadComprobantes();
    } catch (error) {
      showToast(error.message || 'Error al rechazar comprobante', 'error');
    }
  };

  const enviarWhatsAppConfirmacion = () => {
    try {
      if (!pagoAprobado) return;
      
      const cliente = pagoAprobado.auto.cliente;
      const auto = pagoAprobado.auto;
      const fechaPago = new Date(pagoAprobado.fechaPago || new Date()).toLocaleDateString('es-UY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      
      const mensaje = `*CONFIRMACIÓN DE PAGO - RV AUTOMÓVILES*\n\n` +
        `Estimado/a ${cliente.nombre},\n\n` +
        `Le confirmamos la recepción de su pago correspondiente a:\n\n` +
        `🚗 *Vehículo:* ${auto.marca} ${auto.modelo} ${auto.anio}\n` +
        `📋 *Matrícula:* ${auto.matricula}\n` +
        `💳 *Cuota N°:* ${pagoAprobado.numeroCuota}\n` +
        `💵 *Monto Pagado:* ${formatCurrency(parseFloat(pagoAprobado.monto))}\n` +
        `📅 *Fecha de Pago:* ${fechaPago}\n\n` +
        `Agradecemos su puntualidad en el cumplimiento de sus obligaciones.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `*📱 ACCESO A TU PORTAL DE CUOTAS*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `Consulta el estado de todas tus cuotas en cualquier momento:\n\n` +
        `🌐 *Link:* https://rv--automoviles.vercel.app\n\n` +
        `🔐 *TUS CREDENCIALES:*\n` +
        `👤 Usuario (Cédula): *${cliente.cedula}*\n` +
        `🔑 Contraseña: *${cliente.passwordTemporal || 'Consultar con RV Automóviles'}*\n\n` +
        `💡 _Guarda estas credenciales para acceder en cualquier momento_\n\n` +
        `Saludos cordiales,\n` +
        `*RV Automóviles* 🚗`;
      
      // Limpiar el número de teléfono
      let telefono = cliente.telefono.replace(/[^0-9]/g, '');
      if (telefono.startsWith('0')) {
        telefono = telefono.substring(1);
      }
      
      // Abrir WhatsApp
      const url = `https://wa.me/598${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      
      // Cerrar modal
      setTimeout(() => {
        setMostrarModalWhatsApp(false);
        setPagoAprobado(null);
      }, 500);
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      showToast('Error al abrir WhatsApp', 'error');
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <span className="badge badge-success">Aprobado</span>;
      case 'rechazado':
        return <span className="badge badge-danger">Rechazado</span>;
      case 'pendiente':
      default:
        return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rechazado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pendiente':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const comprobantesFiltrados = comprobantes;
  const pendientes = comprobantes.filter(c => c.estado === 'pendiente').length;
  const aprobados = comprobantes.filter(c => c.estado === 'aprobado').length;
  const rechazados = comprobantes.filter(c => c.estado === 'rechazado').length;

  if (loading) {
    return <Loading message="Cargando comprobantes..." />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Comprobantes de Pago</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Gestiona y revisa los comprobantes de pago enviados por los clientes</p>
      </div>

      {/* Filtros */}
      <div className="card p-4 md:p-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">Filtros:</span>
          </div>
          <button
            onClick={() => setFilter('todos')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === 'todos'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({comprobantes.length})
          </button>
          <button
            onClick={() => setFilter('pendiente')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
              filter === 'pendiente'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pendientes ({pendientes})
          </button>
          <button
            onClick={() => setFilter('aprobado')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
              filter === 'aprobado'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Aprobados ({aprobados})
          </button>
          <button
            onClick={() => setFilter('rechazado')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
              filter === 'rechazado'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rechazados ({rechazados})
          </button>
          <button
            onClick={loadComprobantes}
            className="md:ml-auto px-3 md:px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de comprobantes */}
      <div className="card animate-fadeInUp overflow-hidden" style={{animationDelay: '0.3s'}}>
        {comprobantesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {filter === 'todos' 
                ? 'No hay comprobantes registrados'
                : `No hay comprobantes ${filter === 'pendiente' ? 'pendientes' : filter === 'aprobado' ? 'aprobados' : 'rechazados'}`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cuota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {comprobantesFiltrados.map((comprobante) => (
                    <tr 
                      key={comprobante.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        !comprobante.visto ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {comprobante.pago.auto.cliente.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {comprobante.pago.auto.cliente.cedula}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {comprobante.pago.auto.marca} {comprobante.pago.auto.modelo}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {comprobante.pago.auto.matricula}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        Cuota #{comprobante.pago.numeroCuota}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(comprobante.pago.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEstadoIcon(comprobante.estado)}
                          {getEstadoBadge(comprobante.estado)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comprobante.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => verComprobante(comprobante)}
                          className="btn btn-primary btn-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="md:hidden space-y-3 p-4">
              {comprobantesFiltrados.map((comprobante) => (
                <div
                  key={comprobante.id}
                  className={`rounded-lg p-4 border-2 transition-all ${
                    !comprobante.visto
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {comprobante.pago.auto.cliente.nombre}
                        </h3>
                        {!comprobante.visto && (
                          <span className="badge badge-warning text-xs">Nuevo</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cédula: {comprobante.pago.auto.cliente.cedula}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(comprobante.estado)}
                      {getEstadoBadge(comprobante.estado)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Vehículo:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comprobante.pago.auto.marca} {comprobante.pago.auto.modelo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Matrícula:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {comprobante.pago.auto.matricula}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Cuota:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        #{comprobante.pago.numeroCuota}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Monto:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(comprobante.pago.monto)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Fecha:</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comprobante.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => verComprobante(comprobante)}
                    className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Comprobante
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal para ver comprobante */}
      {mostrarComprobante && comprobanteSeleccionado && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[95vh] my-4 overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Comprobante de Pago
                </h2>
                <button
                  onClick={() => {
                    setMostrarComprobante(false);
                    setComprobanteSeleccionado(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Información del Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comprobanteSeleccionado.pago.auto.cliente.nombre}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cédula:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comprobanteSeleccionado.pago.auto.cliente.cedula}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comprobanteSeleccionado.pago.auto.cliente.telefono}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cuenta:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comprobanteSeleccionado.numeroCuenta || 'No especificada'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 md:p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Información del Pago</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comprobanteSeleccionado.pago.auto.marca} {comprobanteSeleccionado.pago.auto.modelo}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Cuota:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        #{comprobanteSeleccionado.pago.numeroCuota}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(comprobanteSeleccionado.pago.monto)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(comprobanteSeleccionado.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm md:text-base">Comprobante</h3>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 md:p-4 bg-gray-50 dark:bg-gray-900/50">
                    {comprobanteSeleccionado.archivoUrl.startsWith('data:image') ? (
                      <img
                        src={comprobanteSeleccionado.archivoUrl}
                        alt="Comprobante"
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <iframe
                        src={comprobanteSeleccionado.archivoUrl}
                        className="w-full h-64 md:h-96 rounded"
                        title="Comprobante PDF"
                      />
                    )}
                  </div>
                </div>
              </div>

              {comprobanteSeleccionado.estado === 'pendiente' && (
                <div className="flex flex-col md:flex-row gap-2 md:gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => aprobarComprobante(comprobanteSeleccionado.id)}
                    className="btn btn-success flex-1 flex items-center justify-center gap-2 text-sm md:text-base py-2.5"
                  >
                    <Check className="w-4 h-4" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => rechazarComprobante(comprobanteSeleccionado.id)}
                    className="btn btn-danger flex-1 flex items-center justify-center gap-2 text-sm md:text-base py-2.5"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de WhatsApp después de aprobar comprobante */}
      {mostrarModalWhatsApp && pagoAprobado && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700 mx-4">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                ✅ ¡Pago Confirmado!
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-center">
                La cuota #{pagoAprobado.numeroCuota} de {pagoAprobado.auto?.cliente?.nombre || 'cliente'} ha sido marcada como pagada.
              </p>
              
              <div className="space-y-2 md:space-y-3">
                <button
                  onClick={enviarWhatsAppConfirmacion}
                  className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2.5 md:py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                >
                  <span className="text-xl">💬</span> Enviar WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    setMostrarModalWhatsApp(false);
                    setPagoAprobado(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 md:py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comprobantes;

