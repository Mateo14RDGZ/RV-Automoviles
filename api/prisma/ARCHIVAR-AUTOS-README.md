# 📦 Archivar Autos Vendidos del Stock

## 🎯 Objetivo

Los autos con estado **"vendido"** deben:
- ❌ **NO aparecer** en el stock de la sección "Autos"
- ✅ **SÍ aparecer** en los reportes PDF (historial completo)

## 📋 Instrucciones

### Paso 1: Ir a Neon Dashboard

1. Ve a: [https://console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto y base de datos
3. Abre el **SQL Editor**

### Paso 2: Ejecutar el SQL de Archivado

Copia y pega el siguiente SQL:

```sql
-- Ver qué autos se van a archivar (OPCIONAL - solo para revisar)
SELECT 
  a.id,
  a.marca,
  a.modelo,
  a.anio,
  a.matricula,
  a.estado,
  a.activo as "Actualmente_Visible",
  c.nombre as "Cliente"
FROM "Auto" a
LEFT JOIN "Cliente" c ON a."clienteId" = c.id
WHERE a.estado = 'vendido'
ORDER BY a."createdAt" DESC;

-- ARCHIVAR: Marcar todos los autos vendidos como inactivos
UPDATE "Auto"
SET activo = false
WHERE estado = 'vendido';

-- Verificar el resultado
SELECT 
  COUNT(*) as "Autos vendidos archivados"
FROM "Auto"
WHERE estado = 'vendido' AND activo = false;

-- Ver estado general del inventario
SELECT 
  estado,
  activo,
  COUNT(*) as cantidad
FROM "Auto"
GROUP BY estado, activo
ORDER BY estado, activo DESC;
```

### Paso 3: Hacer Click en "Run"

Verás:
- Cuántos autos se archivaron
- Estado general del inventario (por estado y visibilidad)

### Paso 4: Verificar en la Aplicación

1. Ve a la sección **"Autos"**
2. Los autos vendidos ya **NO deberían aparecer**
3. Ve a **"Reportes"** → **"Exportar Autos a PDF"**
4. Los autos vendidos **SÍ deberían aparecer** en el PDF

## 🔄 ¿Qué hace este script?

### Antes:
```
Stock de Autos (visible):
  ✅ Auto 1 - disponible (activo: true)
  ✅ Auto 2 - vendido (activo: true) ← PROBLEMA
  ✅ Auto 3 - financiado (activo: true)
```

### Después:
```
Stock de Autos (visible):
  ✅ Auto 1 - disponible (activo: true)
  ✅ Auto 3 - financiado (activo: true)

Archivados (solo en reportes):
  📦 Auto 2 - vendido (activo: false) ← SOLUCIONADO
```

## ⚡ Para el Futuro

El sistema ya está configurado para que:
- Cuando un auto termine su plan de cuotas → automáticamente se marca como `estado: vendido` y `activo: false`
- Los autos archivados **NO aparecen** en el stock
- Los autos archivados **SÍ aparecen** en reportes PDF

Este script es necesario **solo una vez** para archivar los autos que ya estaban marcados como vendidos antes de la actualización.

## 📊 Estados de los Autos

| Estado | Activo | Visible en Stock | Visible en Reportes |
|--------|--------|------------------|---------------------|
| `disponible` | `true` | ✅ Sí | ✅ Sí |
| `reservado` | `true` | ✅ Sí | ✅ Sí |
| `financiado` | `true` | ✅ Sí | ✅ Sí |
| `vendido` | `false` | ❌ No | ✅ Sí |

## 🎉 Resultado Final

Después de ejecutar este script:
- ✅ Los autos vendidos desaparecen del stock
- ✅ Los autos vendidos siguen en los reportes
- ✅ Los datos se mantienen en la base de datos
- ✅ Sistema listo para archivar automáticamente futuros autos vendidos

