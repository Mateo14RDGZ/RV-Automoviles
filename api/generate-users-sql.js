const bcrypt = require("bcryptjs");

async function generateUsersSQL() {
  console.log("🔐 Generando SQL para crear usuarios...\n");

  // Contraseñas recomendadas
  const passwords = {
    admin: "Admin123!",
    empleado: "Empleado123!",
    adminDemo: "admin123", // Para compatibilidad con demo
  };

  // Generar hashes
  const adminHash = await bcrypt.hash(passwords.admin, 10);
  const empleadoHash = await bcrypt.hash(passwords.empleado, 10);
  const adminDemoHash = await bcrypt.hash(passwords.adminDemo, 10);

  console.log("=".repeat(60));
  console.log("SQL PARA CREAR USUARIOS EN NEON");
  console.log("=".repeat(60));
  console.log("\n-- =====================================================");
  console.log("-- CREAR USUARIOS ADMINISTRATIVOS");
  console.log("-- =====================================================\n");

  // Usuario Admin Principal
  console.log("-- Usuario Administrador Principal");
  console.log(`-- Email: admin@quesadaautomoviles.com`);
  console.log(`-- Password: ${passwords.admin}`);
  console.log(`-- Rol: admin\n`);
  console.log(
    `INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")`
  );
  console.log(
    `VALUES ('admin@quesadaautomoviles.com', '${adminHash}', 'admin', NOW(), NOW());\n`
  );

  // Usuario Admin Demo (compatibilidad)
  console.log("-- Usuario Administrador Demo");
  console.log(`-- Email: admin@demo.com`);
  console.log(`-- Password: ${passwords.adminDemo}`);
  console.log(`-- Rol: admin\n`);
  console.log(
    `INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")`
  );
  console.log(
    `VALUES ('admin@demo.com', '${adminDemoHash}', 'admin', NOW(), NOW());\n`
  );

  // Usuario Empleado
  console.log("-- Usuario Empleado");
  console.log(`-- Email: empleado@quesadaautomoviles.com`);
  console.log(`-- Password: ${passwords.empleado}`);
  console.log(`-- Rol: empleado`);
  console.log(
    `-- Permisos: Autos, Clientes, Pagos (NO Dashboard, NO Reportes)\n`
  );
  console.log(
    `INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")`
  );
  console.log(
    `VALUES ('empleado@quesadaautomoviles.com', '${empleadoHash}', 'empleado', NOW(), NOW());\n`
  );

  console.log("-- =====================================================");
  console.log("-- VERIFICAR USUARIOS CREADOS");
  console.log("-- =====================================================\n");
  console.log(
    'SELECT id, email, rol, "createdAt" FROM "Usuario" ORDER BY rol, email;\n'
  );

  console.log("=".repeat(60));
  console.log("\n✅ SQL generado exitosamente");
  console.log("\n📋 INSTRUCCIONES:");
  console.log("1. Copia todo el SQL generado arriba");
  console.log("2. Pégalo en el SQL Editor de Neon");
  console.log("3. Ejecuta el script");
  console.log("4. Verifica los usuarios con la query SELECT\n");
}

generateUsersSQL().catch(console.error);
