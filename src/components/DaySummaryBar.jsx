import React, { useRef, useEffect } from 'react';
import { ARS, INT } from '../lib/formatters';
import { CheckCircle2, TrendingUp, ShoppingBag, Receipt, DollarSign } from 'lucide-react';
import { gsap, useGSAP } from '../lib/animations';

export function DaySummaryBar({
  dateTitle,
  totalStores,
  loadedStores,
  totals,
  onSave,
  onDiscard,
  onCopyWhatsApp,
  onExportCsv,
  dirtyCount,
  isSaving,
}) {
  const isAllLoaded = totalStores > 0 && loadedStores === totalStores;
  const cardsContainerRef = useRef(null);
  const badgeRef = useRef(null);

  useGSAP(() => {
    if (cardsContainerRef.current) {
      gsap.fromTo(
        cardsContainerRef.current.children,
        { opacity: 0, y: -6, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, { scope: cardsContainerRef });

  useEffect(() => {
    if (isAllLoaded && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
  }, [isAllLoaded]);

  return (
    <>
      {/* 1. STICKY TOP BAR: Title, Loaded progress and Total KPIs (Permanently fixed while scrolling) */}
      <div className="sticky top-[53px] sm:top-[70px] z-20 bg-slate-950/95 backdrop-blur-md border-y border-slate-800/80 -mx-2 sm:-mx-6 lg:-mx-8 px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-2xl transition-all duration-300">
        <div className="max-w-[1600px] mx-auto space-y-2.5">
          {/* Title & Progress */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-2">
                <span>{dateTitle}</span>
                {isAllLoaded && (
                  <span
                    ref={badgeRef}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    100% Completo
                  </span>
                )}
              </h2>
            </div>

            <div className="text-xs font-semibold shrink-0">
              <span
                className={
                  totalStores === 0
                    ? 'text-slate-500'
                    : isAllLoaded
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }
              >
                {loadedStores} de {totalStores} tiendas cargadas
              </span>
            </div>
          </div>

          {/* Live Total KPI Cards */}
          <div ref={cardsContainerRef} className="grid grid-cols-3 gap-2 sm:gap-4 font-mono-numbers">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 gsap-lift">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 text-blue-400 hidden sm:block">
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Comandas
                </p>
                <p className="text-sm sm:text-base font-extrabold text-white">
                  {INT.format(totals.c)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 gsap-lift">
              <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hidden sm:block">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Venta Total
                </p>
                <p className="text-sm sm:text-base font-extrabold text-emerald-400">
                  {ARS.format(totals.v)}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 gsap-lift">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 text-purple-400 hidden sm:block">
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Unidades
                </p>
                <p className="text-sm sm:text-base font-extrabold text-purple-300">
                  {INT.format(totals.u)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
