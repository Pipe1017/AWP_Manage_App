// frontend/src/pages/ProyectosLanding.jsx
import React, { useState } from 'react';
import HatchLogo from '../components/common/HatchLogo';

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
    <div className="bg-white text-hatch-blue min-h-screen">
      {/* Header con branding HATCH */}
      <div className="bg-gradient-hatch border-b border-hatch-blue-light backdrop-blur-sm sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HatchLogo className="h-12" variant="full" />
              <div className="border-l-2 border-hatch-orange pl-4">
                <h1 className="text-2xl font-bold text-hatch-blue">AWP Manager</h1>
                <p className="text-sm text-hatch-gray">Advanced Work Packaging System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-hatch-gray">Total Proyectos</p>
              <p className="text-3xl font-bold text-hatch-orange">{proyectos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Create Project */}
        <div className="mb-12 p-8 bg-gradient-to-br from-hatch-gray to-white border-2 border-hatch-orange/20 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-hatch-blue flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-orange rounded-lg flex items-center justify-center text-hatch-blue">+</span>
            Crear Nuevo Proyecto
          </h2>
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              placeholder="Nombre del proyecto (ej. Refinería XYZ)..."
              className="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-hatch-gray-dark text-hatch-blue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hatch-orange focus:border-transparent"
              disabled={isCreating}
            />
            <button
              type="submit"
              disabled={isCreating || !nombreProyecto.trim()}
              className="px-8 py-3 bg-gradient-orange hover:shadow-lg text-hatch-blue font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creando..." : "Crear Proyecto"}
            </button>
          </form>
        </div>

        {/* Projects Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-hatch-blue">Mis Proyectos</h2>
            {proyectos.length > 1 && (
              <div className="relative">
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar proyecto..."
                  className="px-4 py-2 pl-10 rounded-lg bg-white border-2 border-hatch-gray text-hatch-blue text-sm w-64 focus:outline-none focus:ring-2 focus:ring-hatch-orange"
                />
                <svg className="w-5 h-5 text-hatch-blue absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="group cursor-pointer p-6 bg-white border-2 border-hatch-gray hover:border-hatch-orange rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-hatch-blue">{proyecto.nombre}</h3>
                    <div className="w-10 h-10 bg-gradient-orange rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-hatch-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-hatch-gray">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-hatch-orange">{proyecto.disciplinas?.length || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Disciplinas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-hatch-blue">{proyecto.plot_plans?.length || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Planos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-hatch-blue-light">
                        {proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">CWAs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-hatch-gray/30 border-2 border-dashed border-hatch-gray-dark rounded-xl">
              <svg className="w-16 h-16 text-hatch-blue mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium text-hatch-blue">No hay proyectos aún</p>
              <p className="text-sm text-gray-500 mt-2">Crea tu primer proyecto usando el formulario de arriba</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProyectosLanding;