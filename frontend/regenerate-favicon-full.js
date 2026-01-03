import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceImage = path.join(__dirname, 'public', 'logo-nicolas-tejera.png');
const outputDir = path.join(__dirname, 'public');

console.log('🌐 Regenerando favicon SIN barras blancas y MÁS GRANDE...\n');

async function generateFullSizeFavicon() {
  try {
    // Generar favicon.png de 64x64 ocupando TODO el espacio (sin barras)
    await sharp(sourceImage)
      .resize(64, 64, {
        fit: 'cover',  // Llenar todo el espacio sin barras
        position: 'center'
      })
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(path.join(outputDir, 'favicon.png'));
    
    console.log('✅ Generado: favicon.png (64x64 - SIN barras, ocupando todo el espacio)');

    // Generar favicon-16x16.png
    await sharp(sourceImage)
      .resize(16, 16, {
        fit: 'cover',
        position: 'center'
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    
    console.log('✅ Generado: favicon-16x16.png (sin barras)');

    // Generar favicon-32x32.png
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'cover',
        position: 'center'
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    console.log('✅ Generado: favicon-32x32.png (sin barras)');

    // Generar favicon-48x48.png (tamaño adicional más grande)
    await sharp(sourceImage)
      .resize(48, 48, {
        fit: 'cover',
        position: 'center'
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(outputDir, 'favicon-48x48.png'));
    
    console.log('✅ Generado: favicon-48x48.png (sin barras)');

    console.log('\n🎉 Favicon actualizado sin barras blancas y más grande!');
    console.log('💡 El logo ahora ocupa todo el espacio disponible');
    console.log('💡 Recuerda hacer Ctrl+Shift+Del y limpiar caché para ver los cambios');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateFullSizeFavicon();

