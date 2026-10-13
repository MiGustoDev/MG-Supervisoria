import React, { useState } from 'react';
import { Settings, Plus, Trash2, Store, Users, Check, AlertCircle } from 'lucide-react';
import { newId } from '../lib/formatters';

export function AdminStructureSection({
  config,
  onSaveConfig,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreSupId, setNewStoreSupId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAddSup = (e) => {
    e.preventDefault();
    const name = newSupName.trim();
    if (!name) return;
    if (config.supervisoras.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      alert('Esa supervisora ya existe.');
      return;
    }
    const next = {
      ...config,
      supervisoras: [...config.supervisoras, { id: newId('sup_'), name }],
    };
    onSaveConfig(next);
    setNewSupName('');
  };

  const handleRenameSup = (id, newName) => {
    const next = {
      ...config,
      supervisoras: config.supervisoras.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    };
    onSaveConfig(next);
  };

  const handleDeleteSup = (id) => {
    const next = {
      ...config,
      supervisoras: config.supervisoras.filter((s) => s.id !== id),
      tiendas: config.tiendas.map((t) => (t.sup === id ? { ...t, sup: '' } : t)),
    };
    onSaveConfig(next);
    setConfirmDelete(null);
  };

  const handleAddStore = (e) => {
    e.preventDefault();
    const name = newStoreName.trim();
    if (!name) return;
    if (config.tiendas.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Esa tienda ya existe.');
      return;
    }
    const next = {
      ...config,
      tiendas: [...config.tiendas, { id: newId('t_'), name, sup: newStoreSupId }],
    };
    onSaveConfig(next);
    setNewStoreName('');
  };

  const handleRenameStore = (id, newName) => {
    const next = {
      ...config,
      tiendas: config.tiendas.map((t) => (t.id === id ? { ...t, name: newName } : t)),
    };
    onSaveConfig(next);
  };

  const handleReassignStore = (id, newSupId) => {
    const next = {
      ...config,
      tiendas: config.tiendas.map((t) => (t.id === id ? { ...t, sup: newSupId } : t)),
    };
    onSaveConfig(next);
  };

  const handleDeleteStore = (id) => {
    const next = {
      ...config,
      tiendas: config.tiendas.filter((t) => t.id !== id),
    };
    onSaveConfig(next);
    setConfirmDelete(null);
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Settings className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Configuración de Estructura</h3>
            <p className="text-xs text-slate-400">
              Administración de supervisoras y asignación de tiendas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
        >
          {isOpen ? 'Ocultar panel' : 'Editar estructura'}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-8 animate-in fade-in duration-200">
          {/* Supervisoras */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Supervisoras ({config.supervisoras.length})</span>
            </h4>

            <div className="space-y-2">
              {config.supervisoras.map((s) => {
                const count = config.tiendas.filter((t) => t.sup === s.id).length;
                return (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
                  >
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleRenameSup(s.id, e.target.value)}
                      className="bg-transparent border-0 text-white font-semibold text-sm focus:outline-none flex-1 min-w-[150px]"
                    />
                    <span className="text-xs text-slate-400">
                      {count} {count === 1 ? 'tienda' : 'tiendas'}
                    </span>

                    {confirmDelete === s.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteSup(s.id)}
                          className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                        >
                          Sí, borrar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Supervisor Form */}
            <form onSubmit={handleAddSup} className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Nombre de la nueva supervisora..."
                value={newSupName}
                onChange={(e) => setNewSupName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 flex-1"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>
          </div>

          {/* Tiendas */}
          <div className="border-t border-slate-800 pt-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Tiendas ({config.tiendas.length})</span>
            </h4>

            <div className="space-y-2">
              {config.tiendas.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80"
                >
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => handleRenameStore(t.id, e.target.value)}
                    className="bg-transparent border-0 text-white font-semibold text-sm focus:outline-none flex-1 min-w-[150px]"
                  />

                  <select
                    value={t.sup || ''}
                    onChange={(e) => handleReassignStore(t.id, e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="">Sin supervisora</option>
                    {config.supervisoras.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {confirmDelete === t.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteStore(t.id)}
                        className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
                      >
                        Sí, borrar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Store Form */}
            <form onSubmit={handleAddStore} className="flex flex-wrap gap-2 mt-3">
              <input
                type="text"
                placeholder="Nombre de la nueva tienda..."
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 flex-1 min-w-[200px]"
              />

              <select
                value={newStoreSupId}
                onChange={(e) => setNewStoreSupId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none"
              >
                <option value="">Asignar supervisora...</option>
                {config.supervisoras.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
