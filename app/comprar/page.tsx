'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import TicketGrid from '@/components/TicketGrid';

export default function ComprarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [transferData, setTransferData] = useState({
    nombreComprador: '',
    telefonoComprador: '',
    nombreVendedor: '',
    folio: '',
    monto: '',
    fecha: '',
    comprobante: null as File | null,
  });

  // Autocompletar datos del usuario cuando inicia sesión
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Debes iniciar sesión para comprar boletos');
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user) {
      // Autocompletar nombre y teléfono del usuario
      setTransferData(prev => ({
        ...prev,
        nombreComprador: (session.user as any).name || '',
        telefonoComprador: (session.user as any).telefono || '',
      }));
    }
  }, [status, session, router]);

  // Autocompletar monto cuando se muestra el formulario de upload
  useEffect(() => {
    if (showUpload && purchaseData) {
      setTransferData(prev => ({
        ...prev,
        monto: purchaseData.total.toString(),
      }));
    }
  }, [showUpload, purchaseData]);

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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type === 'cuenta' ? 'Cuenta' : type === 'clabe' ? 'CLABE' : 'Titular'} copiado al portapapeles`);
    } catch (err) {
      toast.error('No se pudo copiar al portapapeles');
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
      formData.append('nombreComprador', transferData.nombreComprador);
      formData.append('telefonoComprador', transferData.telefonoComprador);
      formData.append('nombreVendedor', transferData.nombreVendedor);
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

  const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '50');
  const total = selectedTickets.length * ticketPrice;

  if (status === 'loading') {
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
              <div className="flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mx-auto mb-4">
                <span className="text-5xl text-white font-bold">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                ¡Boletos Reservados!
              </h2>
              <p className="text-center text-gray-600">
                Código de compra: <strong className="text-primary-600">RIFA</strong>
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                ⏰ Tienes {purchaseData.expiresInMinutes} minutos para completar tu pago.
                Después, los boletos se liberarán automáticamente.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-3 text-blue-900">💰 Información de Pago</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Banco:</strong> BBVA Bancomer</p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <strong>Cuenta:</strong>
                  <span id="cuenta-valor">1517353084</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('1517353084', 'cuenta')}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    title="Copiar cuenta"
                  >
                    📋
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <strong>CLABE:</strong>
                  <span id="clabe-valor">012180015173530847</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('012180015173530847', 'clabe')}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    title="Copiar CLABE"
                  >
                    📋
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <strong>Titular:</strong>
                  <span id="titular-valor">Alfaro Alvarez Oscar Humberto</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('Alfaro Alvarez Oscar Humberto', 'titular')}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    title="Copiar titular"
                  >
                    📋
                  </button>
                </div>

                <p><strong>Concepto:</strong> Pon tu N° de boleto y tu Nombre</p>

                <p className="text-xl font-bold text-red-600 mt-4">
                  Monto a transferir: ${total.toLocaleString('es-MX')} MXN
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadTransfer} className="space-y-4 max-w-xl mx-auto">
              <h3 className="font-bold text-lg text-center mb-4 text-black">Paso 3: Sube tu comprobante</h3>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  👤 Nombre del Comprador *
                </label>
                <input
                  type="text"
                  required
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.nombreComprador}
                  onChange={(e) => setTransferData({ ...transferData, nombreComprador: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  📱 Teléfono del Comprador *
                </label>
                <input
                  type="tel"
                  required
                  minLength={10}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.telefonoComprador}
                  onChange={(e) => setTransferData({ ...transferData, telefonoComprador: e.target.value })}
                  placeholder="Ej: 5551234567"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  🤝 Nombre del Vendedor *
                </label>
                <input
                  type="text"
                  required
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.nombreVendedor}
                  onChange={(e) => setTransferData({ ...transferData, nombreVendedor: e.target.value })}
                  placeholder="¿Quién te vendió?"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  🔢 Folio de Transferencia *
                </label>
                <input
                  type="text"
                  required
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.folio}
                  onChange={(e) => setTransferData({ ...transferData, folio: e.target.value })}
                  placeholder="Ej: 123456789"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  💵 Monto Transferido *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min={total}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.monto}
                  onChange={(e) => setTransferData({ ...transferData, monto: e.target.value })}
                  placeholder="$0.00"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  📅 Fecha de Transferencia *
                </label>
                <input
                  type="date"
                  required
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center bg-gray-50 text-black"
                  value={transferData.fecha}
                  onChange={(e) => setTransferData({ ...transferData, fecha: e.target.value })}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-48 text-sm font-medium text-gray-700 text-center sm:text-left">
                  📎 Comprobante *
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 text-black text-sm"
                  onChange={(e) => setTransferData({ ...transferData, comprobante: e.target.files?.[0] || null })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
              >
                {loading ? 'Enviando...' : '✅ Enviar Comprobante'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


