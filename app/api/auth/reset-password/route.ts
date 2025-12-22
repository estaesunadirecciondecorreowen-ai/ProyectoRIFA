import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        reset_token: null,
        reset_token_expiry: null,
      },
    });

    return NextResponse.json({
      message: 'Contraseña restablecida exitosamente',
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return NextResponse.json(
      { error: 'Error al restablecer contraseña' },
      { status: 500 }
    );
  }
}


