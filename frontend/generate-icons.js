import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sizes = [
  { file: 'icon-72.png', size: 72 },
  { file: 'icon-96.png', size: 96 },
  { file: 'icon-128.png', size: 128 },
  { file: 'icon-144.png', size: 144 },
  { file: 'icon-152.png', size: 152 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }
];

async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');

  for (const { file, size } of sizes) {
    const svgPath = path.join(__dirname, 'public', file);
    const pngPath = svgPath; // Sobreescribir el mismo archivo
    
    try {
      const svgBuffer = fs.readFileSync(svgPath);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath + '.tmp');
      
      // Reemplazar el SVG con el PNG
      fs.unlinkSync(svgPath);
      fs.renameSync(pngPath + '.tmp', pngPath);
      
      console.log(`✅ ${file} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error generando ${file}:`, error.message);
    }
  }
  
  console.log('\n✨ ¡Iconos generados exitosamente!');
}

generateIcons();
