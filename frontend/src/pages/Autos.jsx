import { useEffect, useState } from 'react';
import { autosService, clientesService } from '../services';
import { Car, Plus, Search, Edit2, Trash2, Eye, DollarSign, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatCurrency, formatPesos } from '../utils/format';

const Autos = () => {
  const { showToast } = useToast();
  const [autos, setAutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAuto, setEditingAuto] = useState(null);
  // Modal para asignar cliente
  const [showAsignarCliente, setShowAsignarCliente] = useState(false);
  const [autoAsignarCliente, setAutoAsignarCliente] = useState(null);
  const [clienteAsignar, setClienteAsignar] = useState('');
  // Modal para ver detalles del auto
  const [showDetalles, setShowDetalles] = useState(false);
  const [autoDetalles, setAutoDetalles] = useState(null);

  const abrirAsignarCliente = (auto) => {
    setAutoAsignarCliente(auto);
    setClienteAsignar('');
    setShowAsignarCliente(true);
  };

  const handleAsignarCliente = async (e) => {
    e.preventDefault();
    if (!clienteAsignar) return;
    try {
      // Enviar todos los campos del auto, actualizando solo el clienteId
      await autosService.update(autoAsignarCliente.id, {
        marca: autoAsignarCliente.marca,
        modelo: autoAsignarCliente.modelo,
        anio: autoAsignarCliente.anio,
        matricula: autoAsignarCliente.matricula,
        precio: autoAsignarCliente.precio,
        estado: autoAsignarCliente.estado,
        clienteId: parseInt(clienteAsignar)
      });
      showToast('Cliente asignado exitosamente', 'success');
      setShowAsignarCliente(false);
      setAutoAsignarCliente(null);
      setClienteAsignar('');
      await loadData();
    } catch (error) {
      showToast(error.message || error.response?.data?.error || 'Error al asignar cliente', 'error');
    }
  };
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, autoId: null });
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    matricula: '',
    precio: '',
    clienteId: '',
    kilometraje: '',
    departamento: '',
    tipoDocumento: '',
    valorPatente: '',
    color: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [autosData, clientesData] = await Promise.all([
        autosService.getAll(),
        clientesService.getAll(),
      ]);
      setAutos(autosData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes sin planes de cuotas (sin autos que tengan pagos)
  const getClientesSinPlanesActivos = () => {
    return clientes.filter(cliente => {
      // Si no tiene autos, puede ser seleccionado
      if (!cliente.autos || cliente.autos.length === 0) {
        return true;
      }
      
      // Verificar si algún auto del cliente tiene pagos
      const tieneAutosConPagos = cliente.autos.some(auto => {
        // Buscar el auto en el array de autos para verificar si tiene pagos
        const autoCompleto = autos.find(a => a.id === auto.id);
        return autoCompleto && autoCompleto.pagos && autoCompleto.pagos.length > 0;
      });
      
      // Retornar solo clientes sin autos con pagos
      return !tieneAutosConPagos;
    });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await autosService.getAll({ 
        buscar: searchTerm,
        estado: estadoFilter 
      });
      setAutos(data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar autos localmente en tiempo real
  const filteredAutos = autos.filter(auto => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      auto.marca.toLowerCase().includes(searchLower) ||
      auto.modelo.toLowerCase().includes(searchLower) ||
      auto.matricula.toLowerCase().includes(searchLower);
    
    const matchesEstado = !estadoFilter || auto.estado === estadoFilter;
    
    return matchesSearch && matchesEstado;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Preparar datos para enviar al backend (incluyendo TODOS los campos)
      const dataToSend = {
        marca: formData.marca,
        modelo: formData.modelo,
        anio: parseInt(formData.anio),
        matricula: formData.matricula,
        precio: parseFloat(formData.precio),
        clienteId: formData.clienteId ? parseInt(formData.clienteId) : null,
        // Nuevos campos adicionales
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        color: formData.color || null,
        departamento: formData.departamento || null,
        tipoDocumento: formData.tipoDocumento || null,
        valorPatente: formData.valorPatente ? parseFloat(formData.valorPatente) : null
      };
      
      // Solo incluir estado si estamos editando
      if (editingAuto) {
        dataToSend.estado = editingAuto.estado; // Mantener el estado actual
      }
      
      console.log('🚗 Guardando auto:', { dataToSend, editingAuto });
      
      if (editingAuto) {
        const response = await autosService.update(editingAuto.id, dataToSend);
        console.log('✅ Auto actualizado:', response);
        showToast('Auto actualizado exitosamente', 'success');
      } else {
        const response = await autosService.create(dataToSend);
        console.log('✅ Auto creado:', response);
        showToast('Auto creado exitosamente', 'success');
      }
      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('❌ Error al guardar auto:', error);
      showToast(error.message || error.response?.data?.error || 'Error al guardar el auto', 'error');
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({ isOpen: true, autoId: id });
  };

  const confirmDelete = async () => {
    try {
      await autosService.delete(confirmDialog.autoId);
      showToast('Auto eliminado exitosamente', 'success');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar el auto', 'error');
    }
  };

  const handleEdit = (auto) => {
    setEditingAuto(auto);
    setFormData({
      marca: auto.marca,
      modelo: auto.modelo,
      anio: auto.anio,
      matricula: auto.matricula,
      precio: auto.precio,
      clienteId: auto.clienteId || '',
      kilometraje: auto.kilometraje || '',
      departamento: auto.departamento || '',
      tipoDocumento: auto.tipoDocumento || '',
      valorPatente: auto.valorPatente || '',
      color: auto.color || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAuto(null);
    setFormData({
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      matricula: '',
      precio: '',
      clienteId: '',
      kilometraje: '',
      departamento: '',
      tipoDocumento: '',
      valorPatente: '',
      color: '',
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      disponible: 'badge badge-success',
      vendido: 'badge badge-info',
      reservado: 'badge badge-warning',
    };
    return badges[estado] || 'badge badge-gray';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Autos</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Administra el inventario de vehículos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto py-2.5 md:py-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm md:text-base">Nuevo Auto</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card animate-fadeInUp p-4 md:p-6" style={{animationDelay: '0.2s'}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 md:pl-10 text-sm md:text-base"
              />
            </div>
          </div>
          <div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="input text-sm md:text-base"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="financiado">Financiado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de autos - Desktop */}
      <div className="hidden md:block card overflow-hidden animate-fadeInUp" style={{animationDelay: '0.3s'}}>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredAutos.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{searchTerm || estadoFilter ? 'No se encontraron autos con ese criterio' : 'No hay autos registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Vehículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Matrícula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Año
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAutos.map((auto) => (
                  <tr key={auto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                          <Car className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {auto.marca} {auto.modelo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                      {auto.matricula === '0km' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          0km
                        </span>
                      ) : auto.matricula}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{auto.anio}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(auto.precio)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {auto.cliente ? auto.cliente.nombre : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={getEstadoBadge(auto.estado)}>
                        {auto.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2" style={{position: 'relative'}}>
                        <button
                          onClick={() => {
                            setAutoDetalles(auto);
                            setShowDetalles(true);
                          }}
                          title="Ver detalles"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(auto)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {/* Botón discreto solo ícono para asignar cliente */}
                        {!auto.cliente && (
                          <>
                            <button
                              onClick={() => abrirAsignarCliente(auto)}
                              title="Asignar cliente"
                              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                              style={{zIndex: 20}}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {showAsignarCliente && autoAsignarCliente && autoAsignarCliente.id === auto.id && (
                              <div
                                className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-[220px]"
                                style={{top: '2.5rem'}}
                                tabIndex={0}
                                onBlur={(e) => {
                                  // No cerrar si el foco se mueve a un elemento dentro del modal
                                  const currentTarget = e.currentTarget;
                                  setTimeout(() => {
                                    if (!currentTarget.contains(document.activeElement)) {
                                      setShowAsignarCliente(false);
                                    }
                                  }, 200);
                                }}
                              >
                                <h2 className="text-base font-bold mb-2 text-gray-900 dark:text-white">Asignar cliente</h2>
                                <form onSubmit={handleAsignarCliente} className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                                    <select
                                      value={clienteAsignar}
                                      onChange={e => setClienteAsignar(e.target.value)}
                                      className="input"
                                      required
                                    >
                                      <option value="">Selecciona un cliente</option>
                                      {getClientesSinPlanesActivos().map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                          {cliente.nombre} - {cliente.cedula}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button type="submit" className="btn btn-primary flex-1 btn-xs">Asignar</button>
                                    <button type="button" className="btn btn-secondary flex-1 btn-xs" onClick={() => setShowAsignarCliente(false)}>Cancelar</button>
                                  </div>
                                </form>
                              </div>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(auto.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cards para móvil */}
      <div className="md:hidden space-y-3 px-2">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredAutos.length === 0 ? (
          <div className="card text-center py-12">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{searchTerm || estadoFilter ? 'No se encontraron autos' : 'No hay autos registrados'}</p>
          </div>
        ) : (
          filteredAutos.map((auto, index) => (
            <div key={auto.id} className="card p-4 hover-lift animate-fadeInUp" style={{animationDelay: `${0.1 * (index % 6)}s`}}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {auto.marca} {auto.modelo}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {auto.matricula === '0km' ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          0km
                        </span>
                      ) : auto.matricula}
                    </p>
                  </div>
                </div>
                <span className={`${getEstadoBadge(auto.estado)} text-[10px] px-2 py-1 whitespace-nowrap ml-2`}>
                  {auto.estado}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Año:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{auto.anio}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(auto.precio)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                    {auto.cliente ? auto.cliente.nombre : 'Sin asignar'}
                  </span>
                </div>
              </div>

              {/* Botones adaptados para mobile - Grid de 2 columnas */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setAutoDetalles(auto);
                    setShowDetalles(true);
                  }}
                  className="btn btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
                </button>
                <button
                  onClick={() => handleEdit(auto)}
                  className="btn btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar
                </button>
                {!auto.cliente && (
                  <button
                    onClick={() => abrirAsignarCliente(auto)}
                    className="btn btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Asignar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(auto.id)}
                  className="btn btn-danger text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                {editingAuto ? 'Editar Auto' : 'Nuevo Auto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="input text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="input text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Año *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.anio}
                      onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                      className="input text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Matrícula
                    </label>
                    <input
                      type="text"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      placeholder="Dejar vacío para 0km"
                      className="input text-sm md:text-base"
                    />
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Si no tiene matrícula, se mostrará como "0km"
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="input text-sm md:text-base"
                    />
                  </div>

                  {editingAuto && (
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                        Estado (Automático)
                      </label>
                      <div className="input bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed text-xs md:text-sm">
                        {editingAuto.estado === 'disponible' && '🟢 Disponible'}
                        {editingAuto.estado === 'financiado' && '🟡 En Financiamiento'}
                        {editingAuto.estado === 'vendido' && '🔵 Vendido'}
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                        El estado se actualiza automáticamente
                      </p>
                    </div>
                  )}

                  <div className={editingAuto ? "md:col-span-1" : "md:col-span-2"}>
                    {/* Campo de cliente solo al crear, no al editar */}
                    {!editingAuto && (
                      <>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                          Cliente Asignado
                        </label>
                        <select
                          value={formData.clienteId}
                          onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                          className="input text-sm md:text-base"
                        >
                          <option value="">Sin cliente asignado</option>
                          {getClientesSinPlanesActivos().map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.nombre} - {cliente.cedula}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Solo clientes sin planes activos
                        </p>
                      </>
                    )}
                  </div>

                  {/* Nuevos campos adicionales */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ej: Blanco, Negro"
                      className="input text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Kilometraje
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.kilometraje}
                      onChange={(e) => setFormData({ ...formData, kilometraje: e.target.value })}
                      placeholder="Ej: 50000"
                      className="input text-sm md:text-base"
                    />
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Dejar vacío si es 0km
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Departamento
                    </label>
                    <select
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="input text-sm md:text-base"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Montevideo">Montevideo</option>
                      <option value="Canelones">Canelones</option>
                      <option value="Maldonado">Maldonado</option>
                      <option value="Rocha">Rocha</option>
                      <option value="Treinta y Tres">Treinta y Tres</option>
                      <option value="Cerro Largo">Cerro Largo</option>
                      <option value="Rivera">Rivera</option>
                      <option value="Artigas">Artigas</option>
                      <option value="Salto">Salto</option>
                      <option value="Paysandú">Paysandú</option>
                      <option value="Río Negro">Río Negro</option>
                      <option value="Soriano">Soriano</option>
                      <option value="Colonia">Colonia</option>
                      <option value="San José">San José</option>
                      <option value="Flores">Flores</option>
                      <option value="Florida">Florida</option>
                      <option value="Lavalleja">Lavalleja</option>
                      <option value="Durazno">Durazno</option>
                      <option value="Tacuarembó">Tacuarembó</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Tipo de Documentación
                    </label>
                    <select
                      value={formData.tipoDocumento}
                      onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                      className="input text-sm md:text-base"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Titulo Original">Título Original</option>
                      <option value="Titulo Duplicado">Título Duplicado</option>
                      <option value="Titulo en Tramite">Título en Trámite</option>
                      <option value="Factura DICOSE">Factura DICOSE</option>
                      <option value="Importado">Importado</option>
                      <option value="Sin Documentos">Sin Documentos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Valor de Patente ($ UYU)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.valorPatente}
                      onChange={(e) => setFormData({ ...formData, valorPatente: e.target.value })}
                      placeholder="Ej: 15000"
                      className="input text-sm md:text-base"
                    />
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Costo anual de la patente en pesos uruguayos
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <button type="submit" className="btn btn-primary flex-1 text-sm md:text-base py-2.5">
                    {editingAuto ? 'Actualizar' : 'Crear'} Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary flex-1 text-sm md:text-base py-2.5"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar cliente (mobile y desktop) */}
      {showAsignarCliente && autoAsignarCliente && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
                Asignar Cliente
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                Auto: {autoAsignarCliente.marca} {autoAsignarCliente.modelo}
              </p>
              <form onSubmit={handleAsignarCliente} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Cliente
                  </label>
                  <select
                    value={clienteAsignar}
                    onChange={e => setClienteAsignar(e.target.value)}
                    className="input text-sm md:text-base"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {getClientesSinPlanesActivos().map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} - {cliente.cedula}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 md:gap-3 pt-2 md:pt-4">
                  <button type="submit" className="btn btn-primary flex-1 text-sm md:text-base py-2.5">
                    Asignar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAsignarCliente(false);
                      setAutoAsignarCliente(null);
                      setClienteAsignar('');
                    }}
                    className="btn btn-secondary flex-1 text-sm md:text-base py-2.5"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Auto */}
      {showDetalles && autoDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto border border-gray-300 dark:border-gray-700 my-2 md:my-4">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                  Detalles del Vehículo
                </h2>
                <button
                  onClick={() => {
                    setShowDetalles(false);
                    setAutoDetalles(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 md:p-4 rounded-lg">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                      <Car className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm md:text-base">Información del Vehículo</span>
                    </h3>
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Marca:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{autoDetalles.marca}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Modelo:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{autoDetalles.modelo}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Año:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{autoDetalles.anio}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Matrícula:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {autoDetalles.matricula === '0km' || !autoDetalles.matricula ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              0km
                            </span>
                          ) : autoDetalles.matricula}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Color:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {autoDetalles.color || <span className="text-gray-400 italic text-xs">No especificado</span>}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Kilometraje:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {autoDetalles.kilometraje ? `${parseInt(autoDetalles.kilometraje).toLocaleString()} km` : <span className="text-gray-400 italic text-xs">No especificado</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 md:p-4 rounded-lg">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm md:text-base">Información Comercial</span>
                    </h3>
                    <div className="space-y-1.5 md:space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                        <span className="font-bold text-green-700 dark:text-green-400 text-sm md:text-lg">{formatCurrency(autoDetalles.precio)}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <span className={`${getEstadoBadge(autoDetalles.estado)} text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1`}>
                          {autoDetalles.estado}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Valor Patente ($ UYU):</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {autoDetalles.valorPatente ? formatPesos(autoDetalles.valorPatente) : <span className="text-gray-400 italic text-xs">No especificado</span>}
                        </span>
                      </div>
                      {autoDetalles.cliente && (
                        <div className="flex justify-between text-xs md:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                          <span className="font-semibold text-gray-900 dark:text-white truncate ml-2">{autoDetalles.cliente.nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Procedencia y Documentación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Procedencia</h3>
                    <p className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
                      {autoDetalles.departamento || <span className="text-gray-400 italic text-xs">No especificado</span>}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">Documentación</h3>
                    <p className="text-sm md:text-lg font-medium text-gray-900 dark:text-white">
                      {autoDetalles.tipoDocumento || <span className="text-gray-400 italic text-xs">No especificado</span>}
                    </p>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 md:p-4 rounded-lg">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 md:mb-3">Información del Sistema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fecha de registro:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {new Date(autoDetalles.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {new Date(autoDetalles.updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                <button
                  onClick={() => {
                    setShowDetalles(false);
                    handleEdit(autoDetalles);
                  }}
                  className="btn btn-primary flex-1 text-xs md:text-sm py-2 md:py-2.5"
                >
                  <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-1.5 md:mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowDetalles(false);
                    setAutoDetalles(null);
                  }}
                  className="btn btn-secondary flex-1 text-xs md:text-sm py-2 md:py-2.5"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, autoId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Auto"
        message="¿Está seguro de que desea eliminar este auto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Autos;
