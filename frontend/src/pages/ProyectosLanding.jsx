// frontend/src/pages/ProyectosLanding.jsx
import React, { useState } from 'react';
import HatchLogo from '../components/common/HatchLogo';
import client from '../api/axios';

function ProyectosLanding({ proyectos, onSelectProyecto, onAddProyecto, error }) {
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [filtro, setFiltro] = useState("");
  
  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreProyecto.trim()) return;
    setIsCreating(true);
    await onAddProyecto(nombreProyecto);
    setNombreProyecto("");
    setIsCreating(false);
  };

  const handleStartEdit = (e, p) => {
    e.stopPropagation();
    setEditingId(p.id);
    setEditName(p.nombre);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      await client.put(`/proyectos/${editingId}`, { nombre: editName });
      window.location.reload();
    } catch (err) {
      alert("Error editando proyecto");
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm("⚠️ ¿Estás seguro? Se borrará TODO el proyecto:\n- Planos\n- Áreas (CWAs)\n- Paquetes (CWPs/EWPs/PWPs)\n- Items\n\nEsta acción no se puede deshacer.")) return;
    
    try {
      await client.delete(`/proyectos/${id}`);
      window.location.reload();
    } catch (err) {
      alert("Error eliminando proyecto");
    }
  };

  const proyectosFiltrados = proyectos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="bg-gray-50 text-hatch-blue min-h-screen flex flex-col">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* ✅ CAMBIO AQUÍ: Logo más grande (h-16) */}
            <HatchLogo className="h-16" variant="full" />
            
            <div className="h-12 w-px bg-gray-300"></div>
            
            <div>
              {/* ✅ CAMBIO AQUÍ: Título más grande para balancear */}
              <h1 className="text-2xl font-bold text-hatch-blue tracking-tight">AWP Manager</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Construction Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs text-gray-400 font-semibold uppercase">Proyectos Activos</p>
              <p className="text-2xl font-bold text-hatch-orange leading-none">{proyectos.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-hatch flex items-center justify-center text-white font-bold shadow-lg text-lg">
              U
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r shadow-sm flex items-center gap-3 text-red-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">Error de Conexión</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* FORMULARIO CREACIÓN */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-1 bg-gradient-orange"></div>
          <div className="p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/3">
              <h2 className="text-2xl font-bold text-hatch-blue mb-2">Nuevo Proyecto</h2>
              <p className="text-gray-500 text-sm">Crea un nuevo espacio de trabajo para gestionar planos, áreas y paquetes de construcción.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 w-full flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={nombreProyecto}
                  onChange={(e) => setNombreProyecto(e.target.value)}
                  placeholder="Ej: Refinería Planta B - Fase 2"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-hatch-blue placeholder-gray-400 focus:outline-none focus:border-hatch-orange focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                  disabled={isCreating}
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={isCreating || !nombreProyecto.trim()}
                className="px-8 py-4 bg-hatch-blue hover:bg-hatch-blue-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isCreating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>+ Crear</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* LISTA DE PROYECTOS */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-hatch-orange rounded-full"></span>
            Mis Proyectos
          </h2>
          
          {proyectos.length > 0 && (
            <div className="relative">
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Filtrar proyectos..."
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm w-64 focus:outline-none focus:border-hatch-blue focus:ring-1 focus:ring-hatch-blue"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {proyectosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectosFiltrados.map(proyecto => (
              <div
                key={proyecto.id}
                onClick={() => onSelectProyecto(proyecto)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-hatch-orange/30 transition-all cursor-pointer flex flex-col h-full overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white group-hover:from-orange-50/30 group-hover:to-white transition-colors">
                  {editingId === proyecto.id ? (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <input 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)}
                        className="flex-1 px-2 py-1 border-2 border-blue-400 rounded text-lg font-bold text-hatch-blue outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveEdit} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Guardar">✓</button>
                      <button onClick={handleCancelEdit} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Cancelar">✕</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-hatch-blue line-clamp-1" title={proyecto.nombre}>
                        {proyecto.nombre}
                      </h3>
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">ID: {proyecto.id}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Última actualización: Hoy</p>
                </div>

                {/* Card Body (Stats) */}
                <div className="p-5 flex-1">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                      <p className="text-2xl font-bold text-hatch-orange">{proyecto.disciplinas?.length || 0}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Discip</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                      <p className="text-2xl font-bold text-hatch-blue">{proyecto.plot_plans?.length || 0}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Planos</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                      <p className="text-2xl font-bold text-blue-400">
                        {proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">CWAs</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Actions) - Siempre visible pero discreto */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleStartEdit(e, proyecto)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-hatch-blue hover:bg-white border border-transparent hover:border-gray-200 rounded-md transition-all"
                  >
                    ✏️ Editar
                  </button>
                  <div className="w-px bg-gray-300 h-6 self-center mx-1"></div>
                  <button 
                    onClick={(e) => handleDelete(e, proyecto.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-all"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xl font-bold text-gray-400">No hay proyectos aún</p>
            <p className="text-gray-400 mt-2">Usa el panel superior para crear el primero</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProyectosLanding;