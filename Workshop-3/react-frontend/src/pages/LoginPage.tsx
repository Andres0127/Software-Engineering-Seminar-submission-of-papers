import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden" 
         style={{
           background: 'linear-gradient(135deg, #FFFFFF 0%, #0077FF 100%)'
         }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-300 opacity-5 rounded-full blur-3xl"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
               backgroundSize: '50px 50px'
             }}></div>
      </div>

      {/* Centered login area */}
      <div className="relative z-10 w-full max-w-5xl mx-4 p-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 h-[95vh] border border-white/20">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
