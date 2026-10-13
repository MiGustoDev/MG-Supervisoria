import React, { useState } from 'react';
import {
  Users,
  Store,
  GripVertical,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  MapPin,
  Search,
} from 'lucide-react';

export function SupervisorKanbanBoard({ config, onUpdateConfig, currentUser }) {
  const [draggedStoreId, setDraggedStoreId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const supervisoras = config.supervisoras || [];
  const tiendas = config.tiendas || [];

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'admin@migusto.com.ar' || currentUser?.supId === '__all';
  const currentUserId = currentUser?.supId;

  // Track expanded state for accordion panels (by default, logged supervisor is expanded or all if admin)
  const [expandedCols, setExpandedCols] = useState(() => {
    const map = {};
    supervisoras.forEach((s) => {
      // If admin, open all. If supervisor, open their own by default.
      map[s.id] = isAdmin || s.id === currentUserId;
    });
    return map;
  });

  const toggleCol = (colId) => {
    setExpandedCols((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  // Reorder supervisoras: Logged supervisor comes first!
  const sortedSupervisoras = [...supervisoras].sort((a, b) => {
    if (!isAdmin && currentUserId) {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
    }
    return 0;
  });

  const columns = sortedSupervisoras.map((s) => ({
    id: s.id,
    name: s.name,
    title: s.title || 'Supervisora de Tiendas',
    avatarColor: s.avatarColor || 'from-amber-500 to-orange-600',
    stores: tiendas.filter((t) => t.sup === s.id),
    isCurrentLoggedUser: currentUserId === s.id,
  }));

  // Drag Handlers (ONLY enabled for admin)
  const handleDragStart = (e, storeId) => {
    if (!isAdmin) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', storeId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedStoreId(storeId);
  };

  const handleDragOver = (e, colId) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    if (!isAdmin) return;
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e, targetColId) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDragOverColId(null);
    const storeId = e.dataTransfer.getData('text/plain') || draggedStoreId;
    if (!storeId) return;

    const nextTiendas = tiendas.map((t) => {
      if (t.id === storeId) {
        return { ...t, sup: targetColId };
      }
      return t;
    });

    onUpdateConfig({
      ...config,
      tiendas: nextTiendas,
    });
    setDraggedStoreId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl mb-8">
      {/* Board Top Header: Centered location icon, title and larger search bar */}
      <div className="flex flex-col items-center justify-center text-center gap-3.5 mb-6 pb-5 border-b border-slate-800/80">
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/25">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
              {isAdmin ? (
                'Arrastrá cualquier sucursal y soltala en otra supervisora para transferirla al instante'
              ) : (
                'Sucursales y asignaciones por supervisora'
              )}
            </h3>
            {isAdmin && (
              <p className="text-xs text-slate-400 mt-1">
                Modo Administrador: Tenés permisos para reasignar sucursales entre bandejas.
              </p>
            )}
          </div>
        </div>

        {/* Larger Centered Search Input */}
        <div className="w-full max-w-md relative mt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar sucursal por nombre..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner transition text-left"
          />
        </div>
      </div>

      {/* Accordion / Column List */}
      <div className="space-y-4">
        {columns.map((col) => {
          const isOver = dragOverColId === col.id;
          const isExpanded = expandedCols[col.id] !== false;
          // If supervisor: their own column is editable/active, others are read-only and dimmed
          const isDimmed = !isAdmin && !col.isCurrentLoggedUser;

          const filteredStores = col.stores.filter((t) =>
            t.name.toLowerCase().includes(searchFilter.toLowerCase())
          );

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOver
                  ? 'bg-slate-800/80 border-amber-500 shadow-2xl shadow-amber-500/10'
                  : col.isCurrentLoggedUser
                  ? 'bg-slate-950/90 border-amber-500/80 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/40'
                  : isDimmed
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-60 hover:opacity-85'
                  : 'bg-slate-950/70 border-slate-800/80 shadow-inner'
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleCol(col.id)}
                className={`w-full p-3.5 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 text-left transition select-none ${
                  col.isCurrentLoggedUser
                    ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-transparent hover:bg-slate-900/80'
                    : 'bg-slate-900/50 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${col.avatarColor} flex items-center justify-center font-extrabold text-white text-sm shadow-md shrink-0`}
                  >
                    {col.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug break-words">
                      {col.name}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                      {col.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span
                    className={`text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full font-mono-numbers whitespace-nowrap ${
                      col.isCurrentLoggedUser
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    {col.stores.length} <span className="hidden xs:inline">locales</span>
                  </span>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800/60 flex items-center justify-center text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Accordion Content / Stores List */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/60 bg-slate-950/60">
                  {filteredStores.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800/60 rounded-xl">
                      {searchFilter
                        ? 'No se encontraron sucursales con esa búsqueda'
                        : isOver
                        ? 'Soltá aquí para transferir la sucursal'
                        : 'Sin sucursales asignadas'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {filteredStores.map((store) => {
                        const isDragging = draggedStoreId === store.id;

                        return (
                          <div
                            key={store.id}
                            draggable={isAdmin}
                            onDragStart={(e) => handleDragStart(e, store.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                              isAdmin
                                ? 'cursor-grab active:cursor-grabbing hover:border-amber-500/60 hover:bg-slate-850 hover:shadow-lg'
                                : 'cursor-default'
                            } ${
                              isDragging
                                ? 'opacity-40 border-amber-500 scale-95'
                                : isDimmed
                                ? 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                                : 'bg-slate-900 border-slate-800 text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              {isAdmin && (
                                <GripVertical className="w-4 h-4 text-slate-500 hover:text-amber-400 transition shrink-0" />
                              )}
                              <span className="truncate text-white font-bold text-xs">
                                {store.name}
                              </span>
                              {store.isPropia && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider shrink-0 border border-amber-500/30">
                                  Propia
                                </span>
                              )}
                              {store.isExperience && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black uppercase tracking-wider shrink-0 border border-purple-500/30">
                                  Experience
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Drop zone helper only shown to admin */}
                  {isAdmin && isOver && (
                    <div className="mt-2 p-3 text-center border-2 border-dashed border-amber-500 rounded-xl text-amber-400 text-xs font-bold animate-pulse">
                      Soltá aquí para reasignar a {col.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
