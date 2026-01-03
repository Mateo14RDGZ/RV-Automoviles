# 🗑️ Script para Limpiar Base de Datos

## ⚠️ ADVERTENCIA IMPORTANTE

Este script **ELIMINA TODOS LOS DATOS** excepto los usuarios **admin** y **empleado**.

Las tablas NO se eliminan, solo su contenido.

## ✅ ¿Qué se MANTIENE?

- ✅ Usuarios admin y empleado
- ✅ Todas las tablas de la base de datos
- ✅ Estructura de la base de datos

## 🗑️ ¿Qué se ELIMINA?

- ❌ Todos los clientes
- ❌ Todos los autos
- ❌ Todos los pagos
- ❌ Todas las permutas
- ❌ Todos los comprobantes de pago
- ❌ Usuarios vinculados a clientes

## 📋 Instrucciones de Uso

### Opción 1: Ejecutar en Neon Console (Recomendado)

1. **Accede a Neon Console**:
   - Ve a https://console.neon.tech
   - Inicia sesión con tu cuenta
   - Selecciona tu proyecto

2. **Abre SQL Editor**:
   - En el menú lateral, haz clic en "SQL Editor"
   - Se abrirá el editor de consultas

3. **Copia y Pega el Script**:
   - Abre el archivo `limpiar-base-datos.sql`
   - Copia TODO el contenido
   - Pégalo en el editor de Neon

4. **Ejecuta el Script**:
   - Haz clic en "Run" o presiona `Ctrl+Enter`
   - Espera a que termine (debe ser muy rápido)

5. **Verifica**:
   - Deberías ver que cada comando DELETE se ejecutó correctamente
   - Las secuencias se reiniciaron
   - La base de datos está completamente vacía

### Opción 2: Usando pgAdmin

1. Conecta pgAdmin a tu base de datos de Neon
2. Haz clic derecho en tu base de datos → "Query Tool"
3. Copia y pega el contenido de `limpiar-base-datos.sql`
4. Haz clic en el botón "Execute" (▶️)

### Opción 3: Desde línea de comandos

```bash
# Usando psql (asegúrate de tener la URL de conexión)
psql "postgresql://usuario:password@host/database?sslmode=require" -f limpiar-base-datos.sql
```

## 📝 Qué hace el Script

El script realiza las siguientes operaciones en orden:

1. 🗑️ **Elimina ComprobantePago** (todos los comprobantes)
2. 🗑️ **Elimina Pago** (todos los pagos)
3. 🗑️ **Elimina Permuta** (todas las permutas)
4. 🗑️ **Elimina Auto** (todos los autos)
5. 🗑️ **Elimina usuarios vinculados a clientes** (mantiene admin y empleado)
6. 🗑️ **Elimina Cliente** (todos los clientes)
7. ♻️ **Reinicia las secuencias de IDs** (los nuevos IDs empezarán desde 1)
8. ✅ **Muestra usuarios restantes** (verás admin y empleado)
9. 📊 **Muestra resumen** (conteo de registros por tabla)

## 🔄 Después de Limpiar

### ✅ Ya tienes Admin y Empleado

**No necesitas recrear nada**, los usuarios admin y empleado ya están en la base de datos.

Puedes iniciar sesión inmediatamente con:

**Admin:**
- Email: `admin@demo.com`
- Contraseña: `admin123`

**Empleado:**
- Email: `empleado@demo.com`
- Contraseña: `admin123`

### 🧪 Verificar el Sistema

1. Inicia sesión como admin o empleado
2. Crea un nuevo cliente
3. Verifica que el modal de WhatsApp aparezca con las credenciales
4. Intenta iniciar sesión como cliente con las credenciales generadas

## 🔒 Seguridad

- ⚠️ **Este script NO afecta a admin y empleado**
- ⚠️ **Todos los demás datos se perderán permanentemente**
- ⚠️ **No hay forma de recuperar los datos después de ejecutar este script**
- ✅ **Puedes volver a ejecutarlo cuantas veces quieras**

## 💡 Alternativa: Limpiar Solo Algunos Datos

Si solo quieres eliminar algunos datos específicos, puedes ejecutar comandos individuales:

```sql
-- Solo eliminar clientes y sus datos relacionados
DELETE FROM "ComprobantePago" WHERE "pagoId" IN (
  SELECT id FROM "Pago" WHERE "autoId" IN (
    SELECT id FROM "Auto" WHERE "clienteId" IS NOT NULL
  )
);
DELETE FROM "Pago" WHERE "autoId" IN (SELECT id FROM "Auto" WHERE "clienteId" IS NOT NULL);
DELETE FROM "Permuta";
DELETE FROM "Auto" WHERE "clienteId" IS NOT NULL;
DELETE FROM "Usuario" WHERE "clienteId" IS NOT NULL;
DELETE FROM "Cliente";

-- Solo eliminar autos sin clientes
DELETE FROM "Auto" WHERE "clienteId" IS NULL;
```

## ✅ Verificación Post-Limpieza

Ejecuta este query para verificar el resultado:

```sql
SELECT 
  'Usuario' as tabla, 
  COUNT(*) as registros,
  'Deben quedar 2 (admin y empleado)' as nota
FROM "Usuario"
UNION ALL
SELECT 'Cliente', COUNT(*), 'Debe ser 0' FROM "Cliente"
UNION ALL
SELECT 'Auto', COUNT(*), 'Debe ser 0' FROM "Auto"
UNION ALL
SELECT 'Pago', COUNT(*), 'Debe ser 0' FROM "Pago"
UNION ALL
SELECT 'Permuta', COUNT(*), 'Debe ser 0' FROM "Permuta"
UNION ALL
SELECT 'ComprobantePago', COUNT(*), 'Debe ser 0' FROM "ComprobantePago";
```

**Resultado esperado:**
- Usuario: 2 registros (admin y empleado)
- Todas las demás tablas: 0 registros

## 📞 Soporte

Si tienes problemas al ejecutar el script:
1. Verifica que tienes permisos de escritura en la base de datos
2. Asegúrate de estar conectado a la base de datos correcta
3. Revisa los logs de errores de PostgreSQL

