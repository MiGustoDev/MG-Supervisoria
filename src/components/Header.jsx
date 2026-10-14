import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, Check, ShieldCheck, Database, X, Lock } from 'lucide-react';

export function Header({
  currentUser,
  onLogout,
  onOpenDbModal,
  isDbConfigured,
  onOpenChangePassword,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close side menu / dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-[1600px] mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}Logo_Mi_Gusto_2025.png`}
              alt="Mi Gusto"
              className="h-7 sm:h-9 w-auto object-contain brightness-110 drop-shadow-[0_2px_12px_rgba(245,158,11,0.15)]"
            />
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
              Supervisión
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block mt-1">
            Control de comandas, venta neta y unidades por tienda
          </p>
        </div>

        {/* User Profile & Side Menu Trigger */}
        <div className="relative" ref={menuRef}>
          {currentUser ? (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-left transition shadow-md group"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br ${
                  currentUser.avatarColor || 'from-amber-500 to-orange-600'
                } flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-sm shrink-0`}
              >
                {currentUser.name ? currentUser.name.charAt(0) : 'U'}
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-black text-white group-hover:text-amber-300 transition leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {currentUser.role || 'Supervisora'}
                </p>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          ) : (
            <button
              onClick={onOpenDbModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold bg-slate-900 text-slate-300"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Conectar</span>
            </button>
          )}

          {/* User Profile Dropdown / Side Menu */}
          {isMenuOpen && currentUser && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${
                      currentUser.avatarColor || 'from-amber-500 to-orange-600'
                    } flex items-center justify-center font-black text-white text-sm shadow-sm shrink-0`}
                  >
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    Sesión activa
                  </span>
                </div>
              </div>

              {/* Menu options */}
              <div className="space-y-1">
                {onOpenChangePassword && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition text-left"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Cambiar contraseña</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
