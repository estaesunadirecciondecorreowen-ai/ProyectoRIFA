import { PrismaClient, TicketStatus, PurchaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ===== CONFIGURACIÓN DE VENDEDORES Y SUS VENTAS =====
// Agrupa cada vendedor con sus boletos vendidos
// Para agregar un nuevo vendedor, solo agrega una nueva entrada aquí

interface Venta {
  boleto: number;
  comprador: string;
}

interface VendedorVentas {
  vendedor: string;
  ventas: Venta[];
}

const ventasPorVendedor: VendedorVentas[] = [
  {
    vendedor: 'Mauricio',
    ventas: [
      { boleto: 184, comprador: 'Emiliano' },
      { boleto: 6, comprador: 'Valeria O.' },
      { boleto: 25, comprador: 'Azul R.' },
      { boleto: 411, comprador: 'Renata O.' },
      { boleto: 7, comprador: 'Cristhian S.' },
      { boleto: 20, comprador: 'Fernando' },
      { boleto: 24, comprador: 'Gian' },
      { boleto: 67, comprador: 'Alejandro A.' },
      { boleto: 58, comprador: 'Alejandro A.' },
      { boleto: 364, comprador: 'Cristhian S.' },
      { boleto: 212, comprador: 'Jose Francisco' },
    ],
  },
  {
    vendedor: 'Rebeca',
    ventas: [
      { boleto: 56, comprador: 'Mateo C.' },
      { boleto: 71, comprador: 'Carlos G.' },
      { boleto: 28, comprador: 'Carlos G.' },
      { boleto: 13, comprador: 'Maribel C.' },
      { boleto: 38, comprador: 'Maribel C.' },
      { boleto: 23, comprador: 'Rita C.' },
      { boleto: 113, comprador: 'Rita C.' },
      { boleto: 375, comprador: 'Ezequiel Carrillo' },
      { boleto: 143, comprador: 'Ezequiel Carrillo' },
      { boleto: 499, comprador: 'Ezequiel Carrillo' },
      { boleto: 500, comprador: 'Ezequiel Carrillo' },
      { boleto: 407, comprador: 'Ezequiel Carrillo' },
      { boleto: 172, comprador: 'Ezequiel Carrillo' },
      { boleto: 162, comprador: 'Ezequiel Carrillo' },
      { boleto: 208, comprador: 'Ezequiel Carrillo' },
      { boleto: 222, comprador: 'Ezequiel Carrillo' },
      { boleto: 269, comprador: 'Ezequiel Carrillo' },
      { boleto: 344, comprador: 'Yadira Diaz' },
    ],
  },
  {
    vendedor: 'Antonio',
    ventas: [
      { boleto: 444, comprador: 'Erick' },
      { boleto: 11, comprador: 'Alejandra' },
      { boleto: 8, comprador: 'Stephanie' },
      { boleto: 128, comprador: 'Stephanie' },
      { boleto: 304, comprador: 'Diego E.' },
      { boleto: 412, comprador: 'Diego E.' },
      { boleto: 112, comprador: 'Diego E.' },
      { boleto: 435, comprador: 'Diego E.' },
    ],
  },
  {
    vendedor: 'Ricardo',
    ventas: [
      { boleto: 288, comprador: 'Omar' },
      { boleto: 34, comprador: 'Felix P.' },
      { boleto: 16, comprador: 'Isaac' },
      { boleto: 300, comprador: 'David Z.' },
      { boleto: 74, comprador: 'Marisela' },
      { boleto: 5, comprador: 'Sofia' },
      { boleto: 77, comprador: 'Felix P.' },
      { boleto: 47, comprador: 'Felix P.' },
      { boleto: 192, comprador: 'Felix P.' },
      { boleto: 219, comprador: 'Felix P.' },
      { boleto: 73, comprador: 'Marisela' },
      { boleto: 428, comprador: 'Luis Enrique' },
      { boleto: 88, comprador: 'Luis Enrique' },
      { boleto: 488, comprador: 'Luis Enrique' },
      { boleto: 240, comprador: 'Luis Enrique' },
      { boleto: 486, comprador: 'Luis Enrique' },
    ],
  },
  {
    vendedor: 'Diego R.',
    ventas: [
      { boleto: 27, comprador: 'Michelle' },
      { boleto: 210, comprador: 'Carlos Adiel' },
      { boleto: 498, comprador: 'Gian Carlo' },
      { boleto: 347, comprador: 'Gian Carlo' },
    ],
  },
  {
    vendedor: 'Cristopher D.',
    ventas: [
      { boleto: 350, comprador: 'Mireya De La O' },
      { boleto: 253, comprador: 'Mireya De La O' },
      { boleto: 174, comprador: 'Mireya De La O' },
      { boleto: 213, comprador: 'Mireya De La O' },
      { boleto: 18, comprador: 'Manuel Navarro' },
      { boleto: 452, comprador: 'Manuel Navarro' },
      { boleto: 250, comprador: 'Manuel Navarro' },
      { boleto: 254, comprador: 'Manuel Navarro' },
      { boleto: 273, comprador: 'Manuel Navarro' },
      { boleto: 197, comprador: 'Yael Ali Lima Pascual' },
      { boleto: 297, comprador: 'Yael Ali Lima Pascual' },
      { boleto: 266, comprador: 'Alberto Ehad Garcia Barradas' },
      { boleto: 399, comprador: 'Saul De La O' },
      { boleto: 327, comprador: 'Saul De La O' },
    ],
  },
  {
    vendedor: 'Leonardo MG',
    ventas: [
      { boleto: 117, comprador: 'Emmanuel Morales Garcia' },
      { boleto: 93, comprador: 'Emmanuel Morales Garcia' },
      { boleto: 12, comprador: 'Yoset Aaron Arriaga Aguilar' },
      { boleto: 135, comprador: 'Jesus Oswaldo Arroyo Gutierrez' },
      { boleto: 98, comprador: 'Machorro Perez Leonardo' },
      { boleto: 10, comprador: 'Trejo Leon Diego Arturo' },
      { boleto: 19, comprador: 'Trejo Leon Diego Arturo' },
      { boleto: 17, comprador: 'Martinez Aguayo Maximiliano' },
      { boleto: 141, comprador: 'Martinez Aguayo Maximiliano' },
      { boleto: 477, comprador: 'Balmont Camacho Jonathan' },
      { boleto: 3, comprador: 'Garcia Baez Rocio Ixtlaccihuatl' },
      { boleto: 118, comprador: 'Garcia Baez Rocio Ixtlaccihuatl' },
      { boleto: 456, comprador: 'Garcia Baez Rocio Ixtlaccihuatl' },
      { boleto: 100, comprador: 'Garcia Baez Rocio Ixtlaccihuatl' },
      { boleto: 1, comprador: 'Priscila Vega' },
      { boleto: 21, comprador: 'Priscila Vega' },
      { boleto: 333, comprador: 'Axel Francisco Mendoza' },
      { boleto: 215, comprador: 'Hector Carrera Cruz' },
      { boleto: 44, comprador: 'Hector Carrera Cruz' },
    ],
  },
  {
    vendedor: 'Karina Ramirez',
    ventas: [
      { boleto: 2, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 22, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 50, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 199, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 84, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 248, comprador: 'Jose Francisco Romero Martinez' },
      { boleto: 90, comprador: 'Maria Bonifacia Ramirez' },
      { boleto: 66, comprador: 'Maria Bonifacia Ramirez' },
      { boleto: 97, comprador: 'Maria Bonifacia Ramirez' },
      { boleto: 312, comprador: 'Montserat Ramirez' },
      { boleto: 450, comprador: 'Montserat Ramirez' },
    ],
  },
  
  // ===== AGREGAR NUEVOS VENDEDORES AQUÍ =====
  // Ejemplo:
  // {
  //   vendedor: 'Nuevo Vendedor',
  //   ventas: [
  //     { boleto: 999, comprador: 'Nombre del Comprador' },
  //     { boleto: 888, comprador: 'Otro Comprador' },
  //   ],
  // },
];

// ===== SCRIPT DE CARGA =====

async function main() {
  console.log('🎫 Iniciando carga de ventas físicas (v2 - Agrupado por vendedor)...\n');

  let ventasExitosas = 0;
  let ventasOmitidas = 0;
  let totalBoletos = 0;

  // Calcular total de boletos
  ventasPorVendedor.forEach(v => totalBoletos += v.ventas.length);
  console.log(`📊 Total de boletos a procesar: ${totalBoletos}\n`);

  // Procesar cada vendedor
  for (const vendedorData of ventasPorVendedor) {
    console.log(`\n👤 Procesando ventas de: ${vendedorData.vendedor}`);
    console.log(`   Boletos a registrar: ${vendedorData.ventas.length}`);
    console.log('   ' + '─'.repeat(50));

    let ventasVendedor = 0;

    for (const venta of vendedorData.ventas) {
      try {
        // Verificar si el boleto existe y está disponible
        const ticket = await prisma.ticket.findUnique({
          where: { numero: venta.boleto },
        });

        if (!ticket) {
          console.log(`   ❌ Boleto #${venta.boleto} no existe`);
          ventasOmitidas++;
          continue;
        }

        if (ticket.estado !== TicketStatus.available) {
          console.log(`   ⚠️  Boleto #${venta.boleto} ya está ${ticket.estado} - OMITIENDO`);
          ventasOmitidas++;
          continue;
        }

        // Buscar usuario admin
        let adminUser = await prisma.user.findFirst({
          where: {
            nombre: {
              contains: vendedorData.vendedor,
            },
            rol: 'ADMIN',
          },
        });

        // Si no existe, usar el admin por defecto
        if (!adminUser) {
          adminUser = await prisma.user.findUnique({
            where: { email: 'admin@rifaaltruista.com' },
          });
        }

        if (!adminUser) {
          console.log(`   ❌ No se encontró usuario admin`);
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
            telefono_comprador: '"Pendiente"',
            vendedor_nombre: vendedorData.vendedor,
          },
        });

        // Actualizar el boleto
        await prisma.ticket.update({
          where: { numero: venta.boleto },
          data: {
            estado: TicketStatus.sold_physical,
            user_id: adminUser.id,
            purchase_id: purchase.id,
            nota: `Comprador: ${venta.comprador} | Vendedor: ${vendedorData.vendedor} | Venta física`,
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
              vendedor: vendedorData.vendedor,
            }),
          },
        });

        console.log(`   ✅ #${venta.boleto} - ${venta.comprador}`);
        ventasExitosas++;
        ventasVendedor++;
      } catch (error) {
        console.log(`   ❌ Error en boleto #${venta.boleto}:`, error);
        ventasOmitidas++;
      }
    }

    console.log(`   ✅ Registrados: ${ventasVendedor} boletos`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESUMEN FINAL');
  console.log('═'.repeat(70));
  console.log(`✅ Ventas registradas: ${ventasExitosas}`);
  console.log(`⚠️  Ventas omitidas: ${ventasOmitidas}`);
  console.log(`📝 Total procesado: ${totalBoletos}`);
  
  console.log('\n📋 RESUMEN POR VENDEDOR:');
  for (const vendedorData of ventasPorVendedor) {
    console.log(`   ${vendedorData.vendedor}: ${vendedorData.ventas.length} boletos`);
  }
  
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

