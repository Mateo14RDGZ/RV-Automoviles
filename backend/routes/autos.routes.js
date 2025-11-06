const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');
const prisma = require('../../api/lib/prisma');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener todos los autos
router.get('/', async (req, res) => {
  try {
    const { buscar, estado, incluirInactivos } = req.query;
    
    const where = {
      // Por defecto, solo mostrar autos activos (no archivados)
      activo: incluirInactivos === 'true' ? undefined : true
    };
    
    // Si es cliente, solo puede ver sus propios autos
    if (req.user.rol === 'cliente') {
      where.clienteId = req.user.clienteId;
    }
    
    if (buscar) {
      where.OR = [
        { marca: { contains: buscar, mode: 'insensitive' } },
        { modelo: { contains: buscar, mode: 'insensitive' } },
        { matricula: { contains: buscar, mode: 'insensitive' } },
      ];
    }
    
    if (estado) {
      where.estado = estado;
    }

    const autos = await prisma.auto.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            cedula: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(autos);
  } catch (error) {
    console.error('Error al obtener autos:', error);
    res.status(500).json({ error: 'Error al obtener autos' });
  }
});

// Obtener un auto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const auto = await prisma.auto.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        pagos: {
          orderBy: {
            numeroCuota: 'asc'
          }
        }
      }
    });

    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    res.json(auto);
  } catch (error) {
    console.error('Error al obtener auto:', error);
    res.status(500).json({ error: 'Error al obtener auto' });
  }
});

// Crear un nuevo auto
router.post('/', async (req, res) => {
  try {
    const { marca, modelo, anio, año, matricula, precio, estado, clienteId } = req.body;
    const anioValue = anio || año; // Soportar ambos nombres

    // Validar campos obligatorios
    if (!marca || !modelo || !anioValue || !matricula || !precio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Verificar si la matrícula ya existe
    const existingAuto = await prisma.auto.findUnique({
      where: { matricula }
    });

    if (existingAuto) {
      return res.status(400).json({ error: 'La matrícula ya está registrada' });
    }

    // Si se asigna un cliente, cambiar el estado automáticamente a 'vendido'
    let estadoFinal = estado || 'disponible';
    if (clienteId && (!estado || estado === 'disponible')) {
      estadoFinal = 'vendido';
    }

    const auto = await prisma.auto.create({
      data: {
        marca,
        modelo,
        anio: parseInt(anioValue),
        matricula,
        precio: parseFloat(precio),
        estado: estadoFinal,
        clienteId: clienteId ? parseInt(clienteId) : null,
      },
      include: {
        cliente: true
      }
    });

    res.status(201).json(auto);
  } catch (error) {
    console.error('Error al crear auto:', error);
    res.status(500).json({ error: 'Error al crear auto' });
  }
});

// Actualizar un auto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, anio, año, matricula, precio, estado, clienteId } = req.body;
    const anioValue = anio || año; // Soportar ambos nombres

    // Verificar si el auto existe
    const existingAuto = await prisma.auto.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAuto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    // Si se cambia la matrícula, verificar que no exista
    if (matricula && matricula !== existingAuto.matricula) {
      const matriculaExists = await prisma.auto.findUnique({
        where: { matricula }
      });
      if (matriculaExists) {
        return res.status(400).json({ error: 'La matrícula ya está registrada' });
      }
    }

    const auto = await prisma.auto.update({
      where: { id: parseInt(id) },
      data: {
        marca,
        modelo,
        anio: anioValue ? parseInt(anioValue) : undefined,
        matricula,
        precio: precio ? parseFloat(precio) : undefined,
        estado,
        clienteId: clienteId ? parseInt(clienteId) : null,
      },
      include: {
        cliente: true
      }
    });

    res.json(auto);
  } catch (error) {
    console.error('Error al actualizar auto:', error);
    res.status(500).json({ error: 'Error al actualizar auto' });
  }
});

// Eliminar un auto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el auto existe
    const auto = await prisma.auto.findUnique({
      where: { id: parseInt(id) },
      include: {
        pagos: true
      }
    });

    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    // Si tiene pagos asociados, no permitir eliminación directa
    if (auto.pagos.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar un auto con pagos registrados. Elimine primero los pagos asociados.' 
      });
    }

    await prisma.auto.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Auto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar auto:', error);
    res.status(500).json({ error: 'Error al eliminar auto' });
  }
});

module.exports = router;
