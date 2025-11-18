// Script para probar el login directamente contra la API de producción
const axios = require('axios');

async function probarLogin() {
  console.log('🧪 Probando login en producción...\n');
  
  const API_URL = 'https://rv-gestion-automotora20.vercel.app/api';
  const email = 'admin@automanager.com';
  const password = 'admin123';
  
  try {
    console.log('📡 Enviando petición POST a:', `${API_URL}/auth/login`);
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('');
    
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    console.log('✅ Login exitoso!\n');
    console.log('📦 Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('\n🎟️ Token generado:', response.data.token.substring(0, 50) + '...');
    }
    
    if (response.data.user) {
      console.log('\n👤 Usuario:');
      console.log('  - ID:', response.data.user.id);
      console.log('  - Email:', response.data.user.email);
      console.log('  - Rol:', response.data.user.rol);
    }
    
  } catch (error) {
    console.error('❌ Error en login\n');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Mensaje:', error.response.data.error || error.response.data);
      console.error('\n📦 Respuesta completa:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

probarLogin();
