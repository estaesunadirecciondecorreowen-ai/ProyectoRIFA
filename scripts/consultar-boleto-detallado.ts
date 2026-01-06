import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const numeroConsulta = 110;
  
  console.log(`\n🔍 Consulta detallada del boleto ${numeroConsulta}...\n`);

  const boleto = await prisma.ticket.findUnique({
    where: { numero: numeroConsulta },
    include: {
      purchase: {
        include: {
          user: true,
          transfer: true,
        },
      },
    },
  });

  if (!boleto || !boleto.purchase) {
    console.log(`❌ Boleto no encontrado o sin compra asociada\n`);
    return;
  }

  const purchase = boleto.purchase;

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`\n🎫 BOLETO ${numeroConsulta} - ANÁLISIS DETALLADO\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // Verificar si es venta física
  const esVentaFisica = !!(purchase.vendedor_nombre && purchase.comprador_nombre);

  if (esVentaFisica) {
    console.log('🏪 TIPO DE VENTA: VENTA FÍSICA\n');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`👤 Vendedor:  ${purchase.vendedor_nombre}`);
    console.log(`👥 Comprador: ${purchase.comprador_nombre}`);
    console.log(`📱 Teléfono:  ${purchase.telefono_comprador || 'No especificado'}`);
  } else {
    console.log('💻 TIPO DE VENTA: VENTA EN LÍNEA\n');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`👤 Usuario:   ${purchase.user.nombre}`);
    console.log(`📧 Email:     ${purchase.user.email}`);
    console.log(`📱 Teléfono:  ${purchase.user.telefono}`);
  }

  console.log('\n📊 ESTADO DE LA COMPRA:');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`   Código único:     ${purchase.unique_code}`);
  console.log(`   Estado compra:    ${purchase.status}`);
  console.log(`   Estado boleto:    ${boleto.estado}`);
  console.log(`   Método de pago:   ${purchase.method}`);
  console.log(`   Total:            $${purchase.total.toFixed(2)} MXN`);
  console.log(`   Fecha de compra:  ${new Date(purchase.created_at).toLocaleString('es-MX')}`);

  if (purchase.transfer) {
    console.log('\n💰 TRANSFERENCIA:');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`   Folio:            ${purchase.transfer.folio}`);
    console.log(`   Monto:            $${purchase.transfer.monto.toFixed(2)} MXN`);
    console.log(`   Fecha:            ${new Date(purchase.transfer.fecha).toLocaleDateString('es-MX')}`);
    console.log(`   Estado:           ${purchase.transfer.status}`);
    if (purchase.transfer.comprobante_url) {
      console.log(`   Comprobante:      ${purchase.transfer.comprobante_url}`);
    }
  } else {
    console.log('\n⚠️  SIN TRANSFERENCIA REGISTRADA');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log('   El comprador aún no ha subido el comprobante de pago');
  }

  // Ver todos los campos relevantes
  console.log('\n🔍 CAMPOS ADICIONALES:');
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`   vendedor_nombre:   ${purchase.vendedor_nombre || '(vacío - no es venta física)'}`);
  console.log(`   comprador_nombre:  ${purchase.comprador_nombre || '(vacío - no es venta física)'}`);
  console.log(`   telefono_comprador: ${purchase.telefono_comprador || '(vacío)'}`);
  console.log(`   PDF generado:      ${boleto.pdf_generado ? 'Sí' : 'No'}`);

  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');

  // Resumen final
  if (esVentaFisica) {
    console.log('✅ CONCLUSIÓN: Esta ES una VENTA FÍSICA');
    console.log(`   Vendedor: ${purchase.vendedor_nombre}`);
    console.log(`   Comprador: ${purchase.comprador_nombre}`);
  } else {
    console.log('❌ CONCLUSIÓN: Esta NO es una venta física');
    console.log('   Es una compra en línea regular');
    console.log(`   Usuario: ${purchase.user.nombre} (${purchase.user.email})`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


