// app/api/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanExpiredReservations } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await cleanExpiredReservations();

    const totalTickets = parseInt(
      process.env.NEXT_PUBLIC_TOTAL_TICKETS || "500",
      10
    );

    const grouped = await prisma.ticket.groupBy({
      by: ["estado"],
      _count: true,
    });

    const sold = grouped
      .filter((s) => s.estado === "sold" || s.estado === "sold_physical")
      .reduce((acc, s) => acc + s._count, 0);

    const pending = grouped
      .filter((s) => s.estado === "pending_review")
      .reduce((acc, s) => acc + s._count, 0);

    const available = grouped
      .filter((s) => s.estado === "available")
      .reduce((acc, s) => acc + s._count, 0);

    const stats = {
      total: totalTickets,
      sold,
      pending,
      available,
      percentage: totalTickets > 0 ? ((sold / totalTickets) * 100).toFixed(2) : "0.00",
    };

    const tickets = await prisma.ticket.findMany({
      orderBy: { numero: "asc" },
      select: { id: true, numero: true, estado: true },
    });

    return NextResponse.json({ tickets, stats });
  } catch (error) {
    console.error("Error en /api/tickets:", error);
    return NextResponse.json({ error: "Error al obtener tickets" }, { status: 500 });
  }
}
