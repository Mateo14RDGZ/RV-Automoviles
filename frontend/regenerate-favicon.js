import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceImage = path.join(__dirname, 'public', 'logo-nicolas-tejera.png');
const outputDir = path.join(__dirname, 'public');

console.log('🌐 Regenerando favicon con mejor calidad...\n');

async function generateBetterFavicon() {
  try {
    // Generar favicon.png de 64x64 (mejor calidad)
    await sharp(sourceImage)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(outputDir, 'favicon.png'));
    
    console.log('✅ Generado: favicon.png (64x64 - alta calidad)');

    // Generar favicon-16x16.png
    await sharp(sourceImage)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    
    console.log('✅ Generado: favicon-16x16.png');

    // Generar favicon-32x32.png
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    console.log('✅ Generado: favicon-32x32.png');

    console.log('\n🎉 Favicon actualizado con mejor calidad!');
    console.log('💡 Recuerda hacer Ctrl+F5 en el navegador para ver los cambios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateBetterFavicon();

