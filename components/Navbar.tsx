'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                🎫 {process.env.NEXT_PUBLIC_RAFFLE_NAME || 'Rifa Altruista'}
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
            ) : session ? (
              <>
                <span className="text-gray-700 hidden sm:block">
                  Hola, <strong>{session.user?.name}</strong>
                </span>

                {isAdmin ? (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-md font-medium ${
                      pathname?.startsWith('/admin')
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    Panel Admin
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-4 py-2 rounded-md font-medium ${
                        pathname === '/dashboard'
                          ? 'bg-primary-600 text-white'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      Mis Boletos
                    </Link>
                    <Link
                      href="/comprar"
                      className={`px-4 py-2 rounded-md font-medium ${
                        pathname === '/comprar'
                          ? 'bg-success-600 text-white'
                          : 'text-success-600 hover:bg-success-50'
                      }`}
                    >
                      Comprar
                    </Link>
                  </>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-md font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


