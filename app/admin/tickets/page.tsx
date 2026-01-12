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
  updated_at: string | Date;
};

export default function AdminTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const userRole = (session?.user as any)?.role ?? (session?.user as any)?.rol;

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
      fetchRows('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchRows = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error cargando tickets');
      setRows(data.rows || []);
    } catch (e: any) {
      toast.error(e.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const countLabel = useMemo(() => `${rows.length} registro(s)`, [rows.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Base completa de boletos</h1>
            <p className="text-white/80 mt-1">Busca por boleto, nombre, correo, teléfono o folio. ({countLabel})</p>
          </div>

          <button
            onClick={() => router.push('/admin')}
            className="px-5 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors"
          >
            ← Volver al panel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchRows(q)}
              placeholder="Ej: 123 | Juan | correo@gmail.com | 55... | FOLIO..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-blue-700 font-medium placeholder:text-gray-400"
            />
            <button
              onClick={() => fetchRows(q)}
              className="px-6 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
            >
              🔍 Buscar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          {loading ? (
            <div className="py-16 text-center text-gray-700">Cargando…</div>
          ) : rows.length === 0 ? (
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
                  {rows.map((r) => (
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
                        {formatDate(new Date(r.updated_at))}
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
