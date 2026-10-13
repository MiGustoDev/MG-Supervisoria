import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { authenticateSupervisor } from '../lib/auth';

export function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateSupervisor(email, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={`${import.meta.env.BASE_URL}Logo_Mi_Gusto_2025.png`}
            alt="Mi Gusto"
            className="h-10 sm:h-12 w-auto object-contain brightness-110 mb-2 drop-shadow-[0_2px_12px_rgba(245,158,11,0.2)]"
          />
          <h2 className="text-xl font-black text-white tracking-tight mt-1">
            Portal de Supervisión
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ingresá con tu cuenta corporativa para gestionar las cargas de tus locales
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/70 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Correo Institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="ejemplo@migusto.com.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-11 py-3 text-white text-sm focus:outline-none transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-500">
            Tu sesión se mantendrá iniciada en este dispositivo de forma permanente hasta que decidas cerrar sesión.
          </p>
        </div>
      </div>
    </div>
  );
}
