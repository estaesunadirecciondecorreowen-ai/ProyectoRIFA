/**
 * Script para crear un usuario administrador adicional
 * Uso: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔐 Crear Nuevo Administrador\n');
    
    const nombre = await question('Nombre completo: ');
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');
    
    if (!nombre || !email || !password) {
      console.error('❌ Todos los campos son requeridos');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.error('❌ Ya existe un usuario con este email');
      process.exit(1);
    }
    
    // Hashear contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    // Crear admin
    const admin = await prisma.user.create({
      data: {
        nombre,
        email,
        password_hash,
        email_verified: true,
        rol: 'ADMIN'
      }
    });
    
    console.log('\n✅ Administrador creado exitosamente!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Nombre: ${admin.nombre}`);
    console.log(`   Email: ${admin.email}`);
    console.log('\n⚠️  Guarda estas credenciales en un lugar seguro\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();


