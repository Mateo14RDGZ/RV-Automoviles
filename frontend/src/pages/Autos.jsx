import { useEffect, useState } from 'react';
import { autosService, clientesService } from '../services';
import { Car, Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

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
      // Preparar datos para enviar al backend
      const dataToSend = {
        marca: formData.marca,
        modelo: formData.modelo,
        anio: parseInt(formData.anio),
        matricula: formData.matricula,
        precio: parseFloat(formData.precio),
        clienteId: formData.clienteId ? parseInt(formData.clienteId) : null
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Autos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra el inventario de vehículos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          Nuevo Auto
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo o matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="input"
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
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${auto.precio.toLocaleString()}
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
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : filteredAutos.length === 0 ? (
          <div className="card text-center py-12">
            <Car className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{searchTerm || estadoFilter ? 'No se encontraron autos con ese criterio' : 'No hay autos registrados'}</p>
          </div>
        ) : (
          filteredAutos.map((auto, index) => (
            <div key={auto.id} className="card hover-lift animate-fadeInUp" style={{animationDelay: `${0.1 * (index % 6)}s`}}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {auto.marca} {auto.modelo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {auto.matricula === '0km' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          0km
                        </span>
                      ) : auto.matricula}
                    </p>
                  </div>
                </div>
                <span className={getEstadoBadge(auto.estado)}>
                  {auto.estado}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Año:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{auto.anio}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${auto.precio.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Cliente:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {auto.cliente ? auto.cliente.nombre : 'Sin asignar'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(auto)}
                  className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                {!auto.cliente && (
                  <button
                    onClick={() => abrirAsignarCliente(auto)}
                    className="flex-1 btn btn-primary text-sm py-2 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Asignar Cliente
                  </button>
                )}
                <button
                  onClick={() => handleDelete(auto.id)}
                  className="flex-1 btn btn-danger text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingAuto ? 'Editar Auto' : 'Nuevo Auto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Año *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.anio}
                      onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Matrícula
                    </label>
                    <input
                      type="text"
                      value={formData.matricula}
                      onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                      placeholder="Dejar vacío para autos 0km"
                      className="input"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Si no tiene matrícula, se mostrará como "0km"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      className="input"
                    />
                  </div>

                  {editingAuto && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Estado (Automático)
                      </label>
                      <div className="input bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed">
                        {editingAuto.estado === 'disponible' && '🟢 Disponible'}
                        {editingAuto.estado === 'financiado' && '🟡 En Financiamiento'}
                        {editingAuto.estado === 'vendido' && '🔵 Vendido'}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        El estado se actualiza automáticamente según el flujo de venta
                      </p>
                    </div>
                  )}

                  <div className={editingAuto ? "md:col-span-1" : "md:col-span-2"}>
                    {/* Campo de cliente solo al crear, no al editar */}
                    {!editingAuto && (
                      <>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cliente Asignado
                        </label>
                        <select
                          value={formData.clienteId}
                          onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                          className="input"
                        >
                          <option value="">Sin cliente asignado</option>
                          {getClientesSinPlanesActivos().map((cliente) => (
                            <option key={cliente.id} value={cliente.id}>
                              {cliente.nombre} - {cliente.cedula}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Solo se muestran clientes sin planes de cuotas activos
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingAuto ? 'Actualizar' : 'Crear'} Auto
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

      {/* Modal para asignar cliente (mobile y desktop) */}
      {showAsignarCliente && autoAsignarCliente && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Asignar Cliente
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Auto: {autoAsignarCliente.marca} {autoAsignarCliente.modelo}
              </p>
              <form onSubmit={handleAsignarCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente
                  </label>
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
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Asignar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAsignarCliente(false);
                      setAutoAsignarCliente(null);
                      setClienteAsignar('');
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
