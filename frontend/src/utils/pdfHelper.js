// Sistema profesional de generación de PDFs para RV Automóviles

// Paleta de colores corporativa RV Automóviles
const COLORS = {
  // Azules corporativos
  primary: [25, 55, 109], // Azul oscuro corporativo
  secondary: [41, 98, 255], // Azul brillante
  accent: [79, 70, 229], // Índigo moderno
  
  // Estados
  success: [16, 185, 129], // Verde esmeralda
  warning: [251, 146, 60], // Naranja cálido
  danger: [239, 68, 68], // Rojo coral
  info: [59, 130, 246], // Azul información
  
  // Grises premium
  gray: {
    50: [250, 250, 250],
    100: [245, 245, 245],
    200: [230, 230, 230],
    300: [212, 212, 212],
    400: [163, 163, 163],
    500: [115, 115, 115],
    600: [82, 82, 82],
    700: [64, 64, 64],
    800: [38, 38, 38],
    900: [23, 23, 23]
  },
  
  // Colores adicionales
  white: [255, 255, 255],
  black: [0, 0, 0]
};

/**
 * Dibuja el logo profesional de RV Automóviles
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño del logo
 */
const drawRVLogo = (doc, x, y, size = 25) => {
  const centerX = x + size/2;
  const centerY = y + size/2;
  const radius = size/2;
  
  // Fondo circular con gradiente simulado
  doc.setFillColor(...COLORS.primary);
  doc.ellipse(centerX, centerY, radius, radius, 'F');
  
  // Círculo interior decorativo
  doc.setFillColor(...COLORS.secondary);
  doc.ellipse(centerX, centerY, radius/1.3, radius/1.3, 'F');
  
  // Letras RV en el centro
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(size * 0.45);
  doc.setFont(undefined, 'bold');
  // Usar coordenadas simples sin opciones de alineación para evitar errores
  const textWidth = doc.getTextWidth('RV');
  doc.text('RV', centerX - textWidth/2, centerY + (size * 0.12));
  
  // Círculo exterior decorativo
  doc.setDrawColor(...COLORS.white);
  doc.setLineWidth(0.6);
  doc.ellipse(centerX, centerY, radius * 0.85, radius * 0.85, 'S');
};

/**
 * Agrega header profesional con logo de RV Automóviles
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} type - Tipo de documento
 * @returns {number} - Posición Y donde termina el header
 */
export const addPDFHeader = async (doc, title, subtitle = null, type = 'DOCUMENTO') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // === SECCIÓN SUPERIOR CON LOGO Y MARCA ===
  
  // Banda superior con color corporativo
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Línea decorativa inferior
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, 35, pageWidth, 2, 'F');
  
  // Logo RV Automóviles (círculo con letras)
  drawRVLogo(doc, 15, 7, 20);
  
  // Nombre de la empresa
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('RV Automóviles', 42, 18);
  
  // Slogan/Descripción
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(240, 240, 240);
  doc.text('Tu concesionaria de confianza', 42, 26);
  
  // Información de la derecha (fecha y tipo)
  const ahora = new Date();
  const fecha = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${ahora.getFullYear()}`;
  const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const tipoDoc = (type || 'DOCUMENTO').toString().toUpperCase();
  
  // Caja de información en la esquina superior derecha
  const infoBoxWidth = 50;
  const infoBoxX = pageWidth - infoBoxWidth - 10;
  
  // Usar color sólido en lugar de transparencia
  doc.setFillColor(45, 75, 125); // Azul semi-oscuro
  doc.roundedRect(infoBoxX, 6, infoBoxWidth, 23, 2, 2, 'F');
  
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text('FECHA:', infoBoxX + 3, 11);
  doc.text('HORA:', infoBoxX + 3, 17);
  doc.text('DOCUMENTO:', infoBoxX + 3, 23);
  
  doc.setFont(undefined, 'normal');
  doc.text(fecha, infoBoxX + 17, 11);
  doc.text(hora, infoBoxX + 17, 17);
  doc.text(tipoDoc, infoBoxX + 23, 23);
  
  // === SECCIÓN DE TÍTULO ===
  
  let yPos = 50;
  
  // Título principal del documento
  doc.setTextColor(...COLORS.gray[900]);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  const tituloTexto = (title || 'Documento').toString();
  doc.text(tituloTexto, 15, yPos);
  
  // Línea decorativa bajo el título
  const titleWidth = doc.getTextWidth(tituloTexto);
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(3);
  doc.line(15, yPos + 2, 15 + Math.min(titleWidth, 80), yPos + 2);
  
  yPos += 8;
  
  // Subtítulo si existe
  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray[600]);
    const subtituloTexto = subtitle.toString();
    doc.text(subtituloTexto, 15, yPos);
    yPos += 8;
  }
  
  // === CAJA DE INFORMACIÓN ADICIONAL ===
  
  yPos += 2;
  
  // Caja con fondo suave
  doc.setFillColor(...COLORS.gray[50]);
  doc.setDrawColor(...COLORS.gray[200]);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, pageWidth - 30, 18, 3, 3, 'FD');
  
  // Icono y texto de información
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray[700]);
  doc.setFont(undefined, 'normal');
  
  const infoY = yPos + 7;
  doc.text('Este documento ha sido generado automáticamente por el Sistema de Gestión de', 20, infoY);
  doc.text('RV Automóviles. Conserve este documento como comprobante oficial.', 20, infoY + 5);
  
  // Sello digital
  doc.setFillColor(...COLORS.info);
  doc.roundedRect(pageWidth - 45, yPos + 4, 30, 10, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.white);
  const selloTexto = 'DOCUMENTO OFICIAL';
  const selloWidth = doc.getTextWidth(selloTexto);
  doc.text(selloTexto, pageWidth - 30 - selloWidth/2, yPos + 10);
  
  yPos += 23;
  
  // Línea separadora elegante
  doc.setDrawColor(...COLORS.gray[300]);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  return yPos + 5;
};

/**
 * Agrega footer profesional con información de contacto
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {Object} options - Opciones de configuración
 */
export const addPDFFooter = async (doc, options = {}) => {
  const {
    showContact = true,
    contactInfo = {
      telefono: '+598 99 123 456',
      email: 'contacto@rvautomoviles.com',
      web: 'www.rvautomoviles.com.uy',
      direccion: 'Montevideo, Uruguay'
    }
  } = options;
  
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 25;
    
    // === LÍNEAS DECORATIVAS SUPERIORES ===
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(1.5);
    doc.line(15, footerY - 2, pageWidth - 15, footerY - 2);
    
    doc.setDrawColor(...COLORS.gray[200]);
    doc.setLineWidth(0.3);
    doc.line(15, footerY - 1, pageWidth - 15, footerY - 1);
    
    // === FONDO DEL FOOTER ===
    doc.setFillColor(...COLORS.gray[50]);
    doc.rect(0, footerY, pageWidth, 25, 'F');
    
    // === LOGO PEQUEÑO EN FOOTER ===
    drawRVLogo(doc, 18, footerY + 4, 12);
    
    // === INFORMACIÓN DE CONTACTO ===
    if (showContact) {
      const contactX = 35;
      const contactY = footerY + 6;
      
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS.gray[700]);
      
      // Asegurar que todos los valores sean strings
      const tel = (contactInfo.telefono || '+598 99 123 456').toString();
      const email = (contactInfo.email || 'contacto@rvautomoviles.com').toString();
      const web = (contactInfo.web || 'www.rvautomoviles.com.uy').toString();
      const dir = (contactInfo.direccion || 'Montevideo, Uruguay').toString();
      
      // Teléfono
      doc.setFont(undefined, 'bold');
      doc.text('Tel:', contactX, contactY);
      doc.setFont(undefined, 'normal');
      doc.text(tel, contactX + 8, contactY);
      
      // Email
      doc.setFont(undefined, 'bold');
      doc.text('Email:', contactX, contactY + 5);
      doc.setFont(undefined, 'normal');
      doc.text(email, contactX + 11, contactY + 5);
      
      // Web
      doc.setFont(undefined, 'bold');
      doc.text('Web:', contactX, contactY + 10);
      doc.setFont(undefined, 'normal');
      doc.text(web, contactX + 9, contactY + 10);
      
      // Dirección (a la derecha)
      doc.setFont(undefined, 'bold');
      doc.text('Dirección:', contactX + 70, contactY);
      doc.setFont(undefined, 'normal');
      doc.text(dir, contactX + 87, contactY);
    }
    
    // === NÚMERO DE PÁGINA ELEGANTE ===
    const pageBoxWidth = 22;
    const pageBoxX = pageWidth - pageBoxWidth - 15;
    const pageBoxY = footerY + 5;
    
    // Fondo del número de página
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(pageBoxX, pageBoxY, pageBoxWidth, 12, 2, 2, 'F');
    
    // Borde decorativo
    doc.setDrawColor(...COLORS.secondary);
    doc.setLineWidth(0.5);
    doc.roundedRect(pageBoxX, pageBoxY, pageBoxWidth, 12, 2, 2, 'S');
    
    // Texto del número de página
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...COLORS.white);
    const pageText = `Pág. ${i}/${pageCount}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageBoxX + pageBoxWidth/2 - pageTextWidth/2, pageBoxY + 8);
    
    // === TEXTO LEGAL/INFORMATIVO ===
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.gray[500]);
    doc.setFont(undefined, 'italic');
    const legalText = 'Documento generado electrónicamente - Sistema RV Automóviles';
    const legalTextWidth = doc.getTextWidth(legalText);
    doc.text(legalText, pageWidth / 2 - legalTextWidth/2, pageHeight - 4);
  }
};

/**
 * Estilos profesionales para tablas en PDFs
 * @param {string} color - Color del tema (primary, success, warning, danger)
 * @returns {Object} - Configuración de estilos para jsPDF-autoTable
 */
export const getTableStyles = (color = 'primary') => {
  const colorMap = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info
  };
  
  const headerColor = colorMap[color] || COLORS.primary;
  
  return {
    theme: 'grid',
    headStyles: { 
      fillColor: headerColor,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.2,
      lineColor: COLORS.white,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }
    },
    bodyStyles: { 
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      lineWidth: 0.2,
      lineColor: COLORS.gray[200],
      textColor: COLORS.gray[800]
    },
    alternateRowStyles: { 
      fillColor: COLORS.gray[50]
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      minCellHeight: 8
    },
    margin: { left: 15, right: 15 },
    tableLineColor: COLORS.gray[300],
    tableLineWidth: 0.2
  };
};

/**
 * Agrega una sección con título destacado
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} yPos - Posición Y inicial
 * @param {string} title - Título de la sección
 * @param {string} description - Descripción opcional
 * @returns {number} - Nueva posición Y
 */
export const addSection = (doc, yPos, title, description = null) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Barra lateral decorativa
  doc.setFillColor(...COLORS.secondary);
  doc.rect(15, yPos, 4, 10, 'F');
  
  // Título de la sección
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...COLORS.gray[800]);
  doc.text(title, 22, yPos + 7);
  
  let newY = yPos + 12;
  
  // Descripción si existe
  if (description) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...COLORS.gray[600]);
    const lines = doc.splitTextToSize(description, pageWidth - 30);
    doc.text(lines, 15, newY);
    newY += lines.length * 4 + 2;
  }
  
  // Línea separadora suave
  doc.setDrawColor(...COLORS.gray[200]);
  doc.setLineWidth(0.5);
  doc.line(15, newY, pageWidth - 15, newY);
  
  return newY + 6;
};

/**
 * Agrega una caja informativa destacada
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} yPos - Posición Y
 * @param {string} title - Título de la caja
 * @param {string} content - Contenido
 * @param {string} type - Tipo (info, success, warning, danger)
 * @returns {number} - Nueva posición Y
 */
export const addInfoBox = (doc, yPos, title, content, type = 'info') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 30;
  
  const colorMap = {
    info: { bg: [219, 234, 254], border: COLORS.info, text: [30, 64, 175] },
    success: { bg: [220, 252, 231], border: COLORS.success, text: [21, 128, 61] },
    warning: { bg: [254, 243, 199], border: COLORS.warning, text: [146, 64, 14] },
    danger: { bg: [254, 226, 226], border: COLORS.danger, text: [153, 27, 27] }
  };
  
  const colors = colorMap[type] || colorMap.info;
  
  // Calcular altura necesaria
  const contentLines = doc.splitTextToSize(content, boxWidth - 10);
  const boxHeight = 12 + (contentLines.length * 4);
  
  // Fondo de la caja
  doc.setFillColor(...colors.bg);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.8);
  doc.roundedRect(15, yPos, boxWidth, boxHeight, 3, 3, 'FD');
  
  // Título
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...colors.text);
  doc.text(title, 20, yPos + 7);
  
  // Contenido
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(contentLines, 20, yPos + 13);
  
  return yPos + boxHeight + 5;
};

/**
 * Crea un PDF con formato estándar profesional
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 * @param {string} type - Tipo de documento
 * @returns {Promise<{doc: jsPDF, startY: number}>}
 */
export const createStandardPDF = async (title, subtitle = null, type = 'DOCUMENTO') => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Agregar header con logo
  const startY = await addPDFHeader(doc, title, subtitle, type);
  
  return { doc, startY };
};

/**
 * Genera nombre de archivo con formato estándar
 * @param {string} type - Tipo de documento
 * @param {string} description - Descripción adicional
 * @returns {string} - Nombre del archivo
 */
export const getPDFFileName = (type, description = '') => {
  const fecha = new Date().toISOString().split('T')[0];
  const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const desc = description ? `_${description}` : '';
  return `RV_${type}${desc}_${fecha}_${hora}.pdf`;
};

/**
 * Agrega marca de agua al documento
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {string} text - Texto de la marca de agua
 * @param {string} type - Tipo (draft, confidential, copy)
 */
export const addWatermark = (doc, text = 'COPIA', type = 'draft') => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    
    doc.setTextColor(...COLORS.gray[400]);
    doc.setFontSize(60);
    doc.setFont(undefined, 'bold');
    
    // Rotar el texto 45 grados
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    const textWidth = doc.getTextWidth(text);
    
    // Guardar el contexto actual
    const radians = (45 * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    // Aplicar la transformación de rotación manualmente
    doc.text(text, centerX - textWidth/2, centerY);
    
    doc.restoreGraphicsState();
  }
};

export { COLORS };

