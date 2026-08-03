// Utilidades compartidas para los reportes PDF de RV Automóviles.

const COLORS = {
  primary: [22, 48, 86],
  secondary: [37, 99, 235],
  accent: [30, 64, 175],
  success: [21, 128, 61],
  warning: [180, 83, 9],
  danger: [185, 28, 28],
  info: [37, 99, 235],
  gray: {
    50: [248, 250, 252],
    100: [241, 245, 249],
    200: [226, 232, 240],
    300: [203, 213, 225],
    400: [148, 163, 184],
    500: [100, 116, 139],
    600: [71, 85, 105],
    700: [51, 65, 85],
    800: [30, 41, 59],
    900: [15, 23, 42]
  },
  white: [255, 255, 255],
  black: [0, 0, 0]
};

const formatGeneratedAt = (date = new Date()) =>
  new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);

let brandLogoDataUrlPromise;

const loadBrandLogo = async () => {
  if (!brandLogoDataUrlPromise) {
    brandLogoDataUrlPromise = fetch('/icon-512.png')
      .then((response) => {
        if (!response.ok) throw new Error('No se pudo cargar el logo');
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
        }
        return `data:image/png;base64,${btoa(binary)}`;
      })
      .catch(() => null);
  }
  return brandLogoDataUrlPromise;
};

const drawBrandFallback = (doc, x, y) => {
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(x, y, 22, 22, 2.5, 2.5, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RV', x + 11, y + 14, { align: 'center' });
};

const drawBrandMark = async (doc, x, y) => {
  const logo = await loadBrandLogo();
  if (logo) {
    doc.addImage(logo, 'PNG', x, y, 22, 22, undefined, 'FAST');
    return;
  }
  drawBrandFallback(doc, x, y);
};

/**
 * Encabezado limpio: marca, nombre del reporte, alcance y fecha de generación.
 * No incluye eslóganes, contactos ni afirmaciones que no provengan del negocio.
 */
export const addPDFHeader = async (doc, title, subtitle = null, type = 'REPORTE') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 7, 'F');
  await drawBrandMark(doc, margin, 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text('RV AUTOMÓVILES', 43, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gray[500]);
  doc.text('Sistema de gestión', 43, 28);

  const reportLabel = String(type || 'REPORTE').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gray[600]);
  doc.text(reportLabel, pageWidth - margin, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gray[500]);
  doc.text(`Generado: ${formatGeneratedAt()}`, pageWidth - margin, 27, { align: 'right' });

  doc.setDrawColor(...COLORS.gray[200]);
  doc.setLineWidth(0.4);
  doc.line(margin, 43, pageWidth - margin, 43);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...COLORS.gray[900]);
  const safeTitle = String(title || 'Reporte');
  const titleLines = doc.splitTextToSize(safeTitle, pageWidth - margin * 2);
  doc.text(titleLines, margin, 56);

  let yPos = 56 + titleLines.length * 7;
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.gray[600]);
    const subtitleLines = doc.splitTextToSize(String(subtitle), pageWidth - margin * 2);
    doc.text(subtitleLines, margin, yPos + 1);
    yPos += subtitleLines.length * 4.5 + 3;
  }

  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(margin, yPos + 2, 28, 1.5, 0.75, 0.75, 'F');
  return yPos + 11;
};

/** Agrega numeración y marca al pie sin datos de contacto inventados. */
export const addPDFFooter = async (doc, options = {}) => {
  const { label = 'Reporte de gestión' } = options;
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    const y = pageHeight - 13;
    doc.setDrawColor(...COLORS.gray[200]);
    doc.setLineWidth(0.35);
    doc.line(15, y - 4, pageWidth - 15, y - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.gray[500]);
    doc.text(`RV Automóviles - ${label}`, 15, y);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - 15, y, { align: 'right' });
  }
};

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
      font: 'helvetica',
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      valign: 'middle',
      lineWidth: 0,
      cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 }
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      lineWidth: 0.15,
      lineColor: COLORS.gray[200],
      textColor: COLORS.gray[800],
      valign: 'middle'
    },
    alternateRowStyles: { fillColor: COLORS.gray[50] },
    styles: { overflow: 'linebreak', cellWidth: 'wrap', minCellHeight: 7 },
    margin: { top: 18, bottom: 23, left: 15, right: 15 },
    tableLineColor: COLORS.gray[200],
    tableLineWidth: 0.15,
    showHead: 'everyPage'
  };
};

export const addSection = (doc, yPos, title, description = null) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.gray[900]);
  doc.text(String(title), 15, yPos + 5);

  let nextY = yPos + 10;
  if (description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.gray[600]);
    const lines = doc.splitTextToSize(String(description), pageWidth - 30);
    doc.text(lines, 15, nextY);
    nextY += lines.length * 4 + 1;
  }

  doc.setDrawColor(...COLORS.gray[200]);
  doc.setLineWidth(0.35);
  doc.line(15, nextY, pageWidth - 15, nextY);
  return nextY + 5;
};

export const addInfoBox = (doc, yPos, title, content, type = 'info') => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const palette = {
    info: { bg: [239, 246, 255], border: COLORS.info, text: [30, 64, 175] },
    success: { bg: [240, 253, 244], border: COLORS.success, text: [21, 128, 61] },
    warning: { bg: [255, 251, 235], border: COLORS.warning, text: [146, 64, 14] },
    danger: { bg: [254, 242, 242], border: COLORS.danger, text: [153, 27, 27] }
  }[type] || { bg: COLORS.gray[50], border: COLORS.gray[300], text: COLORS.gray[700] };
  const lines = doc.splitTextToSize(String(content), pageWidth - 44);
  const boxHeight = 13 + lines.length * 4;

  doc.setFillColor(...palette.bg);
  doc.setDrawColor(...palette.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, yPos, pageWidth - 30, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...palette.text);
  doc.text(String(title), 20, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(lines, 20, yPos + 12);
  return yPos + boxHeight + 5;
};

export const createStandardPDF = async (title, subtitle = null, type = 'REPORTE') => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const startY = await addPDFHeader(doc, title, subtitle, type);
  return { doc, startY };
};

export const getPDFFileName = (type, description = '') => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const suffix = description ? `_${description}` : '';
  return `RV_${type}${suffix}_${date}_${time}.pdf`;
};

export const addWatermark = (doc, text = 'COPIA') => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.setTextColor(...COLORS.gray[400]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(54);
    doc.text(String(text), pageWidth / 2, pageHeight / 2, { align: 'center', angle: 35 });
    doc.restoreGraphicsState();
  }
};

export { COLORS };
