// app/api/admin/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cleanExpiredReservations } from "@/lib/utils";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type SortKey = "numero" | "estado" | "updatedAt";

export async function GET(req: Request) {
  try {
    // 1) Admin only (FIX: role)
    const session = await getServerSession(authOptions);

    const role =
      (session?.user as any)?.role ?? // <- tu auth.ts guarda role
      (session?.user as any)?.rol;    // compat opcional

    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2) Limpieza de reservaciones expiradas
    await cleanExpiredReservations();

    const { searchParams } = new URL(req.url);

    const mode = (searchParams.get("mode") || "").trim(); // "grid"
    const q = (searchParams.get("q") || "").trim();

    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") || "25", 10), 5),
      200
    );

    const sort = (searchParams.get("sort") || "numero") as SortKey;
    const order =
      (searchParams.get("order") || "asc").toLowerCase() === "desc"
        ? "desc"
        : "asc";

    const totalTickets = parseInt(process.env.NEXT_PUBLIC_TOTAL_TICKETS || "500", 10);

    // 3) Stats (siempre)
    const grouped = await prisma.ticket.groupBy({
      by: ["estado"],
      _count: true,
    });

    const soldCount = grouped
      .filter((s) => s.estado === "sold" || s.estado === "sold_physical")
      .reduce((acc, s) => acc + s._count, 0);

    const pendingCount = grouped
      .filter((s) => s.estado === "pending_review")
      .reduce((acc, s) => acc + s._count, 0);

    const availableCount = grouped
      .filter((s) => s.estado === "available")
      .reduce((acc, s) => acc + s._count, 0);

    const stats = {
      total: totalTickets,
      sold: soldCount,
      pending: pendingCount,
      available: availableCount,
      percentage: totalTickets > 0 ? ((soldCount / totalTickets) * 100).toFixed(2) : "0.00",
    };

    // 4) Si NO piden tabla extendida, devolvemos lista simple
    const wantsExtended =
      mode === "grid" ||
      q.length > 0 ||
      searchParams.has("page") ||
      searchParams.has("pageSize");

    if (!wantsExtended) {
      const tickets = await prisma.ticket.findMany({
        orderBy: { numero: "asc" },
        select: { id: true, numero: true, estado: true },
      });

      return NextResponse.json({ tickets, stats });
    }

    // 5) Tabla extendida (búsqueda global)
    const qAsNumber = Number(q);
    const isNumber = q !== "" && !Number.isNaN(qAsNumber);

    const where: any =
      q === ""
        ? {}
        : {
            OR: [
              ...(isNumber ? [{ numero: qAsNumber }] : []),

              { estado: { equals: q as any } },
              { nota: { contains: q, mode: "insensitive" } },

              { user: { is: { nombre: { contains: q, mode: "insensitive" } } } },
              { user: { is: { email: { contains: q, mode: "insensitive" } } } },
              { user: { is: { telefono: { contains: q, mode: "insensitive" } } } },

              { purchase: { is: { unique_code: { contains: q, mode: "insensitive" } } } },
              { purchase: { is: { method: { contains: q, mode: "insensitive" } } } },
              { purchase: { is: { status: { equals: q as any } } } },

              { purchase: { is: { comprador_nombre: { contains: q, mode: "insensitive" } } } },
              { purchase: { is: { telefono_comprador: { contains: q, mode: "insensitive" } } } },
              { purchase: { is: { vendedor_nombre: { contains: q, mode: "insensitive" } } } },

              { purchase: { is: { transfer: { is: { folio: { contains: q, mode: "insensitive" } } } } } },
            ],
          };

    const orderBy: any =
      sort === "numero"
        ? { numero: order }
        : sort === "estado"
        ? { estado: order }
        : { updated_at: order };

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          numero: true,
          estado: true,
          nota: true,
          reserved_until: true,
          created_at: true,
          updated_at: true,

          user: {
            select: {
              id: true,
              nombre: true,
              email: true,
              telefono: true,
            },
          },

          purchase: {
            select: {
              id: true,
              total: true,
              status: true,
              method: true,
              unique_code: true,
              comprador_nombre: true,
              telefono_comprador: true,
              vendedor_nombre: true,
              created_at: true,
              updated_at: true,

              user: {
                select: {
                  id: true,
                  nombre: true,
                  email: true,
                  telefono: true,
                },
              },

              transfer: {
                select: {
                  id: true,
                  folio: true,
                  status: true,
                  monto: true,
                  fecha: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Aplanado para UI
    const rows = tickets.map((t: any) => {
      const buyerName =
        t.purchase?.comprador_nombre ||
        t.purchase?.user?.nombre ||
        t.user?.nombre ||
        null;

      const buyerEmail = t.purchase?.user?.email || t.user?.email || null;

      const buyerPhone =
        t.purchase?.telefono_comprador ||
        t.purchase?.user?.telefono ||
        t.user?.telefono ||
        null;

      const sellerName = t.purchase?.vendedor_nombre || null;

      const folio = t.purchase?.transfer?.folio || null;

      return {
        id: t.id,
        numero: t.numero,
        estado: t.estado,
        updatedAt: t.updated_at,

        comprador: buyerName,
        correo: buyerEmail,
        telefono: buyerPhone,

        folioTransferencia: folio,
        metodo: t.purchase?.method || null,
        vendedor: sellerName,

        purchaseStatus: t.purchase?.status || null,
        purchaseCode: t.purchase?.unique_code || null,
        purchaseTotal: t.purchase?.total || null,
      };
    });

    return NextResponse.json({
      stats,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      rows,
    });
  } catch (error) {
    console.error("Error obteniendo tickets:", error);
    return NextResponse.json({ error: "Error al obtener tickets" }, { status: 500 });
  }
}
