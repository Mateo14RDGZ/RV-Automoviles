-- ==========================================
-- ARCHIVAR AUTOS VENDIDOS
-- ==========================================
-- 
-- Este script marca todos los autos con estado "vendido" como inactivos (activo = false)
-- para que NO aparezcan en el stock pero SÍ se mantengan en reportes.
--
-- IMPORTANTE:
--   • Los autos NO aparecerán más en la sección "Autos" (stock)
--   • Los autos SÍ aparecerán en los reportes PDF (historial completo)
--   • Los datos NO se eliminan, solo se ocultan del stock activo
--
-- ==========================================

-- Paso 1: Ver cuántos autos se van a archivar (CONSULTA)
SELECT 
  COUNT(*) as "Total a archivar",
  COUNT(CASE WHEN activo = true THEN 1 END) as "Actualmente visibles",
  COUNT(CASE WHEN activo = false THEN 1 END) as "Ya archivados"
FROM "Auto"
WHERE estado = 'vendido';

-- Paso 2: Ver detalles de los autos que se van a archivar (CONSULTA)
SELECT 
  a.id,
  a.marca,
  a.modelo,
  a.anio,
  a.matricula,
  a.estado,
  a.activo as "Actualmente_Activo",
  c.nombre as "Cliente",
  (SELECT COUNT(*) FROM "Pago" WHERE "autoId" = a.id) as "Cantidad_Pagos"
FROM "Auto" a
LEFT JOIN "Cliente" c ON a."clienteId" = c.id
WHERE a.estado = 'vendido'
ORDER BY a."createdAt" DESC;

-- Paso 3: ARCHIVAR - Marcar todos los autos vendidos como inactivos
UPDATE "Auto"
SET activo = false
WHERE estado = 'vendido';

-- Paso 4: Verificar el resultado
SELECT 
  COUNT(*) as "Total de autos vendidos",
  COUNT(CASE WHEN activo = true THEN 1 END) as "Aún visibles (ERROR)",
  COUNT(CASE WHEN activo = false THEN 1 END) as "Archivados correctamente"
FROM "Auto"
WHERE estado = 'vendido';

-- Paso 5: Ver estado general del inventario
SELECT 
  estado,
  activo,
  COUNT(*) as cantidad
FROM "Auto"
GROUP BY estado, activo
ORDER BY estado, activo DESC;

-- ==========================================
-- RESULTADO ESPERADO:
-- Todos los autos con estado='vendido' deben tener activo=false
-- ==========================================

