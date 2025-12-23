import { PrismaClient, UserRole, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear admin por defecto
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@rifaaltruista.com' },
  });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin123456', 10);
    await prisma.user.create({
      data: {
        nombre: 'Administrador',
        email: 'admin@rifaaltruista.com',
        telefono: '0000000000',
        password_hash: adminPassword,
        email_verified: true,
        rol: UserRole.ADMIN,
      },
    });
    console.log('✅ Usuario administrador creado:');
    console.log('   Email: admin@rifaaltruista.com');
    console.log('   Contraseña: admin123456');
    console.log('   ⚠️  IMPORTANTE: Cambia esta contraseña en producción');
  } else {
    console.log('ℹ️  Usuario administrador ya existe');
  }

  // Crear los 500 boletos
  const ticketCount = await prisma.ticket.count();

  if (ticketCount === 0) {
    console.log('🎫 Creando 500 boletos...');

    const tickets: { numero: number; estado: TicketStatus }[] = [];
    for (let i = 1; i <= 500; i++) {
      tickets.push({
        numero: i,
        estado: TicketStatus.available,
      });
    }

    await prisma.ticket.createMany({
      data: tickets,
    });

    console.log('✅ 500 boletos creados exitosamente');
  } else {
    console.log(`ℹ️  Ya existen ${ticketCount} boletos en la base de datos`);
  }

  // Configuración inicial de la rifa
  const configs = [
    {
      key: 'raffle_name',
      value: process.env.NEXT_PUBLIC_RAFFLE_NAME || 'Rifa Altruista',
    },
    {
      key: 'raffle_cause',
      value: process.env.NEXT_PUBLIC_RAFFLE_CAUSE || 'Apoyo a niños con cáncer',
    },
    {
      key: 'raffle_prize',
      value: process.env.NEXT_PUBLIC_RAFFLE_PRIZE || 'Auto Toyota 2024',
    },
    {
      key: 'ticket_price',
      value: process.env.NEXT_PUBLIC_TICKET_PRICE || '50',
    },
  ];

  for (const config of configs) {
    await prisma.raffleConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ Configuración de la rifa guardada');
  console.log('');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


