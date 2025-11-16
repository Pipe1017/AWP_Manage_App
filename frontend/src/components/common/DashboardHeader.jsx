import React from 'react';

function DashboardHeader({ proyecto, onBack, sidebarExpanded, setSidebarExpanded }) {
  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border-b border-blue-700/30 h-16 flex items-center px-6 gap-4 sticky top-0 z-40">
      {/* Menu Toggle */}
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        title="Toggle sidebar"
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-300 hover:text-white"
        title="Volver a proyectos"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Proyectos</span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-700"></div>

      {/* Project Info */}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white">{proyecto.nombre}</h1>
        <p className="text-xs text-gray-400">
          {proyecto.disciplinas?.length || 0} disciplinas • {proyecto.plot_plans?.length || 0} planos
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Configuración">
          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative" title="Notificaciones">
          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Perfil">
          <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;