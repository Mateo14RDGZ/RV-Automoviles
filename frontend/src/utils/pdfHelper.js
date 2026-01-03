// Helper para agregar logo y encabezados consistentes a los PDFs de forma profesional

// Colores corporativos
const COLORS = {
  primary: [14, 70, 135], // Azul oscuro profesional
  secondary: [59, 130, 246], // Azul medio
  accent: [37, 99, 235], // Azul vibrante
  success: [22, 163, 74], // Verde
  warning: [245, 158, 11], // Naranja
  danger: [220, 38, 38], // Rojo
  gray: {
    50: [249, 250, 251],
    100: [243, 244, 246],
    200: [229, 231, 235],
    300: [209, 213, 219],
    400: [156, 163, 175],
    500: [107, 114, 128],
    600: [75, 85, 99],
    700: [55, 65, 81],
    800: [31, 41, 55],
    900: [17, 24, 39]
  }
};

/**
 * Agrega el logo de la empresa al PDF con marco profesional
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} x - Posición X del logo
 * @param {number} y - Posición Y del logo
 * @param {number} width - Ancho del logo
 * @param {number} height - Alto del logo
 * @param {boolean} withFrame - Si debe incluir un marco decorativo
 */
export const addLogoToPDF = async (doc, x = 14, y = 10, width = 40, height = 20, withFrame = false) => {
  try {
    const img = new Image();
    img.src = '/logo-nicolas-tejera.png';
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
          // Marco decorativo opcional
          if (withFrame) {
            doc.setDrawColor(...COLORS.primary);
            doc.setLineWidth(0.5);
            doc.roundedRect(x - 2, y - 2, width + 4, height + 4, 2, 2);
          }
          
          doc.addImage(img, 'PNG', x, y, width, height);
          resolve(true);
        } catch (error) {
          console.warn('No se pudo agregar el logo al PDF:', error);
          resolve(false);
        }
      };
      
      img.onerror = () => {
        console.warn('No se pudo cargar el logo para el PDF');
        resolve(false);
      };
      
      setTimeout(() => resolve(false), 2000);
    });
  } catch (error) {
    console.warn('Error al intentar agregar logo:', error);
    return false;
  }
};

/**
 * Agrega un encabezado profesional con banner superior
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} type - Tipo de documento (reporte, historial, inventario)
 */
export const addPDFHeader = async (doc, title, subtitle = null, type = 'reporte') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Banner superior con degradado simulado
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Franja decorativa
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Logo con fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 8, 44, 24, 2, 2, 'F');
  await addLogoToPDF(doc, 14, 10, 40, 20, false);
  
  // Información de la empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('NICOLAS TEJERA', pageWidth - 14, 18, { align: 'right' });
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Automóviles', pageWidth - 14, 25, { align: 'right' });
  
  doc.setFontSize(8);
  doc.setTextColor(220, 220, 220);
  doc.text('Calidad y Confianza', pageWidth - 14, 31, { align: 'right' });
  
  // Título del documento
  doc.setTextColor(...COLORS.gray[800]);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 60);
  
  // Línea decorativa bajo el título
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(2);
  doc.line(14, 63, 60, 63);
  
  // Subtítulo si existe
  let yPos = 70;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray[600]);
    doc.text(subtitle, 14, yPos);
    yPos += 6;
  }
  
  // Información del documento en tabla
  doc.setFillColor(...COLORS.gray[50]);
  doc.rect(14, yPos, pageWidth - 28, 18, 'F');
  doc.setDrawColor(...COLORS.gray[200]);
  doc.rect(14, yPos, pageWidth - 28, 18);
  
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray[700]);
  
  const fecha = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  doc.text('Fecha de Generación:', 18, yPos + 7);
  doc.text('Tipo de Documento:', 18, yPos + 13);
  
  doc.setFont(undefined, 'normal');
  doc.text(fecha, 60, yPos + 7);
  doc.text(type.toUpperCase(), 60, yPos + 13);
  
  // Marca de agua "DOCUMENTO OFICIAL"
  doc.setTextColor(...COLORS.gray[300]);
  doc.setFontSize(7);
  doc.text('DOCUMENTO OFICIAL', pageWidth - 18, yPos + 10, { align: 'right' });
  
  return yPos + 24;
};

/**
 * Agrega pie de página profesional con información completa
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {Object} options - Opciones adicionales para el footer
 */
export const addPDFFooter = (doc, options = {}) => {
  const {
    showContact = true,
    contactInfo = {
      telefono: '+598 XX XXX XXX',
      email: 'info@nicolastejera.com',
      web: 'www.nicolastejera.com'
    }
  } = options;
  
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea superior decorativa
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(1);
    doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
    
    // Fondo del footer
    doc.setFillColor(...COLORS.gray[50]);
    doc.rect(0, pageHeight - 24, pageWidth, 24, 'F');
    
    // Logo pequeño en footer
    const logoPromise = addLogoToPDF(doc, 14, pageHeight - 20, 20, 10, false);
    
    // Información de contacto (si está habilitada)
    if (showContact) {
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.gray[600]);
      doc.setFont(undefined, 'normal');
      
      const centerX = pageWidth / 2;
      doc.text(`Tel: ${contactInfo.telefono}`, centerX - 45, pageHeight - 15);
      doc.text(`Email: ${contactInfo.email}`, centerX - 45, pageHeight - 10);
      doc.text(`Web: ${contactInfo.web}`, centerX - 45, pageHeight - 5);
    }
    
    // Número de página con diseño profesional
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(pageWidth - 32, pageHeight - 20, 18, 8, 1, 1, 'F');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${i}/${pageCount}`, pageWidth - 23, pageHeight - 14.5, { align: 'center' });
  }
};

/**
 * Configuración de tabla profesional estándar
 * @param {string} color - Color del tema (primary, success, warning, danger)
 */
export const getTableStyles = (color = 'primary') => {
  const colorMap = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger
  };
  
  return {
    theme: 'grid',
    headStyles: { 
      fillColor: colorMap[color] || COLORS.primary,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [255, 255, 255],
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 }
    },
    bodyStyles: { 
      fontSize: 8,
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
      lineWidth: 0.1,
      lineColor: COLORS.gray[200],
      textColor: COLORS.gray[800]
    },
    alternateRowStyles: { 
      fillColor: COLORS.gray[50]
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    margin: { left: 14, right: 14 },
    tableLineColor: COLORS.gray[300],
    tableLineWidth: 0.1
  };
};

/**
 * Agrega una sección con título y descripción
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} yPos - Posición Y inicial
 * @param {string} title - Título de la sección
 * @param {string} description - Descripción opcional
 */
export const addSection = (doc, yPos, title, description = null) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Fondo de sección
  doc.setFillColor(...COLORS.accent);
  doc.rect(14, yPos, 6, 8, 'F');
  
  // Título
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray[800]);
  doc.text(title, 22, yPos + 6);
  
  let newY = yPos + 10;
  
  // Descripción
  if (description) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray[600]);
    doc.text(description, 14, newY);
    newY += 6;
  }
  
  // Línea separadora
  doc.setDrawColor(...COLORS.gray[200]);
  doc.setLineWidth(0.3);
  doc.line(14, newY, pageWidth - 14, newY);
  
  return newY + 4;
};

/**
 * Crea un documento PDF con el formato profesional estándar
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} type - Tipo de documento
 * @returns {Promise<{doc: jsPDF, startY: number}>}
 */
export const createStandardPDF = async (title, subtitle = null, type = 'reporte') => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Agregar encabezado profesional
  const startY = await addPDFHeader(doc, title, subtitle, type);
  
  return { doc, startY };
};

/**
 * Obtiene el nombre del archivo con formato estándar
 * @param {string} type - Tipo de documento
 * @param {string} description - Descripción adicional
 */
export const getPDFFileName = (type, description = '') => {
  const fecha = new Date().toISOString().split('T')[0];
  const empresa = 'NicolasTejera';
  const desc = description ? `_${description}` : '';
  return `${empresa}_${type}${desc}_${fecha}.pdf`;
};

export { COLORS };

