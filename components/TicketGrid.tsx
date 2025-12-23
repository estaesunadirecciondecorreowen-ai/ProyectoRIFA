'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data.tickets);
      setStats(data.stats);
    } catch (error) {
      console.error('Error cargando boletos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    if (!selectable || ticket.estado !== 'available') return;
    if (onSelect) {
      onSelect(ticket.numero);
    }
  };

  const handleTicketDoubleClick = (ticket: Ticket) => {
    if (!selectable || ticket.estado !== 'available') return;
    if (onDoubleClick) {
      onDoubleClick(ticket.numero);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    if (filter === 'available') return ticket.estado === 'available';
    if (filter === 'sold') return ticket.estado === 'sold' || ticket.estado === 'sold_physical';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.sold}</div>
              <div className="text-sm text-gray-600">Vendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.percentage}%</div>
              <div className="text-sm text-gray-600">Progreso</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-4 rounded-full transition-all duration-500"
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
          className={`px-4 py-2 rounded-md font-medium ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-md font-medium ${
            filter === 'available'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setFilter('sold')}
          className={`px-4 py-2 rounded-md font-medium ${
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
      <div className="bg-white rounded-lg shadow-lg p-4 overflow-x-auto">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Panel de Boletos (25 x 20)</h3>
          <p className="text-sm text-gray-500">Total: 500 boletos</p>
        </div>
        <div className="inline-block min-w-max">
          <div 
            className="grid gap-1"
            style={{ 
              gridTemplateColumns: 'repeat(25, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(20, minmax(0, 1fr))'
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
                    relative w-10 h-10 rounded font-bold text-xs
                    transition-all duration-200 transform
                    ${colorClass}
                    ${isSelected ? 'ring-2 ring-blue-500 scale-110 z-10' : ''}
                    ${isClickable ? 'hover:scale-110 hover:shadow-lg hover:z-10' : ''}
                    flex items-center justify-center
                    text-white
                  `}
                  title={`Boleto #${ticket.numero} - ${getTicketStatusText(ticket.estado)} (Doble clic para ir al formulario)`}
                >
                  {ticket.numero}
                  {isSelected && (
                    <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full w-3 h-3 flex items-center justify-center text-white text-[8px]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectable && selectedTickets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-center text-blue-800 font-medium">
            Has seleccionado {selectedTickets.length} boleto(s): {selectedTickets.sort((a, b) => a - b).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}


