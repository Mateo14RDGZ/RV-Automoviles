// Utilidades de formato
export const formatCurrency = (value) => {
  // Formatear con punto para miles y coma para decimales (formato uruguayo)
  const formatted = new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  // Agregar símbolo U$S delante (dólares estadounidenses)
  return `U$S ${formatted}`;
};

export const formatPesos = (value) => {
  // Formatear con punto para miles y coma para decimales (formato uruguayo)
  const formatted = new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  // Agregar símbolo $ delante (pesos uruguayos)
  return `$ ${formatted}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('es-UY').format(value);
};

export const calculateDaysUntil = (dateString) => {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getPaymentStatus = (pago) => {
  if (pago.estado === 'pagado') {
    return { text: 'Pagado', color: 'success', icon: 'check' };
  }
  
  const daysUntil = calculateDaysUntil(pago.fechaVencimiento);
  
  if (daysUntil < 0) {
    return { text: 'Vencido', color: 'danger', icon: 'alert' };
  } else if (daysUntil <= 3) {
    return { text: 'Por vencer', color: 'warning', icon: 'clock' };
  } else {
    return { text: 'Pendiente', color: 'info', icon: 'calendar' };
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
