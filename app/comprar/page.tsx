'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import TicketGrid from '@/components/TicketGrid';

export default function ComprarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [transferData, setTransferData] = useState({
    folio: '',
    monto: '',
    fecha: '',
    comprobante: null as File | null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Debes iniciar sesión para comprar boletos');
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleTicketSelect = (ticketNumber: number) => {
    setSelectedTickets((prev) => {
      if (prev.includes(ticketNumber)) {
        return prev.filter((n) => n !== ticketNumber);
      } else {
        return [...prev, ticketNumber];
      }
    });
  };

  const handleReserve = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Selecciona al menos un boleto');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/tickets/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketNumbers: selectedTickets }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPurchaseData(data);
      setShowUpload(true);
      toast.success(`${selectedTickets.length} boleto(s) reservado(s). Tienes ${data.expiresInMinutes} minutos para completar el pago.`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transferData.comprobante) {
      toast.error('Debes subir tu comprobante de pago');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('purchaseId', purchaseData.purchaseId);
      formData.append('folio', transferData.folio);
      formData.append('monto', transferData.monto);
      formData.append('fecha', transferData.fecha);
      formData.append('comprobante', transferData.comprobante);

      const response = await fetch('/api/transfers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('¡Transferencia registrada! Te notificaremos cuando sea validada.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '100');
  const total = selectedTickets.length * ticketPrice;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Comprar Boletos
        </h1>

        {!showUpload ? (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Paso 1: Selecciona tus boletos</h2>
              <p className="text-gray-600 mb-4">
                Haz clic en los boletos disponibles (verdes) que deseas comprar.
                Precio por boleto: <strong>${ticketPrice} MXN</strong>
              </p>

              {selectedTickets.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium">
                    Boletos seleccionados: {selectedTickets.length}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    Total: ${total.toLocaleString('es-MX')} MXN
                  </p>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={loading || selectedTickets.length === 0}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
              >
                {loading ? 'Reservando...' : `Reservar ${selectedTickets.length} boleto(s)`}
              </button>
            </div>

            <TicketGrid
              selectable={true}
              onSelect={handleTicketSelect}
              selectedTickets={selectedTickets}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                ¡Boletos Reservados!
              </h2>
              <p className="text-center text-gray-600">
                Código de compra: <strong className="text-primary-600">{purchaseData.uniqueCode}</strong>
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                ⏰ Tienes {purchaseData.expiresInMinutes} minutos para completar tu pago.
                Después, los boletos se liberarán automáticamente.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">Paso 2: Realiza tu transferencia</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Banco:</strong> BBVA</p>
                <p><strong>Cuenta:</strong> 1234 5678 9012 3456</p>
                <p><strong>CLABE:</strong> 012345678901234567</p>
                <p><strong>Titular:</strong> Rifa Altruista</p>
                <p className="text-xl font-bold text-primary-600 mt-4">
                  Monto a pagar: ${total.toLocaleString('es-MX')} MXN
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Importante:</strong> En el concepto de pago, coloca tu código:{' '}
                  <span className="font-mono bg-white px-2 py-1 rounded">{purchaseData.uniqueCode}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadTransfer} className="space-y-4">
              <h3 className="font-bold text-lg">Paso 3: Sube tu comprobante</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folio / Referencia de transferencia *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={transferData.folio}
                  onChange={(e) => setTransferData({ ...transferData, folio: e.target.value })}
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto transferido *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min={total}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={transferData.monto}
                  onChange={(e) => setTransferData({ ...transferData, monto: e.target.value })}
                  placeholder={total.toString()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de transferencia *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={transferData.fecha}
                  onChange={(e) => setTransferData({ ...transferData, fecha: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de pago (imagen o PDF) *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => setTransferData({ ...transferData, comprobante: e.target.files?.[0] || null })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar Comprobante'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


