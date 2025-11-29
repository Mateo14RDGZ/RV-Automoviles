import { useEffect, useState } from 'react';
import { clientesService } from '../services';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    direccion: '',
    email: '',
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term = searchTerm) => {
    try {
      setLoading(true);
      const data = await clientesService.getAll({ buscar: term });
      setClientes(data);
      
      // Si hay resultados, desplazar al primer resultado
      if (data.length > 0) {
        setTimeout(() => {
          const firstCard = document.querySelector('.grid > div:first-child');
          if (firstCard) {
            firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstCard.classList.add('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
            setTimeout(() => {
              firstCard.classList.remove('ring-2', 'ring-blue-500', 'dark:ring-blue-400');
            }, 2000);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📝 Enviando datos del cliente:', formData);
      
      if (editingCliente) {
        await clientesService.update(editingCliente.id, formData);
        alert('Cliente actualizado exitosamente');
      } else {
        const response = await clientesService.create(formData);
        console.log('✅ Cliente creado:', response);
        
        if (response.passwordTemporal) {
          alert(`Cliente creado exitosamente.\n\nSe ha creado un usuario con:\nEmail: ${formData.email}\nContraseña temporal: ${response.passwordTemporal}\n\nEl cliente puede usar estas credenciales para acceder al portal.`);
        } else {
          alert('Cliente creado exitosamente');
        }
      }
      setShowModal(false);
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error al guardar el cliente';
      
      // Si el error es que ya existe, ofrecer buscar al cliente
      if (errorMsg.includes('cédula ya está registrada') || errorMsg.includes('email ya está registrado')) {
        const buscar = window.confirm(
          `${errorMsg}\n\n¿Deseas buscar este cliente existente?\n\nPuedes agregarle un nuevo auto desde la sección "Autos" seleccionando este cliente.`
        );
        if (buscar) {
          setShowModal(false);
          resetForm();
          const termBusqueda = formData.cedula || formData.email;
          setSearchTerm(termBusqueda);
          await handleSearch(termBusqueda);
        }
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesService.delete(id);
        loadClientes();
      } catch (error) {
        alert(error.response?.data?.error || 'Error al eliminar el cliente');
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      cedula: cliente.cedula,
      telefono: cliente.telefono,
      direccion: cliente.direccion || '',
      email: cliente.email || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCliente(null);
    setFormData({
      nombre: '',
      cedula: '',
      telefono: '',
      direccion: '',
      email: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra la información de tus clientes. Los clientes existentes pueden tener múltiples autos/planes.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Mensaje informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              ¿Cliente ya existe?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Si un cliente ya completó un plan de cuotas y necesitas crear uno nuevo, no es necesario crear un nuevo registro. 
              Simplemente ve a <strong>Autos</strong> y crea un nuevo auto asociado al cliente existente.
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
            />
          </div>
          <button onClick={handleSearch} className="btn btn-primary">
            Buscar
          </button>
        </div>
      </div>

      {/* Grid de clientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : clientes.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{cliente.nombre}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">CI: {cliente.cedula}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{cliente.telefono}</span>
                </div>
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-2">{cliente.direccion}</span>
                  </div>
                )}
              </div>

              {cliente.autos && cliente.autos.length > 0 && (
                <div className="mb-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Autos asociados:</p>
                  <div className="space-y-1">
                    {cliente.autos.map((auto) => (
                      <div key={auto.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 dark:text-gray-300">
                          {auto.marca} {auto.modelo}
                        </span>
                        <span className={`badge badge-${auto.estado === 'disponible' ? 'success' : auto.estado === 'vendido' ? 'info' : 'warning'}`}>
                          {auto.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(cliente)}
                  className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="flex-1 btn btn-danger text-sm py-2 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>

              {!editingCliente && (
                <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Nota:</strong> Si el cliente ya existe, será redirigido a buscarlo. Los clientes pueden tener múltiples autos/planes de cuotas.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cédula *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="correo@ejemplo.com"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si proporcionas un email, se creará un usuario para acceso al portal del cliente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <textarea
                    rows={3}
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingCliente ? 'Actualizar' : 'Crear'} Cliente
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
    </div>
  );
};

export default Clientes;
