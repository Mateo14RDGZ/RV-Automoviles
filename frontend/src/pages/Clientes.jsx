import { useEffect, useState } from 'react';
import { clientesService } from '../services';
import { Users, Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const Clientes = () => {
  const { showToast } = useToast();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, clienteId: null });
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAll({ buscar: searchTerm });
      setClientes(data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado local en tiempo real
  const filteredClientes = clientes.filter(cliente => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.cedula.toLowerCase().includes(searchLower) ||
      cliente.telefono.toLowerCase().includes(searchLower) ||
      (cliente.email && cliente.email.toLowerCase().includes(searchLower))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('📝 Enviando datos del cliente:', formData);
      
      if (editingCliente) {
        await clientesService.update(editingCliente.id, formData);
        showToast('Cliente actualizado exitosamente', 'success');
      } else {
        const response = await clientesService.create(formData);
        console.log('✅ Cliente creado:', response);
        
        showToast('Cliente creado exitosamente', 'success');
        
        // Si es un nuevo cliente, enviar credenciales por WhatsApp
        if (response.passwordTemporal && formData.telefono) {
          const telefono = formData.telefono.replace(/\D/g, ''); // Remover caracteres no numéricos
          const urlWeb = window.location.origin; // URL de la web actual
          
          // Crear mensaje de WhatsApp con las credenciales
          const mensaje = `¡Hola ${formData.nombre}! 👋

Bienvenido a *Nicolas Tejera Automóviles* 🚗

Te compartimos tus credenciales de acceso para ver tus cuotas:

🔐 *Credenciales de Acceso:*
📧 Usuario: ${response.emailUsuario}
🔑 Contraseña: ${response.passwordTemporal}

🌐 *Link de acceso:*
${urlWeb}

Puedes iniciar sesión con tu email o cédula y la contraseña proporcionada.

¡Cualquier consulta, estamos a tu disposición!`;

          const mensajeEncoded = encodeURIComponent(mensaje);
          const whatsappUrl = `https://wa.me/${telefono}?text=${mensajeEncoded}`;
          
          // Abrir WhatsApp en una nueva pestaña
          window.open(whatsappUrl, '_blank');
          
          showToast('🔐 Credenciales: ' + response.emailUsuario + ' / ' + response.passwordTemporal, 'info', 10000);
          showToast('📱 Abriendo WhatsApp para enviar credenciales...', 'info', 5000);
        }
      }
      setShowModal(false);
      resetForm();
      loadClientes();
    } catch (error) {
      console.error('❌ Error al guardar cliente:', error);
      showToast(error.response?.data?.error || error.message || 'Error al guardar el cliente', 'error');
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({ isOpen: true, clienteId: id });
  };

  const confirmDelete = async () => {
    try {
      await clientesService.delete(confirmDialog.clienteId);
      showToast('Cliente eliminado exitosamente', 'success');
      loadClientes();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar el cliente', 'error');
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
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Administra la información de tus clientes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center justify-center gap-2 w-full md:w-auto py-2.5 md:py-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm md:text-base">Nuevo Cliente</span>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card animate-fadeInUp p-4 md:p-6" style={{animationDelay: '0.2s'}}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 md:pl-10 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Grid de clientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">{searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 px-2 md:px-0">
          {filteredClientes.map((cliente, index) => (
            <div key={cliente.id} className="card p-4 md:p-6 hover:shadow-xl hover-lift transition-all duration-300 animate-fadeInUp" style={{animationDelay: `${0.1 * (index % 6)}s`}}>
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">{cliente.nombre}</h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">CI: {cliente.cedula}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">{cliente.telefono}</span>
                </div>
                {cliente.email && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-start gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{cliente.direccion}</span>
                  </div>
                )}
              </div>

              {cliente.autos && cliente.autos.length > 0 && (
                <div className="mb-3 md:mb-4 pb-3 md:pb-4 border-t border-gray-200 dark:border-gray-700 pt-3 md:pt-4">
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-2">Autos asociados:</p>
                  <div className="space-y-1">
                    {cliente.autos.map((auto) => (
                      <div key={auto.id} className="flex items-center justify-between text-[10px] md:text-xs">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                          {auto.marca} {auto.modelo}
                        </span>
                        <span className={`badge badge-${auto.estado === 'disponible' ? 'success' : auto.estado === 'vendido' ? 'info' : 'warning'} text-[10px] px-1.5 py-0.5 ml-2 flex-shrink-0`}>
                          {auto.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(cliente)}
                  className="flex-1 btn btn-secondary text-xs md:text-sm py-2 flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cliente.id)}
                  className="flex-1 btn btn-danger text-xs md:text-sm py-2 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-300 dark:border-gray-700">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Cédula *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cedula}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 8) {
                          setFormData({ ...formData, cedula: value });
                        }
                      }}
                      maxLength="8"
                      pattern="[0-9]{8}"
                      placeholder="Ej: 12345678"
                      className="input text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="input text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input text-sm md:text-base"
                    placeholder="correo@ejemplo.com"
                  />
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Si proporcionas email, se creará usuario. Login con cédula de 8 dígitos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
                    Dirección
                  </label>
                  <textarea
                    rows={3}
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="input text-sm md:text-base"
                  />
                </div>

                <div className="flex gap-2 md:gap-3 pt-3 md:pt-4">
                  <button type="submit" className="btn btn-primary flex-1 text-sm md:text-base py-2.5">
                    {editingCliente ? 'Actualizar' : 'Crear'} Cliente
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, clienteId: null })}
        onConfirm={confirmDelete}
        title="Eliminar Cliente"
        message="¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Clientes;
