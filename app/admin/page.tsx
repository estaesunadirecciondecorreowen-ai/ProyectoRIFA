'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const ticketStats = stats.ticketStats.reduce((acc: any, stat: any) => {
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-white">
            Vista general del sistema
          </p>
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
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Boletos Vendidos</p>
                <p className="text-4xl font-bold mt-2">{soldCount}</p>
                <p className="text-green-100 text-xs mt-1">
                  {((soldCount / 500) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="text-5xl opacity-20">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pendientes</p>
                <p className="text-4xl font-bold mt-2">{pendingCount}</p>
                <p className="text-yellow-100 text-xs mt-1">
                  {stats.pendingTransfers} transferencias
                </p>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Disponibles</p>
                <p className="text-4xl font-bold mt-2">{availableCount}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {((availableCount / 500) * 100).toFixed(1)}% restante
                </p>
              </div>
              <div className="text-5xl opacity-20">🎫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Ingresos Totales</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(stats.revenue.total)}</p>
                <p className="text-purple-100 text-xs mt-1">
                  {stats.revenue.salesCount} ventas
                </p>
              </div>
              <div className="text-5xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Usuarios y Alertas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Información del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-800 font-medium">Usuarios Registrados</span>
                <span className="font-bold text-lg text-blue-600">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-800 font-medium">Total de Boletos</span>
                <span className="font-bold text-lg text-blue-600">500</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-800 font-medium">Precio por Boleto</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '50'))}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Alertas
              {stats.pendingTransfers > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  {stats.pendingTransfers}
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {stats.pendingTransfers > 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 font-medium">
                    ⚠️ Tienes {stats.pendingTransfers} transferencia(s) pendiente(s) de validar
                  </p>
                  <button
                    onClick={() => router.push('/admin/transfers')}
                    className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 font-medium"
                  >
                    Ver ahora →
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">
                    ✅ No hay transferencias pendientes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Ventas Recientes</h2>

          {stats.recentSales.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay ventas registradas aún
            </p>
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
                  {stats.recentSales.map((sale: any) => (
                    <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm font-bold text-blue-600">{sale.unique_code}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{sale.user.nombre}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {sale.tickets.length} boletos
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">{formatCurrency(sale.total)}</td>
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


