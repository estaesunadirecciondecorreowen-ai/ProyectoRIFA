'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import { formatDate } from '@/lib/utils';

type Row = {
  id: string;
  numero: number;
  estado: string;

  comprador_nombre: string | null;
  correo: string | null;
  telefono: string | null;

  vendedor_nombre: string | null;
  metodo: string | null;
  folio: string | null;

  unique_code: string | null;
  updated_at: string | null;
};

function safeToString(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function safeDateISO(v: any): string | null {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function normalizeRow(raw: any): Row {
  const id = safeToString(raw?.id) ?? `${raw?.numero ?? Math.random()}`;
  const numero = Number(raw?.numero ?? 0);

  return {
    id,
    numero: Number.isFinite(numero) ? numero : 0,
    estado: safeToString(raw?.estado) ?? '-',

    comprador_nombre:
      safeToString(raw?.comprador_nombre) ??
      safeToString(raw?.comprador) ??
      safeToString(raw?.buyerName) ??
      null,

    correo: safeToString(raw?.correo) ?? safeToString(raw?.buyerEmail) ?? null,

    telefono: safeToString(raw?.telefono) ?? safeToString(raw?.buyerPhone) ?? null,

    vendedor_nombre:
      safeToString(raw?.vendedor_nombre) ??
      safeToString(raw?.vendedor) ??
      null,

    metodo: safeToString(raw?.metodo) ?? safeToString(raw?.method) ?? null,

    folio:
      safeToString(raw?.folio) ??
      safeToString(raw?.folioTransferencia) ??
      null,

    unique_code:
      safeToString(raw?.unique_code) ??
      safeToString(raw?.purchaseCode) ??
      safeToString(raw?.purchase_code) ??
      null,

    updated_at:
      safeDateISO(raw?.updated_at) ??
      safeDateISO(raw?.updatedAt) ??
      null,
  };
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default function AdminTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = (session?.user as any)?.role ?? (session?.user as any)?.rol;

  const [q, setQ] = useState('');
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  // texto aplicado (para que el botón Buscar sea real y no filtre “en vivo” si no quieres)
  const [appliedQ, setAppliedQ] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      void fetchRowsOnce();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchRowsOnce = async () => {
    setLoading(true);
    try {
      // Importante: NO dependemos de q en server.
      // Pedimos todo una vez (modo grid por si existe).
      const res = await fetch(`/api/admin/tickets?mode=grid&pageSize=500`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push('/auth/login');
        return;
      }
      if (!res.ok) throw new Error(data?.error || 'Error cargando tickets');

      const rawList = Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data?.tickets)
        ? data.tickets
        : [];

      setAllRows(rawList.map(normalizeRow));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error cargando tickets');
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const query = appliedQ.trim();
    if (!query) return allRows;

    // Si el usuario mete varias palabras, filtramos por “todas”
    const parts = query.split(/\s+/).filter(Boolean);

    return allRows.filter((r) => {
      const bag = [
        r.numero ? String(r.numero) : '',
        r.estado ?? '',
        r.comprador_nombre ?? '',
        r.correo ?? '',
        r.telefono ?? '',
        r.folio ?? '',
        r.metodo ?? '',
        r.vendedor_nombre ?? '',
        r.unique_code ?? '',
      ].join(' | ');

      return parts.every((p) => includesCI(bag, p));
    });
  }, [allRows, appliedQ]);

  const countLabel = useMemo(() => `${filteredRows.length} registro(s)`, [filteredRows.length]);

  const handleBuscar = () => {
    setAppliedQ(q);
  };

  const handleLimpiar = () => {
    setQ('');
    setAppliedQ('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Base completa de boletos</h1>
            <p className="text-white/80 mt-1">
              Busca por boleto, nombre, correo, teléfono o folio. ({countLabel})
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-5 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Panel Admin
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="px-5 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
            >
              ← Volver al panel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Ej: 123 | Juan | correo@gmail.com | 55... | FOLIO..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-blue-700 font-medium placeholder:text-gray-400"
            />
            <button
              onClick={handleBuscar}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
            >
              🔍 Buscar
            </button>
            <button
              onClick={handleLimpiar}
              className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>

          {/* Opcional: botón recargar si cambian ventas en vivo */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={fetchRowsOnce}
              className="text-sm font-bold text-blue-700 hover:text-blue-900"
            >
              Recargar datos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          {loading ? (
            <div className="py-16 text-center text-gray-700">Cargando…</div>
          ) : filteredRows.length === 0 ? (
            <div className="py-16 text-center text-gray-600">Sin resultados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Boleto</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Estado</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Comprador</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Correo</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Teléfono</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Folio</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Método</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Vendedor</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Código</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Actualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-blue-700">#{r.numero}</td>
                      <td className="py-3 px-4 text-gray-800">{r.estado}</td>
                      <td className="py-3 px-4 text-gray-800">{r.comprador_nombre ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-800">{r.correo ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-800">{r.telefono ?? '-'}</td>
                      <td className="py-3 px-4 font-mono text-gray-800">{r.folio ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-800">{r.metodo ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-800">{r.vendedor_nombre ?? '-'}</td>
                      <td className="py-3 px-4 font-mono text-gray-800">{r.unique_code ?? '-'}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {r.updated_at ? formatDate(new Date(r.updated_at)) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
