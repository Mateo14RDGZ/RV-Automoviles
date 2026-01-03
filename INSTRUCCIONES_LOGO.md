# Instrucciones para Agregar el Logo de Nicolas Tejera Automoviles

## 📋 Paso a Paso

### 1. **Guardar el logo proporcionado**

Guarda la imagen del logo que te proporcioné con el nombre exacto:
```
logo-nicolas-tejera.png
```

### 2. **Colocar el logo en la carpeta correcta**

Coloca el archivo en la siguiente ubicación:
```
GestionAutomotoraEjemplo/frontend/public/logo-nicolas-tejera.png
```

### 3. **Verificar la implementación**

Una vez colocado el logo, se mostrará automáticamente en:

✅ **Pantalla de Login** - En el centro, reemplazando el emoji del auto  
✅ **Sidebar (Menú lateral)** - En la parte superior, arriba de "Mi Escritorio"  
✅ **PDFs Exportados** - En el encabezado de todos los reportes descargables

## 🔧 Características Técnicas

### Formato recomendado:
- **Tipo**: PNG con fondo transparente
- **Dimensiones sugeridas**: 400x200px (proporción 2:1)
- **Tamaño máximo**: 500KB

### Fallback automático:
Si el logo no se encuentra o no carga correctamente, el sistema mostrará automáticamente el emoji del auto (🚗) como respaldo.

## 📱 Visualización

### En el Login:
- Tamaño: 96px de alto
- Centrado en la pantalla
- Sobre el título "Sistema de Gestión"

### En el Sidebar:
- Tamaño: 64px de alto (desktop), 48px (mobile)
- Centrado en el header azul
- Sobre el texto "Nicolas Tejera Automoviles"

### En los PDFs:
- Tamaño: 35x17mm
- Posición: Esquina superior izquierda
- Acompañado del título del reporte

## 🎨 Ajustes Adicionales

Si necesitas ajustar el tamaño del logo después de colocarlo:

**Login.jsx** (línea ~63):
```jsx
className="h-24 w-auto object-contain"
```

**Layout.jsx** (línea ~68 y ~154):
```jsx
className="h-16 w-auto mx-auto object-contain mb-2"  // Desktop
className="h-12 w-auto mx-auto object-contain mb-1"  // Mobile
```

**pdfHelper.js** (línea ~10):
```javascript
export const addLogoToPDF = async (doc, x = 14, y = 10, width = 40, height = 20)
```

## ✅ Verificación

Para verificar que el logo se muestra correctamente:

1. **Login**: Refresca la página de login (Ctrl+F5)
2. **Sidebar**: Inicia sesión y verifica el menú lateral
3. **PDFs**: Ve a Reportes y descarga cualquier PDF

## 🆘 Solución de Problemas

### El logo no aparece:
1. Verifica que el archivo se llame exactamente `logo-nicolas-tejera.png`
2. Verifica que esté en `frontend/public/`
3. Limpia la caché del navegador (Ctrl+Shift+Delete)
4. Reinicia el servidor de desarrollo si es necesario

### El logo se ve pixelado:
- Usa una imagen de mayor resolución (mínimo 400x200px)
- Asegúrate de que sea PNG de alta calidad

### El logo no aparece en los PDFs:
- Verifica que el archivo sea PNG (no JPG o WebP)
- Asegúrate de que tenga fondo transparente o blanco

---

**Nota**: Los cambios ya están implementados en el código. Solo necesitas colocar el archivo de imagen en la ubicación correcta.

