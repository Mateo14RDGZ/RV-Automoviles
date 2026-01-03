# Sistema de Login de Clientes

## Cómo Funciona

### 1. Creación de Cliente

Cuando el **admin o empleado** crea un nuevo cliente:

1. ✅ Se genera automáticamente una **contraseña aleatoria de 8 caracteres**
2. ✅ La contraseña se **guarda hasheada (encriptada)** en la base de datos de forma **PERMANENTE**
3. ✅ Se crea automáticamente un **usuario asociado al cliente**
4. ✅ La contraseña **SOLO se muestra UNA VEZ** al momento de crear el cliente
5. ✅ El admin/empleado **debe enviar** esta contraseña al cliente por WhatsApp

### 2. Login de Cliente

Para que un cliente pueda iniciar sesión debe cumplir **TODOS** estos requisitos:

#### ✅ Requisitos para Login:

1. **Tener un usuario creado**: Se crea automáticamente al crear el cliente
2. **Tener al menos un auto en estado "financiado"**: El cliente debe tener un plan de cuotas activo
3. **Usar sus credenciales correctas**:
   - **Usuario**: Su número de cédula (8 dígitos)
   - **Contraseña**: La contraseña que recibió por WhatsApp al crear su cuenta

#### ❌ Razones por las que NO puede iniciar sesión:

1. **"Credenciales inválidas"**:
   - La cédula no existe en el sistema
   - La contraseña es incorrecta
   - No tiene usuario asociado (error de sistema)

2. **"No tienes un plan de cuotas activo"**:
   - No tiene autos asignados
   - Sus autos están en estado "disponible" o "vendido" (no "financiado")

### 3. Estados de Autos

Los clientes **SOLO** pueden ver sus cuotas si tienen autos en estado:
- ✅ **"financiado"**: Plan de cuotas activo

Los clientes **NO** pueden iniciar sesión si sus autos están:
- ❌ **"disponible"**: Auto en stock, sin asignar
- ❌ **"vendido"**: Plan de cuotas finalizado, auto vendido completamente

### 4. Contraseñas son PERMANENTES

⚠️ **IMPORTANTE**: Las contraseñas generadas son **PERMANENTES** y se guardan en la base de datos.

- ✅ No se regeneran cada vez
- ✅ No caducan
- ✅ Se mantienen hasta que se modifiquen manualmente
- ⚠️ Solo se muestran UNA VEZ al crear el cliente

### 5. Diagnóstico de Problemas

Si un cliente no puede iniciar sesión, verificar:

#### Paso 1: ¿El cliente existe?
```sql
SELECT * FROM "Cliente" WHERE cedula = '12345678';
```

#### Paso 2: ¿Tiene usuario asociado?
```sql
SELECT c.nombre, c.cedula, u.email, u.rol 
FROM "Cliente" c
LEFT JOIN "Usuario" u ON u."clienteId" = c.id
WHERE c.cedula = '12345678';
```

#### Paso 3: ¿Tiene autos financiados?
```sql
SELECT a.marca, a.modelo, a.estado, c.nombre
FROM "Auto" a
JOIN "Cliente" c ON a."clienteId" = c.id
WHERE c.cedula = '12345678' AND a.estado = 'financiado';
```

#### Paso 4: Verificar logs del backend
El backend ahora muestra logs detallados:
```
🔐 Intentando login de cliente con cédula: 12345678
👤 Cliente encontrado: Juan Pérez (ID: 1)
🔍 Cliente tiene usuario: SÍ
🚗 Autos financiados: 1
🔑 Verificando contraseña...
🔑 Contraseña válida: SÍ
```

### 6. Solución de Problemas Comunes

#### Problema: "Credenciales inválidas"
**Causa**: Contraseña incorrecta o cliente no existe
**Solución**: 
- Verificar que el cliente esté usando su cédula correcta
- Verificar que esté usando la contraseña que recibió por WhatsApp
- Si perdió la contraseña, contactar al administrador

#### Problema: "No tienes un plan de cuotas activo"
**Causa**: No tiene autos con estado "financiado"
**Solución**:
1. Verificar en el panel de admin que el auto esté en estado "financiado"
2. Si el auto está como "disponible", cambiarlo a "financiado"
3. Si el auto está como "vendido", el cliente ya finalizó su plan de cuotas

#### Problema: Cliente olvidó su contraseña
**Solución actual**: 
- No hay sistema de recuperación automática
- El administrador debe resetear manualmente la contraseña en la base de datos
- Se puede implementar un sistema de reseteo si se requiere

### 7. Seguridad

- ✅ Las contraseñas se guardan **hasheadas con bcrypt** (no se pueden ver en texto plano)
- ✅ Los tokens JWT expiran en 24 horas
- ✅ Los clientes solo pueden ver sus propias cuotas
- ✅ Se requiere autenticación para todas las operaciones

### 8. Recordar Sesión

Los clientes pueden marcar "Mantener sesión iniciada" al hacer login:
- ✅ **Marcado**: La sesión se guarda en `localStorage` (permanente)
- ❌ **No marcado**: La sesión se guarda en `sessionStorage` (se borra al cerrar navegador)

---

## Para Desarrolladores

### Crear un cliente con contraseña manual (SQL):
```sql
-- 1. Crear el cliente
INSERT INTO "Cliente" (nombre, cedula, telefono, direccion, email, activo, "createdAt", "updatedAt")
VALUES ('Nombre Cliente', '12345678', '099123456', 'Dirección', 'email@ejemplo.com', true, NOW(), NOW())
RETURNING id;

-- 2. Crear el usuario (reemplazar CLIENTE_ID con el ID del paso 1)
-- La contraseña 'MiPassword123' será hasheada
INSERT INTO "Usuario" (email, password, rol, "clienteId", "createdAt", "updatedAt")
VALUES (
  'email@ejemplo.com',
  '$2a$10$hashedPasswordAquí', -- Usar bcrypt.hash('MiPassword123', 10)
  'cliente',
  CLIENTE_ID,
  NOW(),
  NOW()
);
```

### Verificar contraseña en Node.js:
```javascript
const bcrypt = require('bcryptjs');
const password = 'MiPassword123';
const hash = await bcrypt.hash(password, 10);
console.log('Hash:', hash);

// Verificar
const isValid = await bcrypt.compare('MiPassword123', hash);
console.log('Válida:', isValid); // true
```

