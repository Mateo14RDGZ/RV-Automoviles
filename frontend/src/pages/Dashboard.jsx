import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dashboardService, comprobantesService } from '../services';
import { formatCurrency } from '../utils/format';
import { 
  Car, 
  Users, 
  DollarSign, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  FileText,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(true);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [mostrarModalWhatsApp, setMostrarModalWhatsApp] = useState(false);
  const [pagoAprobado, setPagoAprobado] = useState(null);

  useEffect(() => {
    loadStats();
    loadNotificaciones();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificaciones = async () => {
    try {
      setLoadingNotificaciones(true);
      const data = await comprobantesService.getNotificaciones({ estado: 'pendiente' });
      setNotificaciones(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoadingNotificaciones(false);
    }
  };

  const verComprobante = (comprobante) => {
    setComprobanteSeleccionado(comprobante);
    setMostrarComprobante(true);
    // Marcar como visto
    if (!comprobante.visto) {
      comprobantesService.marcarVisto(comprobante.id, true).then(() => {
        loadNotificaciones();
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
      await loadNotificaciones();
      await loadStats(); // Recargar stats para actualizar pagos
    } catch (error) {
      showToast(error.message || 'Error al aprobar comprobante', 'error');
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
      
      const mensaje = `*CONFIRMACIÓN DE PAGO*\n` +
        `Nicolas Tejera Automóviles\n\n` +
        `Estimado/a ${cliente.nombre},\n\n` +
        `Le confirmamos la recepción de su pago correspondiente a:\n\n` +
        `Vehículo: ${auto.marca} ${auto.modelo} ${auto.anio}\n` +
        `Matrícula: ${auto.matricula}\n` +
        `Cuota N°: ${pagoAprobado.numeroCuota}\n` +
        `Monto Pagado: ${formatCurrency(parseFloat(pagoAprobado.monto))}\n` +
        `Fecha de Pago: ${fechaPago}\n\n` +
        `Agradecemos su puntualidad en el cumplimiento de sus obligaciones.\n\n` +
        `*CONSULTA DE CUOTAS EN LÍNEA*\n\n` +
        `Puede consultar el estado de todas sus cuotas ingresando a:\n` +
        `${window.location.origin}\n\n` +
        `Usuario: ${cliente.cedula}\n` +
        `Contraseña: (la recibida por WhatsApp)\n\n` +
        `Saludos cordiales,\n` +
        `*Nicolas Tejera Automóviles*`;
      
      // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
      let telefono = cliente.telefono.replace(/[^0-9]/g, '');
      
      // Si el número empieza con 0, quitarlo (ej: 0998765432 → 998765432)
      if (telefono.startsWith('0')) {
        telefono = telefono.substring(1);
      }
      
      // Abrir WhatsApp con el mensaje pre-llenado
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

  const rechazarComprobante = async (id, notas = '') => {
    try {
      await comprobantesService.actualizarEstado(id, 'rechazado', notas);
      showToast('Comprobante rechazado', 'success');
      setMostrarComprobante(false);
      setComprobanteSeleccionado(null);
      await loadNotificaciones();
    } catch (error) {
      showToast(error.message || 'Error al rechazar comprobante', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar las estadísticas</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    // Formatear con punto para miles y coma para decimales (formato uruguayo)
    const formatted = new Intl.NumberFormat('es-UY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    
    // Agregar símbolo U$S delante (dólares estadounidenses)
    return `U$S ${formatted}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Escritorio</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Resumen general del sistema</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
        {/* Total Autos */}
        <div className="card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Autos</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{stats.autos.total}</p>
              <div className="flex gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                <span className="badge badge-success dark:bg-green-900/30 dark:text-green-400 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-1">{stats.autos.disponibles} disponibles</span>
              </div>
            </div>
            <div className="p-2.5 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
              <Car className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Autos Vendidos */}
        <div className="card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Autos Vendidos</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{stats.autos.vendidos}</p>
              <div className="flex gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                <span className="badge badge-warning dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] md:text-xs px-1.5 py-0.5 md:px-2.5 md:py-1">{stats.autos.reservados} reservados</span>
              </div>
            </div>
            <div className="p-2.5 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Clientes</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{stats.clientes.total}</p>
            </div>
            <div className="p-2.5 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex-shrink-0">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Recaudado */}
        <div className="card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 hover-lift animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Recaudado</p>
              <p className="text-base md:text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2 break-words">
                {formatCurrency(stats.pagos.totalRecaudado)}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">{stats.pagos.pagados} cuotas pagadas</p>
            </div>
            <div className="p-2.5 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0">
        <div className="card p-4 md:p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 hover-lift animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-400">Cuotas Pendientes</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1 md:mt-2">{stats.pagos.pendientes}</p>
              <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-500 mt-0.5 md:mt-1 break-words">
                {formatCurrency(stats.pagos.totalPendiente)} total
              </p>
            </div>
            <Calendar className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          </div>
        </div>

        <div className="card p-4 md:p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 hover-lift animate-fadeInUp" style={{animationDelay: '0.7s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-red-800 dark:text-red-400">Cuotas Vencidas</p>
              <p className="text-xl md:text-2xl font-bold text-red-900 dark:text-red-300 mt-1 md:mt-2">{stats.pagos.vencidos}</p>
              <p className="text-xs md:text-sm text-red-700 dark:text-red-500 mt-0.5 md:mt-1">Requieren atención</p>
            </div>
            <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
          </div>
        </div>

        <div className="card p-4 md:p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 hover-lift animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-xs md:text-sm font-medium text-green-800 dark:text-green-400">Cuotas Pagadas</p>
              <p className="text-xl md:text-2xl font-bold text-green-900 dark:text-green-300 mt-1 md:mt-2">{stats.pagos.pagados}</p>
              <p className="text-xs md:text-sm text-green-700 dark:text-green-500 mt-0.5 md:mt-1 break-words">
                {formatCurrency(stats.pagos.totalRecaudado)} recaudado
              </p>
            </div>
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Gráfico de Distribución de Dinero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0">
        <div className="lg:col-span-1 card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '0.85s'}}>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Distribución de Dinero</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Recaudado', value: stats.pagos.totalRecaudado, color: '#10b981' },
                  { name: 'Pendiente', value: stats.pagos.totalPendiente, color: '#f59e0b' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total en Financiamientos:</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.pagos.totalRecaudado + stats.pagos.totalPendiente)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Recuperación:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {stats.pagos.totalRecaudado + stats.pagos.totalPendiente > 0 
                  ? ((stats.pagos.totalRecaudado / (stats.pagos.totalRecaudado + stats.pagos.totalPendiente)) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Próximos Vencimientos */}
        <div className="lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '0.9s'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Próximos Vencimientos (7 días)
          </h3>
          {stats.proximosVencimientos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay vencimientos próximos</p>
          ) : (
            <div className="space-y-3">
              {stats.proximosVencimientos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pago.auto?.cliente?.nombre || 'Cliente archivado'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(pago.monto)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(pago.fechaVencimiento)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagos Recientes */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '1s'}}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pagos Recientes
          </h3>
          {stats.pagosRecientes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos recientes</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.pagosRecientes.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pago.auto?.cliente?.nombre || 'Cliente archivado'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700 dark:text-green-400">{formatCurrency(pago.monto)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(pago.fechaPago)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Notificaciones de Comprobantes */}
      <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '1.1s'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Comprobantes de Pago Pendientes
            {notificaciones.length > 0 && (
              <span className="badge badge-warning">{notificaciones.length}</span>
            )}
          </h3>
        </div>
        {loadingNotificaciones ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : notificaciones.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay comprobantes pendientes de revisión
          </p>
        ) : (
          <div className="space-y-3">
            {notificaciones.map((comprobante) => (
              <div
                key={comprobante.id}
                className={`p-4 rounded-lg border ${
                  comprobante.visto
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {comprobante.pago.auto.cliente.nombre}
                      </span>
                      {!comprobante.visto && (
                        <span className="badge badge-warning text-xs">Nuevo</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {comprobante.pago.auto.marca} {comprobante.pago.auto.modelo} - Cuota #{comprobante.pago.numeroCuota}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Monto: <span className="font-medium">{formatCurrency(comprobante.pago.monto)}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cuenta: <span className="font-medium">{comprobante.numeroCuenta}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(comprobante.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => verComprobante(comprobante)}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ver comprobante */}
      {mostrarComprobante && comprobanteSeleccionado && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Comprobante de Pago
                </h2>
                <button
                  onClick={() => {
                    setMostrarComprobante(false);
                    setComprobanteSeleccionado(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Información del Cliente</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
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
                        {comprobanteSeleccionado.numeroCuenta}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Información del Pago</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
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
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprobante</h3>
                  <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    {comprobanteSeleccionado.archivoUrl.startsWith('data:image') ? (
                      <img
                        src={comprobanteSeleccionado.archivoUrl}
                        alt="Comprobante"
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <iframe
                        src={comprobanteSeleccionado.archivoUrl}
                        className="w-full h-96 rounded"
                        title="Comprobante PDF"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => aprobarComprobante(comprobanteSeleccionado.id)}
                  className="btn btn-success flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aprobar
                </button>
                <button
                  onClick={() => rechazarComprobante(comprobanteSeleccionado.id)}
                  className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de WhatsApp después de aprobar comprobante */}
      {mostrarModalWhatsApp && pagoAprobado && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                ✅ ¡Pago Confirmado!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                La cuota #{pagoAprobado.numeroCuota} de {pagoAprobado.auto?.cliente?.nombre || 'cliente'} ha sido marcada como pagada.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={enviarWhatsAppConfirmacion}
                  className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-xl">💬</span> Enviar WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    setMostrarModalWhatsApp(false);
                    setPagoAprobado(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold transition-all duration-200"
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

export default Dashboard;
