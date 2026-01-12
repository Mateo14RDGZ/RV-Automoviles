import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Calendar, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { pagosService } from '../services/apiServices';
import { formatCurrency, formatDate } from '../utils/format';

const ClienteDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [proximoPago, setProximoPago] = useState(null);

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
        pagables, // todas las cuotas que se pueden pagar (pendientes + vencidas)
        todasLasCuotas: pagos // todas las cuotas para mostrar en "Mis Cuotas"
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
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-blue-100 text-sm font-medium">Total del Crédito</p>
              <p className="text-xl md:text-2xl font-bold mt-1 break-words">{formatCurrency(stats.totalCredito)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200 opacity-80 flex-shrink-0" />
          </div>
        </div>

        {/* Total Pagado */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-green-100 text-sm font-medium">Total Pagado</p>
              <p className="text-xl md:text-2xl font-bold mt-1 break-words">{formatCurrency(stats.totalPagado)}</p>
              <p className="text-green-100 text-xs mt-1">{stats.cuotasPagadas} de {stats.totalCuotas} cuotas</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200 opacity-80 flex-shrink-0" />
          </div>
        </div>

        {/* Saldo Pendiente */}
        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover-lift animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-yellow-100 text-sm font-medium">Saldo Pendiente</p>
              <p className="text-xl md:text-2xl font-bold mt-1 break-words">{formatCurrency(stats.totalPendiente)}</p>
              <p className="text-yellow-100 text-xs mt-1">{stats.cuotasPendientes} cuotas</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200 opacity-80 flex-shrink-0" />
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
                Por favor, ponte al día con tus pagos lo antes posible. Ve a la sección "Mis Cuotas" para pagar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClienteDashboard;
