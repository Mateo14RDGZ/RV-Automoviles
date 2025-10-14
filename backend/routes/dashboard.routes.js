const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const prisma = new PrismaClient();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    // Construir filtros según el rol del usuario
    const autoFilter = req.user.rol === 'cliente' ? { clienteId: req.user.clienteId } : {};
    const pagoFilter = req.user.rol === 'cliente' ? { auto: { clienteId: req.user.clienteId } } : {};

    // Total de autos por estado
    const autosDisponibles = await prisma.auto.count({
      where: { ...autoFilter, estado: 'disponible' }
    });

    const autosVendidos = await prisma.auto.count({
      where: { ...autoFilter, estado: 'vendido' }
    });

    const autosReservados = await prisma.auto.count({
      where: { ...autoFilter, estado: 'reservado' }
    });

    const totalAutos = await prisma.auto.count({
      where: autoFilter
    });

    // Total de clientes activos (solo para admin)
    const totalClientes = req.user.rol === 'admin' 
      ? await prisma.cliente.count({ where: { activo: true } }) 
      : 0;

    // Estadísticas de pagos
    const pagosPagados = await prisma.pago.count({
      where: { ...pagoFilter, estado: 'pagado' }
    });

    const pagosPendientes = await prisma.pago.count({
      where: { ...pagoFilter, estado: 'pendiente' }
    });

    // Pagos vencidos
    const pagosVencidos = await prisma.pago.count({
      where: {
        ...pagoFilter,
        estado: 'pendiente',
        fechaVencimiento: {
          lt: new Date()
        }
      }
    });

    // Total de dinero recaudado
    const totalRecaudado = await prisma.pago.aggregate({
      where: { ...pagoFilter, estado: 'pagado' },
      _sum: {
        monto: true
      }
    });

    // Total pendiente de pago
    const totalPendiente = await prisma.pago.aggregate({
      where: { ...pagoFilter, estado: 'pendiente' },
      _sum: {
        monto: true
      }
    });

    // Próximos vencimientos (próximos 7 días)
    const hoy = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(proximosDias.getDate() + 7);

    const proximosVencimientos = await prisma.pago.findMany({
      where: {
        ...pagoFilter,
        estado: 'pendiente',
        fechaVencimiento: {
          gte: hoy,
          lte: proximosDias
        }
      },
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
      },
      take: 5
    });

    // Pagos recientes
    const pagosRecientes = await prisma.pago.findMany({
      where: {
        ...pagoFilter,
        estado: 'pagado',
        fechaPago: {
          not: null
        }
      },
      include: {
        auto: {
          include: {
            cliente: {
              select: {
                nombre: true,
              }
            }
          }
        }
      },
      orderBy: {
        fechaPago: 'desc'
      },
      take: 5
    });

    res.json({
      autos: {
        total: totalAutos,
        disponibles: autosDisponibles,
        vendidos: autosVendidos,
        reservados: autosReservados,
      },
      clientes: {
        total: totalClientes,
      },
      pagos: {
        pagados: pagosPagados,
        pendientes: pagosPendientes,
        vencidos: pagosVencidos,
        totalRecaudado: totalRecaudado._sum.monto || 0,
        totalPendiente: totalPendiente._sum.monto || 0,
      },
      proximosVencimientos,
      pagosRecientes,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
