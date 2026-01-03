# 🔧 Solución de Problemas: Login de Cliente

## ❌ Problema: "No me deja iniciar sesión como cliente"

### Paso 1: Verificar que el cliente tenga un auto "financiado"

**Esto es lo MÁS IMPORTANTE** ⚠️

1. Inicia sesión como **admin** o **empleado**
2. Ve a la sección de **Autos**
3. Busca el auto del cliente
4. Verifica que el **Estado** del auto sea: **"financiado"**

Si el auto está como "disponible" o "vendido", el cliente NO podrá iniciar sesión.

**Cómo solucionarlo:**
1. Haz clic en "Editar" en el auto
2. Cambia el Estado a "financiado"
3. Guarda los cambios
4. Ahora el cliente podrá iniciar sesión

---

### Paso 2: Verificar las credenciales del cliente

El cliente debe usar:
- **Usuario**: Su número de cédula (8 dígitos, sin puntos ni guiones)
- **Contraseña**: La contraseña que recibió por WhatsApp al crear su cuenta

**Ejemplo:**
```
Usuario: 12345678
Contraseña: Abc12XyZ (la que se generó automáticamente)
```

---

### Paso 3: Verificar si el cliente tiene usuario creado

Esto se hace automáticamente al crear el cliente, pero si hay un problema:

1. Ve a la sección de **Clientes**
2. Verifica que el cliente esté en la lista
3. Si el cliente NO aparece, créalo nuevamente

---

### Paso 4: Revisar los logs del backend

Si el cliente sigue sin poder iniciar sesión, revisa los logs del servidor backend:

1. Abre la terminal donde está corriendo el backend (API)
2. Intenta hacer login con el cliente
3. Busca mensajes como estos:

```
🔐 Intentando login de cliente con cédula: 12345678
👤 Cliente encontrado: Juan Pérez (ID: 1)
🔍 Cliente tiene usuario: SÍ
🚗 Autos financiados: 0  ← ⚠️ PROBLEMA AQUÍ
```

Si dice "Autos financiados: 0", ese es el problema. El auto no está en estado "financiado".

---

## 🎯 Solución Rápida (Más Común)

**El 90% de los problemas se solucionan así:**

1. Ve a **Autos** (como admin/empleado)
2. Busca el auto del cliente
3. Haz clic en **"Editar"**
4. Cambia el **Estado** a **"financiado"**
5. Guarda
6. El cliente ya puede iniciar sesión ✅

---

## 📊 Estados de Autos y Login

| Estado del Auto | ¿Cliente puede iniciar sesión? |
|----------------|-------------------------------|
| **financiado** | ✅ SÍ - Plan de cuotas activo |
| disponible     | ❌ NO - Auto en stock         |
| vendido        | ❌ NO - Plan finalizado       |

---

## ✅ Confirmación de que todo funciona

Para verificar que el login funciona correctamente:

1. Crea un cliente de prueba
2. Asígnale un auto con estado "financiado"
3. Guarda la contraseña que se generó (se muestra solo una vez)
4. Envía las credenciales al cliente por WhatsApp
5. El cliente debe poder iniciar sesión con:
   - Usuario: Su cédula (8 dígitos)
   - Contraseña: La que recibió por WhatsApp

---

## 🔐 Sobre las Contraseñas

- ✅ Las contraseñas se guardan de forma **permanente**
- ✅ NO se regeneran cada vez
- ✅ Se muestran **solo UNA VEZ** al crear el cliente
- ✅ El admin/empleado **debe enviarlas** por WhatsApp inmediatamente
- ⚠️ Si el cliente pierde su contraseña, deberás resetearla manualmente en la base de datos

---

## 🆘 Si nada funciona

1. Verifica que el backend esté corriendo (terminal con el API)
2. Verifica que la base de datos esté conectada
3. Revisa los logs del backend para el mensaje de error exacto
4. Contacta al soporte técnico (botón en la sidebar)

---

## 📝 Checklist de Verificación

Antes de decir que "no funciona", verifica:

- [ ] ¿El cliente existe en la sección "Clientes"?
- [ ] ¿El cliente tiene al menos un auto asignado?
- [ ] ¿El auto está en estado "financiado" (NO "disponible" ni "vendido")?
- [ ] ¿Estás usando la cédula correcta (8 dígitos)?
- [ ] ¿Estás usando la contraseña exacta que se generó?
- [ ] ¿El backend está corriendo sin errores?

Si respondiste "SÍ" a todo y sigue sin funcionar, revisa los logs del backend.

