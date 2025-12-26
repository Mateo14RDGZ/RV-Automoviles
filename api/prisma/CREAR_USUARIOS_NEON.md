# 🔐 Crear Usuarios Administrativos en Neon

Esta guía te ayudará a crear usuarios administrativos y de empleados en tu base de datos Neon.

---

## 📋 Opción 1: Usar el Script SQL Directo (Rápido)

El archivo `create-users-neon.sql` contiene el SQL listo para ejecutar, pero **necesitas generar los hashes de contraseñas primero**.

### Pasos:

1. **Genera los hashes de contraseñas**:
   - Ve a: https://bcrypt-generator.com/
   - Para cada contraseña, ingresa:
     - **Contraseña**: Tu contraseña (ej: `Admin123!`)
     - **Rounds**: `10`
     - Click en "Generate"
     - Copia el hash generado

2. **Actualiza el archivo SQL**:
   - Abre `create-users-neon.sql`
   - Reemplaza los hashes de ejemplo con los que generaste

3. **Ejecuta en Neon**:
   - Ve al SQL Editor de Neon
   - Copia y pega el SQL actualizado
   - Ejecuta el script

---

## 📋 Opción 2: Usar el Script Node.js (Recomendado)

Este método genera automáticamente los hashes correctos.

### Pasos:

1. **Navega a la carpeta api**:
   ```bash
   cd GestionAutomotoraEjemplo/api
   ```

2. **Instala dependencias (si no están instaladas)**:
   ```bash
   npm install
   ```

3. **Ejecuta el script generador**:
   ```bash
   node generate-users-sql.js
   ```

4. **Copia el SQL generado**:
   - El script mostrará el SQL completo con hashes válidos
   - Copia todo el SQL generado

5. **Ejecuta en Neon**:
   - Ve al SQL Editor de Neon
   - Pega el SQL copiado
   - Ejecuta el script

---

## 📋 Opción 3: Generar Hashes Manualmente con Node.js

Si quieres generar hashes personalizados:

```bash
# Generar hash para una contraseña específica
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu-password-aqui', 10).then(h => console.log(h));"
```

Luego usa el hash generado en el INSERT SQL.

---

## 👤 Usuarios que se Crean

### 1. Administrador Principal
- **Email**: `admin@quesadaautomoviles.com`
- **Password**: `Admin123!` (cambiar después del primer login)
- **Rol**: `admin`
- **Permisos**: Acceso completo a todo el sistema

### 2. Administrador Demo (compatibilidad)
- **Email**: `admin@demo.com`
- **Password**: `admin123` (cambiar después del primer login)
- **Rol**: `admin`
- **Permisos**: Acceso completo a todo el sistema

### 3. Empleado
- **Email**: `empleado@quesadaautomoviles.com`
- **Password**: `Empleado123!` (cambiar después del primer login)
- **Rol**: `empleado`
- **Permisos**:
  - ✅ Autos (ver, crear, editar, eliminar)
  - ✅ Clientes (ver, crear, editar, eliminar)
  - ✅ Pagos (ver, registrar, generar cuotas)
  - ❌ Dashboard (NO tiene acceso)
  - ❌ Reportes (NO tiene acceso)

---

## ✅ Verificar Usuarios Creados

Después de ejecutar el SQL, verifica con esta query:

```sql
SELECT 
    id, 
    email, 
    rol, 
    "createdAt",
    CASE rol
        WHEN 'admin' THEN '✅ Acceso completo'
        WHEN 'empleado' THEN '⚠️ Acceso limitado'
        WHEN 'cliente' THEN '👤 Acceso a su información'
        ELSE '❓ Rol desconocido'
    END as permisos
FROM "Usuario" 
ORDER BY 
    CASE rol 
        WHEN 'admin' THEN 1 
        WHEN 'empleado' THEN 2 
        WHEN 'cliente' THEN 3 
        ELSE 4 
    END,
    email;
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**:
- Cambia las contraseñas después del primer login
- No uses contraseñas simples en producción
- Considera usar contraseñas más seguras que las de ejemplo
- Los hashes en el SQL son ejemplos - genera tus propios hashes

---

## 🐛 Solución de Problemas

### Error: "duplicate key value violates unique constraint"
- El usuario ya existe. Elimínalo primero o usa `ON CONFLICT DO NOTHING` (ya incluido en el SQL)

### Error: "invalid input syntax for type integer"
- Verifica que las columnas `createdAt` y `updatedAt` usen `NOW()` correctamente

### Error: "column does not exist"
- Asegúrate de haber ejecutado primero el script `create-tables-neon.sql`

---

## 📚 Archivos Relacionados

- `create-tables-neon.sql` - Script para crear las tablas (ejecutar primero)
- `create-users-neon.sql` - Script para crear usuarios (este archivo)
- `generate-users-sql.js` - Script Node.js para generar SQL con hashes válidos

