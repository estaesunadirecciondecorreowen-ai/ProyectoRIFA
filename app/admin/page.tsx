"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Row = {
  id: string;
  numero: number;
  estado: string;
  updatedAt?: string;

  comprador?: string | null;
  correo?: string | null;
  telefono?: string | null;

  folioTransferencia?: string | null;
  metodo?: string | null;
  vendedor?: string | null;

  purchaseStatus?: string | null;
  purchaseCode?: string | null;
  purchaseTotal?: number | null;
};

type Stats = {
  total: number;
  sold: number;
  pending: number;
  available: number;
  percentage: string;
};

export default function AdminTicketsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [releaseLoadingId, setReleaseLoadingId] = useState<string | null>(null);

  // Auth gate
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as any)?.role ?? (session?.user as any)?.rol;
    if (role && role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  const fetchRows = async (opts?: { resetPage?: boolean }) => {
    try {
      setErrorMsg(null);
      setLoading(true);

      const nextPage = opts?.resetPage ? 1 : page;

      const url =
        `/api/admin/tickets?mode=grid` +
        `&q=${encodeURIComponent(q)}` +
        `&page=${nextPage}` +
        `&pageSize=${pageSize}` +
        `&sort=numero&order=asc`;

      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`GET ${url} -> ${res.status} ${txt}`);
      }

      const json = await res.json();

      // ✅ Aquí está el fix clave: el admin endpoint devuelve rows
      const list: Row[] = Array.isArray(json?.rows)
        ? json.rows
        : Array.isArray(json?.tickets)
        ? json.tickets
        : [];

      setRows(list);
      setStats(json?.stats ?? null);

      // paginación (si vino)
      setTotalPages(Number(json?.totalPages ?? 1));

      if (opts?.resetPage) setPage(1);
    } catch (e: any) {
      console.error(e);
      setRows([]);
      setStats(null);
      setErrorMsg("No se pudieron cargar los tickets del panel admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const onSearch = async () => {
    await fetchRows({ resetPage: true });
  };

  const releaseTicket = async (ticketId: string) => {
    try {
      setReleaseLoadingId(ticketId);
      setErrorMsg(null);

      const res = await fetch("/api/admin/tickets/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`POST release -> ${res.status} ${txt}`);
      }

      // refrescar
      await fetchRows();
    } catch (e: any) {
      console.error(e);
      setErrorMsg("No se pudo liberar el boleto. Revisa el estado o intenta de nuevo.");
    } finally {
      setReleaseLoadingId(null);
    }
  };

  const headerStats = useMemo(() => {
    if (!stats) return null;
    return [
      { label: "Total", value: stats.total },
      { label: "Disponibles", value: stats.available },
      { label: "Vendidos", value: stats.sold },
      { label: "Pendientes", value: stats.pending },
      { label: "% Vendido", value: `${stats.percentage}%` },
    ];
  }, [stats]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Panel Admin</h1>
            <p className="text-white/70">Gestión de boletos y validación de pagos</p>
          </div>

          <div className="flex gap-2">
            {/* Ajusta estas rutas a tus páginas reales */}
            <button
              onClick={() => router.push("/admin/transfers")}
              className="rounded-xl bg-white/10 px-4 py-2 font-semibold hover:bg-white/15"
            >
              Validar transferencias
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-white/90"
            >
              Tickets
            </button>
          </div>
        </div>

        {/* Stats */}
        {headerStats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {headerStats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4">
                <div className="text-xs text-white/70">{s.label}</div>
                <div className="mt-1 text-xl font-extrabold">{String(s.value)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Actions */}
        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por número, estado, nombre, email, folio..."
                className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-2 outline-none sm:w-[460px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch();
                }}
              />
              <button
                onClick={onSearch}
                className="rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-white/90"
              >
                Buscar
              </button>
            </div>

            <div className="text-sm text-white/70">
              Mostrando <span className="font-bold text-white">{rows.length}</span> resultados
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-100">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Tabla de boletos</h2>
            <div className="text-sm text-white/60">
              Página {page} de {totalPages}
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-white/70">Cargando...</div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-white/70">No hay resultados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-white/70">
                    <Th>Número</Th>
                    <Th>Estado</Th>
                    <Th>Comprador</Th>
                    <Th>Teléfono</Th>
                    <Th>Folio</Th>
                    <Th>Método</Th>
                    <Th>Total</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const canRelease =
                      r.estado === "reserved" ||
                      r.estado === "pending_review" ||
                      r.estado === "reserved_physical";

                    return (
                      <tr key={r.id} className="border-t border-white/10">
                        <Td className="font-extrabold">{r.numero}</Td>
                        <Td>
                          <span className="rounded-full bg-white/10 px-3 py-1">
                            {r.estado}
                          </span>
                        </Td>
                        <Td>{r.comprador ?? "-"}</Td>
                        <Td>{r.telefono ?? "-"}</Td>
                        <Td>{r.folioTransferencia ?? "-"}</Td>
                        <Td>{r.metodo ?? "-"}</Td>
                        <Td>{r.purchaseTotal ?? "-"}</Td>
                        <Td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/admin/tickets/${r.numero}`)}
                              className="rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/15"
                            >
                              Ver
                            </button>

                            <button
                              disabled={!canRelease || releaseLoadingId === r.id}
                              onClick={() => releaseTicket(r.id)}
                              className={`rounded-lg px-3 py-2 font-semibold ${
                                !canRelease
                                  ? "bg-white/5 text-white/40"
                                  : "bg-red-600/80 hover:bg-red-600"
                              }`}
                            >
                              {releaseLoadingId === r.id ? "Liberando..." : "Liberar"}
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pager */}
          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`rounded-xl px-4 py-2 font-semibold ${
                page <= 1 ? "bg-white/5 text-white/40" : "bg-white/10 hover:bg-white/15"
              }`}
            >
              Anterior
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={`rounded-xl px-4 py-2 font-semibold ${
                page >= totalPages ? "bg-white/5 text-white/40" : "bg-white/10 hover:bg-white/15"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: any }) {
  return (
    <th className="px-3 py-3 text-xs font-bold uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: any; className?: string }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}
