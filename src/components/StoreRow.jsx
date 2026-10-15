import React from 'react';
import { Store, CheckCircle, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import { ARS, DEC, INT } from '../lib/formatters';

export function StoreRow({
  tienda,
  values,
  onChange,
  savedData,
  isDirty,
}) {
  const { rc, rv, ru, c, v, u, errs, complete } = values;

  const hasComandas = !isNaN(c) && c > 0;
  const ticketPromedio = hasComandas && !isNaN(v) ? v / c : null;
  const unidPorComanda = hasComandas && !isNaN(u) ? u / c : null;

  // Status computation
  let statusBadge = {
    label: 'Pendiente',
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
    dot: 'bg-slate-500',
  };

  if (isDirty && errs.length > 0) {
    statusBadge = {
      label: 'Revisar',
      bg: 'bg-rose-950/60 text-rose-300 border-rose-800/80',
      dot: 'bg-rose-400',
    };
  } else if (isDirty) {
    statusBadge = {
      label: 'Sin guardar',
      bg: 'bg-amber-950/60 text-amber-300 border-amber-800/80',
      dot: 'bg-amber-400 animate-pulse',
    };
  } else if (savedData) {
    statusBadge = {
      label: 'Cargada',
      bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
      dot: 'bg-emerald-400',
    };
  }

  return (
    <div
      className={`store-row-item relative p-4 sm:p-5 rounded-2xl border gsap-card ${
        isDirty
          ? 'bg-slate-900/95 border-amber-500/50 shadow-xl shadow-amber-500/10'
          : savedData
          ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/90'
          : 'bg-slate-900/30 border-slate-800/40 opacity-90'
      }`}
    >
      {/* Top line: Name & Status & Live indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
            <Store className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-white text-base sm:text-lg tracking-tight">
            {tienda.name}
          </span>
          {tienda.isPropia && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
              ✨ Propia MG
            </span>
          )}
          {tienda.isExperience && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm">
              🌟 Experience
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {ticketPromedio !== null && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 font-mono-numbers">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Ticket promedio {ARS.format(ticketPromedio)}
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Comandas */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Comandas
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={rc}
            placeholder="0"
            onChange={(e) => onChange(tienda.id, 'c', e.target.value)}
            className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono-numbers text-base sm:text-lg font-bold focus:outline-none transition ${
              rc && isNaN(c)
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : 'border-slate-800 focus:border-amber-500'
            }`}
          />
        </div>

        {/* Venta */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Venta ($)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={rv}
            placeholder="0"
            onChange={(e) => onChange(tienda.id, 'v', e.target.value)}
            className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono-numbers text-base sm:text-lg font-bold focus:outline-none transition ${
              rv && isNaN(v)
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : 'border-slate-800 focus:border-amber-500'
            }`}
          />
        </div>

        {/* Unidades */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Unidades
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={ru}
            placeholder="0"
            onChange={(e) => onChange(tienda.id, 'u', e.target.value)}
            className={`w-full bg-slate-950 border rounded-xl px-3 py-2 text-white font-mono-numbers text-base sm:text-lg font-bold focus:outline-none transition ${
              ru && isNaN(u)
                ? 'border-rose-500 text-rose-300 bg-rose-950/20'
                : 'border-slate-800 focus:border-amber-500'
            }`}
          />
        </div>
      </div>

      {/* Meta info / validation warning / live stats */}
      <div className="mt-2 text-xs flex flex-wrap items-center justify-between gap-1 min-h-[1.2rem]">
        {errs.length > 0 ? (
          <span className="text-rose-400 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Revisá: {errs.join(' · ')}
          </span>
        ) : complete && hasComandas ? (
          <div className="flex items-center gap-3 text-slate-400">
            <span>
              <strong className="text-slate-200">{DEC.format(unidPorComanda)}</strong> unid. por comanda
            </span>
            {u < c && (
              <span className="text-amber-400">
                ⚠️ Menos unidades que comandas
              </span>
            )}
            <span className="sm:hidden font-mono-numbers text-slate-300">
              Ticket promedio: {ARS.format(ticketPromedio)}
            </span>
          </div>
        ) : (
          <span className="text-slate-500">Completá los 3 campos para registrar</span>
        )}
      </div>
    </div>
  );
}
