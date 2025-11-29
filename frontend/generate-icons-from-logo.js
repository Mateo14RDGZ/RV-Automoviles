import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'public', 'logo-rv-blue.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('🎨 Generando íconos PWA desde logo-rv-blue.png...\n');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}.png`);
    
    try {
      // El logo azul ya viene con su fondo, solo lo redimensionamos al tamaño completo
      const logoSize = size; // 100% del tamaño (el logo ya tiene su diseño completo)
      
      await sharp(inputFile)
        .resize(logoSize, logoSize, {
          fit: 'cover',
          position: 'center'
        })
        .flatten({ background: { r: 24, g: 144, b: 207 } })
        .png({ compressionLevel: 9, quality: 100 })
        .toFile(outputFile);
      
      console.log(`✅ Generado: icon-${size}.png (${logoSize}x${logoSize})`);
    } catch (error) {
      console.error(`❌ Error generando icon-${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 ¡Íconos generados exitosamente!');
}

generateIcons().catch(console.error);
