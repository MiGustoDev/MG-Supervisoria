import React from 'react';
import { ARS, INT } from '../lib/formatters';
import { Trophy, TrendingUp, Layers } from 'lucide-react';

export function DayRankTable({
  rankedList,
  metric,
  onMetricChange,
  dateTitle,
}) {
  const metricOptions = [
    { value: 'v', label: 'Venta' },
    { value: 'c', label: 'Comandas' },
    { value: 'u', label: 'Unidades' },
    { value: 't', label: 'Ticket Promedio' },
  ];

  const maxVal = rankedList.reduce((acc, item) => {
    if (!item.isLoaded) return acc;
    const v = metric === 'v' ? item.venta : metric === 'c' ? item.comandas : metric === 'u' ? item.unidades : item.ticketPromedio || 0;
    return Math.max(acc, v);
  }, 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-4 sm:mt-6">
      {/* Header bar */}
      <div className="p-3.5 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Ranking del Día</h3>
            <p className="text-xs text-slate-400">
              {dateTitle} · Ordenado por Venta Total
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-mono-numbers">
          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider font-semibold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 sm:px-4 w-12 text-center">#</th>
              <th className="py-3 px-3 sm:px-4 font-sans">Tienda</th>
              <th
                onClick={() => onMetricChange('c')}
                className={`py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white transition select-none ${
                  metric === 'c' ? 'text-amber-400 font-bold' : ''
                }`}
                title="Tocar para ordenar por Comandas"
              >
                Comandas {metric === 'c' ? '▾' : ''}
              </th>
              <th
                onClick={() => onMetricChange('v')}
                className={`py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white transition select-none ${
                  metric === 'v' ? 'text-amber-400 font-bold' : ''
                }`}
                title="Tocar para ordenar por Venta"
              >
                Venta {metric === 'v' ? '▾' : ''}
              </th>
              <th
                onClick={() => onMetricChange('u')}
                className={`py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white transition select-none ${
                  metric === 'u' ? 'text-amber-400 font-bold' : ''
                }`}
                title="Tocar para ordenar por Unidades"
              >
                Unidades {metric === 'u' ? '▾' : ''}
              </th>
              <th
                onClick={() => onMetricChange('t')}
                className={`py-3 px-3 sm:px-4 text-right cursor-pointer hover:text-white transition select-none ${
                  metric === 't' ? 'text-amber-400 font-bold' : ''
                }`}
                title="Tocar para ordenar por Ticket Promedio"
              >
                Ticket Prom. {metric === 't' ? '▾' : ''}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rankedList.map((item, idx) => {
              const currentVal =
                metric === 'v'
                  ? item.venta
                  : metric === 'c'
                  ? item.comandas
                  : metric === 'u'
                  ? item.unidades
                  : item.ticketPromedio || 0;
              const barWidth = maxVal > 0 ? Math.max(4, Math.round((currentVal / maxVal) * 100)) : 0;

              return (
                <tr
                  key={item.tiendaId}
                  className={`hover:bg-slate-800/30 transition ${
                    !item.isLoaded ? 'opacity-50 italic text-slate-500' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold">
                    {item.isLoaded ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900'
                            : idx === 2
                            ? 'bg-amber-800 text-amber-200'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    ) : (
                      '–'
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{item.tiendaNombre}</span>
                      {item.isPropia && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                          Propia
                        </span>
                      )}
                      {item.isExperience && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-wider border border-purple-500/30">
                          Experience
                        </span>
                      )}
                      {item.supervisoraNombre && (
                        <span className="text-xs font-normal text-slate-400">
                          · {item.supervisoraNombre}
                        </span>
                      )}
                    </div>
                    {item.isLoaded && (
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-1.5 overflow-hidden max-w-xs">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right ${
                      metric === 'c' ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-slate-300'
                    }`}
                  >
                    {item.isLoaded ? INT.format(item.comandas) : '–'}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right ${
                      metric === 'v' ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-slate-200 font-semibold'
                    }`}
                  >
                    {item.isLoaded ? ARS.format(item.venta) : '–'}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right ${
                      metric === 'u' ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-slate-300'
                    }`}
                  >
                    {item.isLoaded ? INT.format(item.unidades) : '–'}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right ${
                      metric === 't' ? 'text-amber-400 font-bold bg-amber-500/5' : 'text-emerald-400 font-semibold'
                    }`}
                  >
                    {item.isLoaded && item.ticketPromedio
                      ? ARS.format(item.ticketPromedio)
                      : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
