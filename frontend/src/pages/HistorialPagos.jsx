import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, Download, Calendar } from 'lucide-react';
import { pagosService } from '../services/apiServices';
import { formatCurrency, formatDate } from '../utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPDFHeader, addPDFFooter, COLORS, getPDFFileName, getTableStyles } from '../utils/pdfHelper';
import { SkeletonTable } from '../components/SkeletonLoader';
import { EmptyFilter } from '../components/EmptyStateIllustrated';

const HistorialPagos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  useEffect(() => {
    loadHistorial();
  }, []);

  useEffect(() => {
    filterPagos();
  }, [searchTerm, filterEstado, pagos]);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pagosService.getAll();
      const pagosSorted = (response.data || []).sort((a, b) => 
        new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento)
      );
      setPagos(pagosSorted);
      setFilteredPagos(pagosSorted);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setError(error.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const filterPagos = () => {
    let filtered = [...pagos];

    // Filtrar por estado
    if (filterEstado !== 'todos') {
      if (filterEstado === 'vencido') {
        filtered = filtered.filter(p => 
          p.estado === 'pendiente' && new Date(p.fechaVencimiento) < new Date()
        );
      } else {
        filtered = filtered.filter(p => p.estado === filterEstado);
      }
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.numeroCuota.toString().includes(searchTerm) ||
        p.auto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.auto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.auto.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(p.fechaVencimiento).includes(searchTerm) ||
        (p.fechaPago && formatDate(p.fechaPago).includes(searchTerm))
      );
    }

    setFilteredPagos(filtered);
  };

  const descargarComprobante = async (pago) => {
    const doc = new jsPDF();
    
    // Asegurar que todos los valores sean strings válidos
    const numeroCuota = (pago.numeroCuota || 0).toString();
    const estadoPago = (pago.estado || 'pendiente').toString();
    const estadoTexto = estadoPago === 'pagado' ? 'PAGADO' : 'PENDIENTE';
    
    // Header profesional con logo de RV Automóviles
    const startY = await addPDFHeader(
      doc,
      'Comprobante de Pago',
      `Cuota N° ${numeroCuota} - Estado: ${estadoTexto}`,
      'COMPROBANTE'
    );
    
    let currentY = startY;
    
    // === INFORMACIÓN DEL CLIENTE ===
    const clienteData = [
      ['Nombre Completo', (pago.auto?.cliente?.nombre || 'N/A').toString()],
      ['Cédula de Identidad', (pago.auto?.cliente?.cedula || 'N/A').toString()],
      ['Teléfono', (pago.auto?.cliente?.telefono || 'N/A').toString()]
    ];
    
    if (pago.auto?.cliente?.email) {
      clienteData.push(['Correo Electrónico', pago.auto.cliente.email.toString()]);
    }
    
    if (pago.auto?.cliente?.direccion) {
      clienteData.push(['Dirección', pago.auto.cliente.direccion.toString()]);
    }
    
    autoTable(doc, {
      startY: currentY,
      head: [['DATOS DEL CLIENTE', '']],
      body: clienteData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', textColor: COLORS.gray[700] },
        1: { cellWidth: 122 }
      },
      margin: { left: 15, right: 15 }
    });
    
    currentY = doc.lastAutoTable.finalY + 6;
    
    // === INFORMACIÓN DEL VEHÍCULO ===
    const marca = (pago.auto?.marca || '').toString();
    const modelo = (pago.auto?.modelo || '').toString();
    const anio = (pago.auto?.anio || 0).toString();
    const matricula = (pago.auto?.matricula || 'Sin matrícula (0km)').toString();
    
    const vehiculoData = [
      ['Vehículo', `${marca} ${modelo}`.trim()],
      ['Año', anio],
      ['Matrícula', matricula]
    ];
    
    if (pago.auto?.color) {
      vehiculoData.push(['Color', pago.auto.color.toString()]);
    }
    
    autoTable(doc, {
      startY: currentY,
      head: [['DATOS DEL VEHÍCULO', '']],
      body: vehiculoData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', textColor: COLORS.gray[700] },
        1: { cellWidth: 122 }
      },
      margin: { left: 15, right: 15 }
    });
    
    currentY = doc.lastAutoTable.finalY + 6;
    
    // === INFORMACIÓN DE PERMUTA (si existe) ===
    const permuta = pago.auto.permutas && pago.auto.permutas.length > 0 ? pago.auto.permutas[0] : null;
    
    if (permuta) {
      const tipoPermuta = permuta.tipo === 'auto' ? 'Automóvil' : 
                         permuta.tipo === 'moto' ? 'Motocicleta' : 'Otros';
      
      const permutaData = [
        ['Tipo de Bien', tipoPermuta]
      ];
      
      if (permuta.descripcion) {
        permutaData.push(['Descripción', permuta.descripcion]);
      }
      
      if (permuta.tipo === 'auto') {
        permutaData.push(
          ['Marca y Modelo', `${permuta.autoMarca || ''} ${permuta.autoModelo || ''}`.trim()],
          ['Año', permuta.autoAnio ? permuta.autoAnio.toString() : 'N/A']
        );
      }
      
      permutaData.push(['Valor Acordado', formatCurrency(permuta.valorEstimado)]);
      
      // Cálculo financiero
      const precioOriginal = pago.auto.precio || 0;
      const valorPermuta = permuta.valorEstimado || 0;
      const precioFinal = precioOriginal - valorPermuta;
      
      permutaData.push(
        ['Precio del Vehículo', formatCurrency(precioOriginal)],
        ['Descuento por Permuta', formatCurrency(valorPermuta)],
        ['MONTO FINANCIADO', formatCurrency(precioFinal)]
      );
      
      autoTable(doc, {
        startY: currentY,
        head: [['PERMUTA INCLUIDA', '']],
        body: permutaData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.warning,
          textColor: COLORS.white,
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold', textColor: COLORS.gray[700] },
          1: { cellWidth: 102, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        didParseCell: function(data) {
          // Destacar monto financiado
          if (data.section === 'body' && data.row.index === permutaData.length - 1) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = COLORS.success;
            data.cell.styles.fillColor = [220, 252, 231];
          }
        }
      });
      
      currentY = doc.lastAutoTable.finalY + 6;
    }
    
    // === DETALLES DEL PAGO ===
    const pagoData = [
      ['Número de Cuota', numeroCuota],
      ['Monto de la Cuota', formatCurrency(pago.monto)],
      ['Fecha de Vencimiento', formatDate(pago.fechaVencimiento)]
    ];
    
    if (pago.estado === 'pagado' && pago.fechaPago) {
      pagoData.push(['Fecha de Pago', formatDate(pago.fechaPago)]);
    }
    
    pagoData.push(['Estado del Pago', estadoTexto]);
    
    autoTable(doc, {
      startY: currentY,
      head: [['INFORMACIÓN DEL PAGO', '']],
      body: pagoData,
      theme: 'grid',
      headStyles: {
        fillColor: pago.estado === 'pagado' ? COLORS.success : COLORS.info,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 80, fontStyle: 'bold', textColor: COLORS.gray[700] },
        1: { cellWidth: 102, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        if (data.section === 'body') {
          // Destacar monto
          if (data.row.index === 1) {
            data.cell.styles.fontSize = 13;
            data.cell.styles.textColor = COLORS.success;
            data.cell.styles.fillColor = [220, 252, 231];
          }
          // Destacar estado
          if (data.row.index === pagoData.length - 1) {
            data.cell.styles.fontSize = 11;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = pago.estado === 'pagado' ? COLORS.success : COLORS.warning;
            data.cell.styles.fillColor = pago.estado === 'pagado' ? [220, 252, 231] : [254, 243, 199];
          }
        }
      }
    });
    
    // === NOTA LEGAL ===
    const finalY = doc.lastAutoTable.finalY + 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    if (finalY < pageHeight - 50) {
      doc.setFillColor(...COLORS.gray[50]);
      doc.setDrawColor(...COLORS.gray[300]);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, finalY, 180, 20, 3, 3, 'FD');
      
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...COLORS.gray[700]);
      doc.text('INFORMACIÓN IMPORTANTE', 20, finalY + 6);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...COLORS.gray[600]);
      doc.text('Este documento constituye comprobante válido de la operación financiera.', 20, finalY + 11);
      doc.text('Para consultas, comuníquese con RV Automóviles a través de los canales oficiales.', 20, finalY + 16);
    }
    
    // Footer profesional con datos de contacto
    await addPDFFooter(doc, {
      showContact: true,
      contactInfo: {
        telefono: '+598 99 123 456',
        email: 'info@rvautomoviles.com',
        web: 'www.rvautomoviles.com.uy',
        direccion: 'Montevideo, Uruguay'
      }
    });
    
    // Guardar PDF con nombre descriptivo
    doc.save(getPDFFileName('Comprobante', `Cuota${pago.numeroCuota}_${pago.auto.cliente.nombre.replace(/\s+/g, '_')}`));
  };

  const getEstadoBadge = (pago) => {
    if (pago.estado === 'pagado') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="w-3 h-3" /> Pagado
        </span>
      );
    }
    
    const fechaVencimiento = new Date(pago.fechaVencimiento);
    const hoy = new Date();
    
    if (fechaVencimiento < hoy) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="w-3 h-3" /> Vencido
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consulta el detalle completo de todas tus cuotas
          </p>
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error al cargar historial</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button onClick={loadHistorial} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Pagos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Consulta el detalle completo de todas tus cuotas
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cuota, vehículo, fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterEstado('todos')}
              className={`btn ${filterEstado === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterEstado('pagado')}
              className={`btn ${filterEstado === 'pagado' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pagados
            </button>
            <button
              onClick={() => setFilterEstado('pendiente')}
              className={`btn ${filterEstado === 'pendiente' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterEstado('vencido')}
              className={`btn ${filterEstado === 'vencido' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Vencidos
            </button>
          </div>
        </div>
      </div>

      {/* Timeline de pagos */}
      <div className="space-y-4">
        {filteredPagos.length === 0 ? (
          searchTerm || filterEstado !== 'todos' ? (
            <EmptyFilter />
          ) : (
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No hay pagos registrados
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Cuando tengas cuotas, aparecerán aquí
                </p>
              </div>
            </div>
          )
        ) : (
          filteredPagos.map((pago) => (
            <div
              key={pago.id}
              className={`card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow ${
                pago.estado === 'pagado' 
                  ? 'border-l-4 border-l-green-500' 
                  : new Date(pago.fechaVencimiento) < new Date()
                  ? 'border-l-4 border-l-red-500'
                  : 'border-l-4 border-l-yellow-500'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Cuota #{pago.numeroCuota}
                    </h3>
                    {getEstadoBadge(pago)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vehículo:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {pago.auto.marca} {pago.auto.modelo}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Matrícula:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {pago.auto.matricula}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Vencimiento:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formatDate(pago.fechaVencimiento)}
                      </span>
                    </div>
                    {pago.estado === 'pagado' && pago.fechaPago && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Pagado el:</span>
                        <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                          {formatDate(pago.fechaPago)}
                        </span>
                      </div>
                    )}
                    {pago.auto.permutas && pago.auto.permutas.length > 0 && (
                      <div className="col-span-2 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          🔄 Permuta: {pago.auto.permutas[0].descripcion} - {formatCurrency(pago.auto.permutas[0].valorEstimado)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monto</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(pago.monto)}
                    </p>
                  </div>
                  
                  {pago.estado === 'pagado' && (
                    <button
                      onClick={() => descargarComprobante(pago)}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Descargar comprobante"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden md:inline">Comprobante</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen */}
      {filteredPagos.length > 0 && (
        <div className="card bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total mostrado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredPagos.length} cuota{filteredPagos.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monto total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(filteredPagos.reduce((sum, p) => sum + parseFloat(p.monto), 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pagadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredPagos.filter(p => p.estado === 'pagado').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialPagos;
