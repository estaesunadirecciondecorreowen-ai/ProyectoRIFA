'use client';

import { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '@/lib/utils';

export default function Countdown() {
  const drawDate = process.env.NEXT_PUBLIC_DRAW_DATE || '2024-12-31T20:00:00';
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(drawDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(drawDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [drawDate]);

  if (timeRemaining.expired) {
    return (
      <div className="text-center py-8 bg-red-100 rounded-lg">
        <h3 className="text-3xl font-bold text-red-600">¡El sorteo ha finalizado!</h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-2xl p-8 text-white">
      <h3 className="text-2xl font-bold text-center mb-6">⏰ Tiempo restante para el sorteo</h3>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-4xl font-bold">{timeRemaining.days}</div>
          <div className="text-sm uppercase mt-2">Días</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-4xl font-bold">{timeRemaining.hours}</div>
          <div className="text-sm uppercase mt-2">Horas</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-4xl font-bold">{timeRemaining.minutes}</div>
          <div className="text-sm uppercase mt-2">Minutos</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
          <div className="text-4xl font-bold">{timeRemaining.seconds}</div>
          <div className="text-sm uppercase mt-2">Segundos</div>
        </div>
      </div>
    </div>
  );
}


