import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] relative">
      {/* Decorative oval behind the card for subtle brand presence */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[90%] h-[60%] bg-[#ffffff] opacity-7 rounded-full" />
      </div>

      {/* Centered login area - rely on LoginForm for internal branding */}
      <div className="relative z-10 w-full max-w-4xl mx-4 p-6">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* The LoginForm already contains a left branding panel and the form on the right */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
