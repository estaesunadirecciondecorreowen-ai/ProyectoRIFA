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
  console.log('🔐 Crear nuevo usuario administrador\n');

  const nombre = await question('Nombre del administrador: ');
  const email = await question('Email del administrador: ');
  const password = await question('Contraseña: ');
  const telefono = await question('Teléfono (opcional, presiona Enter para omitir): ');

  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() }
  });

  if (existingUser) {
    console.log('\n❌ Error: Ya existe un usuario con ese email');
    process.exit(1);
  }

  // Hash de la contraseña
  const password_hash = await bcrypt.hash(password, 10);

  // Crear el usuario administrador
  const admin = await prisma.user.create({
    data: {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim() || '0000000000',
      password_hash,
      email_verified: true,
      rol: 'ADMIN',
    },
  });

  console.log('\n✅ ¡Usuario administrador creado exitosamente!\n');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nombre:', admin.nombre);
  console.log('🔑 Rol: ADMINISTRADOR');
  console.log('\n🔗 Inicia sesión en: http://localhost:3000/auth/login\n');
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

