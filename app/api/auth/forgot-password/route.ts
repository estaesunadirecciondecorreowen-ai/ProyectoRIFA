import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/email';
import { generateToken } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
      });
    }

    const reset_token = generateToken();
    const reset_token_expiry = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token,
        reset_token_expiry,
      },
    });

    await sendEmail({
      to: email,
      subject: 'Restablecer contraseña',
      html: getPasswordResetEmailHtml(user.nombre, reset_token),
    });

    return NextResponse.json({
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}


