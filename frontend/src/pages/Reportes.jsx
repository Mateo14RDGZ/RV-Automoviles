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
      const doc = new jsPDF();
      
      // Agregar encabezado profesional
      const startY = await addPDFHeader(
        doc,
        'Base de Datos de Clientes',
        `Total: ${clientes.length} clientes`,
        'Base de Clientes'
      );
      
      // Tabla única con toda la información
      const tableData = clientes.map(cliente => [
        String(cliente.nombre || '-'),
        String(cliente.cedula || '-'),
        String(cliente.telefono || '-'),
        String(cliente.email || 'Sin email'),
        String(cliente.direccion || 'Sin dirección')
      ]);
      
      autoTable(doc, {
        startY: startY,
        head: [['Nombre Completo', 'Cédula', 'Teléfono', 'Email', 'Dirección']],
        body: tableData,
        ...getTableStyles('secondary'),
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold' },
          1: { cellWidth: 24, halign: 'center' },
          2: { cellWidth: 26, halign: 'center' },
          3: { cellWidth: 42 },
          4: { cellWidth: 48 }
        }
      });
      
      // Agregar pie de página
      addPDFFooter(doc, {
        showContact: true,
        contactInfo: {
          telefono: '+598 XX XXX XXX',
          email: 'info@nicolastejera.com',
          web: 'www.nicolastejera.com'
        }
      });
      
      // Guardar con nombre profesional
      doc.save(getPDFFileName('Clientes', 'Base'));
      showToast('PDF de clientes generado exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showToast('Error al exportar clientes a PDF', 'error');
    }
  };

  const handleExportPagosPDF = async () => {
    try {
      const pagos = await pagosService.getAll();
      const doc = new jsPDF();
      
      // Agregar encabezado profesional
      const startY = await addPDFHeader(
        doc,
        'Historial de Pagos',
        `Total: ${pagos.length} cuotas registradas`,
        'Historial de Pagos'
      );

      // Calcular totales
      const totalPagado = pagos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
      
      const totalPendiente = pagos
        .filter(p => p.estado !== 'pagado')
        .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

      const cuotasPagadas = pagos.filter(p => p.estado === 'pagado').length;
      const cuotasPendientes = pagos.filter(p => p.estado !== 'pagado').length;

      // Tabla de resumen al inicio
      const resumenData = [
        ['Cuotas Pagadas', cuotasPagadas.toString(), formatCurrency(totalPagado)],
        ['Cuotas Pendientes', cuotasPendientes.toString(), formatCurrency(totalPendiente)],
        ['TOTAL', (cuotasPagadas + cuotasPendientes).toString(), formatCurrency(totalPagado + totalPendiente)]
      ];

      autoTable(doc, {
        startY: startY,
        head: [['Concepto', 'Cantidad', 'Monto']],
        body: resumenData,
        ...getTableStyles('success'),
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold' },
          1: { cellWidth: 50, halign: 'center' },
          2: { cellWidth: 52, halign: 'right', fontStyle: 'bold' }
        }
      });

      let currentY = doc.lastAutoTable.finalY + 10;

      // Agrupar pagos por cliente
      const pagosPorCliente = pagos.reduce((acc, pago) => {
        const clienteId = pago.auto?.cliente?.id || 'sin-cliente';
        const clienteNombre = pago.auto?.cliente?.nombre || 'Sin Cliente';
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
          .filter(p => p.estado === 'pagado')
          .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
        
        const clienteTotalPendiente = pagoCliente
          .filter(p => p.estado !== 'pagado')
          .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

        // Título del cliente
        doc.setFillColor(...COLORS.primary);
        doc.rect(14, currentY, 182, 8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(nombre, 16, currentY + 5.5);
        doc.setFont(undefined, 'normal');
        
        currentY += 10;

        // Tabla de datos del cliente
        const clienteInfoData = [];
        if (cliente) {
          clienteInfoData.push([
            'Cédula',
            cliente.cedula || 'N/A',
            'Teléfono',
            cliente.telefono || 'N/A'
          ]);
          if (cliente.email) {
            clienteInfoData.push([
              'Email',
              cliente.email,
              '',
              ''
            ]);
          }
        }

        if (clienteInfoData.length > 0) {
          autoTable(doc, {
            startY: currentY,
            body: clienteInfoData,
            theme: 'plain',
            styles: {
              fontSize: 8,
              cellPadding: 1
            },
            columnStyles: {
              0: { cellWidth: 20, fontStyle: 'bold', textColor: COLORS.gray[600] },
              1: { cellWidth: 70 },
              2: { cellWidth: 20, fontStyle: 'bold', textColor: COLORS.gray[600] },
              3: { cellWidth: 72 }
            }
          });
          currentY = doc.lastAutoTable.finalY + 3;
        }

        // Tabla de pagos del cliente
        const tableData = pagoCliente.map(pago => {
          const monto = formatCurrency(parseFloat(pago.monto || 0));
          const estado = pago.estado === 'pagado' ? 'Pagado' : 
                        pago.estado === 'pendiente' ? 'Pendiente' : 'Vencido';
          return [
            String(`${pago.auto?.marca || ''} ${pago.auto?.modelo || ''}`.trim() || 'N/A'),
            String(pago.auto?.matricula || '0km'),
            `#${String(pago.numeroCuota || '')}`,
            monto,
            pago.fechaVencimiento ? new Date(pago.fechaVencimiento).toLocaleDateString('es-UY', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '-',
            estado,
            pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-UY', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '-'
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
            4: { cellWidth: 22, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' },
            6: { cellWidth: 22, halign: 'center' }
          },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 5) {
              const estado = data.cell.text[0];
              if (estado === 'Pagado') {
                data.cell.styles.textColor = COLORS.success;
                data.cell.styles.fontStyle = 'bold';
              } else if (estado === 'Vencido') {
                data.cell.styles.textColor = COLORS.danger;
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.textColor = COLORS.warning;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });

        currentY = doc.lastAutoTable.finalY + 2;

        // Tabla de totales del cliente
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
            cellPadding: 2,
            fillColor: COLORS.gray[50]
          },
          columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold', textColor: COLORS.success },
            1: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: COLORS.success },
            2: { cellWidth: 30, fontStyle: 'bold', textColor: COLORS.danger },
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: COLORS.danger },
            4: { cellWidth: 30, fontStyle: 'bold' },
            5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
          }
        });

        currentY = doc.lastAutoTable.finalY + 8;
      });

      // Agregar pie de página profesional
      addPDFFooter(doc, {
        showContact: true,
        contactInfo: {
          telefono: '+598 XX XXX XXX',
          email: 'cobranzas@nicolastejera.com',
          web: 'www.nicolastejera.com'
        }
      });

      // Guardar con nombre profesional
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
        'Reporte General del Sistema',
        `Periodo: ${new Date(dateRange.start).toLocaleDateString('es-ES')} - ${new Date(dateRange.end).toLocaleDateString('es-ES')}`,
        'Reporte General'
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
          1: { halign: 'right', cellWidth: 82, fontStyle: 'bold' }
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
          1: { halign: 'right', cellWidth: 82, fontStyle: 'bold' }
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
          1: { halign: 'right', cellWidth: 82, fontStyle: 'bold' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.index === 4) {
            // Resaltar cuotas vencidas en rojo
            data.cell.styles.textColor = COLORS.danger;
          }
        }
      });
      
      // Resumen Financiero Final
      currentY = doc.lastAutoTable.finalY + 15;
      
      // Caja de resumen con diseño profesional
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(14, currentY, 182, 40, 3, 3, 'F');
      
      // Borde decorativo
      doc.setDrawColor(...COLORS.accent);
      doc.setLineWidth(1);
      doc.roundedRect(14, currentY, 182, 40, 3, 3);
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('RESUMEN FINANCIERO', 105, currentY + 10, { align: 'center' });
      
      const totalActivo = (stats?.pagos?.totalRecaudado || 0) + (stats?.pagos?.totalPendiente || 0);
      const tasaRecuperacion = totalActivo > 0 ? ((stats?.pagos?.totalRecaudado || 0) / totalActivo) * 100 : 0;
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Total en Financiamientos Activos: ${formatCurrency(totalActivo)}`, 105, currentY + 20, { align: 'center' });
      doc.text(`Tasa de Recuperación: ${tasaRecuperacion.toFixed(1)}%`, 105, currentY + 28, { align: 'center' });
      
      const estadoFinanciero = tasaRecuperacion >= 80 ? 'Excelente' : tasaRecuperacion >= 60 ? 'Bueno' : 'Requiere Atención';
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text(`Estado: ${estadoFinanciero}`, 105, currentY + 35, { align: 'center' });
      
      // Agregar pie de página profesional
      addPDFFooter(doc, {
        showContact: true,
        contactInfo: {
          telefono: '+598 XX XXX XXX',
          email: 'info@nicolastejera.com',
          web: 'www.nicolastejera.com'
        }
      });
      
      // Guardar con nombre profesional
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
      const permutas = await response.json();
      
      const doc = new jsPDF();
      
      // Agregar encabezado profesional
      const startY = await addPDFHeader(
        doc,
        'Reporte de Permutas',
        `Total de operaciones: ${permutas.length}`,
        'Permutas'
      );
      
      // Estadísticas Generales
      if (permutasStats) {
        const statsY = addSection(doc, startY, 'Estadísticas Generales', 'Resumen de permutas por tipo y valor');
        
        const statsData = [
          ['Total de Permutas Registradas', String(permutasStats.total || 0)],
          ['Permutas de Automóviles', String(permutasStats.porTipo?.find(t => t.tipo === 'auto')?._count || 0)],
          ['Permutas de Motocicletas', String(permutasStats.porTipo?.find(t => t.tipo === 'moto')?._count || 0)],
          ['Otras Permutas', String(permutasStats.porTipo?.find(t => t.tipo === 'otros')?._count || 0)],
          ['Valor Total Estimado', formatCurrency(permutasStats.valorTotal || 0)]
        ];
        
        autoTable(doc, {
          startY: statsY,
          body: statsData,
          ...getTableStyles('warning'),
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 100 },
            1: { halign: 'right', cellWidth: 82, fontStyle: 'bold' }
          },
          didParseCell: function(data) {
            if (data.section === 'body' && data.row.index === 4) {
              // Resaltar valor total
              data.cell.styles.fillColor = COLORS.gray[50];
              data.cell.styles.textColor = COLORS.warning;
              data.cell.styles.fontSize = 10;
            }
          }
        });
      }
      
      // Detalle de Permutas
      let currentY = doc.lastAutoTable?.finalY + 15 || 100;
      currentY = addSection(doc, currentY, 'Detalle de Permutas', 'Lista completa de todas las permutas registradas');
      
      const permutasTableData = permutas.map(p => [
        p.tipo === 'auto' ? 'AUTO' : p.tipo === 'moto' ? 'MOTO' : 'OTROS',
        p.descripcion || '-',
        formatCurrency(p.valorEstimado || 0),
        p.cliente?.nombre || 'Sin asignar',
        new Date(p.createdAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Tipo', 'Descripción', 'Valor Estimado', 'Cliente', 'Fecha']],
        body: permutasTableData,
        ...getTableStyles('warning'),
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 60 },
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
      
      // Agregar pie de página profesional
      addPDFFooter(doc, {
        showContact: true,
        contactInfo: {
          telefono: '+598 XX XXX XXX',
          email: 'info@nicolastejera.com',
          web: 'www.nicolastejera.com'
        }
      });
      
      // Guardar con nombre profesional
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
