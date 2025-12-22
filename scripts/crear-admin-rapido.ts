import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creando nuevo usuario administrador...\n');

  // Datos del administrador
  const nombre = 'Administrador';
  const email = 'admin@rifa.com';
  const password = 'Admin123!';
  const telefono = ''; // opcional

  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    console.log('ℹ️  El usuario ya existe. Actualizando a rol ADMIN...\n');
    
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        rol: 'ADMIN',
        email_verified: true,
      },
    });

    console.log('✅ Usuario actualizado a administrador:\n');
    console.log('📧 Email:', updatedUser.email);
    console.log('👤 Nombre:', updatedUser.nombre);
    console.log('🔑 Rol: ADMINISTRADOR');
    console.log('🔓 Contraseña: (la que ya tenías configurada)');
  } else {
    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear el usuario administrador
    const admin = await prisma.user.create({
      data: {
        nombre,
        email: email.toLowerCase(),
        telefono: telefono || null,
        password_hash,
        email_verified: true,
        rol: 'ADMIN',
      },
    });

    console.log('✅ ¡Usuario administrador creado exitosamente!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nombre:', admin.nombre);
    console.log('🔑 Rol: ADMINISTRADOR');
    console.log('🔓 Contraseña:', password);
  }

  console.log('\n🔗 Inicia sesión en: http://localhost:3000/auth/login\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

