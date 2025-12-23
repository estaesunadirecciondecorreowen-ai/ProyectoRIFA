import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📞 Verificando usuarios...\n');

  // Como el campo telefono ahora es obligatorio, este script ya no es necesario
  // Todos los usuarios nuevos deben tener teléfono
  console.log('✅ El campo teléfono es ahora obligatorio para todos los usuarios\n');
  console.log('ℹ️  Este script ya no es necesario. Todos los usuarios nuevos tienen teléfono obligatorio.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

