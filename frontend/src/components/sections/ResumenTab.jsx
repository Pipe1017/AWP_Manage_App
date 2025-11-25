// frontend/src/components/sections/ResumenTab.jsx

import React, { useState, useEffect } from 'react';
import client from '../../api/axios';

import PlotPlan from '../modules/plotplan/PlotPlan';
import AWPTableConsolidada from '../modules/awp/AWPTableConsolidada';
import UploadPlotPlanForm from '../modules/upload/UploadPlotPlanForm';

function ResumenTab({ proyecto, onProyectoUpdate }) {
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);
  const [selectedCWA, setSelectedCWA] = useState(null);
  const [filteredCWAId, setFilteredCWAId] = useState(null);
  const [isLoadingPlotPlan, setIsLoadingPlotPlan] = useState(false);

  // Inicializar con el primer plot plan si existe
  useEffect(() => {
    if (proyecto.plot_plans && proyecto.plot_plans.length > 0 && !selectedPlotPlanId) {
      setSelectedPlotPlanId(proyecto.plot_plans[0].id);
    }
  }, [proyecto.plot_plans]);

  // Función para recargar todo el proyecto desde el servidor
  const recargarProyecto = async () => {
    try {
      console.log("🔄 Recargando proyecto completo...");
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
      console.log("✅ Proyecto recargado");
    } catch (err) {
      console.error("❌ Error recargando proyecto:", err);
    }
  };

  // Cargar detalles del plot plan cuando se selecciona (incluye CWAs y geometrías)
  useEffect(() => {
    if (!selectedPlotPlanId) return;
    
    let isMounted = true;
    
    const loadPlotPlanWithCWAs = async () => {
      try {
        setIsLoadingPlotPlan(true);
        console.log(`🔄 Cargando detalles del plot plan ${selectedPlotPlanId}...`);
        
        const response = await client.get(
          `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
        );
        
        if (!isMounted) return;
        
        // Actualizamos solo este plot plan dentro de la estructura del proyecto
        const updatedPlotPlans = (proyecto.plot_plans || []).map(pp =>
          pp.id === selectedPlotPlanId ? response.data : pp
        );
        
        onProyectoUpdate({
          ...proyecto,
          plot_plans: updatedPlotPlans
        });
        
        // Reseteamos selecciones
        setSelectedCWA(null);
        setIsLoadingPlotPlan(false);
        
      } catch (err) {
        if (isMounted) {
          console.error("Error cargando Plot Plan:", err);
          setIsLoadingPlotPlan(false);
        }
      }
    };
    
    loadPlotPlanWithCWAs();
    
    return () => {
      isMounted = false;
    };
  }, [selectedPlotPlanId]);

  // Obtener el objeto del plan seleccionado
  const currentPlotPlan = proyecto.plot_plans?.find(pp => pp.id === selectedPlotPlanId);

  // --- HANDLERS ---

  const handlePlotPlanUploaded = async (nuevoPlotPlan) => {
    console.log("📥 Plot Plan subido, actualizando vista...", nuevoPlotPlan);
    const planosActuales = proyecto.plot_plans || [];
    const proyectoActualizado = {
      ...proyecto,
      plot_plans: [...planosActuales, nuevoPlotPlan]
    };
    onProyectoUpdate(proyectoActualizado);
    setSelectedPlotPlanId(nuevoPlotPlan.id);
    await recargarProyecto();
  };

  const handleShapeSaved = async (cwaId, updatedCWA) => {
    console.log("✅ Forma guardada, recargando datos...");
    try {
      const response = await client.get(
        `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
      );
      const updatedPlotPlans = proyecto.plot_plans.map(pp =>
        pp.id === selectedPlotPlanId ? response.data : pp
      );
      onProyectoUpdate({ ...proyecto, plot_plans: updatedPlotPlans });
    } catch (err) { console.error("❌ Error actualizando tras guardar forma:", err); }
  };

  const handlePlotPlanChange = (newId) => {
    console.log(`🔄 Cambiando a plot plan ${newId}`);
    setSelectedCWA(null);
    setFilteredCWAId(null);
    setSelectedPlotPlanId(newId);
  };

  const handleShapeClick = (cwaId) => {
    console.log("🔍 Filtrar tabla por CWA:", cwaId);
    setFilteredCWAId(cwaId);
  };

  const handleClearFilter = () => {
    setFilteredCWAId(null);
  };

  const handleTableDataChange = async () => {
    await recargarProyecto();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      
      {/* --- Toolbar Superior Simplificado --- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-hatch-blue">Resumen General</h2>
        
        {/* Botón Recargar ahora es lo único aquí, los selectores bajaron */}
        <button
          onClick={recargarProyecto}
          className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          title="Recargar datos del servidor"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sincronizar Datos
        </button>
      </div>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* 1. Visualizador de Planos (CON SELECTORES AQUI) */}
        <div className="bg-white border-2 border-hatch-gray rounded-lg overflow-hidden shadow-sm">
          
          {/* Header del Card con los Controles */}
          <div className="p-4 border-b-2 border-hatch-gray bg-gray-50 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-hatch-blue uppercase mr-2">
                  📐 Plot Plan Interactivo
                </h3>
                
                {/* SELECTOR DE PLANO */}
                {proyecto.plot_plans && proyecto.plot_plans.length > 0 ? (
                    <select
                        value={selectedPlotPlanId || ''}
                        onChange={(e) => handlePlotPlanChange(Number(e.target.value))}
                        className="px-3 py-1.5 bg-white border-2 border-hatch-gray rounded-lg text-hatch-blue text-xs font-medium focus:border-hatch-orange outline-none"
                        disabled={isLoadingPlotPlan}
                    >
                        {proyecto.plot_plans.map(pp => (
                            <option key={pp.id} value={pp.id}>📍 {pp.nombre}</option>
                        ))}
                    </select>
                ) : (
                    <span className="text-xs text-red-400">Sin planos</span>
                )}

                {isLoadingPlotPlan && <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>}
            </div>

            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500">Asignar Área:</span>
                
                {/* SELECTOR DE CWA */}
                {currentPlotPlan && currentPlotPlan.cwas && currentPlotPlan.cwas.length > 0 ? (
                    <select
                        value={selectedCWA?.id || ''}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            const cwa = currentPlotPlan.cwas.find(c => c.id === id);
                            setSelectedCWA(cwa || null);
                        }}
                        className={`px-2 py-1 rounded text-xs border-2 outline-none transition-colors ${selectedCWA ? 'border-green-400 bg-green-50 text-green-800' : 'border-hatch-gray bg-gray-50 text-gray-600'}`}
                    >
                        <option value="">-- Seleccionar CWA --</option>
                        {currentPlotPlan.cwas.map(cwa => (
                            <option key={cwa.id} value={cwa.id}>
                                {cwa.codigo} - {cwa.nombre}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="text-xs text-gray-400 italic">No hay CWAs creados</span>
                )}
                
                {selectedCWA && <span className="text-green-500 text-xs font-bold">✓ Listo para dibujar</span>}
            </div>
          </div>
          
          <div className="p-4 bg-gray-900">
            {currentPlotPlan ? (
                <PlotPlan
                  key={`plotplan-${selectedPlotPlanId}`}
                  plotPlan={currentPlotPlan}
                  cwaToAssociate={selectedCWA}
                  onShapeSaved={handleShapeSaved}
                  onShapeClick={handleShapeClick}
                />
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <p>Selecciona o sube un plano para comenzar</p>
                </div>
            )}
          </div>
        </div>

        {/* Sección de Subida (Colapsable o discreta) */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
            <UploadPlotPlanForm
                proyecto={proyecto}
                onUploadSuccess={handlePlotPlanUploaded}
            />
        </div>

        {/* 2. Tabla AWP */}
        <div className="bg-white border-2 border-hatch-gray rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 border-b-2 border-hatch-gray bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-hatch-blue uppercase">
              📋 Tabla de Control
            </h3>
            {filteredCWAId && (
              <button
                onClick={handleClearFilter}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-xs flex items-center gap-2 hover:bg-yellow-200 transition-colors"
              >
                <span>🔍 Filtro: CWA Seleccionado</span>
                <span className="font-bold">✕</span>
              </button>
            )}
          </div>
          
          <div className="p-0">
            <AWPTableConsolidada
              key={`awptable-${selectedPlotPlanId}-${filteredCWAId}`}
              plotPlanId={selectedPlotPlanId}
              proyecto={proyecto}
              filteredCWAId={filteredCWAId}
              onDataChange={handleTableDataChange}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResumenTab;