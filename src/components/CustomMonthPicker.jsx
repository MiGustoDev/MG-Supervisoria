import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export function CustomMonthPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // value is format 'YYYY-MM'
  const [currentYear, setCurrentYear] = useState(() => {
    if (value) {
      const [y] = value.split('-').map(Number);
      return y;
    }
    return new Date().getFullYear();
  });

  const selectedMonthNum = value ? parseInt(value.split('-')[1], 10) - 1 : new Date().getMonth();
  const selectedYear = value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear();

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

  const handleSelectMonth = (monthIndex) => {
    const formatted = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const displayText = `${MONTH_NAMES[selectedMonthNum]} ${selectedYear}`;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl px-3.5 py-1.5 text-xs text-amber-400 font-extrabold focus:outline-none transition shadow-inner group"
      >
        <Calendar className="w-3.5 h-3.5 text-amber-400" />
        <span className="capitalize">{displayText}</span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/95 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Year selector header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentYear((y) => y - 1)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-amber-400" />
            </button>
            <span className="font-black text-white text-base sm:text-lg font-mono-numbers tracking-wide">
              {currentYear}
            </span>
            <button
              type="button"
              onClick={() => setCurrentYear((y) => y + 1)}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Months Grid: Bigger buttons with full comfortable tap target */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {MONTH_NAMES.map((name, index) => {
              const isSelected = selectedYear === currentYear && selectedMonthNum === index;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={`py-3 px-2 rounded-2xl text-xs sm:text-sm font-black transition text-center active:scale-95 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-300 bg-slate-950/60 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
