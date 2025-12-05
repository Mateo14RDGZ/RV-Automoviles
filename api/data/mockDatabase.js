// Mock Database - Simulador de base de datos para modo demo
// Este archivo provee una interfaz similar a Prisma pero usando datos en memoria

const mockData = require('./mockData');
const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    // Referencias a los datos mock
    this.usuarios = mockData.usuarios;
    this.clientes = mockData.clientes;
    this.autos = mockData.autos;
    this.pagos = mockData.pagos;
  }

  // Cliente mock
  get cliente() {
    return {
      findMany: async (options = {}) => {
        let result = [...this.clientes];
        
        if (options.where) {
          result = result.filter(cliente => {
            // Manejo de OR
            if (options.where.OR) {
              return options.where.OR.some(condition => {
                if (condition.cedula) {
                  // Si es un objeto con startsWith
                  if (typeof condition.cedula === 'object' && condition.cedula.startsWith) {
                    return cliente.cedula.startsWith(condition.cedula.startsWith);
                  }
                  // Si es una cédula exacta
                  return cliente.cedula === condition.cedula;
                }
                return false;
              });
            }
            
            // Filtros simples
            if (options.where.id) return cliente.id === options.where.id;
            if (options.where.cedula) return cliente.cedula === options.where.cedula;
            if (options.where.email) return cliente.email.includes(options.where.email);
            return true;
          });
        }

        // Ordenar si se especifica
        if (options.orderBy) {
          if (options.orderBy.createdAt === 'desc') {
            result.sort((a, b) => b.createdAt - a.createdAt);
          } else if (options.orderBy.createdAt === 'asc') {
            result.sort((a, b) => a.createdAt - b.createdAt);
          }
        }

        // Incluir relaciones
        if (options.include) {
          result = result.map(cliente => {
            const enriched = { ...cliente };
            
            if (options.include.usuario) {
              enriched.usuario = this.usuarios.find(u => u.id === cliente.usuarioId);
            }
            
            if (options.include.autos) {
              enriched.autos = this.autos.filter(a => a.clienteId === cliente.id);
              
              // Si autos incluye pagos
              if (options.include.autos.include?.pagos) {
                enriched.autos = enriched.autos.map(auto => ({
                  ...auto,
                  pagos: this.pagos.filter(p => p.autoId === auto.id)
                }));
              }
            }
            
            return enriched;
          });
        }

        return result;
      },

      findUnique: async (options) => {
        const cliente = this.clientes.find(c => 
          (options.where.id && c.id === options.where.id) ||
          (options.where.cedula && c.cedula === options.where.cedula) ||
          (options.where.usuarioId && c.usuarioId === options.where.usuarioId)
        );

        if (!cliente) return null;

        if (options.include?.usuario) {
          return {
            ...cliente,
            usuario: this.usuarios.find(u => u.id === cliente.usuarioId)
          };
        }

        return cliente;
      },

      create: async (options) => {
        const newCliente = {
          id: mockData.getNextClienteId(),
          ...options.data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.clientes.push(newCliente);
        return newCliente;
      },

      update: async (options) => {
        const index = this.clientes.findIndex(c => c.id === options.where.id);
        if (index === -1) throw new Error('Cliente no encontrado');
        
        this.clientes[index] = {
          ...this.clientes[index],
          ...options.data,
          updatedAt: new Date()
        };
        return this.clientes[index];
      },

      delete: async (options) => {
        const index = this.clientes.findIndex(c => c.id === options.where.id);
        if (index === -1) throw new Error('Cliente no encontrado');
        
        const deleted = this.clientes[index];
        this.clientes.splice(index, 1);
        return deleted;
      },

      count: async () => this.clientes.length
    };
  }

  // Auto mock
  get auto() {
    return {
      findMany: async (options = {}) => {
        let result = [...this.autos];
        
        if (options.where) {
          result = result.filter(auto => {
            if (options.where.id) return auto.id === options.where.id;
            if (options.where.estado) return auto.estado === options.where.estado;
            if (options.where.clienteId) return auto.clienteId === options.where.clienteId;
            return true;
          });
        }

        if (options.include?.cliente) {
          result = result.map(auto => ({
            ...auto,
            cliente: auto.clienteId ? this.clientes.find(c => c.id === auto.clienteId) : null
          }));
        }

        return result;
      },

      findUnique: async (options) => {
        const auto = this.autos.find(a => 
          (options.where.id && a.id === options.where.id) ||
          (options.where.matricula && a.matricula === options.where.matricula)
        );

        if (!auto) return null;

        if (options.include?.cliente) {
          return {
            ...auto,
            cliente: auto.clienteId ? this.clientes.find(c => c.id === auto.clienteId) : null
          };
        }

        return auto;
      },

      create: async (options) => {
        const newAuto = {
          id: mockData.getNextAutoId(),
          ...options.data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.autos.push(newAuto);
        return newAuto;
      },

      update: async (options) => {
        const index = this.autos.findIndex(a => a.id === options.where.id);
        if (index === -1) throw new Error('Auto no encontrado');
        
        this.autos[index] = {
          ...this.autos[index],
          ...options.data,
          updatedAt: new Date()
        };
        return this.autos[index];
      },

      delete: async (options) => {
        const index = this.autos.findIndex(a => a.id === options.where.id);
        if (index === -1) throw new Error('Auto no encontrado');
        
        const deleted = this.autos[index];
        this.autos.splice(index, 1);
        return deleted;
      },

      count: async (options = {}) => {
        if (!options.where) return this.autos.length;
        
        return this.autos.filter(auto => {
          if (options.where.estado) return auto.estado === options.where.estado;
          return true;
        }).length;
      }
    };
  }

  // Pago mock
  get pago() {
    return {
      findMany: async (options = {}) => {
        let result = [...this.pagos];
        
        if (options.where) {
          result = result.filter(pago => {
            if (options.where.id) return pago.id === options.where.id;
            if (options.where.clienteId) return pago.clienteId === options.where.clienteId;
            if (options.where.autoId) return pago.autoId === options.where.autoId;
            if (options.where.estado) return pago.estado === options.where.estado;
            return true;
          });
        }

        if (options.include) {
          result = result.map(pago => {
            const enriched = { ...pago };
            if (options.include.cliente) {
              enriched.cliente = this.clientes.find(c => c.id === pago.clienteId);
            }
            if (options.include.auto) {
              enriched.auto = this.autos.find(a => a.id === pago.autoId);
            }
            return enriched;
          });
        }

        if (options.orderBy) {
          const [field, order] = Object.entries(options.orderBy)[0];
          result.sort((a, b) => {
            if (order === 'asc') return a[field] > b[field] ? 1 : -1;
            return a[field] < b[field] ? 1 : -1;
          });
        }

        return result;
      },

      findUnique: async (options) => {
        const pago = this.pagos.find(p => p.id === options.where.id);
        if (!pago) return null;

        if (options.include) {
          const enriched = { ...pago };
          if (options.include.cliente) {
            enriched.cliente = this.clientes.find(c => c.id === pago.clienteId);
          }
          if (options.include.auto) {
            enriched.auto = this.autos.find(a => a.id === pago.autoId);
          }
          return enriched;
        }

        return pago;
      },

      create: async (options) => {
        const newPago = {
          id: mockData.getNextPagoId(),
          ...options.data,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.pagos.push(newPago);
        return newPago;
      },

      update: async (options) => {
        const index = this.pagos.findIndex(p => p.id === options.where.id);
        if (index === -1) throw new Error('Pago no encontrado');
        
        this.pagos[index] = {
          ...this.pagos[index],
          ...options.data,
          updatedAt: new Date()
        };
        return this.pagos[index];
      },

      delete: async (options) => {
        const index = this.pagos.findIndex(p => p.id === options.where.id);
        if (index === -1) throw new Error('Pago no encontrado');
        
        const deleted = this.pagos[index];
        this.pagos.splice(index, 1);
        return deleted;
      },

      count: async (options = {}) => {
        if (!options.where) return this.pagos.length;
        
        return this.pagos.filter(pago => {
          if (options.where.estado) return pago.estado === options.where.estado;
          if (options.where.clienteId) return pago.clienteId === options.where.clienteId;
          return true;
        }).length;
      },

      aggregate: async (options) => {
        let filtered = this.pagos;
        
        if (options.where) {
          filtered = filtered.filter(pago => {
            if (options.where.estado) return pago.estado === options.where.estado;
            return true;
          });
        }

        return {
          _sum: {
            monto: filtered.reduce((sum, p) => sum + parseFloat(p.monto), 0)
          }
        };
      }
    };
  }

  // Usuario mock
  get usuario() {
    return {
      findUnique: async (options) => {
        return this.usuarios.find(u => 
          (options.where.id && u.id === options.where.id) ||
          (options.where.email && u.email === options.where.email)
        ) || null;
      },

      findFirst: async (options) => {
        const user = this.usuarios.find(u => {
          if (options.where.id && u.id !== options.where.id) return false;
          if (options.where.email && u.email !== options.where.email) return false;
          return true;
        });

        if (!user) return null;

        // Si se requiere incluir cliente
        if (options.include?.cliente) {
          const cliente = this.clientes.find(c => c.usuarioId === user.id);
          return {
            ...user,
            cliente: cliente || null
          };
        }

        return user;
      },

      create: async (options) => {
        const hashedPassword = await bcrypt.hash(options.data.password, 10);
        const newUsuario = {
          id: this.usuarios.length + 1,
          ...options.data,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.usuarios.push(newUsuario);
        return newUsuario;
      }
    };
  }

  // Simular query raw (para health check)
  async $queryRaw() {
    return [{ result: 1 }];
  }

  // Simular disconnect
  async $disconnect() {
    return Promise.resolve();
  }
}

// Exportar instancia única (singleton)
const mockDb = new MockDatabase();

module.exports = mockDb;
