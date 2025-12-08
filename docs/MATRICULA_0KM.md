# Actualización: Sistema de Matrículas para Autos 0km

## 🔄 Cambios Implementados

### Frontend (`frontend/src/pages/Autos.jsx`)

1. **Campo de matrícula ahora es opcional**
   - Removido el atributo `required`
   - Placeholder: "Dejar vacío para autos 0km"
   - Mensaje de ayuda indicando que sin matrícula se mostrará como "0km"

2. **Visualización mejorada**
   - Los autos con matrícula "0km" se muestran con un badge verde distintivo
   - Tanto en vista desktop (tabla) como mobile (cards)

### Backend (`api/index.js`)

1. **Validación de matrícula en POST `/api/autos`**
   - Si el campo matrícula está vacío → se asigna automáticamente "0km"
   - Si tiene matrícula → se valida que no esté duplicada
   - Permite múltiples autos con "0km"

2. **Validación de matrícula en PUT `/api/autos/:id`**
   - Misma lógica que en POST
   - Al editar, valida que no se duplique con otros autos (excepto el mismo)

### Base de Datos (`api/prisma/schema.prisma`)

1. **Removida restricción `@unique` de matrícula**
   - Antes: `matricula String @unique`
   - Ahora: `matricula String`
   - Permite múltiples registros con "0km"

## 🚀 Aplicar Cambios en Producción

### Opción 1: Aplicar Migración Local

```bash
# Desde la raíz del proyecto
cd api

# Aplicar migración
npx prisma migrate deploy

# Regenerar cliente
npx prisma generate
```

### Opción 2: En Vercel (Automático)

La migración se aplicará automáticamente al hacer push:

```bash
git add .
git commit -m "feat: permitir múltiples autos 0km y validar matrículas únicas"
git push origin main
```

Vercel ejecutará las migraciones durante el deploy.

## ✅ Comportamiento Esperado

### Crear Auto Sin Matrícula

```javascript
// Request
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "anio": 2024,
  "matricula": "",  // vacío
  "precio": 25000
}

// Response - Se guarda como "0km"
{
  "id": 1,
  "marca": "Toyota",
  "modelo": "Corolla",
  "matricula": "0km",  // convertido automáticamente
  ...
}
```

### Crear Auto Con Matrícula

```javascript
// Request
{
  "marca": "Honda",
  "modelo": "Civic",
  "anio": 2023,
  "matricula": "ABC123",
  "precio": 22000
}

// Response - Se valida unicidad
{
  "id": 2,
  "marca": "Honda",
  "modelo": "Civic",
  "matricula": "ABC123",
  ...
}
```

### Intentar Duplicar Matrícula

```javascript
// Request con matrícula duplicada
{
  "matricula": "ABC123"  // ya existe
}

// Response - Error 400
{
  "error": "Ya existe un auto con esta matrícula"
}
```

### Múltiples Autos 0km (Permitido)

```javascript
// Se pueden crear múltiples autos sin matrícula
Auto 1: { "matricula": "0km" }  // ✅ Permitido
Auto 2: { "matricula": "0km" }  // ✅ Permitido
Auto 3: { "matricula": "0km" }  // ✅ Permitido
```

## 🎨 Visualización en la UI

### Vista Desktop
```
| Vehículo        | Matrícula | ... |
|-----------------|-----------|-----|
| Toyota Corolla  | [0km]     | ... |  ← Badge verde
| Honda Civic     | ABC123    | ... |
```

### Vista Mobile
```
┌─────────────────────┐
│ 🚗 Toyota Corolla   │
│ [0km]               │  ← Badge verde
│ Año: 2024           │
│ Precio: $25,000     │
└─────────────────────┘
```

## 🐛 Troubleshooting

### Error: "Unique constraint failed on the fields: (`matricula`)"

**Causa**: La migración aún no se aplicó en la base de datos.

**Solución**:
```bash
cd api
npx prisma migrate deploy
```

### Error: "Ya existe un auto con esta matrícula"

**Causa**: Intentando crear/editar un auto con una matrícula que ya existe.

**Solución**: 
- Usar otra matrícula
- O dejar el campo vacío para que sea "0km"

## 📝 Notas Importantes

1. **La validación es en el backend**: El frontend permite cualquier valor, pero el backend valida
2. **"0km" es un valor especial**: No se valida como duplicado
3. **Matrículas se normalizan**: Se hace `.trim()` para remover espacios
4. **Case sensitive**: "ABC123" es diferente de "abc123"

## 🔄 Revertir Cambios (Si es necesario)

Si necesitas volver al sistema anterior:

```bash
cd api
npx prisma migrate dev --name revert_matricula_unique
```

Y editar `schema.prisma`:
```prisma
matricula String @unique  // Restaurar @unique
```

## 📊 Migración Aplicada

**Archivo**: `api/prisma/migrations/20241208000000_remove_matricula_unique/migration.sql`

```sql
-- Remover restricción UNIQUE de la columna matricula
DROP INDEX IF EXISTS "Auto_matricula_key";
```

---

**Última actualización**: Diciembre 8, 2025  
**Versión**: 1.0
