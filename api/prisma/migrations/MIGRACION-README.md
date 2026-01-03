# 🔧 Migración: Nuevos Campos para Autos y Pagos

## 📋 Cambios en la Base de Datos

### 1. **Nuevos Campos en Tabla `Auto`**

Se agregan 5 campos nuevos para información detallada del vehículo:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `kilometraje` | INTEGER | Kilometraje del vehículo | No |
| `departamento` | TEXT | Departamento de procedencia | No |
| `tipoDocumento` | TEXT | Tipo de documentación | No |
| `valorPatente` | FLOAT | Valor de la patente | No |
| `color` | TEXT | Color del vehículo | No |

### 2. **Nuevo Campo en Tabla `Pago`**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `comentario` | TEXT | Comentario sobre motivo de no pago | No |

---

## 🚀 Instrucciones para Ejecutar

### Paso 1: Ir a Neon Dashboard

1. Ve a: [https://console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto y base de datos
3. Abre el **SQL Editor**

### Paso 2: Ejecutar la Migración

Copia y pega el siguiente SQL:

```sql
-- Agregar nuevos campos a la tabla Auto
ALTER TABLE "Auto" 
  ADD COLUMN IF NOT EXISTS "kilometraje" INTEGER,
  ADD COLUMN IF NOT EXISTS "departamento" TEXT,
  ADD COLUMN IF NOT EXISTS "tipoDocumento" TEXT,
  ADD COLUMN IF NOT EXISTS "valorPatente" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Agregar campo comentario a la tabla Pago
ALTER TABLE "Pago"
  ADD COLUMN IF NOT EXISTS "comentario" TEXT;

-- Verificar que los campos se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Auto'
  AND column_name IN ('kilometraje', 'departamento', 'tipoDocumento', 'valorPatente', 'color')
ORDER BY column_name;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Pago'
  AND column_name = 'comentario';
```

### Paso 3: Hacer Click en "Run"

Deberías ver:
- ✅ 5 columnas agregadas a la tabla `Auto`
- ✅ 1 columna agregada a la tabla `Pago`

### Paso 4: Regenerar Prisma Client en el Servidor

Después de ejecutar el SQL, el servidor debe regenerar el cliente de Prisma. Esto puede hacerse:

**Opción A (Automático):**
- Reinicia el servidor y se regenerará automáticamente

**Opción B (Manual):**
```bash
cd api
npx prisma generate
```

---

## 🎯 Nuevas Funcionalidades

### Para Autos:

#### **Al Crear/Editar Auto:**
- ✅ Campo de kilometraje
- ✅ Selector de departamento
- ✅ Selector de tipo de documentación
- ✅ Campo de valor de patente
- ✅ Campo de color

#### **Al Ver Auto (Popup):**
Se mostrará toda la información detallada incluyendo los nuevos campos.

### Para Pagos Vencidos:

#### **Desplegable con Comentario:**
- Los empleados/admins pueden agregar comentarios en cuotas vencidas
- Ejemplo: "Cliente con problemas financieros temporales"
- Los comentarios son editables

---

## 📊 Estructura Final

### Tabla Auto (campos principales):
```
- id, marca, modelo, anio, matricula
- precio, estado, activo
- kilometraje (NUEVO)
- departamento (NUEVO)
- tipoDocumento (NUEVO)
- valorPatente (NUEVO)
- color (NUEVO)
- clienteId, createdAt, updatedAt
```

### Tabla Pago (campos principales):
```
- id, autoId, numeroCuota, monto
- fechaVencimiento, fechaPago, estado
- comentario (NUEVO)
- createdAt, updatedAt
```

---

## ⚡ Importante

- Todos los campos nuevos son **opcionales** (nullable)
- Los autos existentes tendrán estos campos en `null` hasta que se editen
- Los pagos existentes tendrán `comentario` en `null`
- No se pierden datos existentes

---

## 🎉 Después de la Migración

1. ✅ Los formularios de auto mostrarán los nuevos campos
2. ✅ Las cuotas vencidas tendrán opción de agregar comentario
3. ✅ El popup de detalle de auto mostrará toda la información
4. ✅ La API devolverá los nuevos campos automáticamente

