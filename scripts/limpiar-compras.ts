import { PrismaClient, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando compras de prueba...');

  // Eliminar todas las transferencias
  const deletedTransfers = await prisma.transfer.deleteMany({});
  console.log(`✅ Eliminadas ${deletedTransfers.count} transferencia(s)`);

  // Eliminar todas las compras
  const deletedPurchases = await prisma.purchase.deleteMany({});
  console.log(`✅ Eliminadas ${deletedPurchases.count} compra(s)`);

  // Resetear todos los boletos a disponible
  const updatedTickets = await prisma.ticket.updateMany({
    data: {
      estado: TicketStatus.available,
      user_id: null,
      purchase_id: null,
      reserved_until: null,
      pdf_generado: false,
      pdf_filename: null,
      nota: null,
    },
  });
  console.log(`✅ Reseteados ${updatedTickets.count} boleto(s) a disponible`);

  console.log('\n✨ Base de datos limpia y lista para usar');
}

main()
  .catch((e) => {
    console.error('❌ Error al limpiar:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

