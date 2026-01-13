import React from 'react';

// Skeleton base con shimmer effect
const SkeletonBase = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded animate-shimmer ${className}`} />
);

// Skeleton para cards de estadísticas
export const SkeletonStatCard = () => (
  <div className="card p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 animate-fadeIn">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-3">
        <SkeletonBase width="w-24" height="h-4" />
        <SkeletonBase width="w-20" height="h-8" />
        <SkeletonBase width="w-32" height="h-5" />
      </div>
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
    </div>
  </div>
);

// Skeleton para tabla/lista
export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3 animate-fadeIn">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
          <div className="flex-1 space-y-2">
            <SkeletonBase width="w-3/4" height="h-5" />
            <SkeletonBase width="w-1/2" height="h-4" />
          </div>
          <div className="space-x-2 flex">
            <SkeletonBase width="w-20" height="h-8" />
            <SkeletonBase width="w-20" height="h-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para lista simple
export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-3 animate-fadeIn">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <SkeletonBase width="w-12" height="h-12" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBase width="w-2/3" height="h-4" />
          <SkeletonBase width="w-1/3" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para gráfico
export const SkeletonChart = () => (
  <div className="card p-6 dark:bg-gray-800 dark:border-gray-700 animate-fadeIn">
    <SkeletonBase width="w-32" height="h-6" className="mb-4" />
    <div className="flex items-end justify-center gap-2 h-64">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBase
          key={i}
          width="w-12"
          height={`h-${Math.floor(Math.random() * 48) + 16}`}
          className="flex-1"
        />
      ))}
    </div>
  </div>
);

// Skeleton para formulario
export const SkeletonForm = () => (
  <div className="space-y-4 animate-fadeIn">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i}>
        <SkeletonBase width="w-24" height="h-4" className="mb-2" />
        <SkeletonBase width="w-full" height="h-10" />
      </div>
    ))}
    <div className="flex gap-3 mt-6">
      <SkeletonBase width="w-32" height="h-10" />
      <SkeletonBase width="w-32" height="h-10" />
    </div>
  </div>
);

export default SkeletonBase;
