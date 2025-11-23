// frontend/src/components/sections/CronogramaSection.jsx
import React from 'react';

function CronogramaTab({ proyecto }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-amber-600/20 border border-amber-500/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Cronograma</h2>
        <p className="text-gray-400 mb-6">
          Visualización Gantt con dependencias entre paquetes de trabajo.
        </p>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-left">
          <p className="text-sm text-gray-300 font-semibold mb-3">Características futuras:</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              Gráfico Gantt interactivo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              Dependencias y rutas críticas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              Hitos y milestones
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              Cargas de recursos por disciplina
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CronogramaTab;