import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { autosService, clientesService, pagosService, dashboardService } from '../services/apiServices';
import { exportToCSV, exportToJSON, formatDataForExport } from '../utils/export';
import { formatCurrency, formatDate } from '../utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPDFHeader, addPDFFooter, getTableStyles, addSection, getPDFFileName, COLORS } from '../utils/pdfHelper';
import { 
  FileDown, 
  FileText, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Users,
  Car,
  RefreshCw
} from 'lucide-react';
import Loading from '../components/Loading';
import StatCard from '../components/StatCard';
import { useToast } from '../context/ToastContext';

const textOrDash = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return '-';
  return String(value).trim();
};

const formatReportDate = (value) => {
  if (!value) return '-';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getPagoEstado = (pago) => {
  if (pago.estado === 'pagado') return 'Pagado';
  const vencimiento = pago.fechaVencimiento ? new Date(pago.fechaVencimiento) : null;
  return vencimiento && vencimiento < new Date() ? 'Vencido' : 'Pendiente';
};

const getPagoMonto = (pago) => {
  const value = pago.estado === 'pagado' && pago.montoPagado !== null && pago.montoPagado !== undefined
    ? pago.montoPagado
    : pago.monto;
  return parseFloat(value) || 0;
};

const Reportes = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [permutasStats, setPermutasStats] = useState(null);
  const [reportType, setReportType] = useState('general');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, permutasData] = await Promise.all([
        dashboardService.getStats(),
        fetch('/api/permutas/stats/resumen', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json()).catch(() => null)
      ]);
      
      setStats(statsData);
      setPermutasStats(permutasData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAutos = async () => {
    try {
      const autos = await autosService.getAll();
      const formatted = formatDataForExport(autos, 'autos');
      exportToCSV(formatted, `autos_${new Date().toISOString().split('T')[0]}.csv`);
      showToast('Autos exportados exitosamente', 'success');
    } catch (error) {
      showToast('Error al exportar autos', 'error');
    }
  };

  const handleExportClientes = async () => {
    try {
      const clientes = await clientesService.getAll();
      const formatted = formatDataForExport(clientes, 'clientes');
      exportToCSV(formatted, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      showToast('Clientes exportados exitosamente', 'success');
    } catch (error) {
      showToast('Error al exportar clientes', 'error');
    }
  };

  const handleExportPagos = async () => {
    try {
      const pagos = await pagosService.getAll();
      const formatted = formatDataForExport(pagos, 'pagos');
      exportToCSV(formatted, `pagos_${new Date().toISOString().split('T')[0]}.csv`);
      showToast('Pagos exportados exitosamente', 'success');
    } catch (error) {
      showToast('Error al exportar pagos', 'error');
    }
  };

  const handleExportGeneral = async () => {
    try {
      const data = {
        fecha_reporte: new Date().toISOString(),
        estadisticas: stats,
        rango_fechas: dateRange
      };
      exportToJSON(data, `reporte_general_${new Date().toISOString().split('T')[0]}.json`);
      showToast('Reporte general exportado exitosamente', 'success');
    } catch (error) {
      showToast('Error al exportar reporte general', 'error');
    }
  };

  // Funciones para exportar a PDF
  const handleExportClientesPDF = async () => {
    try {
      const clientes = await clientesService.getAll();
      if (!clientes || clientes.length === 0) {
        showToast('No hay clientes para incluir en el reporte', 'warning');
        return;
      }
      const doc = new jsPDF();
      
      // Agregar encabezado profesional
      const startY = await addPDFHeader(
        doc,
        'Directorio de clientes',
        `${clientes.length} cliente${clientes.length === 1 ? '' : 's'} registrado${clientes.length === 1 ? '' : 's'}`,
        'Clientes'
      );
      
      // Sección descriptiva
      const sectionY = addSection(
        doc,
        startY,
        'Datos de contacto',
        'Listado de clientes y medios de contacto disponibles en el sistema.'
      );
      
      // Tabla profesional con toda la información
      const tableData = clientes.map((cliente, index) => [
        String(index + 1), // Número de fila
        textOrDash(cliente.nombre),
        textOrDash(cliente.cedula),
        textOrDash(cliente.telefono),
        textOrDash(cliente.email),
        textOrDash(cliente.direccion)
      ]);
      
      autoTable(doc, {
        startY: sectionY,
        head: [['#', 'Nombre Completo', 'Cédula', 'Teléfono', 'Email', 'Dirección']],
        body: tableData,
        ...getTableStyles('secondary'),
        columnStyles: {
          0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 40, fontStyle: 'bold' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 24, halign: 'center' },
          4: { cellWidth: 40 },
          5: { cellWidth: 44 }
        },
        didParseCell: function(data) {
          // Alternar colores más suaves
          if (data.section === 'body' && data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [249, 250, 251];
          }
        }
      });
      
      await addPDFFooter(doc, { label: 'Directorio de clientes' });
      doc.save(getPDFFileName('Clientes', 'Base'));
      showToast('PDF de clientes generado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showToast('Error al exportar clientes a PDF', 'error');
    }
  };

  const handleExportPagosPDF = async () => {
    try {
      const pagos = await pagosService.getAll({
        fechaDesde: dateRange.start,
        fechaHasta: dateRange.end
      });
      if (!pagos || pagos.length === 0) {
        showToast('No hay pagos en el rango de fechas seleccionado', 'warning');
        return;
      }
      const doc = new jsPDF();
      const periodoStr = `${formatReportDate(dateRange.start)} al ${formatReportDate(dateRange.end)}`;
      
      // Agregar encabezado profesional con rango de fechas estricto
      const startY = await addPDFHeader(
        doc,
        'Historial de Pagos',
        `Período de vencimiento: ${periodoStr} | ${pagos.length} cuota${pagos.length === 1 ? '' : 's'}`,
        'Pagos'
      );

      // Calcular totales
      const totalPagado = pagos
        .filter(p => getPagoEstado(p) === 'Pagado')
        .reduce((sum, p) => sum + getPagoMonto(p), 0);
      
      const totalPendiente = pagos
        .filter(p => getPagoEstado(p) !== 'Pagado')
        .reduce((sum, p) => sum + getPagoMonto(p), 0);

      const cuotasPagadas = pagos.filter(p => getPagoEstado(p) === 'Pagado').length;
      const cuotasPendientes = pagos.filter(p => getPagoEstado(p) === 'Pendiente').length;
      const cuotasVencidas = pagos.filter(p => getPagoEstado(p) === 'Vencido').length;
      const montoPendiente = pagos.filter(p => getPagoEstado(p) === 'Pendiente').reduce((sum, p) => sum + getPagoMonto(p), 0);
      const montoVencido = pagos.filter(p => getPagoEstado(p) === 'Vencido').reduce((sum, p) => sum + getPagoMonto(p), 0);

      // Tabla de resumen al inicio con diseño mejorado
      const resumenData = [
        ['Cuotas Pagadas', cuotasPagadas.toString(), formatCurrency(totalPagado)],
        ['Cuotas Pendientes', cuotasPendientes.toString(), formatCurrency(montoPendiente)],
        ['Cuotas Vencidas', cuotasVencidas.toString(), formatCurrency(montoVencido)],
        ['Total del período', pagos.length.toString(), formatCurrency(totalPagado + totalPendiente)]
      ];

      autoTable(doc, {
        startY: startY,
        head: [['Concepto', 'Cantidad', 'Monto']],
        body: resumenData,
        ...getTableStyles('success'),
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 45, halign: 'center', fontStyle: 'bold', fontSize: 10 },
          2: { cellWidth: 55, halign: 'right', fontStyle: 'bold', fontSize: 10 }
        },
        didParseCell: function(data) {
          if (data.section === 'body') {
            if (data.row.index === 0) {
              // Fila de pagadas en verde
              data.cell.styles.textColor = COLORS.success;
            } else if (data.row.index === 1) {
              // Fila de pendientes en amarillo
              data.cell.styles.textColor = COLORS.warning;
            } else if (data.row.index === 2) {
              data.cell.styles.textColor = COLORS.danger;
            } else if (data.row.index === 3) {
              data.cell.styles.textColor = COLORS.primary;
              data.cell.styles.fontSize = 11;
              data.cell.styles.fillColor = COLORS.gray[50];
            }
          }
        }
      });

      let currentY = doc.lastAutoTable.finalY + 12;
      
      // Agregar separador visual
      doc.setDrawColor(...COLORS.gray[300]);
      doc.setLineWidth(0.5);
      doc.line(14, currentY - 4, 196, currentY - 4);

      // Agrupar pagos por cliente
      const pagosPorCliente = pagos.reduce((acc, pago) => {
        const clienteId = pago.auto?.cliente?.id || 'sin-cliente';
        const clienteNombre = textOrDash(pago.auto?.cliente?.nombre);
        if (!acc[clienteId]) {
          acc[clienteId] = {
            cliente: pago.auto?.cliente,
            nombre: clienteNombre,
            pagos: []
          };
        }
        acc[clienteId].pagos.push(pago);
        return acc;
      }, {});

      // Iterar por cada cliente
      Object.entries(pagosPorCliente).forEach(([clienteId, data], index) => {
        const { cliente, nombre, pagos: pagoCliente } = data;

        // Verificar si necesitamos una nueva página
        if (currentY > 240) {
          doc.addPage();
          currentY = 50;
        }

        // Calcular totales del cliente
        const clienteTotalPagado = pagoCliente
          .filter(p => getPagoEstado(p) === 'Pagado')
          .reduce((sum, p) => sum + getPagoMonto(p), 0);
        
        const clienteTotalPendiente = pagoCliente
          .filter(p => getPagoEstado(p) !== 'Pagado')
          .reduce((sum, p) => sum + getPagoMonto(p), 0);

        // Título del cliente con diseño mejorado
        doc.setFillColor(...COLORS.primary);
        doc.roundedRect(14, currentY, 182, 10, 2, 2, 'F');
        
        // Borde decorativo
        doc.setDrawColor(...COLORS.accent);
        doc.setLineWidth(0.5);
        doc.roundedRect(14, currentY, 182, 10, 2, 2);
        
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(nombre, 18, currentY + 7);
        doc.setFont(undefined, 'normal');
        
        // Indicador del número de cliente
        doc.setFontSize(8);
        doc.text(`Cliente #${index + 1}`, 190, currentY + 7, { align: 'right' });
        
        currentY += 12;

        // Tabla de datos del cliente con mejor formato
        const clienteInfoData = [];
        if (cliente) {
          if (cliente.cedula) {
            clienteInfoData.push(['Cédula', textOrDash(cliente.cedula), 'Teléfono', textOrDash(cliente.telefono)]);
          }
          if (cliente.email) {
            clienteInfoData.push(['Email', textOrDash(cliente.email), 'Dirección', textOrDash(cliente.direccion)]);
          } else if (cliente.direccion) {
            clienteInfoData.push(['Dirección', cliente.direccion, '', '']);
          }
        }

        if (clienteInfoData.length > 0) {
          autoTable(doc, {
            startY: currentY,
            body: clienteInfoData,
            theme: 'plain',
            styles: {
              fontSize: 8,
              cellPadding: 2,
              fillColor: [249, 250, 251]
            },
            columnStyles: {
              0: { cellWidth: 20, fontStyle: 'bold', textColor: COLORS.gray[600] },
              1: { cellWidth: 66 },
              2: { cellWidth: 20, fontStyle: 'bold', textColor: COLORS.gray[600] },
              3: { cellWidth: 74 }
            }
          });
          currentY = doc.lastAutoTable.finalY + 5;
        }

        // Tabla de pagos del cliente con mejor diseño
        const tableData = pagoCliente.map(pago => {
          const monto = formatCurrency(getPagoMonto(pago));
          const estado = getPagoEstado(pago);
          return [
            textOrDash(`${pago.auto?.marca || ''} ${pago.auto?.modelo || ''}`.trim()),
            textOrDash(pago.auto?.matricula || '0 km'),
            pago.numeroCuota ? `#${pago.numeroCuota}` : '-',
            monto,
            formatReportDate(pago.fechaVencimiento),
            estado,
            formatReportDate(pago.fechaPago)
          ];
        });

        autoTable(doc, {
          startY: currentY,
          head: [['Vehículo', 'Matrícula', 'Cuota', 'Monto', 'Vencimiento', 'Estado', 'Fecha Pago']],
          body: tableData,
          ...getTableStyles('secondary'),
          columnStyles: {
            0: { cellWidth: 38 },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
            4: { cellWidth: 22, halign: 'center', fontSize: 8 },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 22, halign: 'center', fontSize: 8 }
          },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 5) {
              const estado = data.cell.text[0];
              if (estado === 'Pagado') {
                data.cell.styles.textColor = COLORS.success;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [220, 252, 231]; // Verde muy claro
              } else if (estado === 'Vencido') {
                data.cell.styles.textColor = COLORS.danger;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [254, 226, 226]; // Rojo muy claro
              } else {
                data.cell.styles.textColor = COLORS.warning;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [254, 243, 199]; // Amarillo muy claro
              }
            }
          }
        });

        currentY = doc.lastAutoTable.finalY + 3;

        // Tabla de totales del cliente con diseño mejorado
        const clienteTotalesData = [
          [
            'Pagado',
            formatCurrency(clienteTotalPagado),
            'Pendiente',
            formatCurrency(clienteTotalPendiente),
            'TOTAL',
            formatCurrency(clienteTotalPagado + clienteTotalPendiente)
          ]
        ];

        autoTable(doc, {
          startY: currentY,
          body: clienteTotalesData,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 3,
            fillColor: COLORS.gray[50],
            lineWidth: 0.1,
            lineColor: COLORS.gray[300]
          },
          columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold', textColor: COLORS.success },
            1: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: COLORS.success },
            2: { cellWidth: 30, fontStyle: 'bold', textColor: COLORS.warning },
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: COLORS.warning },
            4: { cellWidth: 30, fontStyle: 'bold', textColor: COLORS.primary, fontSize: 10 },
            5: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: COLORS.primary, fontSize: 10 }
          }
        });

        currentY = doc.lastAutoTable.finalY + 10;
      });

      await addPDFFooter(doc, { label: `Historial de pagos - ${periodoStr}` });
      doc.save(getPDFFileName('Pagos', 'Historial'));
      showToast('Historial de pagos generado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showToast('Error al exportar historial de pagos', 'error');
    }
  };

  const handleExportGeneralPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Agregar encabezado profesional
      const startY = await addPDFHeader(
        doc,
        'Resumen general del negocio',
        `Estado actual de la información registrada al ${formatReportDate(new Date())}`,
        'Resumen general'
      );
      
      // Sección de Autos
      let currentY = addSection(doc, startY, 'Inventario de Autos', 'Resumen del estado actual de vehículos');
      
      const autosData = [
        ['Total de Autos', String(stats?.autos?.total || 0)],
        ['Disponibles para Venta', String(stats?.autos?.disponibles || 0)],
        ['Vendidos', String(stats?.autos?.vendidos || 0)],
        ['En Financiamiento', String(stats?.autos?.financiados || 0)]
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: autosData,
        ...getTableStyles('primary'),
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80, fontStyle: 'bold' }
        }
      });
      
      // Sección de Clientes
      currentY = doc.lastAutoTable.finalY + 12;
      currentY = addSection(doc, currentY, 'Base de Clientes', 'Total de clientes registrados en el sistema');
      
      const clientesData = [
        ['Total de Clientes Activos', String(stats?.clientes?.total || 0)]
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: clientesData,
        ...getTableStyles('secondary'),
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80, fontStyle: 'bold' }
        }
      });
      
      // Sección de Pagos
      currentY = doc.lastAutoTable.finalY + 12;
      currentY = addSection(doc, currentY, 'Estado Financiero', 'Resumen de cobros y financiamientos');
      
      const pagosData = [
        ['Total Recaudado', formatCurrency(stats?.pagos?.totalRecaudado || 0)],
        ['Total Pendiente de Cobro', formatCurrency(stats?.pagos?.totalPendiente || 0)],
        ['Cuotas Pagadas', String(stats?.pagos?.pagados || 0)],
        ['Cuotas Pendientes', String(stats?.pagos?.pendientes || 0)],
        ['Cuotas Vencidas', String(stats?.pagos?.vencidos || 0)]
      ];
      
      autoTable(doc, {
        startY: currentY,
        body: pagosData,
        ...getTableStyles('success'),
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 100 },
          1: { halign: 'right', cellWidth: 80, fontStyle: 'bold' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === 4) {
            // Resaltar cuotas vencidas en rojo
            data.cell.styles.textColor = COLORS.danger;
          }
        }
      });
      
      // Indicadores financieros calculados a partir de los importes registrados.
      currentY = doc.lastAutoTable.finalY + 13;
      const totalActivo = (stats?.pagos?.totalRecaudado || 0) + (stats?.pagos?.totalPendiente || 0);
      const tasaRecuperacion = totalActivo > 0 ? ((stats?.pagos?.totalRecaudado || 0) / totalActivo) * 100 : 0;

      if (currentY > 238) {
        doc.addPage();
        currentY = 25;
      }
      currentY = addSection(doc, currentY, 'Indicadores de cartera', 'Importes acumulados según los pagos registrados en el sistema.');
      autoTable(doc, {
        startY: currentY,
        head: [['Indicador', 'Resultado']],
        body: [
          ['Cartera registrada', formatCurrency(totalActivo)],
          ['Porcentaje cobrado', `${tasaRecuperacion.toFixed(1)}%`]
        ],
        ...getTableStyles('primary'),
        columnStyles: {
          0: { cellWidth: 110, fontStyle: 'bold' },
          1: { cellWidth: 70, halign: 'right', fontStyle: 'bold' }
        }
      });

      await addPDFFooter(doc, { label: 'Resumen general del negocio' });
      doc.save(getPDFFileName('ReporteGeneral', 'Sistema'));
      showToast('PDF de reporte general exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showToast('Error al exportar reporte general a PDF', 'error');
    }
  };

  const handleExportPermutasPDF = async () => {
    try {
      const response = await fetch('/api/permutas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      let permutas = await response.json();
      // Filtro estricto por rango de fechas (fechaRecepcion)
      const desde = new Date(dateRange.start);
      desde.setHours(0, 0, 0, 0);
      const hasta = new Date(dateRange.end);
      hasta.setHours(23, 59, 59, 999);
      permutas = permutas.filter(p => {
        const fecha = new Date(p.fechaRecepcion || p.createdAt);
        return fecha >= desde && fecha <= hasta;
      });
      if (permutas.length === 0) {
        showToast('No hay permutas en el rango de fechas seleccionado', 'warning');
        return;
      }
      
      const doc = new jsPDF();
      const periodoStr = `${formatReportDate(dateRange.start)} al ${formatReportDate(dateRange.end)}`;
      
      // Agregar encabezado profesional con rango de fechas estricto
      const startY = await addPDFHeader(
        doc,
        'Reporte de Permutas',
        `Período de recepción: ${periodoStr} | ${permutas.length} operación${permutas.length === 1 ? '' : 'es'}`,
        'Permutas'
      );
      
      // Resumen calculado exclusivamente con las operaciones del período.
      const totalValorPermutas = permutas.reduce((sum, p) => sum + (parseFloat(p.valorEstimado) || 0), 0);
      const countByType = (type) => permutas.filter(p => p.tipo === type).length;
      const statsY = addSection(doc, startY, 'Resumen del período', 'Cantidad y valor estimado de las operaciones incluidas en este reporte.');
      const statsData = [
        ['Operaciones incluidas', String(permutas.length)],
        ['Automóviles', String(countByType('auto'))],
        ['Motocicletas', String(countByType('moto'))],
        ['Otros bienes', String(countByType('otros'))],
        ['Valor estimado total', formatCurrency(totalValorPermutas)]
      ];
      autoTable(doc, {
        startY: statsY,
        head: [['Indicador', 'Resultado']],
        body: statsData,
        ...getTableStyles('warning'),
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 108 },
          1: { halign: 'right', cellWidth: 72, fontStyle: 'bold' }
        }
      });
      
      // Detalle de Permutas
      let currentY = doc.lastAutoTable?.finalY + 15 || 100;
      currentY = addSection(doc, currentY, 'Detalle de operaciones', 'Bien recibido, valor estimado, cliente asociado y fecha de recepción.');
      
      const permutasTableData = permutas.map(p => [
        p.tipo === 'auto' ? 'AUTO' : p.tipo === 'moto' ? 'MOTO' : 'OTROS',
        textOrDash(p.descripcion),
        formatCurrency(p.valorEstimado || 0),
        textOrDash(p.cliente?.nombre),
        formatReportDate(p.fechaRecepcion || p.createdAt)
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Tipo', 'Bien recibido', 'Valor estimado', 'Cliente', 'Recepción']],
        body: permutasTableData,
        ...getTableStyles('warning'),
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 58 },
          2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
          3: { cellWidth: 42 },
          4: { cellWidth: 28, halign: 'center' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 0) {
            const tipo = data.cell.text[0];
            if (tipo === 'AUTO') {
              data.cell.styles.fillColor = [37, 99, 235, 0.1];
              data.cell.styles.textColor = COLORS.accent;
            } else if (tipo === 'MOTO') {
              data.cell.styles.fillColor = [245, 158, 11, 0.1];
              data.cell.styles.textColor = COLORS.warning;
            }
          }
        }
      });
      
      await addPDFFooter(doc, { label: `Permutas - ${periodoStr}` });
      doc.save(getPDFFileName('Permutas', 'Reporte'));
      showToast('PDF de permutas exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF de permutas:', error);
      showToast('Error al exportar permutas a PDF', 'error');
    }
  };

  if (loading) return <Loading message="Cargando reportes..." />;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Reportes y Exportación</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">Genera y descarga reportes del sistema</p>
      </div>

      {/* Estadísticas Generales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <StatCard
            title="Total Autos"
            value={stats.autos.total}
            subtitle={`${stats.autos.disponibles} disponibles`}
            icon={Car}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Total Clientes"
            value={stats.clientes.total}
            icon={Users}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Recaudado"
            value={formatCurrency(stats.pagos.totalRecaudado)}
            subtitle={`${stats.pagos.pagados} pagos`}
            icon={DollarSign}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Pendiente"
            value={formatCurrency(stats.pagos.totalPendiente)}
            subtitle={`${stats.pagos.pendientes} cuotas`}
            icon={TrendingUp}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </div>
      )}

      {/* Rango de Fechas */}
      <div className="card animate-fadeInUp p-4 md:p-6" style={{animationDelay: '0.3s'}}>
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Rango de Fechas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input text-sm md:text-base"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          El rango de fechas se aplica estrictamente a los PDFs de Historial de Pagos (por fecha de vencimiento) y Permutas (por fecha de recepción).
        </p>
      </div>

      {/* Exportaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
        {/* Exportar Clientes */}
        <div className="card hover-lift animate-fadeInUp p-3 md:p-6" style={{animationDelay: '0.4s'}}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                Base de Clientes
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-4">
                Exporta la información completa de todos los clientes
              </p>
              <button onClick={handleExportClientesPDF} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Exportar Pagos */}
        <div className="card hover-lift animate-fadeInUp p-3 md:p-6" style={{animationDelay: '0.5s'}}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                Historial de Pagos
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-4">
                Exporta el registro completo de pagos y cuotas
              </p>
              <button onClick={handleExportPagosPDF} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Exportar Permutas */}
        <div className="card hover-lift animate-fadeInUp p-3 md:p-6" style={{animationDelay: '0.65s'}}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
              <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                Permutas
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-4">
                Exporta el registro de permutas y estadísticas
              </p>
              {permutasStats && (
                <div className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                  Total: {permutasStats.total || 0} | Valor: {formatCurrency(permutasStats.valorTotal || 0)}
                </div>
              )}
              <button onClick={handleExportPermutasPDF} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Reporte General */}
        <div className="card hover-lift animate-fadeInUp p-3 md:p-6" style={{animationDelay: '0.6s'}}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                Reporte General
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-4">
                Exporta un resumen completo de todas las estadísticas
              </p>
              <button onClick={handleExportGeneralPDF} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 w-full md:w-auto justify-center">
                <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de Pagos Vencidos */}
      {stats && stats.pagos.vencidos > 0 && (
        <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 animate-fadeInUp" style={{animationDelay: '0.8s'}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">
              Atención: Pagos Vencidos
            </h3>
          </div>
          <p className="text-red-800 dark:text-red-300 mb-4">
            Tienes <strong>{stats.pagos.vencidos}</strong> cuotas vencidas que requieren seguimiento inmediato.
          </p>
          <button 
            onClick={() => navigate('/pagos', { state: { filterType: 'vencidos' } })}
            className="btn btn-danger text-sm transition-all hover:scale-105 active:scale-95"
          >
            Ver Pagos Vencidos
          </button>
        </div>
      )}
    </div>
  );
};


export default Reportes;
