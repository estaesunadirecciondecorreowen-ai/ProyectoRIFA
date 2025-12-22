import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            ¡Revisa tu correo!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Hemos enviado un enlace de verificación a tu correo electrónico.
            Por favor, haz clic en el enlace para activar tu cuenta.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              <strong>Importante:</strong> Revisa también tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}


