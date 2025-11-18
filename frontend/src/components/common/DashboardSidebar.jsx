// frontend/src/components/common/DashboardSidebar.jsx

import React from 'react';

function DashboardSidebar({ proyecto, selectedSection, setSelectedSection, isExpanded }) {
  // ============================================================================
  // VERSIÓN COLAPSADA (Solo íconos)
  // ============================================================================
  if (!isExpanded) {
    return (
      <div className="w-20 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-6 gap-4">
        {/* Resumen */}
        <button
          onClick={() => setSelectedSection('resumen')}
          className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
            selectedSection === 'resumen'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Resumen General"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>

        {/* Cronograma */}
        <button
          onClick={() => setSelectedSection('cronograma')}
          className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
            selectedSection === 'cronograma'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Cronograma"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Árbol */}
        <button
          onClick={() => setSelectedSection('arbol')}
          className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
            selectedSection === 'arbol'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Árbol del Proyecto"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Separador */}
        <div className="w-full border-t border-gray-700 my-2"></div>

        {/* ✨ NUEVO: Configuración */}
        <button
          onClick={() => setSelectedSection('configuracion')}
          className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
            selectedSection === 'configuracion'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Configuración"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

  // ============================================================================
  // VERSIÓN EXPANDIDA (Con detalles)
  // ============================================================================
  return (
    <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 flex flex-col overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" />
          </svg>
          Panel de Control
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ======================================================================
            SECCIÓN: Resumen General
        ====================================================================== */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedSection('resumen')}
            className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 mb-3 ${
              selectedSection === 'resumen'
                ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Resumen General</p>
              <p className="text-xs text-gray-400 mt-0.5">Plot Plan y estructura AWP</p>
            </div>
          </button>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30 text-center">
              <p className="text-lg font-bold text-blue-400">{proyecto.disciplinas?.length || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Disciplinas</p>
            </div>
            <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30 text-center">
              <p className="text-lg font-bold text-cyan-400">{proyecto.plot_plans?.length || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Planos</p>
            </div>
            <div className="p-3 bg-emerald-900/30 rounded-lg border border-emerald-500/30 text-center">
              <p className="text-lg font-bold text-emerald-400">
                {proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">CWAs</p>
            </div>
          </div>
        </div>

        {/* ======================================================================
            SECCIÓN: Cronograma
        ====================================================================== */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedSection('cronograma')}
            className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
              selectedSection === 'cronograma'
                ? 'bg-amber-600/20 border border-amber-500/50 text-amber-300'
                : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Cronograma</p>
              <p className="text-xs text-gray-400 mt-0.5">Gantt y timeline</p>
            </div>
            <span className="px-2 py-1 bg-amber-600/30 text-amber-300 text-xs rounded-full font-semibold">
              Próxima
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-3 px-2">
            Visualiza el cronograma del proyecto con dependencias entre CWP, EWP, PWP e IWP.
          </p>
        </div>

        {/* ======================================================================
            SECCIÓN: Árbol del Proyecto
        ====================================================================== */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setSelectedSection('arbol')}
            className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
              selectedSection === 'arbol'
                ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Árbol de Proyecto</p>
              <p className="text-xs text-gray-400 mt-0.5">Jerarquía completa</p>
            </div>
            <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full font-semibold">
              Próxima
            </span>
          </button>
          <p className="text-xs text-gray-500 mt-3 px-2">
            Visualiza toda la estructura jerárquica del proyecto en formato de árbol expandible.
          </p>
        </div>

        {/* Separador visual */}
        <div className="mx-4 my-2 border-t-2 border-gray-700"></div>

        {/* ======================================================================
            ✨ NUEVA SECCIÓN: Configuración
        ====================================================================== */}
        <div className="p-4">
          <button
            onClick={() => setSelectedSection('configuracion')}
            className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
              selectedSection === 'configuracion'
                ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                : 'bg-gray-700/30 hover:bg-gray-700/50 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-sm">Configuración</p>
              <p className="text-xs text-gray-400 mt-0.5">Catálogos del proyecto</p>
            </div>
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
          </button>
          <p className="text-xs text-gray-500 mt-3 px-2">
            Gestiona disciplinas, tipos de entregables, y catálogos maestros del proyecto.
          </p>

          {/* Mini-stats de configuración */}
          <div className="mt-3 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Disciplinas:</span>
                <span className="text-purple-300 font-semibold">{proyecto.disciplinas?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipos Entregables:</span>
                <span className="text-purple-300 font-semibold">
                  {proyecto.disciplinas?.reduce((sum, d) => sum + (d.tipos_entregables?.length || 0), 0) || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Áreas (CWA):</span>
                <span className="text-purple-300 font-semibold">
                  {proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50 text-xs text-gray-500 text-center">
        <p>Proyecto ID: <strong className="text-gray-400">{proyecto.id}</strong></p>
        <p className="mt-1 text-gray-600">AWP Manager v1.0</p>
      </div>
    </div>
  );
}

export default DashboardSidebar;