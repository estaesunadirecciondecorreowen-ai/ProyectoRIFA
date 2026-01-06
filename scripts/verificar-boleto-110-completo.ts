import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 VERIFICACIÓN EXHAUSTIVA DEL BOLETO 110\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // Consulta RAW del boleto
  const boleto = await prisma.ticket.findUnique({
    where: { numero: 110 },
  });

  console.log('📋 DATOS COMPLETOS DEL TICKET (tabla tickets):');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(JSON.stringify(boleto, null, 2));
  console.log('\n');

  if (boleto?.purchase_id) {
    // Consulta RAW de la compra
    const purchase = await prisma.purchase.findUnique({
      where: { id: boleto.purchase_id },
    });

    console.log('💳 DATOS COMPLETOS DE LA COMPRA (tabla purchases):');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(JSON.stringify(purchase, null, 2));
    console.log('\n');

    // Verificar transferencia
    if (purchase) {
      const transfer = await prisma.transfer.findFirst({
        where: { purchase_id: purchase.id },
      });

      if (transfer) {
        console.log('💰 DATOS COMPLETOS DE LA TRANSFERENCIA (tabla transfers):');
        console.log('─────────────────────────────────────────────────────────────────────────────');
        console.log(JSON.stringify(transfer, null, 2));
        console.log('\n');
      } else {
        console.log('⚠️  NO HAY TRANSFERENCIA ASOCIADA\n');
      }

      // Verificar usuario
      const user = await prisma.user.findUnique({
        where: { id: purchase.user_id },
      });

      console.log('👤 DATOS COMPLETOS DEL USUARIO (tabla users):');
      console.log('─────────────────────────────────────────────────────────────────────────────');
      console.log(JSON.stringify(user, null, 2));
      console.log('\n');
    }
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  // Análisis detallado de campos específicos
  if (boleto?.purchase_id) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: boleto.purchase_id },
    });

    console.log('🔎 ANÁLISIS DE CAMPOS CRÍTICOS:');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`vendedor_nombre:      "${purchase?.vendedor_nombre}" ${purchase?.vendedor_nombre ? '✅ TIENE DATOS' : '❌ NULL/VACÍO'}`);
    console.log(`comprador_nombre:     "${purchase?.comprador_nombre}" ${purchase?.comprador_nombre ? '✅ TIENE DATOS' : '❌ NULL/VACÍO'}`);
    console.log(`telefono_comprador:   "${purchase?.telefono_comprador}" ${purchase?.telefono_comprador ? '✅ TIENE DATOS' : '❌ NULL/VACÍO'}`);
    console.log(`method:               "${purchase?.method}"`);
    console.log(`status:               "${purchase?.status}"`);
    console.log('\n');

    if (purchase?.vendedor_nombre || purchase?.comprador_nombre) {
      console.log('✅✅✅ CONFIRMADO: ESTE BOLETO SÍ TIENE DATOS DE VENTA FÍSICA ✅✅✅\n');
    } else {
      console.log('❌❌❌ CONFIRMADO: ESTE BOLETO NO TIENE DATOS DE VENTA FÍSICA ❌❌❌\n');
    }
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


