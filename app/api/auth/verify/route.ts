import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { verification_token: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        verification_token: null,
      },
    });

    return NextResponse.json({
      message: 'Correo verificado exitosamente',
    });
  } catch (error) {
    console.error('Error en verificación:', error);
    return NextResponse.json(
      { error: 'Error al verificar correo' },
      { status: 500 }
    );
  }
}


