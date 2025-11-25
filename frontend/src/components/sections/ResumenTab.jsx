// frontend/src/components/sections/ResumenTab.jsx

import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/axios';

import PlotPlan from '../modules/plotplan/PlotPlan';
import AWPTableConsolidada from '../modules/awp/AWPTableConsolidada';
import UploadPlotPlanForm from '../modules/upload/UploadPlotPlanForm';

// --- COMPONENTE: SELECTOR DE CWA CON BUSCADOR ---
function CWASelector({ cwas, selectedCWA, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar lista
  const filteredCWAs = cwas.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-64" ref={containerRef}>
      {/* Botón Principal (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 text-xs font-medium text-left bg-white border-2 rounded-lg flex items-center justify-between transition-all min-h-[32px] ${
          selectedCWA 
            ? 'border-green-400 text-green-800 bg-green-50' 
            : 'border-hatch-gray text-gray-600 hover:border-hatch-orange'
        }`}
      >
        {/* ✅ CAMBIO: wrap y break-words para ver todo el texto */}
        <span className="whitespace-normal break-words leading-tight flex-1 mr-2">
          {selectedCWA 
            ? `${selectedCWA.codigo} - ${selectedCWA.nombre}` 
            : "-- Seleccionar Área --"}
        </span>
        <span className="text-gray-400 flex-shrink-0">▼</span>
      </button>

      {/* Dropdown Flotante */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border-2 border-hatch-gray rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-96">
          
          {/* Buscador Interno */}
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <input
              type="text"
              placeholder="🔍 Buscar área..."
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-hatch-orange"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Lista de Opciones */}
          <div className="overflow-y-auto flex-1">
            {filteredCWAs.length > 0 ? (
              filteredCWAs.map(cwa => {
                const hasGeo = cwa.shape_type || (cwa.shape_data && Object.keys(cwa.shape_data).length > 0);
                return (
                  <div
                    key={cwa.id}
                    onClick={() => {
                      onSelect(cwa);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer border-b border-gray-50 hover:bg-blue-50 flex items-start justify-between gap-2 ${
                      selectedCWA?.id === cwa.id ? 'bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col flex-1">
                      <span className={`font-mono font-bold text-[10px] ${selectedCWA?.id === cwa.id ? 'text-hatch-blue' : 'text-gray-500'}`}>
                        {cwa.codigo}
                      </span>
                      {/* ✅ CAMBIO: Texto completo (wrap) */}
                      <span className={`whitespace-normal break-words leading-tight ${selectedCWA?.id === cwa.id ? 'font-bold text-hatch-blue' : ''}`}>
                        {cwa.nombre}
                      </span>
                    </div>
                    
                    {/* Indicador de Estado */}
                    <div className="flex items-center self-center flex-shrink-0" title={hasGeo ? "Geometría dibujada" : "Sin dibujo"}>
                      {hasGeo ? (
                        <span className="text-green-500 text-xs">✅</span>
                      ) : (
                        <span className="text-red-300 text-xs opacity-50">❌</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-400 text-xs italic">
                No se encontraron áreas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
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

  // Función para recargar todo el proyecto
  const recargarProyecto = async () => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) {
      console.error("❌ Error recargando proyecto:", err);
    }
  };

  // Cargar detalles del plot plan
  useEffect(() => {
    if (!selectedPlotPlanId) return;
    
    let isMounted = true;
    const loadPlotPlanWithCWAs = async () => {
      try {
        setIsLoadingPlotPlan(true);
        const response = await client.get(
          `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`
        );
        
        if (!isMounted) return;
        
        const updatedPlotPlans = (proyecto.plot_plans || []).map(pp =>
          pp.id === selectedPlotPlanId ? response.data : pp
        );
        
        onProyectoUpdate({
          ...proyecto,
          plot_plans: updatedPlotPlans
        });
        
        setSelectedCWA(null);
        setFilteredCWAId(null); // Reset filtro al cambiar plano
        setIsLoadingPlotPlan(false);
        
      } catch (err) {
        if (isMounted) setIsLoadingPlotPlan(false);
      }
    };
    loadPlotPlanWithCWAs();
    return () => { isMounted = false; };
  }, [selectedPlotPlanId]);

  const currentPlotPlan = proyecto.plot_plans?.find(pp => pp.id === selectedPlotPlanId);

  // --- HANDLERS ---

  const handlePlotPlanUploaded = async (nuevoPlotPlan) => {
    const planosActuales = proyecto.plot_plans || [];
    const proyectoActualizado = { ...proyecto, plot_plans: [...planosActuales, nuevoPlotPlan] };
    onProyectoUpdate(proyectoActualizado);
    setSelectedPlotPlanId(nuevoPlotPlan.id);
    await recargarProyecto();
  };

  const handleShapeSaved = async (cwaId, updatedCWA) => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`);
      const updatedPlotPlans = proyecto.plot_plans.map(pp => pp.id === selectedPlotPlanId ? response.data : pp);
      onProyectoUpdate({ ...proyecto, plot_plans: updatedPlotPlans });
    } catch (err) { console.error(err); }
  };

  const handlePlotPlanChange = (newId) => {
    setSelectedCWA(null);
    setFilteredCWAId(null);
    setSelectedPlotPlanId(newId);
  };

  // ✅ LÓGICA UNIFICADA: Desde Dropdown -> PlotPlan -> Tabla
  const handleCWASelectFromDropdown = (cwa) => {
    setSelectedCWA(cwa);        // 1. Pone el CWA listo para dibujar (si no tiene geo)
    setFilteredCWAId(cwa.id);   // 2. Filtra la tabla de abajo
    // 3. (Implícito) Al pasar filteredCWAId al PlotPlan, este lo iluminará
  };

  // ✅ LÓGICA INVERSA: Desde Clic en Mapa -> Dropdown y Tabla
  const handleShapeClick = (cwaId) => {
    setFilteredCWAId(cwaId);
    const cwa = currentPlotPlan?.cwas?.find(c => c.id === cwaId);
    if (cwa) setSelectedCWA(cwa);
  };

  const handleClearFilter = () => {
    setFilteredCWAId(null);
    setSelectedCWA(null);
  };

  const handleTableDataChange = async () => {
    await recargarProyecto();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-hatch-blue">Resumen General</h2>
        <button onClick={recargarProyecto} className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Sincronizar Datos
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Visualizador */}
        <div className="bg-white border-2 border-hatch-gray rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b-2 border-hatch-gray bg-gray-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-hatch-blue uppercase mr-2">📐 Plot Plan Interactivo</h3>
                {proyecto.plot_plans && proyecto.plot_plans.length > 0 ? (
                    <select value={selectedPlotPlanId || ''} onChange={(e) => handlePlotPlanChange(Number(e.target.value))} className="px-3 py-1.5 bg-white border-2 border-hatch-gray rounded-lg text-hatch-blue text-xs font-medium focus:border-hatch-orange outline-none" disabled={isLoadingPlotPlan}>
                        {proyecto.plot_plans.map(pp => <option key={pp.id} value={pp.id}>📍 {pp.nombre}</option>)}
                    </select>
                ) : <span className="text-xs text-red-400">Sin planos</span>}
                {isLoadingPlotPlan && <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>}
            </div>

            <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500">Asignar Área:</span>
                {currentPlotPlan && currentPlotPlan.cwas && currentPlotPlan.cwas.length > 0 ? (
                    <CWASelector 
                      cwas={currentPlotPlan.cwas} 
                      selectedCWA={selectedCWA}
                      onSelect={handleCWASelectFromDropdown} // Usamos el nuevo handler unificado
                    />
                ) : <span className="text-xs text-gray-400 italic px-2">No hay CWAs creados</span>}
                {selectedCWA && <span className="text-green-500 text-xs font-bold">✓ Listo</span>}
            </div>
          </div>
          
          <div className="p-4 bg-gray-900">
            {currentPlotPlan ? (
                <PlotPlan
                  key={`plotplan-${selectedPlotPlanId}`}
                  plotPlan={currentPlotPlan}
                  cwaToAssociate={selectedCWA}
                  activeCWAId={filteredCWAId} // ✅ NUEVO PROP: Para iluminar desde el listado
                  onShapeSaved={handleShapeSaved}
                  onShapeClick={handleShapeClick}
                />
            ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400"><p>Selecciona o sube un plano para comenzar</p></div>
            )}
          </div>
        </div>

        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
            <UploadPlotPlanForm proyecto={proyecto} onUploadSuccess={handlePlotPlanUploaded} />
        </div>

        {/* Tabla */}
        <div className="bg-white border-2 border-hatch-gray rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 border-b-2 border-hatch-gray bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-hatch-blue uppercase">📋 Tabla de Control</h3>
            {filteredCWAId && (
              <button onClick={handleClearFilter} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-xs flex items-center gap-2 hover:bg-yellow-200 transition-colors">
                <span>🔍 Filtro: {selectedCWA?.codigo}</span><span className="font-bold">✕</span>
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