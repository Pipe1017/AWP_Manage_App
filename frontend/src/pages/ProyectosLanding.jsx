import React, { useState } from 'react';

function ProyectosLanding({ proyectos, onSelectProyecto, onAddProyecto, error }) {
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [filtro, setFiltro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreProyecto.trim()) return;
    setIsCreating(true);
    await onAddProyecto(nombreProyecto);
    setNombreProyecto("");
    setIsCreating(false);
  };

  const proyectosFiltrados = proyectos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border-b border-blue-700/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AWP Manager</h1>
                <p className="text-sm text-gray-400">Sistema de Gestión Avanzada de Proyectos</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>Total: <strong className="text-blue-400">{proyectos.length}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-200">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Create Project */}
        <div className="mb-12 p-8 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 text-blue-300 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo Proyecto
          </h2>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              placeholder="Nombre del proyecto (ej. Refinería XYZ)..."
              className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !nombreProyecto.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {isCreating ? "Creando..." : "Crear"}
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Mis Proyectos</h2>
            {proyectos.length > 1 && (
              <div className="relative">
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar..."
                  className="px-4 py-2 pl-10 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm w-64"
                />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="group cursor-pointer p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-xl"
                >
                  <h3 className="text-lg font-bold text-white mb-4">{proyecto.nombre}</h3>
                  
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-400">{proyecto.disciplinas?.length || 0}</p>
                      <p className="text-xs text-gray-500">Disciplinas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-cyan-400">{proyecto.plot_plans?.length || 0}</p>
                      <p className="text-xs text-gray-500">Planos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-400">
                        {proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0}
                      </p>
                      <p className="text-xs text-gray-500">CWAs</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-gray-400 text-center">Click para abrir →</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-800/30 border border-gray-700 rounded-xl">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium text-gray-400">No hay proyectos</p>
              <p className="text-sm text-gray-500">Crea uno usando el formulario de arriba</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProyectosLanding;