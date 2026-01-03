import { useEffect, useState } from 'react';
import { Car, Users, CreditCard, AlertCircle, CheckCircle, Clock, TrendingUp, Bell, FileText, Eye, Check, X } from 'lucide-react';
import api from '../services/api';
import { comprobantesService } from '../services';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';

const EmpleadoDashboard = () => {
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
      const response = await api.get('/dashboard/stats-empleado');
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Error al cargar estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Escritorio de Gestión
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Panel de control operativo
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Clientes Activos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.clientes.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.clientes.conFinanciamiento} con financiamiento
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Autos Disponibles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Autos Disponibles
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.autos.disponibles}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.autos.total} total en catálogo
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Car className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Autos Financiados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                En Financiamiento
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.autos.financiados}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Planes activos
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        {/* Cuotas Vencidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Cuotas Vencidas
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.pagos.vencidos}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Requieren atención
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Cuotas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pendientes</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pagos.pendientes}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cuotas por cobrar
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pagadas</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pagos.pagados}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cuotas completadas
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Permutas</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.permutas.total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Recibidas
          </p>
        </div>
      </div>

      {/* Próximos Vencimientos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Próximos Vencimientos (7 días)
          </h2>
        </div>
        <div className="overflow-x-auto">
          {stats.proximosVencimientos.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Teléfono
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.proximosVencimientos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pago.auto.cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pago.auto.marca} {pago.auto.modelo} ({pago.auto.anio})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{pago.numeroCuota}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(pago.fechaVencimiento).toLocaleDateString('es-UY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pago.auto.cliente.telefono}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No hay vencimientos próximos
            </div>
          )}
        </div>
      </div>

      {/* Cuotas Vencidas */}
      {stats.pagosVencidos.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-red-200 dark:border-red-800">
          <div className="p-6 border-b border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <h2 className="text-xl font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Cuotas Vencidas - Acción Requerida
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cuota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Días Vencida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Teléfono
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.pagosVencidos.map((pago) => {
                  const diasVencidos = Math.floor(
                    (new Date() - new Date(pago.fechaVencimiento)) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={pago.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {pago.auto.cliente.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {pago.auto.marca} {pago.auto.modelo} ({pago.auto.anio})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{pago.numeroCuota}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(pago.fechaVencimiento).toLocaleDateString('es-UY')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {diasVencidos} días
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {pago.auto.cliente.telefono}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clientes con Financiamiento Activo */}
      {stats.clientesConFinanciamiento.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Clientes con Financiamiento Activo
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vehículo(s)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.clientesConFinanciamiento.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {cliente.telefono}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {cliente.autos.map((auto, index) => (
                        <div key={auto.id}>
                          {auto.marca} {auto.modelo} ({auto.anio}) - {auto.matricula}
                          {index < cliente.autos.length - 1 && ', '}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Notificaciones de Comprobantes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Comprobantes de Pago Pendientes
            {notificaciones.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {notificaciones.length}
              </span>
            )}
          </h2>
        </div>
        <div className="p-6">
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
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Nuevo
                          </span>
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
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Aprobar
                </button>
                <button
                  onClick={() => rechazarComprobante(comprobanteSeleccionado.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-1 flex items-center justify-center gap-2"
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

export default EmpleadoDashboard;
