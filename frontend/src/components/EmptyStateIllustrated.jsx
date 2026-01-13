import React from 'react';
import {
  Car,
  Users,
  CreditCard,
  FileText,
  Search,
  AlertCircle,
  Package,
  ShoppingCart,
  Calendar,
  Database,
  Plus,
  Filter
} from 'lucide-react';

const EmptyStateIllustrated = ({
  icon: Icon = Database,
  title = 'No hay datos disponibles',
  description = 'Comienza agregando nuevos elementos',
  actionLabel,
  onAction,
  type = 'default', // default, search, filter, error
  showDecoration = true
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'search':
        return {
          bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          icon: Search
        };
      case 'filter':
        return {
          bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
          iconColor: 'text-purple-600 dark:text-purple-400',
          icon: Filter
        };
      case 'error':
        return {
          bgGradient: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
          iconBg: 'bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: AlertCircle
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50',
          iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-800/50',
          iconColor: 'text-gray-600 dark:text-gray-400',
          icon: Icon
        };
    }
  };

  const styles = getTypeStyles();
  const DisplayIcon = styles.icon;

  return (
    <div className="flex items-center justify-center py-16 px-4 animate-fadeInUp">
      <div className="text-center max-w-md">
        {/* Decorative background circles */}
        {showDecoration && (
          <div className="relative mb-8">
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.bgGradient} rounded-full blur-3xl opacity-30 animate-pulse`}></div>
            <div className={`relative w-32 h-32 mx-auto ${styles.iconBg} rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300 animate-bounceIn`}>
              <DisplayIcon className={`w-16 h-16 ${styles.iconColor} animate-float`} />
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-floatSlow opacity-60"></div>
            <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-floatDelay opacity-40"></div>
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-pink-400 rounded-full animate-float opacity-50"></div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Action button */}
        {actionLabel && onAction && (
          <div className="mt-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={onAction}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              {actionLabel}
            </button>
          </div>
        )}

        {/* Helper text */}
        {type === 'search' && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-500 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            💡 Intenta buscar con otros términos
          </p>
        )}
        {type === 'filter' && (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-500 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            💡 Prueba cambiando los filtros aplicados
          </p>
        )}
      </div>
    </div>
  );
};

// Variantes predefinidas para uso rápido
export const EmptyAutos = ({ onAdd }) => (
  <EmptyStateIllustrated
    icon={Car}
    title="¡Tu inventario está vacío!"
    description="Comienza agregando tu primer vehículo al sistema para empezar a gestionar tus ventas"
    actionLabel="Agregar Primer Auto"
    onAction={onAdd}
  />
);

export const EmptyClientes = ({ onAdd }) => (
  <EmptyStateIllustrated
    icon={Users}
    title="No hay clientes registrados"
    description="Agrega clientes para comenzar a gestionar ventas y planes de cuotas"
    actionLabel="Agregar Primer Cliente"
    onAction={onAdd}
  />
);

export const EmptyPagos = () => (
  <EmptyStateIllustrated
    icon={CreditCard}
    title="No hay pagos registrados"
    description="Los pagos aparecerán aquí una vez que se generen planes de cuotas para los autos vendidos"
  />
);

export const EmptyReportes = () => (
  <EmptyStateIllustrated
    icon={FileText}
    title="No hay suficientes datos"
    description="Necesitas al menos algunos registros para generar reportes estadísticos"
  />
);

export const EmptySearch = () => (
  <EmptyStateIllustrated
    icon={Search}
    type="search"
    title="No encontramos resultados"
    description="No se encontraron elementos que coincidan con tu búsqueda"
  />
);

export const EmptyFilter = () => (
  <EmptyStateIllustrated
    icon={Filter}
    type="filter"
    title="Sin resultados con estos filtros"
    description="Intenta ajustar los filtros para ver más resultados"
  />
);

export default EmptyStateIllustrated;
