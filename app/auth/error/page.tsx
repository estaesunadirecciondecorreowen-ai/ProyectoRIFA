'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Error de configuración del servidor';
      case 'AccessDenied':
        return 'Acceso denegado';
      case 'Verification':
        return 'El token de verificación ha expirado o ya fue usado';
      case 'Default':
      default:
        return 'Ha ocurrido un error en la autenticación';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold mb-4 text-red-600">
            Error de Autenticación
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {getErrorMessage(error)}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
            >
              Intentar nuevamente
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


