import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('🔐 Cambiar contraseña de usuario administrador\n');

  const email = await question('Email del administrador (ej: admin@rifaaltruista.com): ');
  
  // Verificar si el usuario existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });

  if (!existingUser) {
    console.log('\n❌ Error: No existe un usuario con ese email');
    console.log('📧 Email buscado:', email.trim().toLowerCase());
    process.exit(1);
  }

  console.log('\n✅ Usuario encontrado:');
  console.log('👤 Nombre:', existingUser.nombre);
  console.log('📧 Email:', existingUser.email);
  console.log('🔑 Rol:', existingUser.rol);

  const newPassword = await question('\nNueva contraseña: ');
  const confirmPassword = await question('Confirma la nueva contraseña: ');

  if (newPassword !== confirmPassword) {
    console.log('\n❌ Error: Las contraseñas no coinciden');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.log('\n⚠️  Advertencia: La contraseña es muy corta (mínimo 8 caracteres)');
    const continuar = await question('¿Deseas continuar de todas formas? (si/no): ');
    if (continuar.toLowerCase() !== 'si') {
      console.log('❌ Operación cancelada');
      process.exit(0);
    }
  }

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
  console.log('   Producción: https://tu-dominio.onrender.com/auth/login\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });

