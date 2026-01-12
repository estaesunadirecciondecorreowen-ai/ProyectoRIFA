'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';

type Row = {
  id: string;
  numero: number;
  estado: string;

  comprador: string;
  correo: string;
  telefono: string;

  folio: string;
  method: string;
  vendedor: string;
};

export default function AdminTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role ?? (session?.user as any)?.rol;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      fetchRows();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tickets', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Error cargando boletos');
      setRows(data?.rows || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error cargando boletos');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((r) => {
      const blob = [
        r.numero,
        r.estado,
        r.comprador,
        r.correo,
        r.telefono,
        r.folio,
        r.method,
        r.vendedor,
      ]
        .join(' ')
        .toLowerCase();

      return blob.includes(term);
    });
  }, [q, rows]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Base completa de boletos</h1>
            <p className="text-white/80">
              Busca por boleto, nombre, correo, teléfono o folio. ({filtered.length} registro(s))
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
          >
            ← Volver al panel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 text-gray-900">
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: 123 | Juan | correo@gmail.com | 55... | FOLIO..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 font-medium placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => null}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              🔎 Buscar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden text-gray-900">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Boleto</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Estado</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Comprador</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Correo</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Teléfono</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Folio</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Método</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Vendedor</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-blue-700">#{r.numero}</td>
                      <td className="py-3 px-4 text-gray-900">{r.estado || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.comprador || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.correo || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.telefono || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.folio || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.method || '-'}</td>
                      <td className="py-3 px-4 text-gray-900">{r.vendedor || '-'}</td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td className="py-8 px-4 text-center text-gray-500" colSpan={8}>
                        No hay resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
