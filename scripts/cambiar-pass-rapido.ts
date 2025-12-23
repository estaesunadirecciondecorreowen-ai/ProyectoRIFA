import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Cambiando contraseña de administrador...\n');

  const email = 'admin@rifaaltruista.com';
  const newPassword = 'Rifa$Sw02526!Admin';

  // Verificar si el usuario existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!existingUser) {
    console.log('❌ Error: No existe un usuario con ese email');
    console.log('📧 Email buscado:', email);
    
    // Intentar crear el usuario si no existe
    console.log('\n⚠️  Creando el usuario...');
    
    const password_hash = await bcrypt.hash(newPassword, 10);
    
    const newUser = await prisma.user.create({
      data: {
        nombre: 'Admin Principal',
        email: email.toLowerCase(),
        telefono: '5500000000',
        password_hash,
        email_verified: true,
        rol: 'ADMIN',
      },
    });

    console.log('\n✅ ¡Usuario creado exitosamente!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:      ', newUser.email);
    console.log('👤 Nombre:     ', newUser.nombre);
    console.log('🔑 Rol:        ', newUser.rol);
    console.log('🔒 Contraseña: ', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return;
  }

  console.log('✅ Usuario encontrado:');
  console.log('👤 Nombre:', existingUser.nombre);
  console.log('📧 Email:', existingUser.email);
  console.log('🔑 Rol:', existingUser.rol);

  // Hash de la nueva contraseña
  const password_hash = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña
  await prisma.user.update({
    where: { email: existingUser.email },
    data: { password_hash },
  });

  console.log('\n✅ ¡Contraseña actualizada exitosamente!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:           ', existingUser.email);
  console.log('🔒 Nueva contraseña:', newPassword);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔗 Inicia sesión en:');
  console.log('   Local:      http://localhost:3000/auth/login');
  console.log('   Producción: https://proyectorifa.onrender.com/auth/login\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

