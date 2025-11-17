import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotPlan from '../modules/plotplan/PlotPlan';
import AWPTableConsolidada from '../modules/awp/AWPTableConsolidada';
import ConfigPanel from '../forms/ConfigPanel';
import UploadPlotPlanForm from '../modules/upload/UploadPlotPlanForm';

const API_URL = 'http://192.168.1.4:8000/api/v1';

function ResumenTab({ proyecto, onProyectoUpdate }) {
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);
  const [selectedCWA, setSelectedCWA] = useState(null);
  const [filteredCWAId, setFilteredCWAId] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [isLoadingPlotPlan, setIsLoadingPlotPlan] = useState(false);

  // Inicializar con el primer plot plan
  useEffect(() => {
    if (proyecto.plot_plans && proyecto.plot_plans.length > 0 && !selectedPlotPlanId) {
      setSelectedPlotPlanId(proyecto.plot_plans[0].id);
    }
  }, [proyecto.plot_plans]);

  // Función para recargar proyecto completo
  const recargarProyecto = async () => {
    try {
      console.log("🔄 Recargando proyecto completo...");
      const response = await axios.get(`${API_URL}/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
      console.log("✅ Proyecto recargado");
    } catch (err) {
      console.error("❌ Error recargando proyecto:", err);
    }
  };

  // Cargar plot plan específico cuando se selecciona
  useEffect(() => {
    if (!selectedPlotPlanId || isLoadingPlotPlan) return;
    
    let isMounted = true;
    
    const loadPlotPlanWithCWAs = async () => {
      try {
        setIsLoadingPlotPlan(true);
        console.log(`🔄 Cargando plot plan ${selectedPlotPlanId}...`);
        
        const response = await axios.get(
          `${API_URL}/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
        );
        
        if (!isMounted) return;
        
        console.log("✅ Plot plan cargado:", response.data);
        
        const updatedPlotPlans = proyecto.plot_plans.map(pp =>
          pp.id === selectedPlotPlanId ? response.data : pp
        );
        
        onProyectoUpdate({
          ...proyecto,
          plot_plans: updatedPlotPlans
        });
        
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

  const currentPlotPlan = proyecto.plot_plans?.find(pp => pp.id === selectedPlotPlanId);

  const handleShapeSaved = async (cwaId, updatedCWA) => {
    console.log("✅ Forma guardada, recargando plot plan...");
    
    try {
      const response = await axios.get(
        `${API_URL}/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
      );
      
      const updatedPlotPlans = proyecto.plot_plans.map(pp =>
        pp.id === selectedPlotPlanId ? response.data : pp
      );
      
      onProyectoUpdate({
        ...proyecto,
        plot_plans: updatedPlotPlans
      });
      
      console.log("✅ Plot plan recargado con geometrías");
      
    } catch (err) {
      console.error("❌ Error recargando plot plan:", err);
    }
  };

  const handleShapeClick = (cwaId) => {
    console.log("🔍 Filtrar tabla por CWA:", cwaId);
    setFilteredCWAId(cwaId);
  };

  const handleClearFilter = () => {
    setFilteredCWAId(null);
  };

  const handlePlotPlanUploaded = async (nuevoPlotPlan) => {
    await recargarProyecto();
    setTimeout(() => {
      setSelectedPlotPlanId(nuevoPlotPlan.id);
    }, 100);
  };

  const handleDisciplinaCreada = async (nuevaDisciplina) => {
    await recargarProyecto();
  };

  const handleCWACreada = async () => {
    console.log("✅ CWA creado, recargando plot plan...");
    
    try {
      const response = await axios.get(
        `${API_URL}/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
      );
      
      const updatedPlotPlans = proyecto.plot_plans.map(pp =>
        pp.id === selectedPlotPlanId ? response.data : pp
      );
      
      onProyectoUpdate({
        ...proyecto,
        plot_plans: updatedPlotPlans
      });
      
      console.log("✅ Plot plan recargado después de crear CWA");
      
    } catch (err) {
      console.error("❌ Error recargando plot plan:", err);
    }
  };

  const handlePlotPlanChange = (newId) => {
    console.log(`🔄 Cambiando a plot plan ${newId}`);
    setSelectedCWA(null);
    setFilteredCWAId(null);
    setSelectedPlotPlanId(newId);
  };

  const handleTableDataChange = async () => {
    console.log("🔄 Datos de tabla cambiados, recargando...");
    await recargarProyecto();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar Superior */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Resumen General</h2>
          {currentPlotPlan && (
            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full text-sm text-blue-300 font-medium">
              📍 {currentPlotPlan.nombre}
            </span>
          )}
          {isLoadingPlotPlan && (
            <span className="text-xs text-yellow-400 animate-pulse">⏳ Cargando...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de CWA para asignar a áreas */}
          {currentPlotPlan && currentPlotPlan.cwas && currentPlotPlan.cwas.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600">
              <span className="text-xs text-gray-400 font-medium">Asignar CWA:</span>
              <select
                value={selectedCWA?.id || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const cwa = currentPlotPlan.cwas.find(c => c.id === id);
                  setSelectedCWA(cwa || null);
                }}
                className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
              >
                <option value="">-- Seleccionar --</option>
                {currentPlotPlan.cwas.map(cwa => (
                  <option key={cwa.id} value={cwa.id}>
                    {cwa.codigo} - {cwa.nombre}
                  </option>
                ))}
              </select>
              {selectedCWA && (
                <span className="text-xs text-green-400">✓</span>
              )}
            </div>
          )}

          {/* Botón de refresh */}
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
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs"
              disabled={isLoadingPlotPlan}
            >
              {proyecto.plot_plans.map(pp => (
                <option key={pp.id} value={pp.id}>{pp.nombre}</option>
              ))}
            </select>
          )}

          {/* Botón Configuración */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Config
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Panel de Configuración (colapsable) */}
        {showConfig && (
          <div className="p-6 border-b border-gray-700 bg-gray-800/30">
            <ConfigPanel
              proyecto={proyecto}
              onDisciplinaCreada={handleDisciplinaCreada}
              selectedPlotPlanId={selectedPlotPlanId}
            />
          </div>
        )}

        {/* Upload Plot Plan */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">📤 Subir Nuevo Plano</h3>
          </div>
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
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  📐 Plot Plan Interactivo
                </h3>
                {selectedCWA && (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ CWA seleccionado: {selectedCWA.codigo} - {selectedCWA.nombre}
                  </p>
                )}
                {!selectedCWA && (
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

            {/* Tabla Consolidada AWP */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  📋 Estructura AWP Consolidada
                </h3>
                
                {/* Indicador de filtro activo */}
                {filteredCWAId && (
                  <button
                    onClick={handleClearFilter}
                    className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded text-xs hover:bg-blue-600/30 flex items-center gap-2"
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