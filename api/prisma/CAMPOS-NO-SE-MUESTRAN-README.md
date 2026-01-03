# ⚠️ IMPORTANTE: Los Datos No Se Muestran en el Modal

## 🔍 Problema

Los campos nuevos (kilometraje, color, departamento, tipoDocumento, valorPatente) **NO se están mostrando** en el modal de "Ver Detalles" aunque ya los hayas agregado al auto.

## 🎯 Causa

Falta ejecutar la **migración SQL en la base de datos**. Sin la migración:
- ❌ Los campos NO existen en las tablas de PostgreSQL
- ❌ El backend NO devuelve esos campos
- ❌ El frontend NO puede mostrarlos

## ✅ Solución (EJECUTAR AHORA)

### Paso 1: Ir a Neon Dashboard

1. Abre: [https://console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto
3. Selecciona tu base de datos
4. Click en "SQL Editor"

### Paso 2: Ejecutar Este SQL

```sql
-- ==========================================
-- AGREGAR CAMPOS NUEVOS A AUTOS Y PAGOS
-- ==========================================

-- Agregar campos a la tabla Auto
ALTER TABLE "Auto" 
  ADD COLUMN IF NOT EXISTS "kilometraje" INTEGER,
  ADD COLUMN IF NOT EXISTS "departamento" TEXT,
  ADD COLUMN IF NOT EXISTS "tipoDocumento" TEXT,
  ADD COLUMN IF NOT EXISTS "valorPatente" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Agregar campo comentario a la tabla Pago
ALTER TABLE "Pago"
  ADD COLUMN IF NOT EXISTS "comentario" TEXT;

-- Verificar que se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'Auto'
  AND column_name IN ('kilometraje', 'departamento', 'tipoDocumento', 'valorPatente', 'color')
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'Pago'
  AND column_name = 'comentario';
```

### Paso 3: Click en "Run"

Deberías ver algo como:

```
✅ ALTER TABLE
✅ ALTER TABLE

column_name      | data_type
-----------------+-----------
color            | text
departamento     | text
kilometraje      | integer
tipoDocumento    | text
valorPatente     | double precision

column_name      | data_type
-----------------+-----------
comentario       | text
```

### Paso 4: Reiniciar el Servidor Backend

El servidor necesita regenerar el Prisma Client para usar los nuevos campos.

**Opción A (Automático en Vercel/Railway):**
- Si tu backend está en Vercel o Railway, se reiniciará solo

**Opción B (Local/Manual):**
```bash
cd api
npx prisma generate
# Reiniciar el servidor
```

### Paso 5: Refrescar la Aplicación Web

1. Abre la aplicación web
2. Presiona `Ctrl + Shift + R` (recarga forzada)
3. Ve a Autos
4. Click en "Ver Detalles" en cualquier auto
5. **¡Ahora deberías ver todos los campos!** 🎉

## 🧪 Verificar que Funciona

### Test 1: Ver Detalles de un Auto Existente
```
1. Ve a Autos
2. Click en "Ver Detalles" (ícono ojo 👁️)
3. Deberías ver:
   ✅ Kilometraje (o "No especificado")
   ✅ Color (o "No especificado")
   ✅ Departamento (o "No especificado")
   ✅ Tipo Documento (o "No especificado")
   ✅ Valor Patente (o "No especificado")
```

### Test 2: Editar un Auto y Agregar Datos
```
1. Click en "Editar" en un auto
2. Completa los campos nuevos:
   - Color: Blanco
   - Kilometraje: 50000
   - Departamento: Montevideo
   - Tipo Documento: Título Original
   - Valor Patente: 1500
3. Guarda
4. Click en "Ver Detalles"
5. Todos los campos deberían aparecer con los valores
```

### Test 3: Comentarios en Cuotas Vencidas
```
1. Ve a Pagos
2. Filtra por "Vencidos"
3. Click en "Agregar Comentario" en una cuota vencida
4. Escribe algo y guarda
5. El comentario debería aparecer debajo de la cuota
```

## 📊 Estado de las Tablas Después de la Migración

### Tabla Auto:
```
Campos existentes:
✅ id, marca, modelo, anio, matricula
✅ precio, estado, activo
✅ clienteId, createdAt, updatedAt

Campos NUEVOS:
🆕 kilometraje (INTEGER)
🆕 departamento (TEXT)
🆕 tipoDocumento (TEXT)
🆕 valorPatente (DOUBLE PRECISION)
🆕 color (TEXT)
```

### Tabla Pago:
```
Campos existentes:
✅ id, autoId, numeroCuota, monto
✅ fechaVencimiento, fechaPago, estado
✅ createdAt, updatedAt

Campos NUEVOS:
🆕 comentario (TEXT)
```

## ❗ Si Siguen Sin Aparecer los Datos

1. **Verifica en Neon Console:**
   ```sql
   SELECT * FROM "Auto" LIMIT 1;
   ```
   Deberías ver las columnas: `kilometraje`, `color`, `departamento`, `tipoDocumento`, `valorPatente`

2. **Verifica en la API:**
   - Abre las DevTools del navegador (F12)
   - Ve a la pestaña "Network"
   - Recarga la página de Autos
   - Click en la request `/api/autos`
   - Ve la "Response"
   - Los autos deberían incluir los campos nuevos

3. **Si aún no funciona:**
   - El backend necesita reiniciarse
   - Prisma Client debe regenerarse con `npx prisma generate`

## 📞 Resumen Rápido

```bash
# 1. Ejecutar SQL en Neon Dashboard (ARRIBA ⬆️)
# 2. Regenerar Prisma Client (si backend es local)
cd api
npx prisma generate

# 3. Reiniciar servidor backend
# 4. Recargar aplicación web (Ctrl + Shift + R)
# 5. ¡Listo! 🎉
```

---

**Sin ejecutar el SQL en Neon, los campos nuevos NO funcionarán.**  
**Es obligatorio ejecutar la migración una vez.** 🔴

