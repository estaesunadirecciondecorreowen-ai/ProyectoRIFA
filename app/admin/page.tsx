"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Row = {
  id: string;
  numero: number;
  estado: string;
  comprador?: string | null;
  telefono?: string | null;
  folio?: string | null;
  metodo?: string | null;
  vendedor?: string | null;
  total?: number | null;
};

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/tickets?mode=grid&q=${encodeURIComponent(q)}&pageSize=200`,
        { cache: "no-store" }
      );

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const json = await res.json();
      setRows(json.rows ?? []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchRows();
  }, [status]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <h1 className="text-3xl font-extrabold">Panel Admin</h1>
      <p className="text-white/70 mb-6">Gestión de boletos y validación de pagos</p>

      {/* BUSCADOR */}
      <div className="flex gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número, estado, nombre, teléfono, folio..."
          className="w-[420px] rounded-xl bg-white/10 border border-white/20 px-4 py-2"
        />
        <button
          onClick={fetchRows}
          className="rounded-xl bg-white text-black px-4 py-2 font-semibold"
        >
          Buscar
        </button>
      </div>

      {/* TABLA */}
      <div className="rounded-2xl bg-white/10 p-4">
        {loading ? (
          <div className="py-10 text-white/60">Cargando...</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-white/60">No hay resultados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="text-white/70 border-b border-white/10">
                  <th className="px-3 py-3 text-left">Número</th>
                  <th className="px-3 py-3 text-left">Estado</th>
                  <th className="px-3 py-3 text-left">Comprador</th>
                  <th className="px-3 py-3 text-left">Teléfono</th>
                  <th className="px-3 py-3 text-left">Folio</th>
                  <th className="px-3 py-3 text-left">Método</th>
                  <th className="px-3 py-3 text-left">Total</th>
                  <th className="px-3 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="px-3 py-3 font-bold">{r.numero}</td>
                    <td className="px-3 py-3">
                      <span className="bg-white/10 px-3 py-1 rounded-full">
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-3 py-3">{r.comprador ?? "-"}</td>
                    <td className="px-3 py-3">{r.telefono ?? "-"}</td>
                    <td className="px-3 py-3">{r.folio ?? "-"}</td>
                    <td className="px-3 py-3">{r.metodo ?? "-"}</td>
                    <td className="px-3 py-3">{r.total ?? "-"}</td>
                    <td className="px-3 py-3">
                      <button className="bg-white/10 px-3 py-1 rounded-lg mr-2">
                        Ver
                      </button>
                      <button className="bg-red-600/80 px-3 py-1 rounded-lg">
                        Liberar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
