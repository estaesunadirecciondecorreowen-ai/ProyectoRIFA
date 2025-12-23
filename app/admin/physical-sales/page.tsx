'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import SnowEffect from '@/components/SnowEffect';
import TicketGrid from '@/components/TicketGrid';

export default function PhysicalSalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    sellerName: '',
    notes: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleTicketSelect = (ticketNumber: number) => {
    setSelectedTickets((prev) => {
      if (prev.includes(ticketNumber)) {
        return prev.filter((n) => n !== ticketNumber);
      } else {
        return [...prev, ticketNumber];
      }
    });
  };

  const handleTicketDoubleClick = (ticketNumber: number) => {
    // Si el boleto ya está seleccionado, ir al formulario
    if (selectedTickets.includes(ticketNumber)) {
      // Scroll al formulario
      const formElement = document.getElementById('sales-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Si no está seleccionado, seleccionarlo y luego ir al formulario
      setSelectedTickets((prev) => [...prev, ticketNumber]);
      setTimeout(() => {
        const formElement = document.getElementById('sales-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTickets.length === 0) {
      toast.error('Selecciona al menos un boleto');
      return;
    }

    if (!formData.buyerName.trim()) {
      toast.error('Ingresa el nombre del comprador');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/tickets/physical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketNumbers: selectedTickets,
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail || undefined,
          sellerName: formData.sellerName || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(`Venta física registrada exitosamente. Código: ${data.uniqueCode}`);
      setSelectedTickets([]);
      setFormData({
        buyerName: '',
        buyerEmail: '',
        sellerName: '',
        notes: '',
      });

      // Recargar grid
      window.location.reload();
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Registro de Ventas Físicas
            </h1>
            <p className="text-white">
              Registra boletos vendidos en efectivo o fuera del sistema
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-white hover:text-gray-200"
          >
            ← Volver al panel
          </button>
        </div>

        {selectedTickets.length > 0 && (
          <div id="sales-form" className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-blue-700">Datos de la Venta</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">
                Boletos seleccionados: {selectedTickets.length}
              </p>
              <p className="text-2xl font-bold text-blue-900">
                Total: ${total.toLocaleString('es-MX')} MXN
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del comprador *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-blue-700 font-medium"
                  value={formData.buyerName}
                  onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del comprador (opcional)
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-blue-700 font-medium"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                  placeholder="comprador@email.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si proporcionas el email, se le enviará confirmación
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del vendedor (opcional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-blue-700 font-medium"
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  placeholder="María González"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-blue-700 font-medium"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Venta en efectivo"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Registrando...' : '💾 Registrar Venta Física'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            Selecciona los Boletos Vendidos
          </h2>
          <p className="text-gray-600 mb-6">
            Haz clic en los boletos disponibles (verdes) que fueron vendidos físicamente
          </p>

          <TicketGrid
            selectable={true}
            onSelect={handleTicketSelect}
            onDoubleClick={handleTicketDoubleClick}
            selectedTickets={selectedTickets}
          />
        </div>
      </div>
    </div>
  );
}


