const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los pagos (admin ve todos, cliente ve solo los suyos)
router.get('/', async (req, res) => {
  try {
    const { autoId, estado, vencidos } = req.query;
    
    const where = {};
    
    // Si es cliente, solo puede ver sus propios pagos
    if (req.user.rol === 'cliente') {
      where.auto = {
        clienteId: req.user.clienteId
      };
    }
    
    if (autoId) {
      where.autoId = parseInt(autoId);
    }
    
    if (estado) {
      where.estado = estado;
    }

    // Filtrar pagos vencidos
    if (vencidos === 'true') {
      where.estado = 'pendiente';
      where.fechaVencimiento = {
        lt: new Date()
      };
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        auto: {
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                cedula: true,
                telefono: true,
              }
            }
          }
        }
      },
      orderBy: [
        { autoId: 'asc' },
        { numeroCuota: 'asc' }
      ]
    });

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

// Obtener pagos vencidos próximos a vencer (próximos 7 días)
router.get('/proximos-vencimientos', async (req, res) => {
  try {
    const hoy = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(proximosDias.getDate() + 7);

    const where = {
      estado: 'pendiente',
      fechaVencimiento: {
        gte: hoy,
        lte: proximosDias
      }
    };

    // Si es cliente, solo puede ver sus propios pagos
    if (req.user.rol === 'cliente') {
      where.auto = {
        clienteId: req.user.clienteId
      };
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        auto: {
          include: {
            cliente: {
              select: {
                nombre: true,
                telefono: true,
              }
            }
          }
        }
      },
      orderBy: {
        fechaVencimiento: 'asc'
      }
    });

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener próximos vencimientos:', error);
    res.status(500).json({ error: 'Error al obtener próximos vencimientos' });
  }
});

// Crear un nuevo pago/cuota
router.post('/', async (req, res) => {
  try {
    const { autoId, numeroCuota, monto, fechaVencimiento, estado } = req.body;

    // Validar campos obligatorios
    if (!autoId || !numeroCuota || !monto || !fechaVencimiento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar que el auto existe
    const auto = await prisma.auto.findUnique({
      where: { id: parseInt(autoId) }
    });

    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    const pago = await prisma.pago.create({
      data: {
        autoId: parseInt(autoId),
        numeroCuota: parseInt(numeroCuota),
        monto: parseFloat(monto),
        fechaVencimiento: new Date(fechaVencimiento),
        estado: estado || 'pendiente',
      },
      include: {
        auto: {
          include: {
            cliente: true
          }
        }
      }
    });

    res.status(201).json(pago);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ error: 'Error al crear pago' });
  }
});

// Crear múltiples cuotas para un auto
router.post('/generar-cuotas', async (req, res) => {
  try {
    const { autoId, numeroCuotas, montoCuota, fechaInicio, intervaloMeses, esFinanciamientoEnProgreso, cuotasPagadas } = req.body;

    // Validar campos obligatorios
    if (!autoId || !numeroCuotas || !montoCuota || !fechaInicio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar que el auto existe
    const auto = await prisma.auto.findUnique({
      where: { id: parseInt(autoId) }
    });

    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    // Generar cuotas
    const cuotas = [];
    const fecha = new Date(fechaInicio);
    const meses = intervaloMeses || 1;
    const numeroCuotasPagadas = parseInt(cuotasPagadas) || 0;

    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(fecha);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1) * meses);

      // Si es financiamiento en progreso y esta cuota ya está pagada
      const estaPagada = esFinanciamientoEnProgreso && i <= numeroCuotasPagadas;

      cuotas.push({
        autoId: parseInt(autoId),
        numeroCuota: i,
        monto: parseFloat(montoCuota),
        fechaVencimiento,
        estado: estaPagada ? 'pagado' : 'pendiente',
        fechaPago: estaPagada ? fechaVencimiento : null,
      });
    }

    // Crear todas las cuotas
    const pagosCreados = await prisma.pago.createMany({
      data: cuotas
    });

    res.status(201).json({ 
      message: `${pagosCreados.count} cuotas generadas exitosamente${esFinanciamientoEnProgreso ? ` (${numeroCuotasPagadas} marcadas como pagadas)` : ''}`,
      count: pagosCreados.count,
      cuotasPagadas: numeroCuotasPagadas
    });
  } catch (error) {
    console.error('Error al generar cuotas:', error);
    res.status(500).json({ error: 'Error al generar cuotas' });
  }
});

// Actualizar un pago (marcar como pagado, cambiar fecha, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, fechaPago, monto, fechaVencimiento } = req.body;

    // Verificar si el pago existe
    const existingPago = await prisma.pago.findUnique({
      where: { id: parseInt(id) },
      include: {
        auto: {
          include: {
            cliente: true
          }
        }
      }
    });

    if (!existingPago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const updateData = {};
    
    if (estado) updateData.estado = estado;
    if (monto) updateData.monto = parseFloat(monto);
    if (fechaVencimiento) updateData.fechaVencimiento = new Date(fechaVencimiento);
    
    // Si se marca como pagado y no tiene fecha de pago, usar la actual
    if (estado === 'pagado' && !existingPago.fechaPago) {
      updateData.fechaPago = fechaPago ? new Date(fechaPago) : new Date();
    }

    const pago = await prisma.pago.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        auto: {
          include: {
            cliente: true
          }
        }
      }
    });

    // Si el pago fue marcado como "pagado", verificar si todas las cuotas del cliente están pagadas
    if (estado === 'pagado' && pago.auto.clienteId) {
      const clienteId = pago.auto.clienteId;
      
      // Obtener todos los pagos del cliente
      const todosPagosCliente = await prisma.pago.findMany({
        where: {
          auto: {
            clienteId: clienteId
          }
        }
      });

      // Verificar si todas las cuotas están pagadas
      const todasPagadas = todosPagosCliente.every(p => p.estado === 'pagado');

      // Si todas están pagadas, marcar cliente y sus autos como inactivos (archivados)
      if (todasPagadas && todosPagosCliente.length > 0) {
        // Archivar el cliente
        await prisma.cliente.update({
          where: { id: clienteId },
          data: { activo: false }
        });
        
        // Archivar todos los autos del cliente
        await prisma.auto.updateMany({
          where: { clienteId: clienteId },
          data: { activo: false }
        });
        
        console.log(`✅ Cliente ID ${clienteId} y sus autos completaron todos los pagos y fueron archivados automáticamente`);
      }
    }

    res.json(pago);
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
});

// Eliminar un pago
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el pago existe
    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    await prisma.pago.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
});

module.exports = router;
