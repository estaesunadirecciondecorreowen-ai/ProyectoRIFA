import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📞 Actualizando usuarios sin teléfono...\n');

  // Actualizar usuarios que no tienen teléfono
  const result = await prisma.user.updateMany({
    where: {
      telefono: null
    },
    data: {
      telefono: '0000000000' // Teléfono por defecto
    }
  });

  console.log(`✅ ${result.count} usuario(s) actualizado(s) con teléfono por defecto\n`);
  console.log('Ahora puedes ejecutar: npx prisma db push\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

