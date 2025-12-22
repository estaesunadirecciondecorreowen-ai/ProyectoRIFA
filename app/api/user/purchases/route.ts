import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const purchases = await prisma.purchase.findMany({
      where: {
        user_id: userId,
      },
      include: {
        tickets: {
          orderBy: {
            numero: 'asc',
          },
        },
        transfer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({ purchases });
  } catch (error) {
    console.error('Error obteniendo compras:', error);
    return NextResponse.json(
      { error: 'Error al obtener compras' },
      { status: 500 }
    );
  }
}


