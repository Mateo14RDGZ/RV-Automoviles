import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, 'public', 'assets', 'logo-rv.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  console.log('🎨 Generando íconos PWA desde logo-rv.png...\n');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}.png`);
    
    try {
      // Hacer el logo lo más grande posible (95% del ícono)
      const logoSize = Math.floor(size * 0.95); // 95% del tamaño total
      const padding = Math.floor((size - logoSize) / 2);
      
      await sharp(inputFile)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 248, g: 249, b: 250, alpha: 1 } // Color de fondo del logo
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 248, g: 249, b: 250 } // Mismo color de fondo
        })
        .flatten({ background: { r: 248, g: 249, b: 250 } })
        .png({ compressionLevel: 9, quality: 100 })
        .toFile(outputFile);
      
      console.log(`✅ Generado: icon-${size}.png (logo ${logoSize}x${logoSize} - ${Math.floor((logoSize/size)*100)}%)`);
    } catch (error) {
      console.error(`❌ Error generando icon-${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 ¡Íconos generados exitosamente!');
}

generateIcons().catch(console.error);
