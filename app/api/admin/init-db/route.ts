import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Esta ruta solo debe usarse UNA VEZ para inicializar la base de datos
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar si ya hay usuarios (para evitar re-inicializar)
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json(
        { error: 'La base de datos ya está inicializada. Si necesitas reinicializarla, contacta al administrador.' },
        { status: 400 }
      );
    }

    // Crear los 500 boletos
    const tickets = [];
    for (let i = 1; i <= 500; i++) {
      tickets.push({
        numero: i,
        estado: 'available',
      });
    }

    await prisma.ticket.createMany({
      data: tickets,
      skipDuplicates: true,
    });

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123456', 10);
    const admin = await prisma.user.create({
      data: {
        nombre: 'Administrador',
        email: 'admin@rifaaltruista.com',
        telefono: '0000000000',
        password_hash: adminPassword,
        email_verified: true,
        rol: 'ADMIN',
      },
    });

    return NextResponse.json({
      message: 'Base de datos inicializada exitosamente',
      tickets: 500,
      admin: {
        email: 'admin@rifaaltruista.com',
        password: 'admin123456',
        warning: '⚠️ CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE'
      }
    });
  } catch (error) {
    console.error('Error al inicializar base de datos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al inicializar base de datos' },
      { status: 500 }
    );
  }
}

