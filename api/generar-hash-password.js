// Script para generar hash de contraseña con bcrypt
const bcrypt = require('bcryptjs');

const password = 'Marcos1985';
const saltRounds = 10;

console.log('🔐 Generando hash para contraseña:', password);
console.log('📊 Salt rounds:', saltRounds);
console.log('');

const hash = bcrypt.hashSync(password, saltRounds);

console.log('✅ Hash generado:');
console.log(hash);
console.log('');
console.log('📋 SQL para insertar en Neon:');
console.log('');
console.log(`DELETE FROM "Usuario" WHERE email = 'marcos@rvautomoviles.com';`);
console.log('');
console.log(`INSERT INTO "Usuario" (email, password, rol, "clienteId", "createdAt", "updatedAt")`);
console.log(`VALUES (`);
console.log(`  'marcos@rvautomoviles.com',`);
console.log(`  '${hash}',`);
console.log(`  'admin',`);
console.log(`  NULL,`);
console.log(`  NOW(),`);
console.log(`  NOW()`);
console.log(`);`);
console.log('');
console.log('✅ Verifica que la contraseña funciona:');
const testResult = bcrypt.compareSync(password, hash);
console.log('Verificación:', testResult ? '✅ CORRECTO' : '❌ ERROR');
