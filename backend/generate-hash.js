const bcrypt = require('bcryptjs');

// Generar hash de "Marcos1985"
const password = 'Marcos1985';
const hash = bcrypt.hashSync(password, 10);

console.log('\n==============================================');
console.log('🔐 Hash de contraseña para marcos@rvautomoviles.com');
console.log('==============================================\n');
console.log('Contraseña:', password);
console.log('Hash:', hash);
console.log('\n==============================================');
console.log('Usa este hash en el SQL:');
console.log('==============================================\n');
console.log(`INSERT INTO "Usuario" ("email", "password", "rol")
VALUES ('marcos@rvautomoviles.com', '${hash}', 'admin');`);
console.log('\n');
