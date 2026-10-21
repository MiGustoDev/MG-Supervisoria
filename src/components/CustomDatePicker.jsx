import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { pad, getYesterdayStr, todayStr } from '../lib/formatters';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

export function CustomDatePicker({ value, onChange, minDate, maxDate, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current selected date
  const [selYear, selMonth, selDay] = (value || getYesterdayStr()).split('-').map(Number);
  
  // View month & year in calendar
  const [viewYear, setViewYear] = useState(selYear);
  const [viewMonth, setViewMonth] = useState(selMonth - 1); // 0-indexed

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync view when value changes
  useEffect(() => {
    const [y, m] = (value || getYesterdayStr()).split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
  }, [value]);

  const yday = getYesterdayStr();
  const maxLimit = maxDate || yday;
  const minLimit = minDate || '';

  // Navigate months
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days matrix
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const days = [];

  // Prev month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      month: viewMonth - 1,
      year: viewYear,
      isCurrentMonth: false,
      dateStr: `${viewMonth === 0 ? viewYear - 1 : viewYear}-${pad(viewMonth === 0 ? 12 : viewMonth)}-${pad(daysInPrevMonth - i)}`,
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateStr: `${viewYear}-${pad(viewMonth + 1)}-${pad(i)}`,
    });
  }

  // Next month padding to fill grid (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: viewMonth + 1,
      year: viewYear,
      isCurrentMonth: false,
      dateStr: `${viewMonth === 11 ? viewYear + 1 : viewYear}-${pad(viewMonth === 11 ? 1 : viewMonth + 2)}-${pad(i)}`,
    });
  }

  const handleSelectDay = (dateStr) => {
    if (dateStr > maxLimit || (minLimit && dateStr < minLimit)) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  const [y, m, d] = (value || yday).split('-');

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-slate-900 border border-slate-700 hover:border-amber-400 focus:border-amber-400 text-white font-mono-numbers flex items-center justify-between cursor-pointer transition group ${
          compact
            ? 'rounded-xl px-3 py-2 text-xs font-bold'
            : 'rounded-2xl px-4 py-3 text-base font-bold shadow-inner'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`${compact ? 'text-amber-400 font-bold font-mono text-xs' : 'text-amber-300 font-black text-lg tracking-wide'}`}>
            {`${d}/${m}/${y}`}
          </span>
          {!compact && (value === todayStr() ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
              Hoy
            </span>
          ) : value === yday ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
              Ayer
            </span>
          ) : null)}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-amber-400 font-sans transition">
          {!compact && <span>{isOpen ? 'Cerrar' : 'Elegir fecha'}</span>}
          <CalendarIcon className={`${compact ? 'w-3.5 h-3.5 text-sky-400' : 'w-4 h-4 text-amber-400'}`} />
        </div>
      </button>

      {/* Custom Dropdown Modal / Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-[calc(100vw-48px)] sm:w-80 max-w-[340px] bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="font-extrabold text-white text-sm font-sans tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5 font-sans">
            {DAY_NAMES.map((name) => (
              <span key={name} className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {name}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 font-mono-numbers">
            {days.map((item, idx) => {
              const isSelected = item.dateStr === value;
              const isDisabled = item.dateStr > maxLimit || (minLimit && item.dateStr < minLimit);
              const isYday = item.dateStr === yday;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(item.dateStr)}
                  className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-105 z-10'
                      : isDisabled
                      ? 'text-slate-700 cursor-not-allowed opacity-30'
                      : item.isCurrentMonth
                      ? 'text-slate-200 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{item.day}</span>
                  {isYday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick buttons footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs font-sans">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectDay(todayStr())}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/20 transition text-[11px]"
              >
                Cargar hoy
              </button>

              <button
                type="button"
                onClick={() => handleSelectDay(yday)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20 transition text-[11px]"
              >
                Cargar ayer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
