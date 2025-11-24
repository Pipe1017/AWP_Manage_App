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
  const [showUploadForm, setShowUploadForm] = useState(false); // ✅ NUEVO: Control de visibilidad

  // ✅ DEBUG
  console.log("🔍 ResumenTab - Proyecto recibido:", {
    id: proyecto?.id,
    nombre: proyecto?.nombre,
    plot_plans_count: proyecto?.plot_plans?.length
  });

  // Inicializar con el primer plot plan si existe
  useEffect(() => {
    if (proyecto.plot_plans && proyecto.plot_plans.length > 0 && !selectedPlotPlanId) {
      setSelectedPlotPlanId(proyecto.plot_plans[0].id);
      setShowUploadForm(false); // ✅ Ocultar formulario si hay plot plans
    }
  }, [proyecto.plot_plans, selectedPlotPlanId]);

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

  // ✅ CORREGIDO: Handler cuando se sube un nuevo Plot Plan
  const handlePlotPlanUploaded = async (nuevoPlotPlan) => {
    console.log("📥 Plot Plan subido:", nuevoPlotPlan);
    
    try {
      // Recargar proyecto completo desde el servidor
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
      
      // Seleccionar automáticamente el nuevo plot plan
      if (nuevoPlotPlan && nuevoPlotPlan.id) {
        setSelectedPlotPlanId(nuevoPlotPlan.id);
        console.log("✅ Plot Plan seleccionado:", nuevoPlotPlan.nombre);
      }
      
      // ✅ Ocultar formulario después de subir
      setShowUploadForm(false);
      
      console.log("✅ Proyecto recargado exitosamente");
    } catch (err) {
      console.error("❌ Error recargando proyecto:", err);
      alert("Error recargando el proyecto");
    }
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
    try {
      const response = await client.get(
        `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
      );
      const updatedPlotPlans = proyecto.plot_plans.map(pp =>
        pp.id === selectedPlotPlanId ? response.data : pp
      );
      onProyectoUpdate({ ...proyecto, plot_plans: updatedPlotPlans });
    } catch (err) { 
      console.error(err); 
    }
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
                className="px-2 py-1 bg-white border border-hatch-gray rounded text-xs text-hatch-blue"
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

          {/* ✅ NUEVO: Botón para agregar nuevo Plot Plan */}
          {proyecto.plot_plans && proyecto.plot_plans.length > 0 && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
              title="Agregar nuevo Plot Plan"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showUploadForm ? 'Ocultar' : 'Nuevo Plano'}
            </button>
          )}

          {/* Botón Recargar */}
          <button
            onClick={recargarProyecto}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
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
              className="px-3 py-2 bg-white border border-hatch-gray rounded-lg text-hatch-blue text-xs"
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
        
        {/* ✅ Sección de Subida - CONDICIONAL */}
        {(showUploadForm || !proyecto.plot_plans || proyecto.plot_plans.length === 0) && (
          <div className="p-6 border-b border-gray-700 bg-white border-r-2 border-hatch-gray/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-hatch-blue uppercase">
                📤 {proyecto.plot_plans && proyecto.plot_plans.length > 0 ? 'Subir Nuevo Plano' : 'Subir Primer Plano'}
              </h3>
              {showUploadForm && proyecto.plot_plans && proyecto.plot_plans.length > 0 && (
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  ✕ Cancelar
                </button>
              )}
            </div>
            <UploadPlotPlanForm
              proyecto={proyecto}
              onUploadSuccess={handlePlotPlanUploaded}
            />
          </div>
        )}

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
                  key={`plotplan-${selectedPlotPlanId}`}
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