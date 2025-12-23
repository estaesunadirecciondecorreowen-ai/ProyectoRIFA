import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { nombre, email, telefono, password } = await request.json();

    // Validaciones básicas
    if (!nombre || !email || !telefono || !password) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben ser completados' },
        { status: 400 }
      );
    }

    if (telefono.length < 10) {
      return NextResponse.json(
        { error: 'El teléfono debe tener al menos 10 dígitos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario con email verificado automáticamente
    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        telefono,
        password_hash,
        email_verified: true, // Email verificado automáticamente
      },
    });

    return NextResponse.json({
      message: 'Usuario registrado exitosamente.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}


