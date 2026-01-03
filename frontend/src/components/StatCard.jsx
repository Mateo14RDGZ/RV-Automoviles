// Componente de tarjeta de estadística reutilizable
import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  bgColor = 'bg-blue-100', 
  iconColor = 'text-blue-600',
  trend,
  trendValue 
}) => {
  // Convertir bgColor para dark mode
  const getDarkBgColor = (lightBg) => {
    const colorMap = {
      'bg-blue-100': 'dark:bg-blue-900/30',
      'bg-purple-100': 'dark:bg-purple-900/30',
      'bg-green-100': 'dark:bg-green-900/30',
      'bg-yellow-100': 'dark:bg-yellow-900/30',
      'bg-red-100': 'dark:bg-red-900/30',
    };
    return colorMap[lightBg] || 'dark:bg-gray-700';
  };

  // Convertir iconColor para dark mode
  const getDarkIconColor = (lightIcon) => {
    const colorMap = {
      'text-blue-600': 'dark:text-blue-400',
      'text-purple-600': 'dark:text-purple-400',
      'text-green-600': 'dark:text-green-400',
      'text-yellow-600': 'dark:text-yellow-400',
      'text-red-600': 'dark:text-red-400',
    };
    return colorMap[lightIcon] || 'dark:text-gray-300';
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-1 md:mt-2">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white break-words">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2.5 md:p-3 ${bgColor} ${getDarkBgColor(bgColor)} rounded-full flex-shrink-0`}>
          <Icon className={`w-6 h-6 md:w-8 md:h-8 ${iconColor} ${getDarkIconColor(iconColor)}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
