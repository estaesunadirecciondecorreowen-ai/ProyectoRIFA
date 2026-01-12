import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role ?? (session?.user as any)?.rol;

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const numeroStr = (searchParams.get("numero") || "").trim();
    const numero = Number(numeroStr);

    if (!numero || Number.isNaN(numero)) {
      return NextResponse.json({ error: "Número inválido" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { numero },
      select: {
        id: true,
        numero: true,
        estado: true,
      },
    });

    return NextResponse.json({ ticket: ticket ?? null });
  } catch (error) {
    console.error("lookup ticket error:", error);
    return NextResponse.json({ error: "Error al buscar boleto" }, { status: 500 });
  }
}
