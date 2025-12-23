import { PrismaClient, TicketStatus, PurchaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de ventas físicas extraídos de las imágenes
const ventasFisicas = [
  { boleto: 184, comprador: 'Emiliano', vendedor: 'Mauricio' },
  { boleto: 1, comprador: 'Valeria O.', vendedor: 'Mauricio' },
  { boleto: 25, comprador: 'Azul R.', vendedor: 'Mauricio' },
  { boleto: 411, comprador: 'Renata O.', vendedor: 'Mauricio' },
  { boleto: 7, comprador: 'Cristhian S.', vendedor: 'Mauricio' },
  { boleto: 56, comprador: 'Mateo C.', vendedor: 'Rebeca' },
  { boleto: 71, comprador: 'Carlos G.', vendedor: 'Rebeca' },
  { boleto: 28, comprador: 'Carlos G.', vendedor: 'Rebeca' },
  { boleto: 13, comprador: 'Maribel C.', vendedor: 'Rebeca' },
  { boleto: 38, comprador: 'Maribel C.', vendedor: 'Rebeca' },
  { boleto: 23, comprador: 'Rita C.', vendedor: 'Rebeca' },
  { boleto: 113, comprador: 'Rita C.', vendedor: 'Rebeca' },
  { boleto: 444, comprador: 'Erick', vendedor: 'Antonio' },
  { boleto: 11, comprador: 'Alejandra', vendedor: 'Antonio' },
  { boleto: 288, comprador: 'Omar', vendedor: 'Ricardo' },
  { boleto: 20, comprador: 'Fernando', vendedor: 'Mauricio' },
  { boleto: 34, comprador: 'Felix P.', vendedor: 'Ricardo' },
  { boleto: 16, comprador: 'Isaac', vendedor: 'Ricardo' },
  { boleto: 24, comprador: 'Gian', vendedor: 'Mauricio' },
  { boleto: 27, comprador: 'Michelle', vendedor: 'Diego R.' },
  { boleto: 300, comprador: 'David Z.', vendedor: 'Ricardo' },
  { boleto: 350, comprador: 'Mireya De La O', vendedor: 'Cristopher D.' },
  { boleto: 253, comprador: 'Mireya De La O', vendedor: 'Cristopher D.' },
  { boleto: 174, comprador: 'Mireya De La O', vendedor: 'Cristopher D.' },
  { boleto: 213, comprador: 'Mireya De La O', vendedor: 'Cristopher D.' },
  { boleto: 8, comprador: 'Stephanie', vendedor: 'Antonio' },
  { boleto: 128, comprador: 'Stephanie', vendedor: 'Antonio' },
  { boleto: 375, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 143, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 499, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 500, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 407, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 172, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 162, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 208, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 222, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 269, comprador: 'Ezequiel Carrillo', vendedor: 'Rebeca' },
  { boleto: 344, comprador: 'Yadira Diaz', vendedor: 'Rebeca' },
  { boleto: 210, comprador: 'Carlos Adiel', vendedor: 'Diego R.' },
  { boleto: 67, comprador: 'Alejandro A.', vendedor: 'Mauricio' },
  { boleto: 58, comprador: 'Alejandro A.', vendedor: 'Mauricio' },
  { boleto: 304, comprador: 'Diego E.', vendedor: 'Antonio' },
  { boleto: 412, comprador: 'Diego E.', vendedor: 'Antonio' },
  { boleto: 112, comprador: 'Diego E.', vendedor: 'Antonio' },
  { boleto: 435, comprador: 'Diego E.', vendedor: 'Antonio' },
  { boleto: 74, comprador: 'Marisela', vendedor: 'Ricardo' },
  { boleto: 5, comprador: 'Sofia', vendedor: 'Ricardo' },
  { boleto: 77, comprador: 'Felix P.', vendedor: 'Ricardo' },
  { boleto: 47, comprador: 'Felix P.', vendedor: 'Ricardo' },
  { boleto: 192, comprador: 'Felix P.', vendedor: 'Ricardo' },
  { boleto: 219, comprador: 'Felix P.', vendedor: 'Ricardo' },
  { boleto: 73, comprador: 'Marisela', vendedor: 'Ricardo' },
  { boleto: 18, comprador: 'Manuel Navarro', vendedor: 'Cristopher D.' },
  { boleto: 452, comprador: 'Manuel Navarro', vendedor: 'Cristopher D.' },
  { boleto: 250, comprador: 'Manuel Navarro', vendedor: 'Cristopher D.' },
  { boleto: 254, comprador: 'Manuel Navarro', vendedor: 'Cristopher D.' },
  { boleto: 273, comprador: 'Manuel Navarro', vendedor: 'Cristopher D.' },
  { boleto: 197, comprador: 'Yael Ali Lima Pascual', vendedor: 'Cristopher D.' },
  { boleto: 297, comprador: 'Yael Ali Lima Pascual', vendedor: 'Cristopher D.' },
  { boleto: 266, comprador: 'Alberto Ehad Garcia Barradas', vendedor: 'Cristopher D.' },
  { boleto: 498, comprador: 'Gian Carlo', vendedor: 'Diego R.' },
  { boleto: 347, comprador: 'Gian Carlo', vendedor: 'Diego R.' },
  { boleto: 399, comprador: 'Saul De La O', vendedor: 'Cristopher D.' },
  { boleto: 327, comprador: 'Saul De La O', vendedor: 'Cristopher D.' },
  { boleto: 117, comprador: 'Emmanuel Morales Garcia', vendedor: 'Leonardo MG' },
  { boleto: 93, comprador: 'Emmanuel Morales Garcia', vendedor: 'Leonardo MG' },
  { boleto: 12, comprador: 'Yoset Aaron Arriaga Aguilar', vendedor: 'Leonardo MG' },
  { boleto: 135, comprador: 'Jesus Oswaldo Arroyo Gutierrez', vendedor: 'Leonardo MG' },
  { boleto: 98, comprador: 'Machorro Perez Leonardo', vendedor: 'Leonardo MG' },
  { boleto: 10, comprador: 'Trejo Leon Diego Arturo', vendedor: 'Leonardo MG' },
  { boleto: 19, comprador: 'Trejo Leon Diego Arturo', vendedor: 'Leonardo MG' },
  { boleto: 17, comprador: 'Martinez Aguayo Maximiliano', vendedor: 'Leonardo MG' },
  { boleto: 141, comprador: 'Martinez Aguayo Maximiliano', vendedor: 'Leonardo MG' },
  { boleto: 477, comprador: 'Balmont Camacho Jonathan', vendedor: 'Leonardo MG' },
  { boleto: 3, comprador: 'Garcia Baez Rocio Ixtlaccihuatl', vendedor: 'Leonardo MG' },
  { boleto: 118, comprador: 'Garcia Baez Rocio Ixtlaccihuatl', vendedor: 'Leonardo MG' },
  { boleto: 456, comprador: 'Garcia Baez Rocio Ixtlaccihuatl', vendedor: 'Leonardo MG' },
  { boleto: 100, comprador: 'Garcia Baez Rocio Ixtlaccihuatl', vendedor: 'Leonardo MG' },
  { boleto: 21, comprador: 'Priscila Vega', vendedor: 'Leonardo MG' },
  { boleto: 333, comprador: 'Axel Francisco Mendoza', vendedor: 'Leonardo MG' },
  { boleto: 215, comprador: 'Hector Carrera Cruz', vendedor: 'Leonardo MG' },
  { boleto: 44, comprador: 'Hector Carrera Cruz', vendedor: 'Leonardo MG' },
  { boleto: 428, comprador: 'Luis Enrique', vendedor: 'Ricardo' },
  { boleto: 88, comprador: 'Luis Enrique', vendedor: 'Ricardo' },
  { boleto: 2, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 22, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 50, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 199, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 84, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 248, comprador: 'Jose Francisco Romero Martinez', vendedor: 'Karina Ramirez' },
  { boleto: 90, comprador: 'Maria Bonifacia Ramirez', vendedor: 'Karina Ramirez' },
  { boleto: 66, comprador: 'Maria Bonifacia Ramirez', vendedor: 'Karina Ramirez' },
  { boleto: 97, comprador: 'Maria Bonifacia Ramirez', vendedor: 'Karina Ramirez' },
  { boleto: 312, comprador: 'Montserat Ramirez', vendedor: 'Karina Ramirez' },
  { boleto: 450, comprador: 'Montserat Ramirez', vendedor: 'Karina Ramirez' },
  { boleto: 488, comprador: 'Luis Enrique', vendedor: 'Ricardo' },
  { boleto: 240, comprador: 'Luis Enrique', vendedor: 'Ricardo' },
  { boleto: 486, comprador: 'Luis Enrique', vendedor: 'Ricardo' },
  { boleto: 364, comprador: 'Cristhian S.', vendedor: 'Mauricio' },
  { boleto: 212, comprador: 'Jose Francisco', vendedor: 'Mauricio' },
];

async function main() {
  console.log('🎫 Iniciando carga de ventas físicas...\n');

  let ventasExitosas = 0;
  let ventasOmitidas = 0;

  // Procesar cada venta
  for (const venta of ventasFisicas) {
    try {
      // Verificar si el boleto existe y está disponible
      const ticket = await prisma.ticket.findUnique({
        where: { numero: venta.boleto },
      });

      if (!ticket) {
        console.log(`❌ Boleto #${venta.boleto} no existe`);
        ventasOmitidas++;
        continue;
      }

      if (ticket.estado !== TicketStatus.available) {
        console.log(`⚠️  Boleto #${venta.boleto} ya está ${ticket.estado} - OMITIENDO`);
        ventasOmitidas++;
        continue;
      }

      // Buscar o crear usuario basado en el vendedor
      let adminUser = await prisma.user.findFirst({
        where: {
          nombre: {
            contains: venta.vendedor,
          },
          rol: 'ADMIN',
        },
      });

      // Si no existe el admin, usar el admin por defecto
      if (!adminUser) {
        adminUser = await prisma.user.findUnique({
          where: { email: 'admin@rifaaltruista.com' },
        });
      }

      if (!adminUser) {
        console.log(`❌ No se encontró usuario admin para procesar la venta`);
        ventasOmitidas++;
        continue;
      }

      // Crear la compra
      const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '50');
      const uniqueCode = `RIFA-FISICA-${venta.boleto}`;

      const purchase = await prisma.purchase.create({
        data: {
          user_id: adminUser.id,
          total: ticketPrice,
          status: PurchaseStatus.approved,
          method: 'fisico',
          unique_code: uniqueCode,
          comprador_nombre: venta.comprador,
          telefono_comprador: '"Pendiente"', // Marcar como pendiente
          vendedor_nombre: venta.vendedor,
        },
      });

      // Actualizar el boleto
      await prisma.ticket.update({
        where: { numero: venta.boleto },
        data: {
          estado: TicketStatus.sold_physical,
          user_id: adminUser.id,
          purchase_id: purchase.id,
          nota: `Comprador: ${venta.comprador} | Vendedor: ${venta.vendedor} | Venta física`,
        },
      });

      // Registrar log
      await prisma.adminLog.create({
        data: {
          admin_id: adminUser.id,
          action: 'physical_sale_import',
          payload: JSON.stringify({
            purchaseId: purchase.id,
            ticket: venta.boleto,
            comprador: venta.comprador,
            vendedor: venta.vendedor,
          }),
        },
      });

      console.log(`✅ Boleto #${venta.boleto} - ${venta.comprador} (Vendedor: ${venta.vendedor})`);
      ventasExitosas++;
    } catch (error) {
      console.error(`❌ Error procesando boleto #${venta.boleto}:`, error);
      ventasOmitidas++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`✅ Ventas registradas: ${ventasExitosas}`);
  console.log(`⚠️  Ventas omitidas: ${ventasOmitidas}`);
  console.log(`📝 Total procesado: ${ventasFisicas.length}`);
  console.log('\n⚠️  NOTA: Los teléfonos están marcados como "Pendiente" - revisar y actualizar');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

