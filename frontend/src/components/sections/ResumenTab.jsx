import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/axios';
import PlotPlan from '../modules/plotplan/PlotPlan';
import AWPTableConsolidada from '../modules/awp/AWPTableConsolidada';
import UploadPlotPlanForm from '../modules/upload/UploadPlotPlanForm';

// --- COMPONENTE SELECTOR MEJORADO ---
function CWASelector({ cwas, selectedCWA, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCWAs = cwas.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    c.codigo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-w-[240px]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 text-sm bg-white border rounded-lg flex items-center justify-between transition-all shadow-sm ${
          selectedCWA 
            ? 'border-green-500 text-green-700 bg-green-50 ring-1 ring-green-500' 
            : 'border-gray-300 text-gray-700 hover:border-hatch-orange hover:shadow-md'
        }`}
      >
        <span className="truncate mr-2 font-medium">
          {selectedCWA 
            ? `${selectedCWA.codigo} - ${selectedCWA.nombre}` 
            : "Seleccionar Área (CWA)"}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[50] overflow-hidden flex flex-col max-h-96 ring-1 ring-black ring-opacity-5">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <input
              type="text"
              placeholder="🔍 Filtrar por código o nombre..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hatch-orange focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
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
                    className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm flex items-start justify-between gap-3 mb-1 transition-colors ${
                      selectedCWA?.id === cwa.id 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={`font-mono font-bold text-xs ${selectedCWA?.id === cwa.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        {cwa.codigo}
                      </span>
                      <span className={`truncate font-medium ${selectedCWA?.id === cwa.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        {cwa.nombre}
                      </span>
                    </div>
                    <div className="self-center" title={hasGeo ? "Geometría dibujada" : "Sin dibujo"}>
                      {hasGeo 
                        ? <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold border border-green-200">GEO</span> 
                        : <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">--</span>
                      }
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
function ResumenTab({ proyecto, onProyectoUpdate, globalFilterCWA, setGlobalFilterCWA }) {
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);
  const [selectedCWA, setSelectedCWA] = useState(null);
  const [isLoadingPlotPlan, setIsLoadingPlotPlan] = useState(false);
  const [showUpload, setShowUpload] = useState(false); // Estado para colapsar el upload

  // Inicializar con el primer plano
  useEffect(() => {
    if (proyecto.plot_plans?.length > 0 && !selectedPlotPlanId) {
      setSelectedPlotPlanId(proyecto.plot_plans[0].id);
    }
  }, [proyecto.plot_plans]);

  // Recarga simple del proyecto
  const recargarProyecto = async () => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) {
      console.error("❌ Error recargando proyecto:", err);
    }
  };

  // Carga profunda del PlotPlan seleccionado (trae CWAs)
  useEffect(() => {
    if (!selectedPlotPlanId) return;
    
    let isMounted = true;
    const loadPlotPlanWithCWAs = async () => {
      try {
        setIsLoadingPlotPlan(true);
        const response = await client.get(`/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}`);
        
        if (!isMounted) return;
        
        const updatedPlotPlans = (proyecto.plot_plans || []).map(pp =>
          pp.id === selectedPlotPlanId ? response.data : pp
        );
        
        onProyectoUpdate({ ...proyecto, plot_plans: updatedPlotPlans });
        
        // Reset filtros al cambiar de plano
        setSelectedCWA(null);
        setGlobalFilterCWA(null);
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
    onProyectoUpdate({ ...proyecto, plot_plans: [...planosActuales, nuevoPlotPlan] });
    setSelectedPlotPlanId(nuevoPlotPlan.id);
    setShowUpload(false); // Ocultar formulario tras subir
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
    setGlobalFilterCWA(null);
    setSelectedPlotPlanId(newId);
  };

  const handleCWASelectFromDropdown = (cwa) => {
    setSelectedCWA(cwa);        
    setGlobalFilterCWA(cwa.id);
  };

  const handleShapeClick = (cwaId) => {
    setGlobalFilterCWA(cwaId);
    const cwa = currentPlotPlan?.cwas?.find(c => c.id === cwaId);
    if (cwa) setSelectedCWA(cwa);
  };

  const handleClearFilter = () => {
    setGlobalFilterCWA(null);
    setSelectedCWA(null);
  };

  const handleTableDataChange = async () => {
    await recargarProyecto();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Resumen y Control</h2>
            <p className="text-xs text-gray-500">Gestión visual y tabular del proyecto</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setShowUpload(!showUpload)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                {showUpload ? 'Cancelar Subida' : '+ Nuevo Plano'}
            </button>
            <button onClick={recargarProyecto} className="px-4 py-2 bg-hatch-blue text-white rounded-lg text-xs font-medium hover:bg-blue-900 transition-colors shadow-sm flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Sincronizar
            </button>
        </div>
      </div>

      {/* CONTENIDO SCROLLABLE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* SECCIÓN UPLOAD (Colapsable) */}
        {showUpload && (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 shadow-sm animate-fade-in-down">
                <UploadPlotPlanForm proyecto={proyecto} onUploadSuccess={handlePlotPlanUploaded} />
            </div>
        )}

        {/* --- TARJETA PLOT PLAN --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar del Plano */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Plano Base</label>
                    {proyecto.plot_plans?.length > 0 ? (
                        <div className="relative">
                            <select 
                                value={selectedPlotPlanId || ''} 
                                onChange={(e) => handlePlotPlanChange(Number(e.target.value))} 
                                className="pl-2 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium focus:ring-2 focus:ring-hatch-orange focus:border-transparent outline-none appearance-none cursor-pointer hover:bg-gray-100 min-w-[200px]"
                                disabled={isLoadingPlotPlan}
                            >
                                {proyecto.plot_plans.map(pp => <option key={pp.id} value={pp.id}>{pp.nombre}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
                        </div>
                    ) : <span className="text-sm text-red-400">Sin planos cargados</span>}
                </div>
                {isLoadingPlotPlan && <span className="text-xs text-hatch-orange font-medium animate-pulse mt-4">Cargando...</span>}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Filtro Interactivo</label>
                    {currentPlotPlan?.cwas?.length > 0 ? (
                        <CWASelector 
                            cwas={currentPlotPlan.cwas} 
                            selectedCWA={selectedCWA}
                            onSelect={handleCWASelectFromDropdown}
                        />
                    ) : <span className="text-xs text-gray-400 italic py-2">No hay áreas creadas</span>}
                </div>
            </div>
          </div>
          
          {/* Canvas Área */}
          <div className="bg-gray-900 min-h-[400px] relative">
            {currentPlotPlan ? (
                <PlotPlan
                  key={`plotplan-${selectedPlotPlanId}`}
                  plotPlan={currentPlotPlan}
                  cwaToAssociate={selectedCWA}
                  activeCWAId={globalFilterCWA}
                  onShapeSaved={handleShapeSaved}
                  onShapeClick={handleShapeClick}
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <p>Selecciona un plano para visualizar</p>
                </div>
            )}
          </div>
        </div>

        {/* --- TARJETA TABLA DE CONTROL --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden mb-10">
          
          {/* Header Tabla */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                📊 Detalle de Paquetes
            </h3>
            
            {globalFilterCWA && (
              <div className="flex items-center gap-2 animate-fadeIn">
                 <span className="text-xs text-gray-500">Filtrado por:</span>
                 <button 
                    onClick={handleClearFilter} 
                    className="pl-3 pr-2 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200 text-xs font-bold flex items-center gap-2 hover:bg-yellow-200 transition-colors shadow-sm"
                >
                    {selectedCWA?.codigo || `ID ${globalFilterCWA}`}
                    <div className="bg-yellow-300 rounded-full w-4 h-4 flex items-center justify-center text-[10px] text-yellow-800">✕</div>
                </button>
              </div>
            )}
          </div>

          {/* SOLUCIÓN AL SOLAPAMIENTO:
              Un contenedor relativo con overflow-x-auto asegura que la tabla
              scrollee horizontalmente SIN salirse de la tarjeta.
           */}
          <div className="relative w-full overflow-x-auto bg-white">
             {/* Un min-w asegura que la tabla no se comprima demasiado */}
             <div className="min-w-full inline-block align-middle p-1">
                <AWPTableConsolidada
                  key={`awptable-${selectedPlotPlanId}-${globalFilterCWA}`}
                  plotPlanId={selectedPlotPlanId}
                  proyecto={proyecto}
                  filteredCWAId={globalFilterCWA}
                  onDataChange={handleTableDataChange}
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ResumenTab;