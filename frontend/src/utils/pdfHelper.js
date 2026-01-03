// Helper para agregar logo y encabezados consistentes a los PDFs

/**
 * Agrega el logo de la empresa al PDF
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {number} x - Posición X del logo
 * @param {number} y - Posición Y del logo
 * @param {number} width - Ancho del logo
 * @param {number} height - Alto del logo
 */
export const addLogoToPDF = async (doc, x = 14, y = 10, width = 40, height = 20) => {
  try {
    // Intentar cargar el logo
    const img = new Image();
    img.src = '/logo-nicolas-tejera.png';
    
    return new Promise((resolve) => {
      img.onload = () => {
        try {
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
      
      // Timeout de 2 segundos
      setTimeout(() => {
        resolve(false);
      }, 2000);
    });
  } catch (error) {
    console.warn('Error al intentar agregar logo:', error);
    return false;
  }
};

/**
 * Agrega un encabezado estándar con logo y título
 * @param {jsPDF} doc - Instancia de jsPDF
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 */
export const addPDFHeader = async (doc, title, subtitle = null) => {
  // Agregar logo
  await addLogoToPDF(doc, 14, 8, 35, 17);
  
  // Título principal
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246); // Azul
  doc.text(title, 105, 20, { align: 'center' });
  
  // Subtítulo si existe
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 105, 27, { align: 'center' });
  }
  
  // Fecha de generación
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const fecha = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const yPos = subtitle ? 33 : 27;
  doc.text(`Fecha de generación: ${fecha}`, 105, yPos, { align: 'center' });
  
  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos + 3, 196, yPos + 3);
  
  // Retornar la posición Y donde termina el encabezado
  return yPos + 8;
};

/**
 * Agrega pie de página con numeración y logo pequeño
 * @param {jsPDF} doc - Instancia de jsPDF
 */
export const addPDFFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea superior del footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 20, 196, pageHeight - 20);
    
    // Texto del footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    
    // Nombre de la empresa a la izquierda
    doc.text('Nicolas Tejera Automoviles', 14, pageHeight - 12);
    
    // Número de página al centro
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    // Fecha a la derecha
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(fecha, 196, pageHeight - 12, { align: 'right' });
  }
};

/**
 * Crea un documento PDF con el formato estándar de la empresa
 * @param {string} title - Título del documento
 * @param {string} subtitle - Subtítulo opcional
 * @returns {Promise<{doc: jsPDF, startY: number}>}
 */
export const createStandardPDF = async (title, subtitle = null) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Agregar encabezado
  const startY = await addPDFHeader(doc, title, subtitle);
  
  return { doc, startY };
};

