import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cleanExpiredReservations } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Limpiar reservaciones expiradas antes de obtener tickets
    await cleanExpiredReservations();

    const tickets = await prisma.ticket.findMany({
      orderBy: { numero: 'asc' },
      select: {
        id: true,
        numero: true,
        estado: true,
      },
    });

    // Estadísticas
    const stats = await prisma.ticket.groupBy({
      by: ['estado'],
      _count: true,
    });

    const totalTickets = parseInt(process.env.NEXT_PUBLIC_TOTAL_TICKETS || '500');
    const soldCount = stats
      .filter((s) => s.estado === 'sold' || s.estado === 'sold_physical')
      .reduce((acc, s) => acc + s._count, 0);
    const pendingCount = stats
      .filter((s) => s.estado === 'pending_review')
      .reduce((acc, s) => acc + s._count, 0);
    const availableCount = stats
      .filter((s) => s.estado === 'available')
      .reduce((acc, s) => acc + s._count, 0);

    return NextResponse.json({
      tickets,
      stats: {
        total: totalTickets,
        sold: soldCount,
        pending: pendingCount,
        available: availableCount,
        percentage: ((soldCount / totalTickets) * 100).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}


