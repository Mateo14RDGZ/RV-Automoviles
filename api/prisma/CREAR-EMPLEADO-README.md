# 🔧 SOLUCIÓN: Crear Usuario Empleado

## ❌ Problema
El usuario empleado **NO existe** en la base de datos, por lo que no se puede iniciar sesión con las credenciales:
- Email: `empleado@demo.com`
- Contraseña: `admin123`

## ✅ Solución

### Opción 1: Ejecutar SQL en Neon Dashboard (RECOMENDADO)

1. **Ir a Neon Dashboard**: [https://console.neon.tech](https://console.neon.tech)

2. **Seleccionar tu proyecto y base de datos**

3. **Abrir SQL Editor** (pestaña "SQL Editor" en el menú lateral)

4. **Copiar y pegar** el siguiente SQL:

```sql
-- Eliminar usuario empleado existente si hay alguno
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Crear nuevo usuario empleado
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES ('empleado@demo.com', '$2a$10$za6C0z3r1/zSTmZvppv6m.utKMo2E0TGGRuF6aszEA7jVlBGB7XS2', 'empleado', NOW(), NOW());

-- Verificar
SELECT id, email, rol, "createdAt", "updatedAt" FROM "Usuario" WHERE email = 'empleado@demo.com';
```

5. **Hacer clic en "Run"** para ejecutar el SQL

6. **Verificar el resultado**: Deberías ver una fila con el usuario empleado creado

### Opción 2: Usar archivo SQL

Alternativamente, puedes ejecutar el archivo `crear-empleado.sql` que contiene el mismo SQL con comentarios detallados.

## 🎯 Credenciales del Empleado

Una vez ejecutado el SQL, podrás iniciar sesión con:

```
📧 Email: empleado@demo.com
🔐 Contraseña: admin123
👤 Rol: empleado
```

## 📝 Permisos del Empleado

El empleado tiene acceso limitado:

✅ **TIENE ACCESO A:**
- Autos (ver, crear, editar, eliminar)
- Clientes (ver, crear, editar, eliminar)
- Pagos (ver, registrar, generar cuotas)
- Ver próximos vencimientos
- Gestionar comprobantes de pago

❌ **NO TIENE ACCESO A:**
- Dashboard (estadísticas monetarias)
- Reportes (exportación de PDFs)
- Información financiera sensible

## 🔍 Verificar que Funciona

1. Ejecuta el SQL en Neon
2. Ve a la aplicación web
3. Click en "Personal Administrativo"
4. Ingresa:
   - Email: `empleado@demo.com`
   - Contraseña: `admin123`
5. ¡Deberías poder ingresar! 🎉

## 📚 Nota para el Seed

El archivo `seed.js` ya fue actualizado para incluir el empleado en futuras instalaciones desde cero. Sin embargo, como la base de datos ya tiene datos, el seed no se ejecuta automáticamente (para proteger los datos existentes).

Por eso es necesario ejecutar el SQL manualmente esta única vez.

