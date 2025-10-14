import { useEffect, useState } from 'react';
import { dashboardService } from '../services';
import { 
  Car, 
  Users, 
  DollarSign, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle 
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
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
        <p className="text-gray-500">Error al cargar las estadísticas</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen general de RV Automoviles</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Autos */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Autos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.autos.total}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-success dark:bg-green-900/30 dark:text-green-400">{stats.autos.disponibles} disponibles</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Car className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Autos Vendidos */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Autos Vendidos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.autos.vendidos}</p>
              <div className="flex gap-2 mt-2">
                <span className="badge badge-warning dark:bg-yellow-900/30 dark:text-yellow-400">{stats.autos.reservados} reservados</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Clientes */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.clientes.total}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Recaudado */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Recaudado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.pagos.totalRecaudado)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.pagos.pagados} cuotas pagadas</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Estado de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Cuotas Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-2">{stats.pagos.pendientes}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                {formatCurrency(stats.pagos.totalPendiente)} total
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-400">Cuotas Vencidas</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-300 mt-2">{stats.pagos.vencidos}</p>
              <p className="text-sm text-red-700 dark:text-red-500 mt-1">Requieren atención urgente</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">Cuotas Pagadas</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300 mt-2">{stats.pagos.pagados}</p>
              <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                {formatCurrency(stats.pagos.totalRecaudado)} recaudado
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Próximos Vencimientos y Pagos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimientos */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
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
                      {pago.auto.cliente.nombre}
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

        {/* Pagos Recientes */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pagos Recientes
          </h3>
          {stats.pagosRecientes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay pagos recientes</p>
          ) : (
            <div className="space-y-3">
              {stats.pagosRecientes.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pago.auto.cliente.nombre}
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
    </div>
  );
};

export default Dashboard;
