# 🗑️ Script para Limpiar Base de Datos

## ⚠️ ADVERTENCIA IMPORTANTE

Este script **ELIMINA TODOS LOS DATOS** de la base de datos de forma **PERMANENTE**.

Solo úsalo si quieres:
- Resetear el sistema completamente
- Empezar con una base de datos limpia
- Probar el nuevo sistema de contraseñas desde cero

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

1. ✅ **Desactiva restricciones de claves foráneas** temporalmente
2. 🗑️ **Elimina datos de todas las tablas** en el orden correcto:
   - ComprobantePago (depende de Pago)
   - Pago (depende de Auto)
   - Permuta (depende de Cliente y Auto)
   - Auto (depende de Cliente)
   - Usuario (vinculados a clientes)
   - Cliente
   - Usuario (admin y empleado)
3. ♻️ **Reinicia las secuencias de IDs** (los IDs volverán a empezar desde 1)
4. ✅ **Reactiva las restricciones de claves foráneas**

## 🔄 Después de Limpiar

### Paso 1: Crear Usuarios Admin y Empleado

Necesitarás recrear los usuarios administrativos. Usa el script `crear-empleado.sql` o ejecuta:

```sql
-- Crear Admin
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES (
  'admin@demo.com',
  '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH',  -- Reemplaza con hash real
  'admin',
  NOW(),
  NOW()
);

-- Crear Empleado
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES (
  'empleado@demo.com',
  '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH',  -- Reemplaza con hash real
  'empleado',
  NOW(),
  NOW()
);
```

> **Nota**: Puedes usar el script `api/generate-empleado.js` para generar el hash correcto de la contraseña.

### Paso 2: Verificar el Sistema

1. Intenta iniciar sesión con las credenciales de admin
2. Crea un nuevo cliente
3. Verifica que el modal de WhatsApp aparezca con las credenciales
4. Intenta iniciar sesión como cliente con las credenciales generadas

## 🔒 Seguridad

- ⚠️ **Nunca ejecutes este script en producción sin un backup**
- ⚠️ **Todos los datos se perderán permanentemente**
- ⚠️ **No hay forma de recuperar los datos después de ejecutar este script**

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

Ejecuta este query para verificar que todas las tablas están vacías:

```sql
SELECT 
  'Usuario' as tabla, COUNT(*) as registros FROM "Usuario"
UNION ALL
SELECT 'Cliente', COUNT(*) FROM "Cliente"
UNION ALL
SELECT 'Auto', COUNT(*) FROM "Auto"
UNION ALL
SELECT 'Pago', COUNT(*) FROM "Pago"
UNION ALL
SELECT 'Permuta', COUNT(*) FROM "Permuta"
UNION ALL
SELECT 'ComprobantePago', COUNT(*) FROM "ComprobantePago";
```

Todas las tablas deberían mostrar `0` registros.

## 📞 Soporte

Si tienes problemas al ejecutar el script:
1. Verifica que tienes permisos de escritura en la base de datos
2. Asegúrate de estar conectado a la base de datos correcta
3. Revisa los logs de errores de PostgreSQL

