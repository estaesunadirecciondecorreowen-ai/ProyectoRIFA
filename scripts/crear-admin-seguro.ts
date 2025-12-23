import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creando nuevo usuario administrador con credenciales seguras\n');

  // Credenciales del nuevo administrador
  const nombre = 'Super Admin';
  const email = 'superadmin@rifa.com';
  const password = 'Admin2026!Seguro#ProyectoAltruista$';
  const telefono = '5512345678';

  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    console.log('⚠️  El usuario ya existe. Actualizando contraseña...\n');
    
    // Hash de la nueva contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    // Actualizar el usuario existente
    const admin = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        nombre,
        password_hash,
        email_verified: true,
        rol: 'ADMIN',
        telefono,
      },
    });

    console.log('✅ ¡Usuario administrador actualizado exitosamente!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nombre:', admin.nombre);
    console.log('🔑 Rol: ADMINISTRADOR');
    console.log('🔒 Nueva contraseña:', password);
    console.log('\n🔗 Inicia sesión en: http://localhost:3000/auth/login');
    console.log('🌐 O en producción: https://tu-dominio.onrender.com/auth/login\n');
  } else {
    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear el usuario administrador
    const admin = await prisma.user.create({
      data: {
        nombre,
        email: email.toLowerCase(),
        telefono,
        password_hash,
        email_verified: true,
        rol: 'ADMIN',
      },
    });

    console.log('✅ ¡Usuario administrador creado exitosamente!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nombre:', admin.nombre);
    console.log('🔑 Rol: ADMINISTRADOR');
    console.log('🔒 Contraseña:', password);
    console.log('\n🔗 Inicia sesión en: http://localhost:3000/auth/login');
    console.log('🌐 O en producción: https://tu-dominio.onrender.com/auth/login\n');
  }

  console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:      ', email);
  console.log('Contraseña: ', password);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

