// frontend/src/components/sections/ResumenTab.jsx

import React, { useState, useEffect } from 'react';
// 1. Importamos el cliente centralizado
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

  // 🌟 LÓGICA CORREGIDA: Actualización Optimista al subir plano
  const handlePlotPlanUploaded = async (nuevoPlotPlan) => {
    console.log("📥 Plot Plan subido, actualizando vista...", nuevoPlotPlan);
    
    // 1. Forzamos la actualización local inmediata para que aparezca en la lista
    const planosActuales = proyecto.plot_plans || [];
    const proyectoActualizado = {
      ...proyecto,
      plot_plans: [...planosActuales, nuevoPlotPlan]
    };

    // 2. Actualizamos el estado global
    onProyectoUpdate(proyectoActualizado);
    
    // 3. Seleccionamos el nuevo plano automáticamente
    setSelectedPlotPlanId(nuevoPlotPlan.id);

    // 4. Recargamos del servidor en segundo plano para asegurar consistencia
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
      
      onProyectoUpdate({
        ...proyecto,
        plot_plans: updatedPlotPlans
      });
    } catch (err) {
      console.error("❌ Error actualizando tras guardar forma:", err);
    }
  };

  const handleCWACreada = async () => {
    console.log("✅ CWA creada, actualizando...");
    // Reutilizamos la lógica de recarga para traer la nueva CWA
    try {
      const response = await client.get(
        `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
      );
      const updatedPlotPlans = proyecto.plot_plans.map(pp =>
        pp.id === selectedPlotPlanId ? response.data : pp
      );
      onProyectoUpdate({ ...proyecto, plot_plans: updatedPlotPlans });
    } catch (err) { console.error(err); }
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
      {/* --- Toolbar Superior --- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-white border-r-2 border-hatch-gray/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-hatch-blue">Resumen General</h2>
          {currentPlotPlan && (
            <span className="px-3 py-1 bg-gradient-orange/20 border border-blue-500/50 rounded-full text-sm text-hatch-orange font-medium">
              📍 {currentPlotPlan.nombre}
            </span>
          )}
          {isLoadingPlotPlan && (
            <span className="text-xs text-yellow-400 animate-pulse">⏳ Cargando...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de CWA (si hay plan seleccionado) */}
          {currentPlotPlan && currentPlotPlan.cwas && currentPlotPlan.cwas.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-hatch-gray/50 rounded-lg border border-gray-600">
              <span className="text-xs text-hatch-blue font-medium">Asignar CWA:</span>
              <select
                value={selectedCWA?.id || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const cwa = currentPlotPlan.cwas.find(c => c.id === id);
                  setSelectedCWA(cwa || null);
                }}
                className="px-2 py-1 bg-hatch-gray border border-gray-600 rounded text-xs text-hatch-blue"
              >
                <option value="">-- Seleccionar --</option>
                {currentPlotPlan.cwas.map(cwa => (
                  <option key={cwa.id} value={cwa.id}>
                    {cwa.codigo} - {cwa.nombre}
                  </option>
                ))}
              </select>
              {selectedCWA && <span className="text-xs text-green-400">✓</span>}
            </div>
          )}

          {/* Botón Recargar */}
          <button
            onClick={recargarProyecto}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-hatch-blue rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
            title="Recargar datos"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Recargar
          </button>

          {/* Selector de Plot Plan */}
          {proyecto.plot_plans && proyecto.plot_plans.length > 1 && (
            <select
              value={selectedPlotPlanId || ''}
              onChange={(e) => handlePlotPlanChange(Number(e.target.value))}
              className="px-3 py-2 bg-hatch-gray border border-gray-600 rounded-lg text-hatch-blue text-xs"
              disabled={isLoadingPlotPlan}
            >
              {proyecto.plot_plans.map(pp => (
                <option key={pp.id} value={pp.id}>{pp.nombre}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* --- Contenido Principal --- */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Sección de Subida */}
        <div className="p-6 border-b border-gray-700 bg-white border-r-2 border-hatch-gray/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-hatch-blue uppercase">📤 Subir Nuevo Plano</h3>
          </div>
          <UploadPlotPlanForm
            proyecto={proyecto}
            onUploadSuccess={handlePlotPlanUploaded}
          />
        </div>

        {/* Visualizador y Tabla */}
        {currentPlotPlan ? (
          <div className="p-6 space-y-6">
            {/* Canvas del Plano */}
            <div className="bg-white border-r-2 border-hatch-gray/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-white border-r-2 border-hatch-gray/50">
                <h3 className="text-sm font-semibold text-hatch-blue uppercase">
                  📐 Plot Plan Interactivo
                </h3>
                {selectedCWA ? (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ CWA seleccionado: {selectedCWA.codigo} - {selectedCWA.nombre}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Selecciona un CWA arriba para asignar áreas dibujadas
                  </p>
                )}
              </div>
              
              <div className="p-4">
                <PlotPlan
                  key={`plotplan-${selectedPlotPlanId}`} // Forzar re-render al cambiar de plano
                  plotPlan={currentPlotPlan}
                  cwaToAssociate={selectedCWA}
                  onShapeSaved={handleShapeSaved}
                  onShapeClick={handleShapeClick}
                />
              </div>
            </div>

            {/* Tabla AWP */}
            <div className="bg-white border-r-2 border-hatch-gray/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-white border-r-2 border-hatch-gray/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-hatch-blue uppercase">
                  📋 Estructura AWP Consolidada
                </h3>
                {filteredCWAId && (
                  <button
                    onClick={handleClearFilter}
                    className="px-3 py-1 bg-gradient-orange/20 border border-blue-500/50 text-hatch-orange rounded text-xs hover:bg-gradient-orange/30 flex items-center gap-2"
                  >
                    <span>🔍 Filtro activo</span>
                    <span>✕</span>
                  </button>
                )}
              </div>
              
              <div className="p-4">
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
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-hatch-blue">
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