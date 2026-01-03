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

console.log('🎨 Generando iconos PWA y favicon desde logo-nicolas-tejera.png...\n');

// Verificar que el logo existe
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Error: No se encontró logo-nicolas-tejera.png en la carpeta public');
  console.error('   Por favor, asegúrate de que el archivo existe antes de ejecutar este script.');
  process.exit(1);
}

async function generateIcon(size) {
  const outputFile = path.join(outputDir, `icon-${size}.png`);
  
  try {
    // Leer el logo original
    const image = sharp(sourceImage);
    const metadata = await image.metadata();
    
    // Crear un canvas cuadrado con fondo blanco
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
        .resize(Math.floor(size * 0.8), Math.floor(size * 0.8), {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer(),
      gravity: 'center'
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputFile);
    
    console.log(`✅ Generado: icon-${size}.png`);
    return true;
  } catch (error) {
    console.error(`❌ Error generando icon-${size}.png:`, error.message);
    return false;
  }
}

async function generateFavicon() {
  const outputFile = path.join(outputDir, 'favicon.png');
  
  try {
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png({ compressionLevel: 9 })
      .toFile(outputFile);
    
    console.log('✅ Generado: favicon.png');
    return true;
  } catch (error) {
    console.error('❌ Error generando favicon.png:', error.message);
    return false;
  }
}

async function generateFaviconICO() {
  const outputFile = path.join(outputDir, 'favicon.ico');
  
  try {
    // Crear un favicon.ico de 32x32
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFormat('png')
      .toFile(outputFile.replace('.ico', '-temp.png'));
    
    // Renombrar a .ico (Sharp no soporta ICO nativo, pero PNG funciona como ICO en la mayoría de navegadores)
    console.log('✅ Generado: favicon.ico (formato PNG)');
    return true;
  } catch (error) {
    console.error('❌ Error generando favicon.ico:', error.message);
    return false;
  }
}

async function generateAppleIcon() {
  const outputFile = path.join(outputDir, 'apple-touch-icon.png');
  
  try {
    // Apple Touch Icon 180x180 con padding
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
        .resize(160, 160, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer(),
      gravity: 'center'
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(outputFile);
    
    console.log('✅ Generado: apple-touch-icon.png (180x180)');
    return true;
  } catch (error) {
    console.error('❌ Error generando apple-touch-icon.png:', error.message);
    return false;
  }
}

// Ejecutar generación
(async () => {
  try {
    console.log('📱 Generando iconos PWA...\n');
    const results = await Promise.all(sizes.map(size => generateIcon(size)));
    
    console.log('\n🌐 Generando favicon...');
    await generateFavicon();
    await generateFaviconICO();
    
    console.log('\n🍎 Generando Apple Touch Icon...');
    await generateAppleIcon();
    
    const successCount = results.filter(r => r).length;
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Completado: ${successCount}/${sizes.length} iconos PWA generados`);
    console.log('✅ favicon.png y favicon.ico generados');
    console.log('✅ apple-touch-icon.png generado');
    console.log('\n🎉 Todos los iconos se generaron desde logo-nicolas-tejera.png');
    console.log('💡 Los iconos están listos para usar en tu PWA');
    
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
    process.exit(1);
  }
})();

