import { useEffect, useState } from 'react';
import { pagosService, autosService, clientesService } from '../services';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Plus, AlertCircle, CheckCircle, Calendar, DollarSign, User, ChevronDown, ChevronUp, Car } from 'lucide-react';

const Pagos = () => {
  const { user } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [autos, setAutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesConPagos, setClientesConPagos] = useState([]);
  const [clientesExpandidos, setClientesExpandidos] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendientes');
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [pagoParaEmail, setPagoParaEmail] = useState(null);
  const [formData, setFormData] = useState({
    autoId: '',
    numeroCuota: 1,
    monto: '',
    fechaVencimiento: '',
  });
  const [generateData, setGenerateData] = useState({
    autoId: '',
    precioTotal: '',
    entregaInicial: '',
    porcentajeInteres: '',
    numeroCuotas: 12,
    montoCuota: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    intervaloMeses: 1,
    esFinanciamientoEnProgreso: false,
    cuotasPagadas: 0,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      if (user?.rol === 'admin') {
        // Cargar datos para admin
        const [pagosData, autosData, clientesData] = await Promise.all([
          pagosService.getAll({ estado: 'pendiente' }),
          autosService.getAll(),
          clientesService.getAll(),
        ]);
        
        setPagos(pagosData);
        setAutos(autosData.filter(auto => auto.estado !== 'disponible'));
        setClientes(clientesData);
        
        // Agrupar pagos por cliente - SIEMPRE con todos los pagos
        const todosPagos = await pagosService.getAll({});
        organizarPagosPorCliente(todosPagos, clientesData);
      } else {
        // Cargar datos para cliente - solo pagos pendientes
        const pagosData = await pagosService.getAll({ estado: 'pendiente' });
        setPagos(pagosData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizarPagosPorCliente = (pagosData, clientesData) => {
    const clientesMap = {};
    
    pagosData.forEach(pago => {
      const clienteId = pago.auto?.clienteId;
      if (!clienteId) return;
      
      if (!clientesMap[clienteId]) {
        const cliente = clientesData.find(c => c.id === clienteId);
        if (!cliente) return;
        
        clientesMap[clienteId] = {
          cliente: cliente,
          pagos: {
            pendientes: [],
            vencidos: [],
            pagados: []
          },
          totales: {
            pendientes: 0,
            vencidos: 0,
            pagados: 0
          }
        };
      }
      
      // Clasificar pago
      if (pago.estado === 'pagado') {
        clientesMap[clienteId].pagos.pagados.push(pago);
        clientesMap[clienteId].totales.pagados += parseFloat(pago.monto);
      } else if (isVencido(pago)) {
        clientesMap[clienteId].pagos.vencidos.push(pago);
        clientesMap[clienteId].totales.vencidos += parseFloat(pago.monto);
      } else {
        clientesMap[clienteId].pagos.pendientes.push(pago);
        clientesMap[clienteId].totales.pendientes += parseFloat(pago.monto);
      }
    });
    
    setClientesConPagos(Object.values(clientesMap));
  };

  const handleFilter = async (filterType) => {
    try {
      setLoading(true);
      setFilter(filterType);
      let params = {};
      
      if (filterType === 'pendientes') {
        params.estado = 'pendiente';
      } else if (filterType === 'pagados') {
        params.estado = 'pagado';
      } else if (filterType === 'vencidos') {
        params.vencidos = 'true';
      }
      // Si es 'todos', params queda vacío para obtener todos los pagos
      
      const data = await pagosService.getAll(params);
      setPagos(data);
      
      // Actualizar agrupación por cliente si es admin - SIEMPRE con todos los pagos
      if (user?.rol === 'admin') {
        const todosPagos = await pagosService.getAll({});
        organizarPagosPorCliente(todosPagos, clientes);
      }
    } catch (error) {
      console.error('Error al filtrar:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCliente = (clienteId) => {
    setClientesExpandidos(prev => ({
      ...prev,
      [clienteId]: !prev[clienteId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pagosService.create(formData);
      setShowModal(false);
      resetForm();
      await loadInitialData();
    } catch (error) {
      console.error('Error al crear el pago:', error);
    }
  };

  const handleGenerateCuotas = async (e) => {
    e.preventDefault();
    try {
      await pagosService.generarCuotas(generateData);
      setShowGenerateModal(false);
      resetGenerateForm();
      await loadInitialData();
      // Recargar con el filtro actual
      if (filter !== 'pendientes') {
        await handleFilter(filter);
      }
    } catch (error) {
      console.error('Error al generar cuotas:', error);
    }
  };

  const handleMarcarPagado = async (pagoId) => {
    setPagoSeleccionado(pagoId);
    setShowConfirmModal(true);
  };

  const confirmarMarcarPagado = async () => {
    try {
      await pagosService.update(pagoSeleccionado, { estado: 'pagado' });
      
      // Guardar el pago para el modal de email
      const pagoActualizado = pagos.find(p => p.id === pagoSeleccionado);
      setPagoParaEmail(pagoActualizado);
      
      setShowConfirmModal(false);
      setPagoSeleccionado(null);
      
      // Mostrar modal de email
      setShowEmailModal(true);
      
      // Recargar todos los datos para actualizar los totales
      await loadInitialData();
      
      // Aplicar el filtro actual nuevamente
      if (filter !== 'pendientes') {
        await handleFilter(filter);
      }
    } catch (error) {
      console.error('Error al actualizar el pago:', error);
      // No mostrar el modal de email si hay error
      setShowConfirmModal(false);
      setPagoSeleccionado(null);
    }
  };

  const enviarEmailConfirmacion = async () => {
    try {
      setLoading(true);
      setEmailError(null);
      await pagosService.enviarEmail(pagoParaEmail.id);
      setEmailEnviado(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowEmailModal(false);
        setPagoParaEmail(null);
        setEmailEnviado(false);
      }, 2000);
    } catch (error) {
      setEmailError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarWhatsAppConfirmacion = () => {
    try {
      const cliente = pagoParaEmail.auto.cliente;
      const auto = pagoParaEmail.auto;
      const fechaPago = new Date(pagoParaEmail.fechaPago || new Date()).toLocaleDateString('es-EC', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      
      const mensaje = `✅ *Pago Confirmado - RV Automóviles*\n\n` +
        `Estimado/a *${cliente.nombre}*,\n\n` +
        `Le confirmamos que hemos recibido su pago correspondiente a:\n\n` +
        `🚗 *Vehículo:* ${auto.marca} ${auto.modelo} ${auto.anio}\n` +
        `📋 *Matrícula:* ${auto.matricula}\n` +
        `🔢 *Cuota:* #${pagoParaEmail.numeroCuota}\n` +
        `💰 *Monto Pagado:* $${parseFloat(pagoParaEmail.monto).toFixed(2)}\n` +
        `📅 *Fecha de Pago:* ${fechaPago}\n\n` +
        `Agradecemos su puntualidad.\n\n` +
        `💻 *Control en Línea*\n` +
        `Puede ver el estado de todas sus cuotas en:\n` +
        `https://rv-gestion-automotora20.vercel.app\n` +
        `Ingrese con su número de cédula.\n\n` +
        `_RV Automóviles - Su concesionario de confianza_`;
      
      // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
      let telefono = cliente.telefono.replace(/[^0-9]/g, '');
      
      // Si el número empieza con 0, quitarlo (ej: 0998765432 → 998765432)
      if (telefono.startsWith('0')) {
        telefono = telefono.substring(1);
      }
      
      // Abrir WhatsApp
      const url = `https://wa.me/598${telefono}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank');
      
      // Cerrar modal
      setTimeout(() => {
        setShowEmailModal(false);
        setPagoParaEmail(null);
        setEmailEnviado(false);
      }, 500);
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
      setEmailError('Error al abrir WhatsApp');
    }
  };

  const resetForm = () => {
    setFormData({
      autoId: '',
      numeroCuota: 1,
      monto: '',
      fechaVencimiento: '',
    });
  };

  const resetGenerateForm = () => {
    setGenerateData({
      autoId: '',
      precioTotal: '',
      entregaInicial: '',
      porcentajeInteres: '',
      numeroCuotas: 12,
      montoCuota: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      intervaloMeses: 1,
      esFinanciamientoEnProgreso: false,
      cuotasPagadas: 0,
    });
  };

  // Calcular monto de cuota automáticamente con intereses
  const calcularMontoCuota = () => {
    const precio = parseFloat(generateData.precioTotal) || 0;
    const entrega = parseFloat(generateData.entregaInicial) || 0;
    const porcentaje = parseFloat(generateData.porcentajeInteres) || 0;
    const cuotas = parseInt(generateData.numeroCuotas) || 1;
    
    if (precio > 0 && cuotas > 0) {
      const saldoFinanciar = precio - entrega;
      const interes = saldoFinanciar * (porcentaje / 100);
      const totalConInteres = saldoFinanciar + interes;
      const montoPorCuota = totalConInteres / cuotas;
      
      setGenerateData(prev => ({
        ...prev,
        montoCuota: montoPorCuota.toFixed(2)
      }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (pago) => {
    if (pago.estado === 'pagado') {
      return <span className="badge badge-success flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Pagado
      </span>;
    }
    
    const fechaVencimiento = new Date(pago.fechaVencimiento);
    const hoy = new Date();
    
    if (fechaVencimiento < hoy) {
      return <span className="badge badge-danger flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Vencido
      </span>;
    }
    
    return <span className="badge badge-warning flex items-center gap-1">
      <Calendar className="w-3 h-3" /> Pendiente
    </span>;
  };

  const isVencido = (pago) => {
    if (pago.estado === 'pagado') return false;
    return new Date(pago.fechaVencimiento) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user?.rol === 'admin' ? 'Gestión de Pagos' : 'Mis Cuotas'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.rol === 'admin' 
              ? 'Administra las cuotas y pagos' 
              : 'Consulta tus cuotas pagadas y pendientes'}
          </p>
        </div>
        {user?.rol === 'admin' && (
          <button
            onClick={() => {
              resetGenerateForm();
              setShowGenerateModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Generar Cuotas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleFilter('pendientes')}
            className={`btn ${filter === 'pendientes' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => handleFilter('vencidos')}
            className={`btn ${filter === 'vencidos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Vencidas
          </button>
          <button
            onClick={() => handleFilter('pagados')}
            className={`btn ${filter === 'pagados' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pagadas
          </button>
        </div>
      </div>

      {/* Vista de pagos */}
      {loading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      ) : user?.rol === 'admin' ? (
        /* Vista Admin: Clientes agrupados */
        <div className="space-y-4">
          {clientesConPagos.length === 0 ? (
            <div className="card dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes con pagos</p>
              </div>
            </div>
          ) : (
            clientesConPagos.map((clienteData) => (
              <div key={clienteData.cliente.id} className="card dark:bg-gray-800 dark:border-gray-700">
                {/* Header del cliente */}
                <div 
                  className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 p-3 md:p-6 cursor-pointer hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-200"
                  onClick={() => toggleCliente(clienteData.cliente.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Info del cliente */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg flex-shrink-0">
                        {clienteData.cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="truncate">{clienteData.cliente.nombre}</span>
                          {clientesExpandidos[clienteData.cliente.id] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          )}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                          Cédula: {clienteData.cliente.cedula} • Tel: {clienteData.cliente.telefono}
                        </p>
                      </div>
                    </div>
                    
                    {/* Resumen de pagos - Responsive */}
                    <div className="flex flex-wrap md:flex-nowrap gap-3 md:gap-6 justify-start md:justify-end">
                      {clienteData.totales.vencidos > 0 && (
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(clienteData.totales.vencidos)}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium uppercase whitespace-nowrap">
                            Vencidos ({clienteData.pagos.vencidos.length})
                          </div>
                        </div>
                      )}
                      {clienteData.totales.pendientes > 0 && (
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(clienteData.totales.pendientes)}
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase whitespace-nowrap">
                            Pendientes ({clienteData.pagos.pendientes.length})
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(clienteData.totales.pagados)}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase whitespace-nowrap">
                          Pagados ({clienteData.pagos.pagados.length})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido expandible */}
                {clientesExpandidos[clienteData.cliente.id] && (
                  <div className="p-3 md:p-6 space-y-3 md:space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {/* Pagos Vencidos */}
                    {clienteData.pagos.vencidos.length > 0 && (
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-red-700 dark:text-red-400 uppercase mb-2 md:mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Pagos Vencidos ({clienteData.pagos.vencidos.length})
                        </h4>
                        <div className="space-y-2">
                          {clienteData.pagos.vencidos.map(pago => (
                            <div key={pago.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-2.5 md:p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col gap-2.5 md:gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base break-words">
                                    {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    Matrícula: {pago.auto.matricula}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Vencimiento: {formatDate(pago.fechaVencimiento)}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-lg md:text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(pago.monto)}</div>
                                  <button
                                    onClick={() => handleMarcarPagado(pago.id)}
                                    className="btn btn-success btn-sm whitespace-nowrap text-xs px-3 py-1.5"
                                  >
                                    Marcar Pagado
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pagos Pendientes */}
                    {clienteData.pagos.pendientes.length > 0 && (
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-yellow-700 dark:text-yellow-400 uppercase mb-2 md:mb-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Pagos Pendientes ({clienteData.pagos.pendientes.length})
                        </h4>
                        <div className="space-y-2">
                          {clienteData.pagos.pendientes.map(pago => (
                            <div key={pago.id} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-2.5 md:p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col gap-2.5 md:gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base break-words">
                                    {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    Matrícula: {pago.auto.matricula}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Vencimiento: {formatDate(pago.fechaVencimiento)}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-lg md:text-xl font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(pago.monto)}</div>
                                  <button
                                    onClick={() => handleMarcarPagado(pago.id)}
                                    className="btn btn-success btn-sm whitespace-nowrap text-xs px-3 py-1.5"
                                  >
                                    Marcar Pagado
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pagos Realizados */}
                    {clienteData.pagos.pagados.length > 0 && (
                      <div>
                        <h4 className="text-xs md:text-sm font-bold text-green-700 dark:text-green-400 uppercase mb-2 md:mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Pagos Realizados ({clienteData.pagos.pagados.length})
                        </h4>
                        <div className="space-y-2">
                          {clienteData.pagos.pagados.map(pago => (
                            <div key={pago.id} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900 rounded-lg p-2.5 md:p-4 hover:shadow-md transition-shadow">
                              <div className="flex flex-col gap-2.5 md:gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base break-words">
                                    {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    Matrícula: {pago.auto.matricula}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                    Pagado: {formatDate(pago.fechaPago)}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(pago.monto)}</div>
                                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">✓ PAGADO</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Vista Cliente: Tabla para desktop, Cards para móvil */
        <div className="card overflow-hidden">
          {pagos.length === 0 && !loading ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron pagos</p>
            </div>
          ) : pagos.length > 0 && (
            <>
              {/* Vista Desktop - Tabla */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Auto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Cuota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Monto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Vencimiento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Fecha Pago
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pagos.map((pago) => (
                      <tr 
                        key={pago.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isVencido(pago) ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {pago.auto.marca} {pago.auto.modelo}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {pago.auto.matricula}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          Cuota #{pago.numeroCuota}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(pago.monto)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(pago.fechaVencimiento)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {pago.fechaPago ? formatDate(pago.fechaPago) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(pago)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="md:hidden space-y-4 p-4">
                {pagos.map((pago) => (
                  <div 
                    key={pago.id} 
                    className={`rounded-lg p-4 border-2 transition-all ${
                      isVencido(pago) 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' 
                        : pago.estado === 'pagado'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Header con auto */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {pago.auto.marca} {pago.auto.modelo}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {pago.auto.matricula}
                        </div>
                      </div>
                      <div className="ml-2">
                        {getEstadoBadge(pago)}
                      </div>
                    </div>

                    {/* Información de la cuota */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cuota</span>
                        <span className="font-medium text-gray-900 dark:text-white">#{pago.numeroCuota}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Monto</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatCurrency(pago.monto)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vencimiento</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(pago.fechaVencimiento)}
                        </span>
                      </div>
                      
                      {pago.fechaPago && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fecha de Pago</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatDate(pago.fechaPago)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal crear cuota individual */}
      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nueva Cuota</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auto *
                  </label>
                  <select
                    required
                    value={formData.autoId}
                    onChange={(e) => setFormData({ ...formData, autoId: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccione un auto</option>
                    {autos.map((auto) => (
                      <option key={auto.id} value={auto.id}>
                        {auto.marca} {auto.modelo} - {auto.cliente?.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Cuota *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.numeroCuota}
                    onChange={(e) => setFormData({ ...formData, numeroCuota: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Vencimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaVencimiento}
                    onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Crear Cuota
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal generar cuotas */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-60 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full shadow-xl border border-gray-300 dark:border-gray-700 animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header - Fijo */}
            <div className="bg-gray-800 dark:bg-gray-900 p-4 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Generar Plan de Cuotas
                  </h2>
                  <p className="text-gray-300 dark:text-gray-400 text-sm mt-1">Configure el plan de financiamiento</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    resetGenerateForm();
                  }}
                  className="text-white hover:bg-gray-700 rounded-lg p-2 transition-all duration-200"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>
            </div>
            
            {/* Contenedor con scroll */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleGenerateCuotas} className="p-5 space-y-4">
                {/* Sección 1: Selección de Auto */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Seleccionar Vehículo *
                  </label>
                  <select
                    required
                    value={generateData.autoId}
                    onChange={(e) => {
                      const selectedAuto = autos.find(a => a.id === parseInt(e.target.value));
                      setGenerateData({ 
                        ...generateData, 
                        autoId: e.target.value,
                        precioTotal: selectedAuto ? selectedAuto.precio.toString() : ''
                      });
                    }}
                    className="input w-full"
                  >
                    <option value="">Seleccione un auto...</option>
                    {autos.map((auto) => (
                      <option key={auto.id} value={auto.id}>
                        {auto.marca} {auto.modelo} • {auto.cliente?.nombre} • ${auto.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sección 2: Detalles Financieros */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Detalles Financieros
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Precio Total del Auto *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={generateData.precioTotal}
                          onChange={(e) => {
                            setGenerateData({ ...generateData, precioTotal: e.target.value });
                          }}
                          onBlur={calcularMontoCuota}
                          className="input pl-8"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Entrega Inicial
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={generateData.entregaInicial}
                          onChange={(e) => {
                            setGenerateData({ ...generateData, entregaInicial: e.target.value });
                          }}
                          onBlur={calcularMontoCuota}
                          className="input pl-8"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pago inicial del cliente</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Interés (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={generateData.porcentajeInteres}
                          onChange={(e) => {
                            setGenerateData({ ...generateData, porcentajeInteres: e.target.value });
                          }}
                          onBlur={calcularMontoCuota}
                          className="input pr-8"
                          placeholder="0.0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tasa de interés anual</p>
                    </div>

                  </div>

                  {/* Resumen Financiero Dinámico */}
                  {generateData.precioTotal && (
                    <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600 animate-fade-in">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Saldo a Financiar:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        
                        {generateData.porcentajeInteres && parseFloat(generateData.porcentajeInteres) > 0 && (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 animate-fade-in">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Interés ({generateData.porcentajeInteres}%):
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                +${(((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)) * (parseFloat(generateData.porcentajeInteres) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-100 dark:bg-gray-700 rounded px-2">
                              <span className="font-bold text-gray-900 dark:text-white">
                                TOTAL A PAGAR:
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white text-lg">
                                ${(((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)) * (1 + parseFloat(generateData.porcentajeInteres) / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </>
                        )}
                        
                        {(!generateData.porcentajeInteres || parseFloat(generateData.porcentajeInteres) === 0) && (
                          <div className="flex justify-between items-center py-2 bg-gray-100 dark:bg-gray-700 rounded px-2">
                            <span className="font-bold text-gray-900 dark:text-white">
                              TOTAL A PAGAR:
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                              ${((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sección 3: Configuración de Cuotas */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Configuración del Plan
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Número de Cuotas *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="60"
                        value={generateData.numeroCuotas}
                        onChange={(e) => {
                          setGenerateData({ ...generateData, numeroCuotas: e.target.value });
                        }}
                        onBlur={calcularMontoCuota}
                        className="input text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Intervalo (meses)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={generateData.intervaloMeses}
                        onChange={(e) => setGenerateData({ ...generateData, intervaloMeses: e.target.value })}
                        className="input text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fecha de Inicio *
                      </label>
                      <input
                        type="date"
                        required
                        value={generateData.fechaInicio}
                        onChange={(e) => setGenerateData({ ...generateData, fechaInicio: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Checkbox para financiamiento en progreso */}
                  <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateData.esFinanciamientoEnProgreso}
                        onChange={(e) => {
                          setGenerateData({ 
                            ...generateData, 
                            esFinanciamientoEnProgreso: e.target.checked,
                            cuotasPagadas: e.target.checked ? generateData.cuotasPagadas : 0
                          });
                        }}
                        className="w-4 h-4 text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-400"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Auto con financiamiento en progreso
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Marcar cuotas anteriores como ya pagadas
                        </p>
                      </div>
                    </label>

                    {/* Campo de cuotas pagadas */}
                    {generateData.esFinanciamientoEnProgreso && (
                      <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Número de Cuotas Ya Pagadas *
                        </label>
                        <input
                          type="number"
                          required={generateData.esFinanciamientoEnProgreso}
                          min="0"
                          max={generateData.numeroCuotas ? parseInt(generateData.numeroCuotas) - 1 : 0}
                          value={generateData.cuotasPagadas}
                          onChange={(e) => setGenerateData({ ...generateData, cuotasPagadas: e.target.value })}
                          className="input text-center"
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Estas cuotas se marcarán automáticamente como pagadas.
                          Quedarán {(parseInt(generateData.numeroCuotas) || 0) - (parseInt(generateData.cuotasPagadas) || 0)} cuotas pendientes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección 4: Resultado - Monto por Cuota */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Monto por Cuota *
                    </label>
                    <button
                      type="button"
                      onClick={calcularMontoCuota}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-xs font-medium rounded transition-all duration-200"
                    >
                      Calcular
                    </button>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={generateData.montoCuota}
                      onChange={(e) => setGenerateData({ ...generateData, montoCuota: e.target.value })}
                      className="input pl-8 text-lg font-semibold text-center"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    Valor de cada cuota mensual
                  </p>
                </div>

                {/* Resumen del Plan (si hay financiamiento en progreso) */}
                {generateData.esFinanciamientoEnProgreso && generateData.numeroCuotas && generateData.cuotasPagadas && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Resumen del Plan</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-600 dark:text-gray-400 text-xs">Total de Cuotas</div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">{generateData.numeroCuotas}</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-900">
                        <div className="text-green-700 dark:text-green-400 text-xs">Ya Pagadas</div>
                        <div className="font-bold text-green-700 dark:text-green-400 text-lg">{generateData.cuotasPagadas}</div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-2 border border-orange-200 dark:border-orange-900">
                        <div className="text-orange-700 dark:text-orange-400 text-xs">Pendientes</div>
                        <div className="font-bold text-orange-700 dark:text-orange-400 text-lg">
                          {parseInt(generateData.numeroCuotas) - parseInt(generateData.cuotasPagadas)}
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2 border border-blue-200 dark:border-blue-900">
                        <div className="text-blue-700 dark:text-blue-400 text-xs">Monto Pendiente</div>
                        <div className="font-bold text-blue-700 dark:text-blue-400 text-lg">
                          ${((parseInt(generateData.numeroCuotas) - parseInt(generateData.cuotasPagadas)) * parseFloat(generateData.montoCuota || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      resetGenerateForm();
                    }}
                    className="px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200"
                  >
                    Generar Plan de Cuotas
                  </button>
                </div>
              </form>
            </div>
            {/* Fin del contenedor con scroll */}
          </div>
        </div>
      )}

      {/* Modal de confirmación para marcar pagado */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirmar Acción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro de marcar esta cuota como pagada?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPagoSeleccionado(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarMarcarPagado}
                  className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de email */}
      {showEmailModal && pagoParaEmail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  emailEnviado 
                    ? 'bg-green-500 dark:bg-green-600 scale-110' 
                    : 'bg-green-100 dark:bg-green-900/30'
                }`}>
                  <CheckCircle className={`w-10 h-10 transition-all duration-500 ${
                    emailEnviado 
                      ? 'text-white scale-110' 
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                {emailEnviado ? '¡Email Enviado!' : '¡Pago Confirmado!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                {emailEnviado 
                  ? 'El cliente recibirá la confirmación en su correo electrónico.' 
                  : 'La cuota ha sido marcada como pagada exitosamente.'}
              </p>
              
              {!emailEnviado && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
                    ¿Cómo deseas notificar al cliente?
                  </p>
                  
                  {emailError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        ❌ {emailError}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={enviarEmailConfirmacion}
                      disabled={loading || emailEnviado}
                      className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        emailEnviado
                          ? 'bg-green-500 dark:bg-green-600 text-white cursor-default'
                          : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Enviando...
                        </>
                      ) : emailEnviado ? (
                        <>
                          <CheckCircle className="w-5 h-5 animate-bounce" />
                          ¡Enviado!
                        </>
                      ) : (
                        <>
                          📧 Enviar Email
                        </>
                      )}
                    </button>

                    {!emailEnviado && (
                      <button
                        onClick={enviarWhatsAppConfirmacion}
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        💬 Enviar WhatsApp
                      </button>
                    )}
                    
                    {!emailEnviado && (
                      <button
                        onClick={() => {
                          setShowEmailModal(false);
                          setPagoParaEmail(null);
                          setEmailError(null);
                        }}
                        disabled={loading}
                        className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        Omitir
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;
