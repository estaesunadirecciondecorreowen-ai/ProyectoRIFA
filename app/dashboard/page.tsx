'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPurchase, setEditingPurchase] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    nombreComprador: '',
    telefonoComprador: '',
    nombreVendedor: '',
    folio: '',
    monto: '',
    fecha: '',
    comprobante: null as File | null,
  });

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

  const handleEditClick = (purchase: any) => {
    setEditingPurchase(purchase.id);
    setEditForm({
      nombreComprador: purchase.comprador_nombre || '',
      telefonoComprador: purchase.telefono_comprador || '',
      nombreVendedor: purchase.vendedor_nombre || '',
      folio: purchase.transfer?.folio || '',
      monto: purchase.transfer?.monto?.toString() || '',
      fecha: purchase.transfer?.fecha ? new Date(purchase.transfer.fecha).toISOString().split('T')[0] : '',
      comprobante: null,
    });
  };

  const handleCancelEdit = () => {
    setEditingPurchase(null);
    setEditForm({
      nombreComprador: '',
      telefonoComprador: '',
      nombreVendedor: '',
      folio: '',
      monto: '',
      fecha: '',
      comprobante: null,
    });
  };

  const handleSubmitEdit = async (purchaseId: string) => {
    try {
      const formData = new FormData();
      formData.append('purchaseId', purchaseId);
      formData.append('nombreComprador', editForm.nombreComprador);
      formData.append('telefonoComprador', editForm.telefonoComprador);
      formData.append('nombreVendedor', editForm.nombreVendedor);
      formData.append('folio', editForm.folio);
      formData.append('monto', editForm.monto);
      formData.append('fecha', editForm.fecha);
      
      if (editForm.comprobante) {
        formData.append('comprobante', editForm.comprobante);
      }

      const response = await fetch('/api/transfers/update', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      toast.success('Transferencia actualizada exitosamente');
      setEditingPurchase(null);
      fetchPurchases(); // Recargar compras
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar transferencia');
    }
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
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Mi Dashboard
          </h1>
          <p className="text-white text-lg">
            Bienvenido, <strong className="text-white">{session?.user?.name}</strong>
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
                        <p className="text-sm text-blue-700 font-medium">
                          Código: <span className="font-mono font-bold text-blue-800">{purchase.unique_code}</span>
                        </p>
                        <p className="text-sm text-blue-700 font-medium">
                          {formatDate(new Date(purchase.created_at))}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Método de pago</p>
                        <p className="font-bold capitalize text-blue-800">{purchase.method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Total pagado</p>
                        <p className="font-bold text-lg text-green-600">
                          {formatCurrency(purchase.total)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-2">
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

                    {/* Información del comprador y vendedor */}
                    {(purchase.comprador_nombre || purchase.vendedor_nombre) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-blue-700 font-medium mb-2">Información de la compra:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {purchase.comprador_nombre && (
                            <div>
                              <span className="text-blue-700">Comprador:</span>{' '}
                              <span className="font-bold text-blue-800">{purchase.comprador_nombre}</span>
                            </div>
                          )}
                          {purchase.telefono_comprador && (
                            <div>
                              <span className="text-blue-700">Teléfono:</span>{' '}
                              <span className="font-bold text-blue-800">{purchase.telefono_comprador}</span>
                            </div>
                          )}
                          {purchase.vendedor_nombre && (
                            <div>
                              <span className="text-blue-700">Vendedor:</span>{' '}
                              <span className="font-bold text-blue-800">{purchase.vendedor_nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {purchase.transfer && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-blue-700 font-medium">Información de transferencia:</p>
                          {purchase.status === 'pending_review' && editingPurchase !== purchase.id && (
                            <button
                              onClick={() => handleEditClick(purchase)}
                              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              ✏️ Editar
                            </button>
                          )}
                        </div>

                        {editingPurchase === purchase.id ? (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nombre del Comprador *
                                </label>
                                <input
                                  type="text"
                                  value={editForm.nombreComprador}
                                  onChange={(e) => setEditForm({...editForm, nombreComprador: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Teléfono del Comprador *
                                </label>
                                <input
                                  type="tel"
                                  value={editForm.telefonoComprador}
                                  onChange={(e) => setEditForm({...editForm, telefonoComprador: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nombre del Vendedor *
                                </label>
                                <input
                                  type="text"
                                  value={editForm.nombreVendedor}
                                  onChange={(e) => setEditForm({...editForm, nombreVendedor: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Folio de Transferencia *
                                </label>
                                <input
                                  type="text"
                                  value={editForm.folio}
                                  onChange={(e) => setEditForm({...editForm, folio: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Monto *
                                </label>
                                <input
                                  type="number"
                                  value={editForm.monto}
                                  onChange={(e) => setEditForm({...editForm, monto: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fecha de Transferencia *
                                </label>
                                <input
                                  type="date"
                                  value={editForm.fecha}
                                  onChange={(e) => setEditForm({...editForm, fecha: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nuevo Comprobante (opcional - deja vacío para mantener el actual)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditForm({...editForm, comprobante: e.target.files?.[0] || null})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitEdit(purchase.id)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                💾 Guardar Cambios
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-blue-700">Folio:</span>{' '}
                                <span className="font-bold text-blue-800">{purchase.transfer.folio}</span>
                              </div>
                              <div>
                                <span className="text-blue-700">Monto:</span>{' '}
                                <span className="font-bold text-green-600">{formatCurrency(purchase.transfer.monto)}</span>
                              </div>
                            </div>
                            {purchase.transfer.admin_notes && (
                              <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                                <p className="text-blue-800">
                                  <strong>Nota del administrador:</strong> {purchase.transfer.admin_notes}
                                </p>
                              </div>
                            )}
                          </>
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


