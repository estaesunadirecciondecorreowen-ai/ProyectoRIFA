'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchPurchases();
    }
  }, [status, router]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/user/purchases');
      const data = await response.json();
      setPurchases(data.purchases);
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { text: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-800' },
      pending_review: { text: 'En revisión', color: 'bg-blue-100 text-blue-800' },
      approved: { text: 'Aprobado', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rechazado', color: 'bg-red-100 text-red-800' },
      cancelled: { text: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
    };
    return badges[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const approvedPurchases = purchases.filter((p) => p.status === 'approved');
  const pendingPurchases = purchases.filter((p) => p.status === 'pending_review');
  const totalTickets = approvedPurchases.reduce((acc, p) => acc + p.tickets.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mi Dashboard
          </h1>
          <p className="text-gray-600">
            Bienvenido, <strong>{session?.user?.name}</strong>
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Boletos Confirmados</p>
                <p className="text-4xl font-bold mt-2">{totalTickets}</p>
              </div>
              <div className="text-5xl opacity-20">🎫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">En Revisión</p>
                <p className="text-4xl font-bold mt-2">{pendingPurchases.length}</p>
              </div>
              <div className="text-5xl opacity-20">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total de Compras</p>
                <p className="text-4xl font-bold mt-2">{purchases.length}</p>
              </div>
              <div className="text-5xl opacity-20">📊</div>
            </div>
          </div>
        </div>

        {/* Botón de compra */}
        <div className="mb-8">
          <Link
            href="/comprar"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            ➕ Comprar más boletos
          </Link>
        </div>

        {/* Lista de compras */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Historial de Compras</h2>

          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <p className="text-gray-600 text-lg mb-6">
                Aún no has comprado boletos
              </p>
              <Link
                href="/comprar"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
              >
                Comprar Boletos
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => {
                const badge = getStatusBadge(purchase.status);

                return (
                  <div
                    key={purchase.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Código: <span className="font-mono font-bold">{purchase.unique_code}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(purchase.created_at))}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Método de pago</p>
                        <p className="font-medium capitalize">{purchase.method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total pagado</p>
                        <p className="font-bold text-lg text-primary-600">
                          {formatCurrency(purchase.total)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Boletos ({purchase.tickets.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {purchase.tickets.map((ticket: any) => (
                          <span
                            key={ticket.id}
                            className={`px-3 py-1 rounded-md font-bold text-sm ${
                              purchase.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : purchase.status === 'pending_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ticket.numero.toString().padStart(3, '0')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {purchase.transfer && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Información de transferencia:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Folio:</span>{' '}
                            <span className="font-medium">{purchase.transfer.folio}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Monto:</span>{' '}
                            <span className="font-medium">{formatCurrency(purchase.transfer.monto)}</span>
                          </div>
                        </div>
                        {purchase.transfer.admin_notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                            <p className="text-gray-600">
                              <strong>Nota del administrador:</strong> {purchase.transfer.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


