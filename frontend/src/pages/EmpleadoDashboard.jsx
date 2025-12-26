import { useEffect, useState } from 'react';
import { Car, Users, CreditCard, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import api from '../services/api';

const EmpleadoDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
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
    </div>
  );
};

export default EmpleadoDashboard;
