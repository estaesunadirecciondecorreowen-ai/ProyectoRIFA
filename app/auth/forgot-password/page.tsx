'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSent(true);
      toast.success('Correo enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          {!sent ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                Recuperar Contraseña
              </h1>
              <p className="text-gray-600 mb-6 text-center">
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-6">📧</div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                ¡Correo enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


