// Script para generar íconos PWA básicos
// Este script crea íconos SVG simples que se pueden usar temporalmente

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  
  <!-- Letra RV -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.35}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >RV</text>
  
  <!-- Texto pequeño "Autos" -->
  <text 
    x="50%" 
    y="${size * 0.75}" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.12}" 
    font-weight="normal" 
    fill="white" 
    text-anchor="middle" 
    opacity="0.9"
  >AUTOS</text>
</svg>
`.trim();

const publicDir = path.join(__dirname, 'public');

// Crear directorio public si no existe
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generar cada tamaño de ícono
sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}.svg`;
  const filepath = path.join(publicDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✓ Creado: ${filename}`);
});

console.log('\n✨ Íconos SVG generados exitosamente');
console.log('📝 Nota: Para producción, convierte estos SVG a PNG usando un convertidor online');
console.log('🔗 Recomendado: https://svgtopng.com/');
