"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type TicketSimple = { id: string; numero: number; estado: string };
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
  const [tickets, setTickets] = useState<TicketSimple[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [q, setQ] = useState("");

  // Gate: si no hay sesión, login
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // Gate: si hay sesión pero no es admin, fuera
  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as any)?.role ?? (session?.user as any)?.rol;
    if (role && role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  // Fetch seguro
  useEffect(() => {
    if (status !== "authenticated") return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/tickets", {
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401) {
          setTickets([]);
          setStats(null);
          router.push("/auth/login");
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`GET /api/admin/tickets failed: ${res.status} ${txt}`);
        }

        const json = await res.json();

        setTickets(Array.isArray(json?.tickets) ? json.tickets : []);
        setStats(json?.stats ?? null);
      } catch (err) {
        console.error(err);
        setTickets([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, router]);

  const filtered = useMemo(() => {
    const query = q.trim();
    if (!query) return tickets;

    const num = Number(query);
    const isNum = query !== "" && !Number.isNaN(num);

    return (tickets ?? []).filter((t) => {
      if (isNum && t.numero === num) return true;
      return (
        String(t.numero).includes(query) ||
        (t.estado || "").toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [tickets, q]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Panel Admin - Tickets</h1>

      {stats && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <Card label="Total" value={stats.total} />
          <Card label="Vendidos" value={stats.sold} />
          <Card label="Pendientes" value={stats.pending} />
          <Card label="Disponibles" value={stats.available} />
          <Card label="% Vendido" value={`${stats.percentage}%`} />
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por número o estado..."
          style={{
            width: 360,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <p>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p>No hay resultados.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Número</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <Td>{t.numero}</Td>
                  <Td>{t.estado}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, minWidth: 160 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{String(value)}</div>
    </div>
  );
}

function Th({ children }: { children: any }) {
  return (
    <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "1px solid #ddd" }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: any }) {
  return <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{children}</td>;
}
