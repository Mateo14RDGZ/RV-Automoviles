import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, Upload, X, FileText } from 'lucide-react';
import { pagosService, comprobantesService } from '../services';
import { formatCurrency, formatDate } from '../utils/format';
import { useToast } from '../context/ToastContext';

const ClienteDashboard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [proximoPago, setProximoPago] = useState(null);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const pagos = await pagosService.getAll() || [];

      console.log('📊 Dashboard - Pagos cargados:', pagos);
      console.log('📊 Dashboard - Total de pagos:', pagos.length);
      console.log('📊 Dashboard - Tipo de datos:', typeof pagos, 'Es array:', Array.isArray(pagos));

      // Calcular estadísticas
      const pagados = pagos.filter(p => p.estado === 'pagado');
      const pendientes = pagos.filter(p => p.estado === 'pendiente' && new Date(p.fechaVencimiento) >= new Date());
      const vencidos = pagos.filter(p => p.estado === 'pendiente' && new Date(p.fechaVencimiento) < new Date());
      // Unificar pendientes y vencidos para mostrar todas las cuotas pagables
      const pagables = pagos.filter(p => p.estado === 'pendiente');

      console.log('✅ Pagados:', pagados.length);
      console.log('⏰ Pendientes:', pendientes.length);
      console.log('🚨 Vencidos:', vencidos.length);

      const totalPagado = pagados.reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const totalPendiente = [...pendientes, ...vencidos].reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const totalCredito = totalPagado + totalPendiente;

      console.log('💰 Total Crédito:', totalCredito);
      console.log('💰 Total Pagado:', totalPagado);
      console.log('💰 Total Pendiente:', totalPendiente);

      // Encontrar próximo pago
      const proximosPagos = pendientes.sort((a, b) => 
        new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
      );
      
      setStats({
        totalCredito,
        totalPagado,
        totalPendiente,
        porcentajePagado: totalCredito > 0 ? (totalPagado / totalCredito) * 100 : 0,
        totalCuotas: pagos.length,
        cuotasPagadas: pagados.length,
        cuotasPendientes: pendientes.length,
        cuotasVencidas: vencidos.length,
        pagados,
        pendientes,
        vencidos,
        pagables // todas las cuotas que se pueden pagar (pendientes + vencidas)
      });

      setProximoPago(proximosPagos[0] || null);
    } catch (error) {
      console.error('❌ Error al cargar dashboard:', error);
      setError(error.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getDiasHastaVencimiento = (fecha) => {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diff = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const abrirModalComprobante = (pago) => {
    setPagoSeleccionado(pago);
    setArchivoSeleccionado(null);
    setShowComprobanteModal(true);
  };

  const cerrarModalComprobante = () => {
    setShowComprobanteModal(false);
    setPagoSeleccionado(null);
    setArchivoSeleccionado(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo por extensión y MIME type
      const extension = file.name.toLowerCase().split('.').pop();
      const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
      const tiposMimePermitidos = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'application/pdf',
        'application/x-pdf',
        'application/acrobat',
        'applications/vnd.pdf',
        'text/pdf',
        'text/x-pdf'
      ];
      
      // Validar por extensión o tipo MIME
      const esValido = extensionesPermitidas.includes(extension) || 
                       tiposMimePermitidos.includes(file.type) ||
                       file.type === ''; // Algunos navegadores no detectan el tipo MIME
      
      if (!esValido) {
        showToast('Solo se permiten archivos PDF, JPG y PNG', 'error');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo no debe exceder 5MB', 'error');
        return;
      }

      setArchivoSeleccionado(file);
    }
  };

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubirComprobante = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }

    try {
      setSubiendo(true);
      const archivoBase64 = await convertirArchivoABase64(archivoSeleccionado);
      
      // Determinar tipo MIME correcto si no está disponible
      let tipoArchivo = archivoSeleccionado.type;
      if (!tipoArchivo) {
        const extension = archivoSeleccionado.name.toLowerCase().split('.').pop();
        const tiposMime = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png'
        };
        tipoArchivo = tiposMime[extension] || 'application/pdf';
      }
      
      await comprobantesService.subir(
        pagoSeleccionado.id,
        archivoBase64,
        tipoArchivo
      );

      showToast('Comprobante enviado exitosamente. Será revisado por el administrador.', 'success');
      cerrarModalComprobante();
      await loadDashboardData();
    } catch (error) {
      showToast(error.message || 'Error al subir comprobante', 'error');
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando tu escritorio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar datos</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={loadDashboardData} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hay datos disponibles</h2>
            <p className="text-gray-600 dark:text-gray-400">No se encontró información de pagos.</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Pagado', value: stats.totalPagado, color: '#10b981' },
    { name: 'Pendiente', value: stats.totalPendiente, color: '#f59e0b' }
  ];

  const diasRestantes = proximoPago ? getDiasHastaVencimiento(proximoPago.fechaVencimiento) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Escritorio</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Resumen completo de tu crédito automotor
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total del Crédito */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total del Crédito</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCredito)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        {/* Total Pagado */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Pagado</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalPagado)}</p>
              <p className="text-green-100 text-xs mt-1">{stats.cuotasPagadas} de {stats.totalCuotas} cuotas</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Saldo Pendiente</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalPendiente)}</p>
              <p className="text-yellow-100 text-xs mt-1">{stats.cuotasPendientes} cuotas</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200 opacity-80" />
          </div>
        </div>

        {/* Progreso */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Progreso</p>
              <p className="text-2xl font-bold mt-1">{stats.porcentajePagado.toFixed(1)}%</p>
              <p className="text-purple-100 text-xs mt-1">Completado</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Progreso */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Progreso de Pagos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Has completado <span className="font-bold text-green-600 dark:text-green-400">{stats.porcentajePagado.toFixed(1)}%</span> de tu crédito
            </p>
          </div>
        </div>

        {/* Próximo Pago */}
        <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '0.7s'}}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Próximo Pago</h2>
          {proximoPago ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vencimiento</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDate(proximoPago.fechaVencimiento)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(proximoPago.monto)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cuota #{proximoPago.numeroCuota}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {proximoPago.auto.marca} {proximoPago.auto.modelo}
                    </p>
                  </div>
                </div>

                <div className={`mt-4 text-center p-3 rounded-lg ${
                  diasRestantes <= 3 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                    : diasRestantes <= 7 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}>
                  <p className="font-bold text-lg">
                    {diasRestantes === 0 ? '¡Vence hoy!' : 
                     diasRestantes === 1 ? '¡Vence mañana!' :
                     diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` :
                     `Faltan ${diasRestantes} días`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">¡Felicitaciones! No tienes pagos pendientes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas */}
      {stats.cuotasVencidas > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-300 mb-1">
                Tienes {stats.cuotasVencidas} cuota{stats.cuotasVencidas > 1 ? 's' : ''} vencida{stats.cuotasVencidas > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Por favor, ponte al día con tus pagos lo antes posible. Contacta con nosotros si necesitas ayuda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Cuotas Pagadas */}
      {stats.pagados.length > 0 && (
        <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '0.9s'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              Últimas Cuotas Pagadas
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.cuotasPagadas} pagada{stats.cuotasPagadas !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-3">
            {stats.pagados.slice(0, 5).map((pago) => (
              <div
                key={pago.id}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Cuota #{pago.numeroCuota}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                        ✓ Pagado
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{pago.auto.marca} {pago.auto.modelo} - {pago.auto.matricula}</p>
                      <p className="mt-1">Pagado: {formatDate(pago.fechaPago)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(pago.monto)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {stats.cuotasPagadas > 5 && (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-2">
                Mostrando 5 de {stats.cuotasPagadas} cuotas pagadas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sección de Cuotas Pagables (pendientes y vencidas) */}
      {stats.pagables && stats.pagables.length > 0 && (
        <div className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: '1s'}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              Mis Cuotas
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stats.pagables.length} cuota{stats.pagables.length !== 1 ? 's' : ''} para pagar
            </span>
          </div>
          <div className="space-y-3">
            {stats.pagables
              .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento))
              .map((pago) => {
                const diasRestantes = getDiasHastaVencimiento(pago.fechaVencimiento);
                const esVencido = diasRestantes < 0;
                const esUrgente = !esVencido && diasRestantes <= 7;
                return (
                  <div
                    key={pago.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      esVencido
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : esUrgente
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Cuota #{pago.numeroCuota}
                          </span>
                          {esVencido ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Vencida
                            </span>
                          ) : esUrgente ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Próximo
                            </span>
                          ) : null}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>{pago.auto.marca} {pago.auto.modelo} - {pago.auto.matricula}</p>
                          <p className="mt-1">Vencimiento: {formatDate(pago.fechaVencimiento)}</p>
                          <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                            {diasRestantes === 0 ? '¡Vence hoy!' : 
                              diasRestantes === 1 ? '¡Vence mañana!' :
                              diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` :
                              `Faltan ${diasRestantes} días`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(pago.monto)}
                        </p>
                        <button
                          onClick={() => abrirModalComprobante(pago)}
                          className="mt-2 btn btn-primary btn-sm flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Pagar con Transferencia
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Modal para subir comprobante de pago */}
      {showComprobanteModal && pagoSeleccionado && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Enviar Comprobante de Pago
                </h2>
                <button
                  onClick={cerrarModalComprobante}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Cuota #{pagoSeleccionado.numeroCuota}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pagoSeleccionado.auto.marca} {pagoSeleccionado.auto.modelo}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(pagoSeleccionado.monto)}
                </p>
              </div>

              <form onSubmit={handleSubirComprobante} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comprobante de Transferencia *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {archivoSeleccionado ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {archivoSeleccionado.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(archivoSeleccionado.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setArchivoSeleccionado(null)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                              <span>Seleccionar archivo</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, JPG o PNG (máx. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={subiendo}
                  >
                    {subiendo ? 'Enviando...' : 'Enviar Comprobante'}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModalComprobante}
                    className="btn btn-secondary flex-1"
                    disabled={subiendo}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
