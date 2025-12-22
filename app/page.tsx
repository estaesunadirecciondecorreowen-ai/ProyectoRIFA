import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Countdown from '@/components/Countdown';
import TicketGrid from '@/components/TicketGrid';
import SnowEffect from '@/components/SnowEffect';

export default function Home() {
  const raffleName = process.env.NEXT_PUBLIC_RAFFLE_NAME || 'Rifa Altruista';
  const raffleCause = process.env.NEXT_PUBLIC_RAFFLE_CAUSE || 'Causa benéfica';
  const rafflePrize = process.env.NEXT_PUBLIC_RAFFLE_PRIZE || 'Premio especial';
  const ticketPrice = process.env.NEXT_PUBLIC_TICKET_PRICE || '50';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-red-900">
      <SnowEffect />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-4">🎄</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              {raffleName}
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-white drop-shadow-md">
              Tu boleto apoya a: <span className="font-bold">{raffleCause}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/comprar"
                className="px-8 py-4 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              >
                🎫 Comprar Boletos
              </Link>
              <Link
                href="#boletos"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
              >
                Ver Boletos Disponibles
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="rgb(127, 29, 29)"
            />
          </svg>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Countdown />
        
        {/* Link a la Noticia */}
        <div className="mt-6 text-center">
          <a
            href="https://x.com/telediario/status/1985533370336702812?s=12"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            📰 Ver Noticia Oficial
          </a>
        </div>
      </section>

      {/* Prize Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">🏆 El Gran Premio</h2>
            <p className="text-3xl font-bold text-primary-600">{rafflePrize}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-xl font-bold mb-2">Apoyas una causa</h3>
              <p className="text-gray-600">
                100% de las ganancias van directamente a {raffleCause}
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Fácil de participar</h3>
              <p className="text-gray-600">
                Elige tus boletos, realiza tu pago y listo
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">Sorteo transparente</h3>
              <p className="text-gray-600">
                Sorteo público y verificable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cause Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-8 md:p-12">
          <h2 className="text-4xl font-bold mb-6 text-center">¿A quién ayudamos?</h2>
          <p className="text-xl text-center mb-8 max-w-3xl mx-auto">
            Con tu participación en esta rifa, estás contribuyendo directamente a{' '}
            <strong>{raffleCause}</strong>. Cada boleto cuenta y hace la diferencia.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-3">Impacto directo</h3>
              <p className="text-white/90">
                El 100% de los fondos recaudados se destinan a la causa. Sin intermediarios,
                sin comisiones ocultas.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-3">Transparencia total</h3>
              <p className="text-white/90">
                Publicamos informes detallados de cómo se utilizan los fondos y el impacto
                generado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Participate Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
            ¿Cómo participar?
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Regístrate</h3>
              <p className="text-gray-600">
                Crea tu cuenta y verifica tu correo electrónico
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Elige tus boletos</h3>
              <p className="text-gray-600">
                Selecciona los números que más te gusten
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Realiza el pago</h3>
              <p className="text-gray-600">
                Transfiere y sube tu comprobante de pago
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">¡Listo!</h3>
              <p className="text-gray-600">
                Recibirás confirmación y participarás en el sorteo
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-blue-900">💰 Precio por boleto</h3>
            <p className="text-3xl font-bold text-blue-600">${ticketPrice} MXN</p>
            <p className="text-blue-700 mt-2">Puedes comprar múltiples boletos</p>
          </div>
        </div>
      </section>

      {/* Tickets Dashboard Section */}
      <section id="boletos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Dashboard de Boletos
          </h2>
          <p className="text-xl text-gray-600">
            Boletos disponibles en tiempo real
          </p>
        </div>
        <TicketGrid selectable={false} />
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl shadow-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para participar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a cientos de personas que ya están participando y apoyando esta gran causa
          </p>
          <Link
            href="/comprar"
            className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            🎫 Comprar Boletos Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-950 text-white py-8 border-t-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl mb-2">🎅</div>
          <p className="text-lg mb-2">
            <strong>{raffleName}</strong>
          </p>
          <p className="text-red-200">
            Apoyando a {raffleCause}
          </p>
          <p className="text-red-300 text-sm mt-4">
            © 2026 Todos los derechos reservados | Sorteo: 6 de Enero 2026 a las 6:00 PM (18:00 hrs CDMX)
          </p>
        </div>
      </footer>
    </div>
  );
}


