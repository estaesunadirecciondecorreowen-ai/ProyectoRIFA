'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTicketColor, getTicketStatusText } from '@/lib/utils';

interface Ticket {
  id: string;
  numero: number;
  estado: string;
}

interface TicketGridProps {
  selectable?: boolean;
  onSelect?: (ticketNumber: number) => void;
  onDoubleClick?: (ticketNumber: number) => void;
  selectedTickets?: number[];
}

export default function TicketGrid({
  selectable = false,
  onSelect,
  onDoubleClick,
  selectedTickets = [],
}: TicketGridProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await fetchTickets(mounted);
    };

    run();

    const interval = setInterval(() => {
      fetchTickets(mounted);
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTickets = async (mounted = true) => {
    try {
      // Importante: no pongas loading=true cada 10s o parpadea
      if (tickets.length === 0) setLoading(true);
      setErrorMsg(null);

      const response = await fetch('/api/tickets', {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      });

      // Manejo explícito de no-OK (incluye 401)
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (!mounted) return;

        // NO rompas la UI: deja grid vacío y muestra aviso
        setTickets([]);
        setStats(null);

        if (response.status === 401) {
          setErrorMsg('No autorizado para ver los boletos. Inicia sesión nuevamente.');
        } else {
          setErrorMsg(`No se pudieron cargar los boletos (${response.status}). ${text}`);
        }
        return;
      }

      const data = await response.json().catch(() => ({}));

      const nextTickets: Ticket[] = Array.isArray(data?.tickets) ? data.tickets : [];
      const nextStats = data?.stats ?? null;

      if (!mounted) return;
      setTickets(nextTickets);
      setStats(nextStats);
    } catch (error) {
      console.error('Error cargando boletos:', error);
      // NO rompas la UI:
      setTickets([]);
      setStats(null);
      setErrorMsg('Ocurrió un error cargando los boletos. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    if (!selectable || ticket.estado !== 'available') return;
    onSelect?.(ticket.numero);
  };

  const handleTicketDoubleClick = (ticket: Ticket) => {
    if (!selectable || ticket.estado !== 'available') return;
    onDoubleClick?.(ticket.numero);
  };

  // ✅ Nunca filtrar sobre undefined
  const filteredTickets = useMemo(() => {
    const list = tickets ?? [];
    return list.filter((ticket) => {
      if (filter === 'all') return true;
      if (filter === 'available') return ticket.estado === 'available';
      if (filter === 'sold') return ticket.estado === 'sold' || ticket.estado === 'sold_physical';
      return true;
    });
  }, [tickets, filter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensaje de error (sin romper la página) */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 sm:p-4 text-sm sm:text-base">
          {errorMsg}
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.available}</div>
              <div className="text-xs sm:text-sm text-gray-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.sold}</div>
              <div className="text-xs sm:text-sm text-gray-600">Vendidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.percentage}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Progreso</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4 sm:mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-3 sm:h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base ${
            filter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setFilter('sold')}
          className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base ${
            filter === 'sold'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vendidos
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Vendido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Reservado</span>
        </div>
      </div>

      {/* Grid de boletos - Panel 25x20 */}
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 overflow-x-auto">
        <div className="text-center mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-700">Panel de Boletos (25 x 20)</h3>
          <p className="text-xs sm:text-sm text-gray-500">Total: 500 boletos | Desliza horizontalmente →</p>
        </div>

        {/* Estado vacío sin crash */}
        {filteredTickets.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            No hay boletos para mostrar.
          </div>
        ) : (
          <div className="inline-block min-w-max mx-auto">
            <div
              className="grid gap-0.5 sm:gap-1"
              style={{
                gridTemplateColumns: 'repeat(25, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(20, minmax(0, 1fr))',
              }}
            >
              {filteredTickets.map((ticket) => {
                const isSelected = selectedTickets.includes(ticket.numero);
                const colorClass = getTicketColor(ticket.estado);
                const isClickable = selectable && ticket.estado === 'available';

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket)}
                    onDoubleClick={() => handleTicketDoubleClick(ticket)}
                    disabled={!isClickable && !isSelected}
                    className={`
                      relative w-8 h-8 sm:w-10 sm:h-10 rounded font-bold text-[10px] sm:text-xs
                      transition-all duration-200 transform
                      ${colorClass}
                      ${isSelected ? 'ring-2 ring-blue-500 scale-110 z-10' : ''}
                      ${isClickable ? 'active:scale-110 sm:hover:scale-110 active:shadow-lg sm:hover:shadow-lg active:z-10 sm:hover:z-10' : ''}
                      flex items-center justify-center
                      text-white
                      touch-manipulation
                    `}
                    title={`Boleto #${ticket.numero} - ${getTicketStatusText(ticket.estado)}`}
                  >
                    {ticket.numero}
                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full w-2.5 h-2.5 sm:w-3 sm:h-3 flex items-center justify-center text-white text-[6px] sm:text-[8px]">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectable && selectedTickets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-center text-blue-800 font-medium text-sm sm:text-base">
            Has seleccionado {selectedTickets.length} boleto(s):{' '}
            {selectedTickets.slice().sort((a, b) => a - b).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
