import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (nombre, email, password) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const autosService = {
  getAll: async (params) => {
    const response = await api.get('/autos', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/autos/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/autos', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/autos/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/autos/${id}`);
    return response.data;
  },
};

export const clientesService = {
  getAll: async (params) => {
    const response = await api.get('/clientes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/clientes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
};

export const pagosService = {
  getAll: async (params = {}) => {
    console.log('🔍 pagosService.getAll - Llamando API con params:', params);
    const response = await api.get('/pagos', { params });
    console.log('✅ pagosService.getAll - Respuesta:', {
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      length: Array.isArray(response.data) ? response.data.length : 'N/A'
    });
    return response.data;
  },

  getProximosVencimientos: async () => {
    const response = await api.get('/pagos/proximos-vencimientos');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/pagos', data);
    return response.data;
  },

  generarCuotas: async (data) => {
    const response = await api.post('/pagos/generar-cuotas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/pagos/${id}`, data);
    return response.data;
  },

  enviarEmail: async (id) => {
    const response = await api.post(`/pagos/${id}/enviar-email`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const comprobantesService = {
  subir: async (pagoId, archivoBase64, tipoArchivo) => {
    const response = await api.post('/comprobantes', {
      pagoId,
      archivoBase64,
      tipoArchivo
    });
    return response.data;
  },

  getNotificaciones: async (params = {}) => {
    const response = await api.get('/comprobantes/notificaciones', { params });
    return response.data;
  },

  marcarVisto: async (id, visto = true) => {
    const response = await api.put(`/comprobantes/${id}/visto`, { visto });
    return response.data;
  },

  actualizarEstado: async (id, estado, notas = null, montoPagado = null) => {
    const body = { estado, notas };
    if (montoPagado !== null) {
      body.montoPagado = montoPagado;
    }
    const response = await api.put(`/comprobantes/${id}/estado`, body);
    return response.data;
  },

  getByPago: async (pagoId) => {
    const response = await api.get(`/comprobantes/pago/${pagoId}`);
    return response.data;
  },
};