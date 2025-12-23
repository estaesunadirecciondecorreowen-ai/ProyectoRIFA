'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminTransfersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        fetchTransfers();
      }
    }
  }, [status, session, router]);

  const fetchTransfers = async () => {
    try {
      const response = await fetch('/api/admin/transfers');
      const data = await response.json();
      setTransfers(data.transfers);
    } catch (error) {
      console.error('Error cargando transferencias:', error);
      toast.error('Error al cargar transferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (transferId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !notes.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo');
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/transfers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId,
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      setSelectedTransfer(null);
      setNotes('');
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Validar Transferencias
            </h1>
            <p className="text-white">
              {transfers.length} transferencia(s) pendiente(s)
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-white hover:text-gray-200"
          >
            ← Volver al panel
          </button>
        </div>

        {transfers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">¡Todo al día!</h2>
            <p className="text-gray-600">
              No hay transferencias pendientes de validar
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Información de la compra */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Información de la Compra
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-mono font-bold">
                          {transfer.purchase.unique_code}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Usuario:</span>
                        <div className="text-right">
                          <p className="font-medium">{transfer.purchase.user.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {transfer.purchase.user.email}
                          </p>
                          {transfer.purchase.user.telefono && (
                            <p className="text-sm text-gray-500">
                              {transfer.purchase.user.telefono}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Boletos:</span>
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                          {transfer.purchase.tickets.map((ticket: any) => (
                            <span
                              key={ticket.id}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold"
                            >
                              {ticket.numero.toString().padStart(3, '0')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Total esperado:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(transfer.purchase.total)}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Fecha de compra:</span>
                        <span className="text-sm">
                          {formatDate(new Date(transfer.purchase.created_at))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de la transferencia */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      Datos de la Transferencia
                    </h3>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Folio:</span>
                        <span className="font-mono font-bold">{transfer.folio}</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Monto:</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(transfer.monto)}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Fecha de pago:</span>
                        <span className="text-sm">
                          {formatDate(new Date(transfer.fecha))}
                        </span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Registrado:</span>
                        <span className="text-sm">
                          {formatDate(new Date(transfer.created_at))}
                        </span>
                      </div>
                    </div>

                    {/* Comprobante */}
                    <div className="mb-4">
                      <p className="text-gray-600 mb-2">Comprobante:</p>
                      <a
                        href={transfer.comprobante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        📄 Ver comprobante
                      </a>
                    </div>

                    {/* Validación */}
                    {transfer.monto < transfer.purchase.total && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 text-sm font-medium">
                          ⚠️ El monto transferido es menor al total de la compra
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notas del administrador */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-gray-700 font-medium mb-2">
                    Notas (opcional para aprobar, obligatorio para rechazar):
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={selectedTransfer?.id === transfer.id ? notes : ''}
                    onChange={(e) => {
                      setSelectedTransfer(transfer);
                      setNotes(e.target.value);
                    }}
                    placeholder="Ej: Validado según estado de cuenta del banco"
                  />
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleAction(transfer.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? 'Procesando...' : '✅ Aprobar Transferencia'}
                  </button>
                  <button
                    onClick={() => handleAction(transfer.id, 'reject')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {actionLoading ? 'Procesando...' : '❌ Rechazar Transferencia'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


