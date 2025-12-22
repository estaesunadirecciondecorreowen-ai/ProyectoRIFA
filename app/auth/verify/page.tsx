'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no válido');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setStatus('success');
      setMessage(data.message);

      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold text-gray-800">
                Verificando tu correo...
              </h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-bold mb-4 text-green-600">
                ¡Correo verificado!
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {message}
              </p>
              <p className="text-gray-500 mb-6">
                Serás redirigido al inicio de sesión en unos segundos...
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
              >
                Ir ahora
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-6">❌</div>
              <h1 className="text-3xl font-bold mb-4 text-red-600">
                Error de verificación
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                {message}
              </p>
              <Link
                href="/auth/register"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
              >
                Volver a registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


