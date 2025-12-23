import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { TransferStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        status: TransferStatus.pending_review,
      },
      include: {
        purchase: {
          include: {
            user: true,
            tickets: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error('Error obteniendo transferencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener transferencias' },
      { status: 500 }
    );
  }
}


