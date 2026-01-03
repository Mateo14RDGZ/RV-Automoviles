import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamaños para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Rutas
const sourceImage = path.join(__dirname, 'public', 'logo-nicolas-tejera.png');
const outputDir = path.join(__dirname, 'public');

console.log('🎨 Regenerando iconos PWA MÁS GRANDES (95% del canvas)...\n');

// Verificar que el logo existe
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Error: No se encontró logo-nicolas-tejera.png');
  process.exit(1);
}

async function generateIcon(size) {
  const outputFile = path.join(outputDir, `icon-${size}.png`);
  
  try {
    // Logo ocupa 95% del espacio (mucho más grande que el 80% anterior)
    const logoSize = Math.floor(size * 0.95);
    
    // Crear canvas blanco
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(sourceImage)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer(),
      gravity: 'center'
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputFile);
    
    console.log(`✅ Generado: icon-${size}.png (logo al 95% - muy grande)`);
    return true;
  } catch (error) {
    console.error(`❌ Error generando icon-${size}.png:`, error.message);
    return false;
  }
}

async function generateAppleIcon() {
  const outputFile = path.join(outputDir, 'apple-touch-icon.png');
  
  try {
    // Apple Touch Icon 180x180 con logo al 95%
    const logoSize = Math.floor(180 * 0.95);
    
    await sharp({
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(sourceImage)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer(),
      gravity: 'center'
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputFile);
    
    console.log('✅ Generado: apple-touch-icon.png (180x180 - logo al 95%)');
    return true;
  } catch (error) {
    console.error('❌ Error generando apple-touch-icon.png:', error.message);
    return false;
  }
}

// Ejecutar generación
(async () => {
  try {
    console.log('📱 Generando iconos PWA más grandes...\n');
    const results = await Promise.all(sizes.map(size => generateIcon(size)));
    
    console.log('\n🍎 Generando Apple Touch Icon más grande...');
    await generateAppleIcon();
    
    const successCount = results.filter(r => r).length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Completado: ${successCount}/${sizes.length} iconos PWA regenerados`);
    console.log('✅ apple-touch-icon.png regenerado');
    console.log('\n🎉 Los iconos ahora son 95% del tamaño (antes eran 80%)');
    console.log('💡 Los logos se verán mucho más grandes al instalar la app');
    
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
})();

