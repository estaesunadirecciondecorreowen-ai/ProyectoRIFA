'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔ Evita errores de hidratación / pantalla negra
  if (!mounted) return null;

  const role =
    (session?.user as any)?.role ??
    (session?.user as any)?.rol ??
    null;

  const isAdmin = role === 'ADMIN';

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error('Error signOut:', e);
    } finally {
      // 🔥 fallback duro (SIEMPRE funciona)
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎫 {process.env.NEXT_PUBLIC_RAFFLE_NAME ?? 'Rifa Altruista'}
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {status === 'loading' && (
              <div className="h-9 w-28 bg-gray-200 animate-pulse rounded" />
            )}

            {status === 'authenticated' && session && (
              <>
                <span className="text-gray-700 hidden sm:block">
                  Hola, <strong>{session.user?.name ?? 'Usuario'}</strong>
                </span>

                {isAdmin ? (
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded-md font-medium transition ${
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
                      className={`px-4 py-2 rounded-md font-medium transition ${
                        pathname === '/dashboard'
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Mis Boletos
                    </Link>

                    <Link
                      href="/comprar"
                      className={`px-4 py-2 rounded-md font-medium transition ${
                        pathname === '/comprar'
                          ? 'bg-green-600 text-white'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      Comprar
                    </Link>
                  </>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition"
                >
                  Salir
                </button>
              </>
            )}

            {status === 'unauthenticated' && (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
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
