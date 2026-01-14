import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { pagosService, autosService, clientesService, comprobantesService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/format';
import { CreditCard, Plus, AlertCircle, CheckCircle, Calendar, DollarSign, User, ChevronDown, ChevronUp, Car, RefreshCw, MessageSquare, Save, X, Upload, FileText } from 'lucide-react';
import { SkeletonTable } from '../components/SkeletonLoader';
import { EmptyPagos, EmptySearch, EmptyFilter } from '../components/EmptyStateIllustrated';

const Pagos = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  
  // Helper para verificar si es staff (admin o empleado)
  const isStaff = user?.rol === 'admin' || user?.rol === 'empleado';

  const [pagos, setPagos] = useState([]);
  const [autos, setAutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesConPagos, setClientesConPagos] = useState([]);
  const [clientesExpandidos, setClientesExpandidos] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pendientes');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Estados para comentarios en cuotas vencidas
  const [comentariosExpandidos, setComentariosExpandidos] = useState({});
  const [comentariosTemp, setComentariosTemp] = useState({});
  const [guardandoComentario, setGuardandoComentario] = useState({});
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [pagoParaEmail, setPagoParaEmail] = useState(null);
  // Estados para subir comprobante (clientes)
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [pagoParaComprobante, setPagoParaComprobante] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [formData, setFormData] = useState({
    autoId: '',
    numeroCuota: 1,
    monto: '',
  });
  const [clienteSearch, setClienteSearch] = useState('');
  // Filtrar clientes por nombre (solo staff)
  const clientesConPagosFiltrados = isStaff && clienteSearch.trim()
    ? clientesConPagos.filter(c => c.cliente.nombre.toLowerCase().includes(clienteSearch.trim().toLowerCase()))
    : clientesConPagos;
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
    // Estados para permutas
    tienePermuta: false,
    tipoPermuta: '', // 'auto', 'moto', 'otros'
    permutaAbierta: false,
    permutaAuto: {
      marca: '',
      modelo: '',
      anio: '',
      matricula: '',
      precio: ''
    },
    permutaMoto: {
      marca: '',
      modelo: '',
      anio: '',
      precio: ''
    },
    permutaOtros: {
      descripcion: '',
      precio: ''
    },
  });

  useEffect(() => {
    // Detectar si viene con un filtro específico desde navegación
    const initialFilter = location.state?.filterType || location.state?.filterVencidos ? 'vencidos' : 'pendientes';
    console.log('🎯 Filtro inicial:', initialFilter);
    loadInitialData(initialFilter);
  }, []);

  // Auto-refresh para clientes: actualizar datos cada 30 segundos
  useEffect(() => {
    if (!isStaff) {
      console.log('🔄 Auto-refresh activado para cliente (cada 30s)');
      const interval = setInterval(() => {
        console.log('🔄 Actualizando datos automáticamente...');
        handleFilter(filter);
      }, 30000); // 30 segundos

      return () => {
        console.log('🛑 Auto-refresh desactivado');
        clearInterval(interval);
      };
    }
  }, [user, filter]);

  const loadInitialData = async (initialFilter = 'pendientes') => {
    try {
      setLoading(true);
      
      if (isStaff) {
        // Cargar datos para staff (admin y empleado)
        const [autosData, clientesData] = await Promise.all([
          autosService.getAll(),
          clientesService.getAll(),
        ]);
        
        // Guardar TODOS los autos (no filtrar aquí)
        // El filtrado se hace en getAutosSinPlanDeCuotas()
        setAutos(autosData);
        setClientes(clientesData);
        
        console.log('📊 Autos cargados:', autosData.length);
        console.log('👥 Clientes cargados:', clientesData.length);
        console.log('🚗 Autos con cliente:', autosData.filter(a => a.clienteId).length);
        console.log('📋 Autos sin pagos:', autosData.filter(a => !a.pagos || a.pagos.length === 0).length);
        
        // Aplicar el filtro inicial (puede ser 'vencidos' si viene desde Reportes)
        await handleFilter(initialFilter);
      } else {
        // Cargar datos para cliente - aplicar filtro inicial
        await handleFilter(initialFilter);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar autos que NO tienen planes de cuotas (sin pagos asociados)
  const getAutosSinPlanDeCuotas = () => {
    const autosFiltrados = autos.filter(auto => {
      // Debe tener un cliente asignado
      if (!auto.clienteId) {
        return false;
      }
      
      // No debe tener pagos asociados
      const tienePagos = auto.pagos && auto.pagos.length > 0;
      return !tienePagos;
    });
    
    console.log('🔍 Autos sin plan de cuotas:', autosFiltrados.length, autosFiltrados.map(a => `${a.marca} ${a.modelo}`));
    return autosFiltrados;
  };

  const organizarPagosPorCliente = (pagosData, clientesData, filtroActivo) => {
    const clientesMap = {};
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    
    pagosData.forEach(pago => {
      const clienteId = pago.auto?.clienteId;
      if (!clienteId) return;
      
      if (!clientesMap[clienteId]) {
        const cliente = clientesData.find(c => c.id === clienteId);
        if (!cliente) return;
        
        clientesMap[clienteId] = {
          cliente: cliente,
          pagos: [], // Solo guardar pagos del filtro actual
          total: 0,
          count: 0
        };
      }
      
      // Agregar pago al cliente (ya viene filtrado del backend)
      clientesMap[clienteId].pagos.push(pago);
      clientesMap[clienteId].total += parseFloat(pago.monto);
      clientesMap[clienteId].count++;
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
      
      console.log('🔍 handleFilter - Rol:', user?.rol, 'Filtro:', filterType, 'Params:', params);
      const data = await pagosService.getAll(params);
      console.log('✅ handleFilter - Datos recibidos:', { 
        count: data.length, 
        sample: data[0],
        rol: user?.rol 
      });
      
      setPagos(data);
      
      // Registrar hora de última actualización
      setLastUpdate(new Date());
      
      // Actualizar agrupación por cliente si es staff - usar los pagos FILTRADOS
      if (isStaff) {
        // Usar clientes del estado si ya están cargados
        const clientesParaOrganizar = clientes.length > 0 ? clientes : await clientesService.getAll();
        organizarPagosPorCliente(data, clientesParaOrganizar, filterType);
      } else {
        console.log('👤 Cliente - Pagos directos:', data.length);
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
      // Validaciones
      const autoSeleccionado = autos.find(a => a.id === parseInt(generateData.autoId));
      if (!autoSeleccionado) {
        alert('Debe seleccionar un vehículo');
        return;
      }
      
      // Validación de permuta
      if (generateData.tienePermuta) {
        if (!generateData.tipoPermuta) {
          alert('Debe seleccionar un tipo de permuta');
          return;
        }
        
        let valorPermuta = 0;
        
        // Validar según tipo de permuta
        if (generateData.tipoPermuta === 'auto') {
          if (!generateData.permutaAuto.marca || !generateData.permutaAuto.modelo || 
              !generateData.permutaAuto.anio || !generateData.permutaAuto.precio) {
            alert('Debe completar todos los campos de la permuta de auto');
            return;
          }
          valorPermuta = parseFloat(generateData.permutaAuto.precio);
        } else if (generateData.tipoPermuta === 'moto') {
          if (!generateData.permutaMoto.marca || !generateData.permutaMoto.modelo || 
              !generateData.permutaMoto.anio || !generateData.permutaMoto.precio) {
            alert('Debe completar todos los campos de la permuta de moto');
            return;
          }
          valorPermuta = parseFloat(generateData.permutaMoto.precio);
        } else if (generateData.tipoPermuta === 'otros') {
          if (!generateData.permutaOtros.descripcion || !generateData.permutaOtros.precio) {
            alert('Debe completar todos los campos de la permuta');
            return;
          }
          valorPermuta = parseFloat(generateData.permutaOtros.precio);
        }
        
        // Validar que el valor de permuta no supere el precio del auto
        const precioAuto = parseFloat(autoSeleccionado.precio);
        if (valorPermuta >= precioAuto) {
          alert(`El valor de la permuta (${formatCurrency(valorPermuta)}) no puede ser igual o mayor al precio del vehículo (${formatCurrency(precioAuto)})`);
          return;
        }
        
        // Verificar que el monto de la cuota corresponda al precio con permuta descontada
        const precioFinal = precioAuto - valorPermuta;
        const montoTotalEsperado = parseFloat(generateData.montoCuota) * parseInt(generateData.numeroCuotas);
        
        // Permitir un margen de diferencia del 1% para intereses
        const diferencia = Math.abs(montoTotalEsperado - precioFinal);
        const margenPermitido = precioFinal * 0.01;
        
        if (diferencia > margenPermitido) {
          const confirmacion = confirm(
            `Advertencia: El total de las cuotas (${formatCurrency(montoTotalEsperado)}) difiere del precio final con permuta (${formatCurrency(precioFinal)}).\n\n` +
            `Precio original: ${formatCurrency(precioAuto)}\n` +
            `Valor permuta: -${formatCurrency(valorPermuta)}\n` +
            `Precio final: ${formatCurrency(precioFinal)}\n\n` +
            `¿Desea continuar de todas formas?`
          );
          if (!confirmacion) {
            return;
          }
        }
      }
      
      // Mapear los datos del formulario a lo que espera el backend
      const dataParaBackend = {
        autoId: generateData.autoId,
        numeroCuotas: parseInt(generateData.numeroCuotas),
        montoPorCuota: parseFloat(generateData.montoCuota),
        fechaPrimeraCuota: generateData.fechaInicio,
        cuotasPagadas: generateData.esFinanciamientoEnProgreso ? parseInt(generateData.cuotasPagadas) || 0 : 0
      };
      
      // Agregar datos de permuta si existe
      if (generateData.tienePermuta && generateData.tipoPermuta) {
        dataParaBackend.permuta = {
          tienePermuta: true,
          tipoPermuta: generateData.tipoPermuta
        };
        
        if (generateData.tipoPermuta === 'auto') {
          dataParaBackend.permuta.permutaAuto = generateData.permutaAuto;
        } else if (generateData.tipoPermuta === 'moto') {
          dataParaBackend.permuta.permutaMoto = generateData.permutaMoto;
        } else if (generateData.tipoPermuta === 'otros') {
          dataParaBackend.permuta.permutaOtros = generateData.permutaOtros;
        }
      }
      
      console.log('🚀 Generando plan de cuotas:', dataParaBackend);
      
      await pagosService.generarCuotas(dataParaBackend);
      
      console.log('✅ Plan de cuotas generado exitosamente');
      
      setShowGenerateModal(false);
      resetGenerateForm();
      await loadInitialData();
      // Recargar con el filtro actual
      if (filter !== 'pendientes') {
        await handleFilter(filter);
      }
    } catch (error) {
      console.error('❌ Error al generar cuotas:', error);
      alert('Error al generar el plan de cuotas: ' + (error.message || 'Error desconocido'));
    }
  };

  const handleMarcarPagado = async (pagoId) => {
    setPagoSeleccionado(pagoId);
    setShowConfirmModal(true);
  };

  // Funciones para manejar comentarios en cuotas vencidas
  const toggleComentario = (pagoId, comentarioActual) => {
    setComentariosExpandidos(prev => ({
      ...prev,
      [pagoId]: !prev[pagoId]
    }));
    
    // Inicializar el comentario temporal con el valor actual si existe
    if (!comentariosExpandidos[pagoId]) {
      setComentariosTemp(prev => ({
        ...prev,
        [pagoId]: comentarioActual || ''
      }));
    }
  };

  const handleComentarioChange = (pagoId, valor) => {
    setComentariosTemp(prev => ({
      ...prev,
      [pagoId]: valor
    }));
  };

  const guardarComentario = async (pagoId) => {
    try {
      setGuardandoComentario(prev => ({ ...prev, [pagoId]: true }));
      
      const comentario = comentariosTemp[pagoId] || '';
      
      await pagosService.update(pagoId, { comentario });
      
      // Actualizar el estado local de pagos
      setPagos(prev => prev.map(p => 
        p.id === pagoId ? { ...p, comentario } : p
      ));
      
      // Actualizar clientesConPagos si existe
      setClientesConPagos(prev => prev.map(cliente => ({
        ...cliente,
        pagos: cliente.pagos.map(p => 
          p.id === pagoId ? { ...p, comentario } : p
        )
      })));
      
      showToast('Comentario guardado exitosamente', 'success');
      
      // Colapsar el comentario
      setComentariosExpandidos(prev => ({
        ...prev,
        [pagoId]: false
      }));
    } catch (error) {
      showToast('Error al guardar comentario', 'error');
    } finally {
      setGuardandoComentario(prev => ({ ...prev, [pagoId]: false }));
    }
  };

  const confirmarMarcarPagado = async () => {
    console.log('🔄 Confirmando pago...', { pagoSeleccionado });
    
    try {
      setLoading(true);
      
      // Buscar el pago en el array principal o en los clientes organizados
      let pagoAActualizar = pagos.find(p => p.id === pagoSeleccionado);
      
      // Si no se encuentra en pagos, buscar en clientesConPagos
      if (!pagoAActualizar) {
        console.log('⚠️ Pago no encontrado en array principal, buscando en clientesConPagos...');
        for (const clienteData of clientesConPagos) {
          const pago = clienteData.pagos.find(p => p.id === pagoSeleccionado);
          if (pago) {
            pagoAActualizar = pago;
            break;
          }
        }
      }
      
      if (!pagoAActualizar) {
        console.error('❌ No se encontró el pago a actualizar');
        alert('Error: No se pudo encontrar el pago. Por favor, recarga la página.');
        setShowConfirmModal(false);
        setPagoSeleccionado(null);
        setLoading(false);
        return;
      }
      
      console.log('✅ Pago encontrado:', pagoAActualizar);
      
      // Actualizar el estado del pago
      console.log('📤 Actualizando pago en el servidor...');
      const resultado = await pagosService.update(pagoSeleccionado, { 
        estado: 'pagado',
        fechaPago: new Date().toISOString()
      });
      
      console.log('✅ Pago actualizado exitosamente:', resultado);
      
      // Guardar el pago con su información completa para el modal
      setPagoParaEmail({
        ...pagoAActualizar,
        estado: 'pagado',
        fechaPago: new Date().toISOString()
      });
      
      setShowConfirmModal(false);
      
      // Mostrar modal de notificación
      console.log('📧 Mostrando modal de notificación');
      setShowEmailModal(true);
      
      // Recargar todos los datos para actualizar los totales
      console.log('🔄 Recargando datos...');
      await loadInitialData();
      
      // Aplicar el filtro actual nuevamente
      if (filter !== 'pendientes') {
        await handleFilter(filter);
      }
      
      setPagoSeleccionado(null);
      setLoading(false);
      console.log('✅ Proceso completado');
    } catch (error) {
      console.error('❌ Error al actualizar el pago:', error);
      alert(`Error al actualizar el pago: ${error.message || 'Error desconocido'}`);
      // No mostrar el modal de notificación si hay error
      setShowConfirmModal(false);
      setPagoSeleccionado(null);
      setLoading(false);
    }
  };

  const enviarEmailConfirmacion = async () => {
    try {
      setLoading(true);
      setEmailError(null);
      
      // MODO DEMO: Simular envío sin llamada real al backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay de red
      
      setEmailEnviado(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowEmailModal(false);
        setPagoParaEmail(null);
        setEmailEnviado(false);
      }, 2000);
    } catch (error) {
      setEmailError('Error al enviar el email (modo demo)');
    } finally {
      setLoading(false);
    }
  };

  const enviarWhatsAppConfirmacion = () => {
    try {
      const cliente = pagoParaEmail.auto.cliente;
      const auto = pagoParaEmail.auto;
      const fechaPago = new Date(pagoParaEmail.fechaPago || new Date()).toLocaleDateString('es-UY', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      
      const mensaje = `*CONFIRMACIÓN DE PAGO*\n` +
        `Nicolas Tejera Automóviles\n\n` +
        `Estimado/a ${cliente.nombre},\n\n` +
        `Le confirmamos la recepción de su pago correspondiente a:\n\n` +
        `Vehículo: ${auto.marca} ${auto.modelo} ${auto.anio}\n` +
        `Matrícula: ${auto.matricula}\n` +
        `Cuota N°: ${pagoParaEmail.numeroCuota}\n` +
        `Monto Pagado: ${formatCurrency(parseFloat(pagoParaEmail.monto))}\n` +
        `Fecha de Pago: ${fechaPago}\n\n` +
        `Agradecemos su puntualidad en el cumplimiento de sus obligaciones.\n\n` +
        `*CONSULTA DE CUOTAS EN LÍNEA*\n\n` +
        `Puede consultar el estado de todas sus cuotas ingresando a:\n` +
        `${window.location.origin}\n\n` +
        `Usuario (Cédula): ${cliente.cedula}\n` +
        `Contraseña: ${cliente.passwordTemporal || 'Consulte su contraseña original'}\n\n` +
        `Saludos cordiales,\n` +
        `*Nicolas Tejera Automóviles*`;
      
      // MODO DEMO: Abrir WhatsApp con el mensaje pre-llenado (solo visual)
      // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
      let telefono = cliente.telefono.replace(/[^0-9]/g, '');
      
      // Si el número empieza con 0, quitarlo (ej: 0998765432 → 998765432)
      if (telefono.startsWith('0')) {
        telefono = telefono.substring(1);
      }
      
      // Abrir WhatsApp (funcionalidad visual para demo)
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
      setEmailError('Error al abrir WhatsApp (modo demo)');
    }
  };

  // Funciones para manejo de comprobantes (clientes)
  const abrirModalComprobante = (pago) => {
    setPagoParaComprobante(pago);
    setArchivoSeleccionado(null);
    setShowComprobanteModal(true);
  };

  const cerrarModalComprobante = () => {
    setShowComprobanteModal(false);
    setPagoParaComprobante(null);
    setArchivoSeleccionado(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo por extensión y MIME type
      const extension = file.name.toLowerCase().split('.').pop();
      const extensionesPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
      const tiposMimePermitidos = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'application/pdf',
        'application/x-pdf',
        'application/acrobat',
        'applications/vnd.pdf',
        'text/pdf',
        'text/x-pdf'
      ];
      
      // Validar por extensión o tipo MIME
      const esValido = extensionesPermitidas.includes(extension) || 
                       tiposMimePermitidos.includes(file.type) ||
                       file.type === ''; // Algunos navegadores no detectan el tipo MIME
      
      if (!esValido) {
        showToast('Solo se permiten archivos PDF, JPG y PNG', 'error');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo no debe exceder 5MB', 'error');
        return;
      }

      setArchivoSeleccionado(file);
    }
  };

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubirComprobante = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }

    try {
      setSubiendoComprobante(true);
      const archivoBase64 = await convertirArchivoABase64(archivoSeleccionado);
      
      // Determinar tipo MIME correcto si no está disponible
      let tipoArchivo = archivoSeleccionado.type;
      if (!tipoArchivo) {
        const extension = archivoSeleccionado.name.toLowerCase().split('.').pop();
        const tiposMime = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png'
        };
        tipoArchivo = tiposMime[extension] || 'application/pdf';
      }
      
      await comprobantesService.subir(
        pagoParaComprobante.id,
        archivoBase64,
        tipoArchivo
      );

      showToast('Comprobante enviado exitosamente. Será revisado por el administrador.', 'success');
      cerrarModalComprobante();
      await handleFilter(filter); // Recargar datos
    } catch (error) {
      showToast(error.message || 'Error al subir comprobante', 'error');
    } finally {
      setSubiendoComprobante(false);
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
      // Estados para permutas
      tienePermuta: false,
      tipoPermuta: '',
      permutaAbierta: false,
      permutaAuto: {
        marca: '',
        modelo: '',
        anio: '',
        matricula: '',
        precio: ''
      },
      permutaMoto: {
        marca: '',
        modelo: '',
        anio: '',
        precio: ''
      },
      permutaOtros: {
        descripcion: '',
        precio: ''
      },
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


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
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

  console.log('🎨 Render - Estado:', {
    rol: user?.rol,
    loading,
    pagosCount: pagos.length,
    clientesConPagosCount: clientesConPagos.length,
    filter
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isStaff ? 'Gestión de Pagos' : 'Mis Cuotas'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isStaff
              ? 'Administra las cuotas y pagos' 
              : 'Consulta tus cuotas pagadas y pendientes'}
          </p>
          {!isStaff && lastUpdate && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Última actualización: {lastUpdate.toLocaleTimeString('es-UY')} (se actualiza cada 30s)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {!isStaff && (
            <button
              onClick={() => handleFilter(filter)}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          )}
          {isStaff && (
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

      {/* Buscador de clientes por nombre (solo staff) */}
      {isStaff && (
        <div className="card mb-2">
          <input
            type="text"
            placeholder="Buscar cliente por nombre..."
            value={clienteSearch}
            onChange={e => setClienteSearch(e.target.value)}
            className="input w-full"
          />
        </div>
      )}

      {/* Vista de pagos */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : isStaff ? (
        /* Vista Admin: Clientes agrupados */
        <div className="space-y-4">
          {clientesConPagosFiltrados.length === 0 ? (
            clienteSearch || filter === 'vencidos' || filter === 'pagados' ? (
              <EmptyFilter />
            ) : (
              <EmptyPagos />
            )
          ) : (
            clientesConPagosFiltrados.map((clienteData, index) => (
              <div key={clienteData.cliente.id} className="card dark:bg-gray-800 dark:border-gray-700 animate-fadeInUp" style={{animationDelay: `${0.1 * (index % 5)}s`}}>
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
                      <div className="text-center">
                        <div className={`text-xl md:text-2xl font-bold ${
                          filter === 'vencidos' ? 'text-red-600 dark:text-red-400' :
                          filter === 'pagados' ? 'text-green-600 dark:text-green-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {formatCurrency(clienteData.total)}
                        </div>
                        <div className={`text-xs font-medium uppercase whitespace-nowrap ${
                          filter === 'vencidos' ? 'text-red-600 dark:text-red-400' :
                          filter === 'pagados' ? 'text-green-600 dark:text-green-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {filter === 'vencidos' ? 'Vencidos' : 
                           filter === 'pagados' ? 'Pagados' : 
                           'Pendientes'} ({clienteData.count})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido expandible */}
                {clientesExpandidos[clienteData.cliente.id] && (
                  <div className="p-3 md:p-6 space-y-3 md:space-y-6 bg-gray-50 dark:bg-gray-900/50">
                    {/* Cuotas según el filtro activo */}
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {filter === 'vencidos' && `Cuotas Vencidas (${clienteData.count})`}
                        {filter === 'pagados' && `Cuotas Pagadas (${clienteData.count})`}
                        {filter === 'pendientes' && `Cuotas Pendientes (${clienteData.count})`}
                        {(!filter || filter === 'todos') && `Todas las Cuotas (${clienteData.count})`}
                      </h4>
                      <div className="space-y-2">
                        {/* Mostrar solo las cuotas del filtro activo (ya vienen filtradas desde el backend) */}
                        {clienteData.pagos.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            No hay cuotas para mostrar
                          </div>
                        ) : (
                          clienteData.pagos
                            .sort((a, b) => a.numeroCuota - b.numeroCuota)
                            .map(pago => {
                              const esVencido = pago.estado !== 'pagado' && new Date(pago.fechaVencimiento) < new Date();
                              const esPagado = pago.estado === 'pagado';
                              
                              return (
                                <div 
                                  key={pago.id} 
                                  className={`rounded-lg p-2.5 md:p-4 hover:shadow-md transition-shadow border-2 ${
                                    esPagado 
                                      ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-900' 
                                      : esVencido
                                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
                                      : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900'
                                  }`}
                                >
                                  <div className="flex flex-col gap-2.5 md:gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="font-medium text-gray-900 dark:text-white text-sm md:text-base break-words">
                                          {pago.auto.marca} {pago.auto.modelo} - Cuota #{pago.numeroCuota}
                                        </div>
                                        {esPagado && (
                                          <span className="badge badge-success text-xs flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> PAGADO
                                          </span>
                                        )}
                                        {esVencido && (
                                          <span className="badge badge-danger text-xs flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> VENCIDO
                                          </span>
                                        )}
                                        {!esPagado && !esVencido && (
                                          <span className="badge badge-warning text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> PENDIENTE
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                                        Matrícula: {pago.auto.matricula}
                                      </div>
                                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                        {esPagado 
                                          ? `Pagado: ${formatDate(pago.fechaPago)}`
                                          : `Vencimiento: ${formatDate(pago.fechaVencimiento)}`
                                        }
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className={`text-lg md:text-xl font-bold ${
                                        esPagado 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : esVencido
                                          ? 'text-red-700 dark:text-red-400'
                                          : 'text-yellow-700 dark:text-yellow-400'
                                      }`}>
                                        {formatCurrency(pago.monto)}
                                      </div>
                                      {!esPagado && (
                                        isStaff ? (
                                          <button
                                            onClick={() => handleMarcarPagado(pago.id)}
                                            className="btn btn-success btn-sm whitespace-nowrap text-xs px-3 py-1.5"
                                          >
                                            Marcar Pagado
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => abrirModalComprobante(pago)}
                                            className="btn btn-primary btn-sm whitespace-nowrap text-xs px-3 py-1.5 flex items-center gap-1"
                                          >
                                            <Upload className="w-4 h-4" />
                                            Pagar
                                          </button>
                                        )
                                      )}
                                    </div>

                                    {/* Sección de comentarios para cuotas vencidas */}
                                    {esVencido && (
                                      <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-800">
                                        <button
                                          onClick={() => toggleComentario(pago.id, pago.comentario)}
                                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                        >
                                          <MessageSquare className="w-4 h-4" />
                                          {pago.comentario ? 'Ver/Editar Comentario' : 'Agregar Comentario'}
                                          {comentariosExpandidos[pago.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>

                                        {comentariosExpandidos[pago.id] && (
                                          <div className="mt-2 space-y-2">
                                            <textarea
                                              value={comentariosTemp[pago.id] || ''}
                                              onChange={(e) => handleComentarioChange(pago.id, e.target.value)}
                                              placeholder="Ej: Cliente con dificultades financieras temporales..."
                                              className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white resize-none"
                                              rows="3"
                                            />
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => guardarComentario(pago.id)}
                                                disabled={guardandoComentario[pago.id]}
                                                className="btn btn-sm btn-primary flex items-center gap-1"
                                              >
                                                <Save className="w-3 h-3" />
                                                {guardandoComentario[pago.id] ? 'Guardando...' : 'Guardar'}
                                              </button>
                                              <button
                                                onClick={() => setComentariosExpandidos(prev => ({ ...prev, [pago.id]: false }))}
                                                className="btn btn-sm btn-secondary flex items-center gap-1"
                                              >
                                                <X className="w-3 h-3" />
                                                Cancelar
                                              </button>
                                            </div>
                                          </div>
                                        )}

                                        {!comentariosExpandidos[pago.id] && pago.comentario && (
                                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-gray-700 dark:text-gray-300">
                                            <strong>Motivo:</strong> {pago.comentario}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Vista Cliente: Tabla para desktop, Cards para móvil */
        <div className="card overflow-hidden">
          {pagos.length === 0 ? (
            filter === 'vencidos' || filter === 'pagados' ? (
              <EmptyFilter />
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tienes cuotas registradas
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Cuando tengas cuotas, aparecerán aquí
                </p>
              </div>
            )
          ) : (
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Acción
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
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
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
                        <td className="px-6 py-4 text-right">
                          {pago.estado !== 'pagado' && (
                            <button
                              onClick={() => abrirModalComprobante(pago)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Upload className="w-4 h-4" />
                              Pagar
                            </button>
                          )}
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

                    {/* Botón de pagar - Solo si no está pagado */}
                    {pago.estado !== 'pagado' && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => abrirModalComprobante(pago)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                          <Upload className="w-5 h-5" />
                          Pagar con Transferencia
                        </button>
                      </div>
                    )}

                    {/* Sección de comentarios para cuotas vencidas - Solo Staff */}
                    {isStaff && isVencido(pago) && (
                      <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-800">
                        <button
                          onClick={() => toggleComentario(pago.id, pago.comentario)}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 transition-colors w-full"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {pago.comentario ? 'Ver/Editar Comentario' : 'Agregar Comentario'}
                          {comentariosExpandidos[pago.id] ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                        </button>

                        {comentariosExpandidos[pago.id] && (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={comentariosTemp[pago.id] || ''}
                              onChange={(e) => handleComentarioChange(pago.id, e.target.value)}
                              placeholder="Ej: Cliente con dificultades financieras temporales..."
                              className="w-full px-3 py-2 text-sm border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white resize-none"
                              rows="3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => guardarComentario(pago.id)}
                                disabled={guardandoComentario[pago.id]}
                                className="btn btn-sm btn-primary flex items-center gap-1 flex-1"
                              >
                                <Save className="w-3 h-3" />
                                {guardandoComentario[pago.id] ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button
                                onClick={() => setComentariosExpandidos(prev => ({ ...prev, [pago.id]: false }))}
                                className="btn btn-sm btn-secondary flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {!comentariosExpandidos[pago.id] && pago.comentario && (
                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-xs text-gray-700 dark:text-gray-300">
                            <strong>Motivo:</strong> {pago.comentario}
                          </div>
                        )}
                      </div>
                    )}
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
                      const selectedAuto = getAutosSinPlanDeCuotas().find(a => a.id === parseInt(e.target.value));
                      setGenerateData({ 
                        ...generateData, 
                        autoId: e.target.value,
                        precioTotal: selectedAuto ? selectedAuto.precio.toString() : ''
                      });
                    }}
                    className="input w-full"
                  >
                    <option value="">Seleccione un auto...</option>
                    {getAutosSinPlanDeCuotas().map((auto) => (
                      <option key={auto.id} value={auto.id}>
                        {auto.marca} {auto.modelo} • {auto.cliente?.nombre} • {formatCurrency(auto.precio)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Solo se muestran autos con cliente asignado y sin plan de cuotas activo
                  </p>
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
                            {formatCurrency((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0))}
                          </span>
                        </div>
                        
                        {generateData.porcentajeInteres && parseFloat(generateData.porcentajeInteres) > 0 && (
                          <>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 animate-fade-in">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Interés ({generateData.porcentajeInteres}%):
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                +{formatCurrency(((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)) * (parseFloat(generateData.porcentajeInteres) / 100))}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-gray-100 dark:bg-gray-700 rounded px-2">
                              <span className="font-bold text-gray-900 dark:text-white">
                                TOTAL A PAGAR:
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white text-lg">
                                {formatCurrency(((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0)) * (1 + parseFloat(generateData.porcentajeInteres) / 100))}
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
                              {formatCurrency((parseFloat(generateData.precioTotal) || 0) - (parseFloat(generateData.entregaInicial) || 0))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sección de Permutas */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Permutas
                  </h3>

                  <div className="space-y-4">
                      {/* Checkbox para indicar si hay permuta */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateData.tienePermuta}
                          onChange={(e) => {
                            setGenerateData({ 
                              ...generateData, 
                              tienePermuta: e.target.checked,
                              tipoPermuta: e.target.checked ? generateData.tipoPermuta : ''
                            });
                          }}
                          className="w-4 h-4 text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-400"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          El cliente ofrece una permuta
                        </span>
                      </label>

                      {/* Selector de tipo de permuta */}
                      {generateData.tienePermuta && (
                        <div className="space-y-4 pl-7">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tipo de Permuta
                            </label>
                            <select
                              value={generateData.tipoPermuta}
                              onChange={(e) => setGenerateData({ 
                                ...generateData, 
                                tipoPermuta: e.target.value 
                              })}
                              className="input w-full"
                            >
                              <option value="">Seleccione el tipo...</option>
                              <option value="auto">Auto</option>
                              <option value="moto">Moto</option>
                              <option value="otros">Otros</option>
                            </select>
                          </div>

                          {/* Formulario para Auto */}
                          {generateData.tipoPermuta === 'auto' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600 space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Datos del Vehículo
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Marca
                                  </label>
                                  <input
                                    type="text"
                                    value={generateData.permutaAuto.marca}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaAuto: { ...generateData.permutaAuto, marca: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="Ej: Toyota"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Modelo
                                  </label>
                                  <input
                                    type="text"
                                    value={generateData.permutaAuto.modelo}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaAuto: { ...generateData.permutaAuto, modelo: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="Ej: Corolla"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Año
                                  </label>
                                  <input
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={generateData.permutaAuto.anio}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaAuto: { ...generateData.permutaAuto, anio: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="2020"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Matrícula
                                  </label>
                                  <input
                                    type="text"
                                    value={generateData.permutaAuto.matricula}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaAuto: { ...generateData.permutaAuto, matricula: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="ABC1234"
                                  />
                                </div>
                                
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Valor Estimado
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={generateData.permutaAuto.precio}
                                      onChange={(e) => setGenerateData({
                                        ...generateData,
                                        permutaAuto: { ...generateData.permutaAuto, precio: e.target.value }
                                      })}
                                      className="input pl-8 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Formulario para Moto */}
                          {generateData.tipoPermuta === 'moto' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600 space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Datos de la Motocicleta
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Marca
                                  </label>
                                  <input
                                    type="text"
                                    value={generateData.permutaMoto.marca}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaMoto: { ...generateData.permutaMoto, marca: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="Ej: Honda"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Modelo
                                  </label>
                                  <input
                                    type="text"
                                    value={generateData.permutaMoto.modelo}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaMoto: { ...generateData.permutaMoto, modelo: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="Ej: CB500X"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Año
                                  </label>
                                  <input
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    value={generateData.permutaMoto.anio}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaMoto: { ...generateData.permutaMoto, anio: e.target.value }
                                    })}
                                    className="input text-sm"
                                    placeholder="2020"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Valor Estimado
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={generateData.permutaMoto.precio}
                                      onChange={(e) => setGenerateData({
                                        ...generateData,
                                        permutaMoto: { ...generateData.permutaMoto, precio: e.target.value }
                                      })}
                                      className="input pl-8 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                Las motocicletas no se agregan al catálogo automáticamente
                              </p>
                            </div>
                          )}

                          {/* Formulario para Otros */}
                          {generateData.tipoPermuta === 'otros' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600 space-y-3">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Descripción de la Permuta
                              </h4>
                              
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Descripción
                                  </label>
                                  <textarea
                                    value={generateData.permutaOtros.descripcion}
                                    onChange={(e) => setGenerateData({
                                      ...generateData,
                                      permutaOtros: { ...generateData.permutaOtros, descripcion: e.target.value }
                                    })}
                                    className="input text-sm resize-none"
                                    rows="3"
                                    placeholder="Describa el bien que se ofrece como permuta..."
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Valor Estimado
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={generateData.permutaOtros.precio}
                                      onChange={(e) => setGenerateData({
                                        ...generateData,
                                        permutaOtros: { ...generateData.permutaOtros, precio: e.target.value }
                                      })}
                                      className="input pl-8 text-sm"
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                          {formatCurrency((parseInt(generateData.numeroCuotas) - parseInt(generateData.cuotasPagadas)) * parseFloat(generateData.montoCuota || 0))}
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
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarMarcarPagado}
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
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
                {emailEnviado ? '¡Notificación Enviada!' : '✅ ¡Pago Confirmado!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                {emailEnviado 
                  ? 'El cliente recibirá la confirmación.' 
                  : `La cuota #${pagoParaEmail.numeroCuota} de ${pagoParaEmail.auto?.cliente?.nombre || 'cliente'} ha sido marcada como pagada.`}
              </p>
              
              {!emailEnviado && (
                <>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                    ¿Deseas notificar al cliente?
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
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        emailEnviado
                          ? 'bg-green-500 dark:bg-green-600 text-white cursor-default'
                          : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105'
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
                          <span className="text-xl">📧</span> Enviar Email
                        </>
                      )}
                    </button>

                    <button
                      onClick={enviarWhatsAppConfirmacion}
                      disabled={loading}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span className="text-xl">💬</span> Enviar WhatsApp
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowEmailModal(false);
                        setPagoParaEmail(null);
                        setEmailError(null);
                        setEmailEnviado(false);
                      }}
                      disabled={loading}
                      className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                    >
                      No notificar ahora
                    </button>
                  </div>
                </>
              )}
              
              {emailEnviado && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setPagoParaEmail(null);
                      setEmailError(null);
                      setEmailEnviado(false);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para subir comprobante de pago (Clientes) */}
      {showComprobanteModal && pagoParaComprobante && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pagar con Transferencia
                </h2>
                <button
                  onClick={cerrarModalComprobante}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Cuota #{pagoParaComprobante.numeroCuota}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {pagoParaComprobante.auto.marca} {pagoParaComprobante.auto.modelo}
                </p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(pagoParaComprobante.monto)}
                </p>
              </div>

              <form onSubmit={handleSubirComprobante} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comprobante de Transferencia *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {archivoSeleccionado ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {archivoSeleccionado.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(archivoSeleccionado.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setArchivoSeleccionado(null)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label className="relative cursor-pointer rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                              <span>Seleccionar archivo</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">o arrastra y suelta</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, JPG o PNG (máx. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={subiendoComprobante}
                  >
                    {subiendoComprobante ? 'Enviando...' : 'Enviar Comprobante'}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModalComprobante}
                    className="btn btn-secondary flex-1"
                    disabled={subiendoComprobante}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;
