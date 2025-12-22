import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Estadísticas de tickets
    const ticketStats = await prisma.ticket.groupBy({
      by: ['estado'],
      _count: true,
    });

    // Total de ingresos
    const approvedPurchases = await prisma.purchase.aggregate({
      where: {
        status: 'approved',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Transferencias pendientes
    const pendingTransfers = await prisma.transfer.count({
      where: {
        status: 'pending_review',
      },
    });

    // Usuarios registrados
    const totalUsers = await prisma.user.count({
      where: {
        rol: 'USER',
      },
    });

    // Ventas recientes
    const recentSales = await prisma.purchase.findMany({
      where: {
        status: 'approved',
      },
      include: {
        user: true,
        tickets: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({
      ticketStats,
      revenue: {
        total: approvedPurchases._sum.total || 0,
        salesCount: approvedPurchases._count,
      },
      pendingTransfers,
      totalUsers,
      recentSales,
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}


