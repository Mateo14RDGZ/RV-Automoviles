import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Search, Download, Calendar } from 'lucide-react';
import { pagosService } from '../services/apiServices';
import { formatCurrency, formatDate } from '../utils/format';
import jsPDF from 'jspdf';

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

  const descargarComprobante = (pago) => {
    const doc = new jsPDF();
    
    // Logo o título
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('RV Automóviles', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Comprobante de Pago', 105, 35, { align: 'center' });
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 42, 190, 42);
    
    // Información del pago
    doc.setFontSize(12);
    let y = 55;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Nombre: ${pago.auto.cliente.nombre}`, 25, y);
    y += 6;
    doc.text(`Cédula: ${pago.auto.cliente.cedula}`, 25, y);
    y += 6;
    doc.text(`Teléfono: ${pago.auto.cliente.telefono}`, 25, y);
    
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Vehículo:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Vehículo: ${pago.auto.marca} ${pago.auto.modelo} ${pago.auto.anio}`, 25, y);
    y += 6;
    doc.text(`Matrícula: ${pago.auto.matricula}`, 25, y);
    
    // Verificar si hay permuta
    const permuta = pago.auto.permutas && pago.auto.permutas.length > 0 ? pago.auto.permutas[0] : null;
    
    if (permuta) {
      y += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Información de Permuta:', 20, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
      
      const tipoPermuta = permuta.tipo === 'auto' ? 'Automóvil' : 
                         permuta.tipo === 'moto' ? 'Motocicleta' : 'Otros';
      doc.text(`Tipo: ${tipoPermuta}`, 25, y);
      y += 6;
      
      if (permuta.descripcion) {
        doc.text(`Descripción: ${permuta.descripcion}`, 25, y);
        y += 6;
      }
      
      doc.text(`Valor Estimado: ${formatCurrency(permuta.valorEstimado)}`, 25, y);
      y += 6;
      
      // Calcular y mostrar precio original y precio final
      const precioOriginal = pago.auto.precio || 0;
      const valorPermuta = permuta.valorEstimado || 0;
      const precioFinal = precioOriginal - valorPermuta;
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Financiero:', 20, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
      doc.text(`Precio Original del Vehículo: ${formatCurrency(precioOriginal)}`, 25, y);
      y += 6;
      doc.text(`Valor de Permuta: -${formatCurrency(valorPermuta)}`, 25, y);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Monto Financiado: ${formatCurrency(precioFinal)}`, 25, y);
      doc.setFont('helvetica', 'normal');
    }
    
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Pago:', 20, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Número de Cuota: #${pago.numeroCuota}`, 25, y);
    y += 6;
    doc.text(`Monto: ${formatCurrency(pago.monto)}`, 25, y);
    y += 6;
    doc.text(`Fecha de Vencimiento: ${formatDate(pago.fechaVencimiento)}`, 25, y);
    y += 6;
    
    if (pago.estado === 'pagado' && pago.fechaPago) {
      doc.setTextColor(34, 197, 94);
      doc.text(`Fecha de Pago: ${formatDate(pago.fechaPago)}`, 25, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
      doc.text('Estado: PAGADO ✓', 25, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('Estado: PENDIENTE', 25, y);
      doc.setTextColor(0, 0, 0);
    }
    
    // Pie de página
    y = 270;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Este es un comprobante válido de pago', 105, y, { align: 'center' });
    y += 5;
    doc.text(`Generado el ${new Date().toLocaleDateString('es-UY')}`, 105, y, { align: 'center' });
    y += 5;
    doc.text('RV Automóviles - Su concesionario de confianza', 105, y, { align: 'center' });
    
    // Descargar
    doc.save(`Comprobante_Cuota_${pago.numeroCuota}.pdf`);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron pagos</p>
            </div>
          </div>
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
