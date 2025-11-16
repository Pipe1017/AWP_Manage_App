import React, { useState } from 'react';

function Sidebar({ proyectos, selectedProyecto, onSelectProyecto, onAddProyecto, loading }) {
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombreProyecto.trim()) return;
    
    setIsCreating(true);
    await onAddProyecto(nombreProyecto);
    setNombreProyecto("");
    setIsCreating(false);
  };

  return (
    // Estilo avanzado de Sidebar
    <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-r-2 border-blue-900/50 h-screen overflow-y-auto shadow-2xl">
      
      {/* Header con logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
            {/* Ícono de Proyecto (Planta Industrial) */}
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AWP Manager</h2>
            <p className="text-xs text-gray-400">Sistema de Gestión de Proyectos</p>
          </div>
        </div>
      </div>

      {/* Formulario para crear proyecto */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Nuevo Proyecto</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={nombreProyecto}
            onChange={(e) => setNombreProyecto(e.target.value)}
            placeholder="Nombre del proyecto..."
            className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isCreating}
          />
          <button 
            type="submit" 
            disabled={isCreating || !nombreProyecto.trim()}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Crear Proyecto
              </>
            )}
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-700"></div>

      {/* Lista de proyectos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Mis Proyectos</h3>
          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full font-medium">
            {proyectos.length}
          </span>
        </div>
        
        {loading && proyectos.length === 0 ? (
          // Estado de carga visual mejorado
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="animate-spin h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-sm">Cargando proyectos...</p>
          </div>
        ) : proyectos.length > 0 ? (
          <ul className="space-y-2">
            {proyectos.map((proyecto) => (
              <li
                key={proyecto.id}
                onClick={() => onSelectProyecto(proyecto)}
                className={`
                  cursor-pointer p-4 rounded-lg border transition-all transform hover:scale-[1.02]
                  ${selectedProyecto?.id === proyecto.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg ring-2 ring-blue-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${selectedProyecto?.id === proyecto.id ? 'bg-white/20' : 'bg-gray-700'}
                  `}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{proyecto.nombre}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
                      {/* Contador de Disciplinas */}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        {proyecto.disciplinas?.length || 0} disc.
                      </span>
                      {/* Contador de Plot Plans */}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        {proyecto.plot_plans?.length || 0} plans
                      </span>
                    </div>
                  </div>
                  {/* Checkmark de Selección */}
                  {selectedProyecto?.id === proyecto.id && (
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <p className="text-sm font-medium mb-1">No hay proyectos</p>
            <p className="text-xs text-center">Crea tu primer proyecto usando el formulario de arriba</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          <span className="font-semibold text-gray-400">HATCH Engineering</span><br />
          AWP Management System v1.0
        </p>
      </div>
    </div>
  );
}

export default Sidebar;