import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotPlan from '../modules/plotplan/PlotPlan';
import AWPEstructura from '../modules/awp/AWPEstructura';
import AWPJerarquia from '../modules/awp/AWPJerarquia';
import ConfigPanel from '../forms/ConfigPanel';
import UploadPlotPlanForm from '../forms/UploadPlotPlanForm';

const API_URL = 'http://localhost:8000/api/v1';

function ResumenTab({ proyecto, onProyectoUpdate }) {
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);
  const [selectedCWA, setSelectedCWA] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (proyecto.plot_plans && proyecto.plot_plans.length > 0) {
      setSelectedPlotPlanId(proyecto.plot_plans[0].id);
    }
  }, [proyecto.plot_plans]);

  const currentPlotPlan = proyecto.plot_plans?.find(pp => pp.id === selectedPlotPlanId);

  const handleShapeSaved = (cwaId, nuevoCWP) => {
    console.log("✅ Forma guardada, actualizando proyecto...");
    const updatedProyecto = {
      ...proyecto,
      plot_plans: proyecto.plot_plans.map(pp => {
        if (pp.id === selectedPlotPlanId) {
          return {
            ...pp,
            cwas: pp.cwas.map(cwa => {
              if (cwa.id === cwaId) {
                return {
                  ...cwa,
                  cwps: [...(cwa.cwps || []), nuevoCWP]
                };
              }
              return cwa;
            })
          };
        }
        return pp;
      })
    };
    onProyectoUpdate(updatedProyecto);
  };

  const handlePlotPlanUploaded = (nuevoPlotPlan) => {
    const updatedProyecto = {
      ...proyecto,
      plot_plans: [...proyecto.plot_plans, { ...nuevoPlotPlan, cwas: [] }]
    };
    onProyectoUpdate(updatedProyecto);
    setSelectedPlotPlanId(nuevoPlotPlan.id);
  };

  const handleDisciplinaCreada = (nuevaDisciplina) => {
    const updatedProyecto = {
      ...proyecto,
      disciplinas: [...proyecto.disciplinas, nuevaDisciplina]
    };
    onProyectoUpdate(updatedProyecto);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Resumen General</h2>
          {currentPlotPlan && (
            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full text-sm text-blue-300 font-medium">
              📍 {currentPlotPlan.nombre}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {proyecto.plot_plans && proyecto.plot_plans.length > 1 && (
            <select
              value={selectedPlotPlanId || ''}
              onChange={(e) => setSelectedPlotPlanId(Number(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              {proyecto.plot_plans.map(pp => (
                <option key={pp.id} value={pp.id}>{pp.nombre}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showConfig && (
          <div className="p-6 border-b border-gray-700">
            <ConfigPanel
              proyecto={proyecto}
              onDisciplinaCreada={handleDisciplinaCreada}
              selectedPlotPlanId={selectedPlotPlanId}
            />
          </div>
        )}

        {/* Upload Plot Plan */}
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">📤 Subir Nuevo Plano</h3>
          <UploadPlotPlanForm
            proyecto={proyecto}
            onUploadSuccess={handlePlotPlanUploaded}
          />
        </div>

        {currentPlotPlan ? (
          <div className="p-6 space-y-6">
            {/* Plot Plan Canvas */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">📐 Lienzo Interactivo</h3>
              </div>
              <div className="p-4">
                <PlotPlan
                  plotPlan={currentPlotPlan}
                  cwaToAssociate={selectedCWA}
                  onShapeSaved={handleShapeSaved}
                />
              </div>
            </div>

            {/* AWP Structure (Selector de CWA) */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">📊 Seleccionar CWA para Asociar</h3>
              </div>
              <div className="p-4">
                <AWPEstructura
                  plotPlan={currentPlotPlan}
                  onCWACreada={() => {}}
                  onCWPCreado={() => {}}
                  selectedCWA={selectedCWA}
                  onSelectCWA={setSelectedCWA}
                />
              </div>
            </div>

            {/* Tabla Jerárquica AWP */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">📋 Jerarquía Completa AWP</h3>
              </div>
              <div className="p-4">
                <AWPJerarquia
                  plotPlanId={selectedPlotPlanId}
                  proyecto={proyecto}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>No hay plot plans disponibles</p>
              <p className="text-sm text-gray-500 mt-2">Sube uno usando el formulario de arriba</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumenTab;