# 🔧 SOLUCIÓN: Error al agregar autos - Campo "escribana" no existe

## 📋 Problema Identificado

El error ocurre porque la columna `escribana` no existe en la base de datos de producción (Vercel). La migración `20250103000000_add_escribana_to_auto` no se ha aplicado.

**Error en Vercel:**
```
The column `Auto.escribana` does not exist in the current database.
Code: P2022
```

---

## ✅ SOLUCIÓN RÁPIDA (Opción 1 - RECOMENDADA)

### Paso 1: Obtener DATABASE_URL de Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Environment Variables**
3. Copia el valor de `DATABASE_URL` o `POSTGRES_PRISMA_URL`

### Paso 2: Aplicar migración

Ejecuta estos comandos en PowerShell:

```powershell
# Configurar la DATABASE_URL (reemplaza con tu URL real)
$env:DATABASE_URL="postgresql://usuario:password@host.neon.tech/database?sslmode=require"

# Ir al directorio api
cd api

# Aplicar todas las migraciones pendientes
npx prisma migrate deploy
```

Esto aplicará la migración `20250103000000_add_escribana_to_auto` y agregará la columna `escribana` a la tabla `Auto`.

---

## ✅ SOLUCIÓN ALTERNATIVA (Opción 2 - SQL Manual)

Si prefieres aplicar la migración manualmente:

### Paso 1: Conectarse a la base de datos

1. Ve a tu dashboard de Neon (https://console.neon.tech)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecutar este SQL

```sql
-- Agregar columna escribana
ALTER TABLE "Auto" ADD COLUMN IF NOT EXISTS "escribana" TEXT;

-- Verificar que se agregó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Auto' AND column_name = 'escribana';
```

### Paso 3: Registrar la migración en Prisma

```sql
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
    gen_random_uuid(),
    'e5d8b8f3c2a1d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    NOW(),
    '20250103000000_add_escribana_to_auto',
    NULL,
    NULL,
    NOW(),
    1
)
ON CONFLICT (migration_name) DO NOTHING;
```

---

## 🔍 Verificación

Después de aplicar la migración, verifica que funcione:

1. Ve a la aplicación en Vercel
2. Intenta crear un nuevo auto
3. Llena todos los campos incluyendo "Escribana"
4. Debería guardarse sin errores

---

## 📝 Script Automático Disponible

También puedes usar el script PowerShell incluido:

```powershell
# Primero configura tu DATABASE_URL
$env:DATABASE_URL="tu_url_aqui"

# Luego ejecuta el script
.\aplicar-migraciones.ps1
```

---

## ⚠️ Nota Importante

Después de aplicar la migración en producción, asegúrate de que Vercel redeploy la aplicación para que use el schema actualizado. Puedes hacer un redeploy desde el Dashboard de Vercel o haciendo un nuevo push al repositorio.

---

## 🐛 Si el problema persiste

Si después de aplicar la migración sigues viendo el error:

1. Verifica que la migración se aplicó correctamente:
   ```sql
   SELECT * FROM "_prisma_migrations" WHERE migration_name = '20250103000000_add_escribana_to_auto';
   ```

2. Verifica que la columna existe:
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'Auto';
   ```

3. Haz un redeploy en Vercel:
   - Ve a Deployments → último deployment → "Redeploy"
