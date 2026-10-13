import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { DatabaseModal } from './components/DatabaseModal';
import { LoginScreen } from './components/LoginScreen';
import { StoreRow } from './components/StoreRow';
import { DaySummaryBar } from './components/DaySummaryBar';
import { DayRankTable } from './components/DayRankTable';
import { MonthlyDashboard } from './components/MonthlyDashboard';
import { SupervisorKanbanBoard } from './components/SupervisorKanbanBoard';
import { CustomDatePicker } from './components/CustomDatePicker';
import { CustomMonthPicker } from './components/CustomMonthPicker';
import { api } from './lib/api';
import { getSupabaseCredentials } from './lib/supabase';
import { getStoredSession, clearSession } from './lib/auth';
import {
  getYesterdayStr,
  fmtDayLong,
  todayStr,
  parseCount,
  parseMoney,
  INT,
  ARS,
  exportCsv,
  MONTHF,
  parseYmd,
  pad,
} from './lib/formatters';
import { Calendar, UserCheck, AlertTriangle, CheckCircle, Copy } from 'lucide-react';

const LS_SELECTED_SUP = 'mg_active_supervisora';
const ALL_SUP = '__all';

export default function App() {
  const dateInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const dbCreds = getSupabaseCredentials();

  // Core state
  const [config, setConfig] = useState({ supervisoras: [], tiendas: [] });
  const [selectedSup, setSelectedSup] = useState(() => {
    const session = getStoredSession();
    if (session?.supId) return session.supId;
    return localStorage.getItem(LS_SELECTED_SUP) || '';
  });
  const [selectedFecha, setSelectedFecha] = useState(getYesterdayStr());
  const [selectedMonth, setSelectedMonth] = useState(() => getYesterdayStr().slice(0, 7));

  // Sync with currentUser when user logs in or switches
  useEffect(() => {
    if (currentUser?.supId) {
      setSelectedSup(currentUser.supId);
      localStorage.setItem(LS_SELECTED_SUP, currentUser.supId);
    }
  }, [currentUser]);

  // Day data: map of saved items { [tiendaId]: record }
  const [dayData, setDayData] = useState({});
  // Form draft state: { [tiendaId]: { rc: string, rv: string, ru: string } }
  const [formInputs, setFormInputs] = useState({});
  // Set of dirty store IDs
  const [dirtyStoreIds, setDirtyStoreIds] = useState(new Set());

  // Monthly data
  const [monthlyRows, setMonthlyRows] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('carga'); // 'carga' | 'ranking' | 'kanban'
  const [rankingView, setRankingView] = useState('mes'); // 'mes' | 'dia'
  const [dayRankMetric, setDayRankMetric] = useState('v');
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initial Load: Config
  useEffect(() => {
    api.getConfig().then((cfg) => {
      setConfig(cfg);
      if (!selectedSup && cfg.supervisoras.length > 0) {
        // Keep current or select first
      }
    });
  }, []);

  // 2. Load Day Data
  const loadDayData = async (fecha) => {
    try {
      const data = await api.getCargasDia(fecha);
      setDayData(data);
      // Re-populate non-dirty inputs
      setFormInputs((prev) => {
        const next = { ...prev };
        config.tiendas.forEach((t) => {
          if (!dirtyStoreIds.has(t.id)) {
            const saved = data[t.id];
            next[t.id] = {
              rc: saved ? String(saved.comandas) : '',
              rv: saved ? String(saved.venta) : '',
              ru: saved ? String(saved.unidades) : '',
            };
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Error loading day data:', err);
    }
  };

  useEffect(() => {
    if (config.tiendas.length > 0) {
      loadDayData(selectedFecha);
    }
  }, [selectedFecha, config.tiendas]);

  // 3. Load Monthly Data
  const loadMonthData = async (mes) => {
    try {
      const rows = await api.getCargasMes(mes);
      setMonthlyRows(rows);
    } catch (err) {
      console.error('Error loading month data:', err);
    }
  };

  useEffect(() => {
    loadMonthData(selectedMonth);
  }, [selectedMonth]);

  // Filtered Stores by supervisor
  const activeStores = useMemo(() => {
    if (!selectedSup) return [];
    if (selectedSup === ALL_SUP) return config.tiendas;
    return config.tiendas.filter((t) => t.sup === selectedSup);
  }, [selectedSup, config.tiendas]);

  const activeSupName = useMemo(() => {
    if (selectedSup === ALL_SUP) return 'Todas las supervisoras';
    const s = config.supervisoras.find((x) => x.id === selectedSup);
    return s ? s.name : 'Sin supervisora';
  }, [selectedSup, config.supervisoras]);

  // Handle Input Changes
  const handleInputChange = (tiendaId, field, rawValue) => {
    setFormInputs((prev) => {
      const current = prev[tiendaId] || { rc: '', rv: '', ru: '' };
      return {
        ...prev,
        [tiendaId]: {
          ...current,
          [field === 'c' ? 'rc' : field === 'v' ? 'rv' : 'ru']: rawValue,
        },
      };
    });

    setDirtyStoreIds((prev) => {
      const next = new Set(prev);
      next.add(tiendaId);
      return next;
    });
  };

  // Evaluate store row validation state
  const evaluateRow = (tiendaId) => {
    const inputs = formInputs[tiendaId] || { rc: '', rv: '', ru: '' };
    const rc = inputs.rc.trim();
    const rv = inputs.rv.trim();
    const ru = inputs.ru.trim();

    const c = parseCount(rc);
    const v = parseMoney(rv);
    const u = parseCount(ru);

    const empty = !rc && !rv && !ru;
    const errs = [];
    if (rc && isNaN(c)) errs.push('comandas: solo números enteros');
    if (rv && isNaN(v)) errs.push('venta: ej. 1.250.000');
    if (ru && isNaN(u)) errs.push('unidades: solo números enteros');

    const complete = !isNaN(c) && !isNaN(v) && !isNaN(u);
    if (!empty && !complete && errs.length === 0) {
      errs.push('faltan completar campos');
    }

    return { rc, rv, ru, c, v, u, empty, complete, errs };
  };

  // Day live totals
  const dayTotals = useMemo(() => {
    let c = 0, v = 0, u = 0;
    activeStores.forEach((t) => {
      const ev = evaluateRow(t.id);
      if (ev.complete) {
        c += ev.c;
        v += ev.v;
        u += ev.u;
      } else if (dayData[t.id]) {
        c += dayData[t.id].comandas;
        v += dayData[t.id].venta;
        u += dayData[t.id].unidades;
      }
    });
    return { c, v, u };
  }, [activeStores, formInputs, dayData]);

  const loadedStoresCount = useMemo(() => {
    return activeStores.filter((t) => dayData[t.id] || evaluateRow(t.id).complete).length;
  }, [activeStores, dayData, formInputs]);

  // Save Day Action
  const handleSaveDay = async () => {
    if (dirtyStoreIds.size === 0) {
      showToast('No hay cambios para guardar.', 'info');
      return;
    }

    const bad = [];
    const itemsToSave = [];

    dirtyStoreIds.forEach((tid) => {
      const ev = evaluateRow(tid);
      if (ev.empty) {
        // ignore
      } else if (ev.errs.length > 0 || !ev.complete) {
        bad.push(tid);
      } else {
        const store = config.tiendas.find((t) => t.id === tid) || { id: tid, name: 'Tienda', sup: '' };
        const supObj = config.supervisoras.find((s) => s.id === store.sup);
        itemsToSave.push({
          tiendaId: tid,
          tiendaNombre: store.name,
          supervisoraId: store.sup || '',
          supervisoraNombre: supObj ? supObj.name : '',
          fecha: selectedFecha,
          comandas: ev.c,
          venta: ev.v,
          unidades: ev.u,
        });
      }
    });

    if (bad.length > 0) {
      showToast(`Por favor revisá las tiendas marcadas con error (${bad.length})`, 'error');
      return;
    }

    if (itemsToSave.length === 0) {
      setDirtyStoreIds(new Set());
      showToast('No había datos válidos que guardar.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      await api.saveCargasDia(itemsToSave);
      setDirtyStoreIds(new Set());
      await loadDayData(selectedFecha);
      await loadMonthData(selectedMonth);
      showToast(`¡Se guardaron ${itemsToSave.length} tiendas correctamente!`, 'success');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al guardar. Intentá de nuevo.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setDirtyStoreIds(new Set());
    loadDayData(selectedFecha);
    showToast('Cambios descartados', 'info');
  };

  // WhatsApp formatted text generator
  const handleCopyWhatsApp = () => {
    if (dirtyStoreIds.size > 0) {
      showToast('Guardá primero los cambios antes de enviar por WhatsApp.', 'error');
      return;
    }
    const lines = [];
    lines.push(`*🥟 Carga diaria Mi Gusto*`);
    lines.push(`Supervisora: ${activeSupName}`);
    lines.push(`Día: ${fmtDayLong(selectedFecha)}`);
    lines.push('');

    let cTot = 0, vTot = 0, uTot = 0, countLoaded = 0;
    activeStores.forEach((t, i) => {
      const d = dayData[t.id];
      if (d) {
        countLoaded++;
        cTot += d.comandas;
        vTot += d.venta;
        uTot += d.unidades;
        const ticket = d.comandas > 0 ? ARS.format(d.venta / d.comandas) : '-';
        lines.push(`${i + 1}. *${t.name}*: ${INT.format(d.comandas)} cmdas · ${ARS.format(d.venta)} · ${INT.format(d.unidades)} unid. (Ticket: ${ticket})`);
      } else {
        lines.push(`• *${t.name}*: PENDIENTE DE CARGA`);
      }
    });

    lines.push('');
    lines.push(`*TOTAL (${countLoaded} de ${activeStores.length} tiendas):*`);
    lines.push(`💰 Venta: ${ARS.format(vTot)}`);
    lines.push(`🧾 Comandas: ${INT.format(cTot)}`);
    lines.push(`🥟 Unidades: ${INT.format(uTot)}`);

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    showToast('¡Texto copiado para WhatsApp! Pegalo en el chat.', 'success');
  };

  // Export Day CSV
  const handleExportDayCsv = () => {
    const rows = [
      'Ranking;Fecha;Supervisora;Tienda;Comandas;Venta;Unidades;Ticket Promedio;Unidades por Comanda;Estado',
    ];
    let rank = 1;
    activeStores.forEach((t) => {
      const d = dayData[t.id];
      const supObj = config.supervisoras.find((s) => s.id === t.sup);
      const supName = supObj ? supObj.name : 'Sin supervisora';
      if (d) {
        const ticket = d.comandas > 0 ? (d.venta / d.comandas).toFixed(2) : '';
        const upc = d.comandas > 0 ? (d.unidades / d.comandas).toFixed(2) : '';
        rows.push(`${rank++};${selectedFecha};"${supName}";"${t.name}";${d.comandas};${d.venta};${d.unidades};${ticket};${upc};Cargada`);
      } else {
        rows.push(`;${selectedFecha};"${supName}";"${t.name}";;;;;;Pendiente`);
      }
    });
    exportCsv(`Carga_MiGusto_${selectedFecha}.csv`, rows);
    showToast('Excel del día descargado', 'success');
  };

  // Export Month CSV
  const handleExportMonthCsv = () => {
    const rows = [
      'Fecha;Supervisora;Tienda;Comandas;Venta;Unidades;Ticket Promedio;Unidades por Comanda',
    ];
    monthlyRows.forEach((r) => {
      const ticket = r.comandas > 0 ? (r.venta / r.comandas).toFixed(2) : '';
      const upc = r.comandas > 0 ? (r.unidades / r.comandas).toFixed(2) : '';
      rows.push(`${r.fecha};"${r.supervisoraNombre || ''}";"${r.tiendaNombre}";${r.comandas};${r.venta};${r.unidades};${ticket};${upc}`);
    });
    exportCsv(`Registro_MiGusto_${selectedMonth}.csv`, rows);
    showToast('Excel del mes descargado', 'success');
  };

  // Day Ranking calculation
  const rankedDayList = useMemo(() => {
    const list = activeStores.map((t) => {
      const d = dayData[t.id];
      const ev = evaluateRow(t.id);
      const isLoaded = Boolean(d || ev.complete);
      const comandas = ev.complete ? ev.c : d ? d.comandas : 0;
      const venta = ev.complete ? ev.v : d ? d.venta : 0;
      const unidades = ev.complete ? ev.u : d ? d.unidades : 0;
      const ticketPromedio = comandas > 0 ? venta / comandas : 0;

      const supObj = config.supervisoras.find((s) => s.id === t.sup);

      return {
        tiendaId: t.id,
        tiendaNombre: t.name,
        supervisoraNombre: selectedSup === ALL_SUP && supObj ? supObj.name : null,
        isPropia: t.isPropia,
        isExperience: t.isExperience,
        isLoaded,
        comandas,
        venta,
        unidades,
        ticketPromedio,
      };
    });

    return list.sort((a, b) => {
      if (a.isLoaded !== b.isLoaded) return b.isLoaded - a.isLoaded;
      if (dayRankMetric === 'v') return b.venta - a.venta;
      if (dayRankMetric === 'c') return b.comandas - a.comandas;
      if (dayRankMetric === 'u') return b.unidades - a.unidades;
      if (dayRankMetric === 't') return b.ticketPromedio - a.ticketPromedio;
      return 0;
    });
  }, [activeStores, dayData, formInputs, dayRankMetric, selectedSup, config.supervisoras]);

  // Monthly KPIs & Breakdowns
  const monthlyData = useMemo(() => {
    const storeIds = new Set(activeStores.map((t) => t.id));
    const filtered = selectedSup === ALL_SUP ? monthlyRows : monthlyRows.filter((r) => storeIds.has(r.tiendaId));

    let venta = 0, comandas = 0, unidades = 0;
    filtered.forEach((r) => {
      venta += r.venta;
      comandas += r.comandas;
      unidades += r.unidades;
    });

    const ticketPromedio = comandas > 0 ? venta / comandas : null;
    const unidPorComanda = comandas > 0 ? unidades / comandas : null;

    // Days in selected month up to yesterday
    const [y, m] = selectedMonth.split('-').map(Number);
    const lastDayOfMonth = new Date(y, m, 0).getDate();
    const daysArr = [];
    const yday = getYesterdayStr();
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const s = `${selectedMonth}-${pad(d)}`;
      if (s <= yday) daysArr.push(s);
    }

    const totalStores = activeStores.length;
    const cargasEsperadas = daysArr.length * totalStores;
    const cargasRealizadas = filtered.length;
    const cumplimientoPorcentaje = cargasEsperadas > 0 ? Math.round((cargasRealizadas / cargasEsperadas) * 100) : 0;

    // Store breakdown
    const storesMonthly = activeStores.map((t) => {
      const storeRows = filtered.filter((r) => r.tiendaId === t.id);
      let sVenta = 0, sCmdas = 0, sUnid = 0;
      storeRows.forEach((r) => {
        sVenta += r.venta;
        sCmdas += r.comandas;
        sUnid += r.unidades;
      });
      const sTicket = sCmdas > 0 ? sVenta / sCmdas : null;
      const sUpc = sCmdas > 0 ? sUnid / sCmdas : null;

      const supObj = config.supervisoras.find((s) => s.id === t.sup);

      return {
        id: t.id,
        name: t.name,
        supervisoraNombre: selectedSup === ALL_SUP && supObj ? supObj.name : null,
        diasCargados: storeRows.length,
        diasEsperados: daysArr.length,
        comandas: sCmdas,
        venta: sVenta,
        unidades: sUnid,
        ticketPromedio: sTicket,
        unidPorComanda: sUpc,
      };
    }).sort((a, b) => b.venta - a.venta);

    // Supervisor ranking for All view
    const supervisorasMonthly = config.supervisoras.map((s) => {
      const sStores = config.tiendas.filter((t) => t.sup === s.id);
      const sStoreIds = new Set(sStores.map((t) => t.id));
      const sRows = monthlyRows.filter((r) => sStoreIds.has(r.tiendaId));

      let sv = 0, sc = 0, su = 0;
      sRows.forEach((r) => {
        sv += r.venta;
        sc += r.comandas;
        su += r.unidades;
      });

      return {
        id: s.id,
        name: s.name,
        tiendasCount: sStores.length,
        comandas: sc,
        venta: sv,
        unidades: su,
      };
    }).sort((a, b) => b.venta - a.venta);

    // Day by day list
    const daysMonthly = daysArr.slice().reverse().map((f) => {
      const fRows = filtered.filter((r) => r.fecha === f);
      let fv = 0, fc = 0, fu = 0;
      fRows.forEach((r) => {
        fv += r.venta;
        fc += r.comandas;
        fu += r.unidades;
      });
      return {
        fecha: f,
        tiendasCargadas: fRows.length,
        totalTiendas: totalStores,
        comandas: fc,
        venta: fv,
        unidades: fu,
      };
    });

    return {
      kpis: {
        venta,
        comandas,
        unidades,
        ticketPromedio,
        unidPorComanda,
        cargasRealizadas,
        cargasEsperadas,
        cumplimientoPorcentaje,
      },
      storesMonthly,
      supervisorasMonthly,
      daysMonthly,
    };
  }, [monthlyRows, activeStores, selectedMonth, selectedSup, config.supervisoras]);

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.supId) {
            setSelectedSup(user.supId);
            localStorage.setItem(LS_SELECTED_SUP, user.supId);
          }
        }}
      />
    );
  }

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setSelectedSup('');
    localStorage.removeItem(LS_SELECTED_SUP);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Brand Navigation */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        isDbConfigured={dbCreds.isConfigured}
      />

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8 pt-3 sm:pt-6">
        {/* Toast notifications */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 border animate-in slide-in-from-bottom duration-300 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-slate-900 text-slate-200 border-slate-700'
                : 'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Main Tabs Navigation */}
        <div className="mb-6 bg-slate-900/70 p-1.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="grid grid-cols-3 gap-1 sm:flex sm:items-center sm:gap-1.5">
            <button
              onClick={() => setActiveTab('carga')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-5 py-2.5 rounded-xl font-extrabold text-[11px] sm:text-sm transition text-center ${
                activeTab === 'carga'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-sm sm:text-base">📋</span>
              <span className="truncate">Carga diaria</span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-5 py-2.5 rounded-xl font-extrabold text-[11px] sm:text-sm transition text-center ${
                activeTab === 'ranking'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-sm sm:text-base">🏆</span>
              <span className="truncate">
                <span className="sm:hidden">Ranking</span>
                <span className="hidden sm:inline">Ranking y Métricas</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-5 py-2.5 rounded-xl font-extrabold text-[11px] sm:text-sm transition text-center ${
                activeTab === 'kanban'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-sm sm:text-base">🔀</span>
              <span className="truncate">
                <span className="sm:hidden">Sucursales</span>
                <span className="hidden sm:inline">Sucursales y supervisores</span>
              </span>
              <span className="hidden lg:inline text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {config.tiendas.length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'kanban' ? (
          <SupervisorKanbanBoard
            config={config}
            currentUser={currentUser}
            onUpdateConfig={async (next) => {
              setConfig(next);
              await api.saveConfig(next);
              showToast('Asignación de sucursales actualizada', 'success');
            }}
          />
        ) : activeTab === 'ranking' ? (
          /* TAB 2: RANKING Y MÉTRICAS */
          <div className="space-y-4 sm:space-y-6">
            {/* Header Filter Info with Día / Mes Toggle */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span>🏆 {rankingView === 'dia' ? 'Ranking del Día' : 'Métricas del Mes'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {rankingView === 'dia'
                    ? `Posiciones y rendimiento del día (${fmtDayLong(selectedFecha)})`
                    : 'Acumulado mensual consolidado y detalle de cumplimiento'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Switch Día / Mes (Bigger and comfortable) */}
                <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setRankingView('mes')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 ${
                      rankingView === 'mes'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingView('dia')}
                    className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 ${
                      rankingView === 'dia'
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    Día
                  </button>
                </div>

                {/* Show Month Picker only when viewing Mes */}
                {rankingView === 'mes' && (
                  <CustomMonthPicker
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                  />
                )}
              </div>
            </div>

            {/* Content: Day Ranking OR Monthly Dashboard according to selection */}
            {activeStores.length > 0 ? (
              rankingView === 'dia' ? (
                <DayRankTable
                  rankedList={rankedDayList}
                  metric={dayRankMetric}
                  onMetricChange={setDayRankMetric}
                  dateTitle={fmtDayLong(selectedFecha)}
                />
              ) : (
                <MonthlyDashboard
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  kpis={monthlyData.kpis}
                  storesMonthly={monthlyData.storesMonthly}
                  supervisorasMonthly={monthlyData.supervisorasMonthly}
                  daysMonthly={monthlyData.daysMonthly}
                  isAllSupervisors={selectedSup === ALL_SUP}
                  onExportMonthCsv={handleExportMonthCsv}
                />
              )
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <p className="text-base font-semibold text-white mb-1">
                  Sin tiendas para mostrar métricas
                </p>
              </div>
            )}
          </div>
        ) : (
          /* TAB 1: CARGA DIARIA (Enfocada 100% en la carga) */
          <>
            {/* Hero & Selection Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supervisor Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Supervisora a Cargo</span>
                </span>
                {currentUser?.email !== 'admin@migusto.com.ar' && currentUser?.supId !== '__all' && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Asignada por sesión
                  </span>
                )}
              </label>

              {currentUser?.email === 'admin@migusto.com.ar' || currentUser?.supId === '__all' ? (
                /* Admin: Can select any supervisor or all stores */
                <select
                  value={selectedSup}
                  onChange={(e) => {
                    if (dirtyStoreIds.size > 0) {
                      if (!confirm('Tenés cambios sin guardar. ¿Deseas descartarlos para cambiar de supervisora?')) {
                        return;
                      }
                      setDirtyStoreIds(new Set());
                    }
                    setSelectedSup(e.target.value);
                    localStorage.setItem(LS_SELECTED_SUP, e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white font-bold text-base focus:outline-none focus:border-amber-500 shadow-inner"
                >
                  <option value={ALL_SUP}>🌟 Todas las tiendas (Vista General)</option>
                  {config.supervisoras.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                /* Supervisor: Locked strictly to their own account */
                <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-white font-bold text-base shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
                        currentUser?.avatarColor || 'from-amber-500 to-orange-600'
                      } flex items-center justify-center font-extrabold text-white text-xs`}
                    >
                      {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    <span>{currentUser?.name}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                    {activeStores.length} locales
                  </span>
                </div>
              )}
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Día a Cargar</span>
              </label>

              <CustomDatePicker
                value={selectedFecha}
                maxDate={todayStr()}
                onChange={(val) => {
                  if (dirtyStoreIds.size > 0) {
                    if (!confirm('Tenés cambios sin guardar. ¿Deseas descartarlos para cambiar de fecha?')) {
                      return;
                    }
                    setDirtyStoreIds(new Set());
                  }
                  setSelectedFecha(val);
                }}
              />
            </div>
          </div>
        </div>

        {/* Day Sticky Bar */}
        <DaySummaryBar
          dateTitle={`${fmtDayLong(selectedFecha)} ${selectedFecha === getYesterdayStr() ? '· Ayer' : ''}`}
          totalStores={activeStores.length}
          loadedStores={loadedStoresCount}
          totals={dayTotals}
          onSave={handleSaveDay}
          onDiscard={handleDiscardChanges}
          onCopyWhatsApp={handleCopyWhatsApp}
          onExportCsv={handleExportDayCsv}
          dirtyCount={dirtyStoreIds.size}
          isSaving={isSaving}
        />

        {/* Store Sheet */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {!selectedSup ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <p className="text-base font-semibold text-white mb-1">
                Elegí tu nombre arriba para comenzar la carga
              </p>
              <p className="text-xs">
                Se guardará en tu dispositivo para recordar tu selección la próxima vez.
              </p>
            </div>
          ) : activeStores.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <p className="text-base font-semibold text-white mb-1">
                No hay tiendas asignadas para esta supervisora
              </p>
              <p className="text-xs">
                Podés asignar tiendas en la sección de Administración abajo.
              </p>
            </div>
          ) : (
            activeStores.map((tienda) => {
              const values = evaluateRow(tienda.id);
              const saved = dayData[tienda.id];
              const isDirty = dirtyStoreIds.has(tienda.id);

              return (
                <StoreRow
                  key={tienda.id}
                  tienda={tienda}
                  values={values}
                  onChange={handleInputChange}
                  savedData={saved}
                  isDirty={isDirty}
                />
              );
            })
          )}
        </div>

        {/* Action buttons toolbar positioned directly below the store sheet */}
        {activeStores.length > 0 && (
          <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="flex flex-col gap-3 max-w-xl mx-auto">
              {/* Primary Save Button */}
              <button
                onClick={handleSaveDay}
                disabled={isSaving || dirtyStoreIds.size === 0}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base transition flex items-center justify-center gap-2 shadow-xl ${
                  dirtyStoreIds.size > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSaving
                  ? 'Guardando cambios...'
                  : dirtyStoreIds.size > 0
                  ? `Guardar cambios (${dirtyStoreIds.size})`
                  : 'Guardar día'}
              </button>

              {/* Secondary Export & Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyWhatsApp}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/70 text-emerald-400 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-emerald-950/30"
                >
                  <span className="text-base">📱</span>
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleExportDayCsv}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-black/40"
                >
                  <span className="text-base">📊</span>
                  <span>Excel</span>
                </button>
              </div>

              {/* Discard changes button */}
              {dirtyStoreIds.size > 0 && (
                <button
                  onClick={handleDiscardChanges}
                  className="w-full py-2 text-rose-400 hover:text-rose-300 text-xs font-bold transition text-center"
                >
                  Descartar
                </button>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Database Modal */}
      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
}
