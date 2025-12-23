'use client';

import { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '@/lib/utils';

export default function Countdown() {
  const drawDate = process.env.NEXT_PUBLIC_DRAW_DATE || '2026-01-06T18:00:00';
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(drawDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeRemaining(calculateTimeRemaining(drawDate));
    
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(drawDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [drawDate]);

  // Evitar error de hidratación mostrando un placeholder durante el primer render
  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-green-700 via-red-700 to-green-700 rounded-xl shadow-2xl p-4 sm:p-8 text-white border-2 sm:border-4 border-white">
        <div className="text-center mb-2">
          <div className="text-2xl sm:text-4xl mb-2">🎅 ⏰ 🎄</div>
          <h3 className="text-lg sm:text-2xl font-bold">Tiempo restante para el sorteo</h3>
          <p className="text-sm sm:text-lg mt-2 text-white/90">📅 6 de Enero 2026 a las 6:00 PM (18:00 hrs CDMX)</p>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
            <div className="text-2xl sm:text-4xl font-bold">--</div>
            <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Días</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
            <div className="text-2xl sm:text-4xl font-bold">--</div>
            <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Horas</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
            <div className="text-2xl sm:text-4xl font-bold">--</div>
            <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Minutos</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
            <div className="text-2xl sm:text-4xl font-bold">--</div>
            <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Segundos</div>
          </div>
        </div>
      </div>
    );
  }

  if (timeRemaining.expired) {
    return (
      <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-green-700 to-red-700 rounded-lg border-2 sm:border-4 border-white">
        <div className="text-3xl sm:text-5xl mb-3 sm:mb-4">🎉🎄🎅</div>
        <h3 className="text-xl sm:text-3xl font-bold text-white">¡El sorteo ha finalizado!</h3>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-700 via-red-700 to-green-700 rounded-xl shadow-2xl p-4 sm:p-8 text-white border-2 sm:border-4 border-white">
      <div className="text-center mb-2">
        <div className="text-2xl sm:text-4xl mb-2">🎅 ⏰ 🎄</div>
        <h3 className="text-lg sm:text-2xl font-bold">Tiempo restante para el sorteo</h3>
        <p className="text-sm sm:text-lg mt-2 text-white/90">📅 6 de Enero 2026 a las 6:00 PM (18:00 hrs CDMX)</p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
          <div className="text-2xl sm:text-4xl font-bold">{timeRemaining.days}</div>
          <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Días</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
          <div className="text-2xl sm:text-4xl font-bold">{timeRemaining.hours}</div>
          <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Horas</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
          <div className="text-2xl sm:text-4xl font-bold">{timeRemaining.minutes}</div>
          <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Minutos</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-4 text-center border border-white/30 sm:border-2">
          <div className="text-2xl sm:text-4xl font-bold">{timeRemaining.seconds}</div>
          <div className="text-[10px] sm:text-sm uppercase mt-1 sm:mt-2 font-bold">Segundos</div>
        </div>
      </div>
    </div>
  );
}


