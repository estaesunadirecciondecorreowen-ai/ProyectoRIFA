'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketInfo, setTicketInfo] = useState<any>(null);
  const [releaseLoading, setReleaseLoading] = useState(false);

  const TOTAL_TICKETS = parseInt(process.env.NEXT_PUBLIC_TOTAL_TICKETS || '500');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role ?? (session?.user as any)?.rol;
      if (userRole !== 'ADMIN') router.push('/dashboard');
      else fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
      toast.error('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const searchTicket = async () => {
    const num = parseInt(ticketNumber);
    if (!num || num < 1 || num > TOTAL_TICKETS) {
      toast.error(`Ingresa un número de boleto válido (1-${TOTAL_TICKETS})`);
      return;
    }

    try {
      const res = await fetch('/api/tickets', { cache: 'no-store' });
      const data = await res.json();
      const ticket = data.tickets.find((t: any) => t.numero === num);

      if (ticket) setTicketInfo(ticket);
      else {
        toast.error('Boleto no encontrado');
        setTicketInfo(null);
      }
    } catch {
      toast.error('Error al buscar boleto');
      setTicketInfo(null);
    }
  };

  const releaseTicket = async () => {
    if (!ticketInfo) return;

    setReleaseLoading(true);
    try {
      const res = await fetch('/api/admin/tickets/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumber: ticketInfo.numero }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo liberar');

      toast.success(data.message || 'Boleto liberado');
      setTicketInfo(null);
      setTicketNumber('');
      fetchStats();
    } catch (e: any) {
      toast.error(e.message || 'Error al liberar boleto');
    } finally {
      setReleaseLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!stats) return null;

  const ticketStats = (stats.ticketStats || []).reduce((acc: any, stat: any) => {
    acc[stat.estado] = stat._count;
    return acc;
  }, {});

  const soldCount = (ticketStats.sold || 0) + (ticketStats.sold_physical || 0);
  const pendingCount = ticketStats.pending_review || 0;
  const availableCount = ticketStats.available || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-black">Vista general del sistema</p>
        </div>

        {/* Navegación de Admin */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/transfers')}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            ⏳ Validar Transferencias
            {stats.pendingTransfers > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {stats.pendingTransfers}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push('/admin/physical-sales')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
          >
            🏪 Ventas Físicas
          </button>

          <button
            onClick={() => router.push('/admin/tickets')}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            📋 Base completa de boletos
          </button>
        </div>

        {/* Liberar Boletos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-2 text-gray-800">🔓 Liberar Boleto Reservado</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Busca y libera boletos que estén reservados o pendientes de pago
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max={TOTAL_TICKETS}
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchTicket()}
                  placeholder={`Número de boleto (1-${TOTAL_TICKETS})`}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-700 font-medium placeholder:text-gray-400"
                />
                <button
                  onClick={searchTicket}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  🔍 Buscar
                </button>
              </div>
            </div>

            {ticketInfo && (
              <div className="flex-1 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Boleto #{ticketInfo.numero}</p>
                  <p className="font-bold text-lg">
                    Estado:{' '}
                    <span
                      className={`
                        ${ticketInfo.estado === 'available' ? 'text-green-600' : ''}
                        ${ticketInfo.estado === 'reserved_pending_payment' ? 'text-gray-600' : ''}
                        ${ticketInfo.estado === 'pending_review' ? 'text-yellow-600' : ''}
                        ${
                          ticketInfo.estado === 'sold' || ticketInfo.estado === 'sold_physical'
                            ? 'text-red-600'
                            : ''
                        }
                      `}
                    >
                      {ticketInfo.estado}
                    </span>
                  </p>
                </div>

                {(ticketInfo.estado === 'reserved_pending_payment' ||
                  ticketInfo.estado === 'pending_review') && (
                  <button
                    onClick={releaseTicket}
                    disabled={releaseLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {releaseLoading ? '⏳ Liberando...' : '🔓 Liberar Boleto'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-green-100 text-sm">Boletos Vendidos</p>
            <p className="text-4xl font-bold mt-2">{soldCount}</p>
            <p className="text-green-100 text-xs mt-1">
              {((soldCount / TOTAL_TICKETS) * 100).toFixed(1)}% del total
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-yellow-100 text-sm">Pendientes</p>
            <p className="text-4xl font-bold mt-2">{pendingCount}</p>
            <p className="text-yellow-100 text-xs mt-1">{stats.pendingTransfers} transferencias</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-blue-100 text-sm">Disponibles</p>
            <p className="text-4xl font-bold mt-2">{availableCount}</p>
            <p className="text-blue-100 text-xs mt-1">
              {((availableCount / TOTAL_TICKETS) * 100).toFixed(1)}% restante
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <p className="text-purple-100 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold mt-2">{formatCurrency(stats.revenue.total)}</p>
            <p className="text-purple-100 text-xs mt-1">{stats.revenue.salesCount} ventas</p>
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Ventas Recientes</h2>

          {stats.recentSales?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay ventas registradas aún</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Código</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Usuario</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Boletos</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Total</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Método</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-800">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales?.map((sale: any) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm font-bold text-blue-600">
                        {sale.unique_code}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{sale.user.nombre}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {sale.tickets.length} boletos
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-gray-800">{sale.method}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-700">
                        {formatDate(new Date(sale.updated_at))}
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
