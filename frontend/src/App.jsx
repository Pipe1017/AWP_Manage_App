import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar.jsx'; 
import ProyectoDetalle from './components/ProyectoDetalle.jsx'; 
import AWPEstructura from './components/AWPEstructura.jsx';
import PlotPlan from './components/PlotPlan.jsx';
import UploadPlotPlanForm from './components/UploadPlotPlanForm.jsx'; 

const API_URL = 'http://localhost:8000/api/v1';

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [currentView, setCurrentView] = useState('general');
  const [error, setError] = useState(null);
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);
  const [selectedCWA, setSelectedCWA] = useState(null); // ✨ NUEVO: CWA seleccionado

  axios.defaults.baseURL = API_URL;

  const fetchProyectos = async () => {
    console.log("🔄 [App] Cargando todos los proyectos...");
    try {
      const response = await axios.get('/proyectos/');
      setProyectos(response.data);
      console.log("✅ [App] Proyectos cargados:", response.data);
      setError(null);
    } catch (err) {
      console.error("🔥 [App] ERROR cargando proyectos:", err);
      setError("No se pudieron cargar los proyectos. Revisa la consola del backend.");
    }
  };
  
  useEffect(() => { fetchProyectos(); }, []);

  // --- Handlers (Lógica de Estado) ---
  const handleAddProyecto = async (nombreProyecto) => {
    try {
      console.log("🕵️‍♂️ [App] Creando proyecto:", { nombre: nombreProyecto });
      const response = await axios.post('/proyectos/', { nombre: nombreProyecto });
      console.log("👍 [App] Proyecto creado. ID:", response.data.id);
      const nuevoProyecto = {...response.data, disciplinas: [], plot_plans: []};
      setProyectos([...proyectos, nuevoProyecto]);
      setSelectedProyecto(nuevoProyecto);
      setCurrentView('general');
      setSelectedPlotPlanId(null);
    } catch (err) {
      console.error("🔥 [App] ERROR creando proyecto:", err);
      alert("Error creando proyecto: " + (err.response?.data?.detail || err.message));
    }
  };
  
  const handleSelectProyecto = (proyecto) => {
    console.log(`[App] Seleccionando proyecto ID: ${proyecto.id}`);
    axios.get(`/proyectos/${proyecto.id}`)
      .then(response => {
        const nuevoProyecto = response.data;
        setSelectedProyecto(nuevoProyecto);
        if (nuevoProyecto.plot_plans && nuevoProyecto.plot_plans.length > 0) {
          setSelectedPlotPlanId(nuevoProyecto.plot_plans[0].id);
        } else {
          setSelectedPlotPlanId(null);
        }
        console.log("✅ [App] Proyecto seleccionado:", nuevoProyecto);
      })
      .catch(err => console.error("🔥 [App] ERROR cargando proyecto:", err));
  };

  const handleDisciplinaCreada = (nuevaDisciplina) => {
    console.log("✅ [App] handleDisciplinaCreada FUE LLAMADA con:", nuevaDisciplina);
    const proyectoActualizado = { ...selectedProyecto, disciplinas: [...selectedProyecto.disciplinas, nuevaDisciplina] };
    setSelectedProyecto(proyectoActualizado);
    const listaProyectosActualizada = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    setProyectos(listaProyectosActualizada);
  };

  const handleTipoEntregableCreado = (disciplinaId, nuevoTipo) => {
    console.log("✅ [App] handleTipoEntregableCreado FUE LLAMADA con:", nuevoTipo);
    const disciplinasActualizadas = selectedProyecto.disciplinas.map(d => {
      if (d.id === disciplinaId) { return { ...d, tipos_entregables: [...d.tipos_entregables, nuevoTipo] }; }
      return d;
    });
    const proyectoActualizado = { ...selectedProyecto, disciplinas: disciplinasActualizadas };
    setSelectedProyecto(proyectoActualizado);
    const listaProyectosActualizada = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    setProyectos(listaProyectosActualizada);
  };

  const handleCWACreada = (plotPlanId, nuevaCWA) => {
    console.log("✅ [App] handleCWACreada FUE LLAMADA con:", nuevaCWA);
    const cwaConHijos = { ...nuevaCWA, cwps: [] };
    const plotPlansActualizados = selectedProyecto.plot_plans.map(pp => {
      if (pp.id === plotPlanId) { return { ...pp, cwas: [...pp.cwas, cwaConHijos] }; }
      return pp;
    });
    const proyectoActualizado = { ...selectedProyecto, plot_plans: plotPlansActualizados };
    setSelectedProyecto(proyectoActualizado);
    const listaProyectosActualizada = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    setProyectos(listaProyectosActualizada);
  };

  const handleCWPCreado = (cwaId, nuevoCWP) => {
    console.log("✅ [App] handleCWPCreado FUE LLAMADA con:", nuevoCWP);
    const plotPlansActualizados = selectedProyecto.plot_plans.map(pp => {
      const cwasActualizados = pp.cwas.map(cwa => {
        if (cwa.id === cwaId) { return { ...cwa, cwps: [...cwa.cwps, nuevoCWP] }; }
        return cwa;
      });
      return { ...pp, cwas: cwasActualizados };
    });
    const proyectoActualizado = { ...selectedProyecto, plot_plans: plotPlansActualizados };
    setSelectedProyecto(proyectoActualizado);
    const listaProyectosActualizada = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    setProyectos(listaProyectosActualizada);
  };

  // ✨ NUEVO: Handler para cuando se guarda una forma en el PlotPlan
  const handleShapeSaved = (cwaId, nuevoCWP) => {
    console.log("✅ [App] handleShapeSaved - Forma guardada como CWP:", nuevoCWP);
    handleCWPCreado(cwaId, nuevoCWP);
    setSelectedCWA(null); // ✨ Deseleccionar CWA después de guardar
  };

  const handlePlotPlanUploaded = (nuevoPlotPlan) => {
    console.log("✅ [App] handlePlotPlanUploaded FUE LLAMADA con:", nuevoPlotPlan);
    const plotPlanConHijos = { ...nuevoPlotPlan, cwas: [] };
    const proyectoActualizado = {
      ...selectedProyecto,
      plot_plans: [...selectedProyecto.plot_plans, plotPlanConHijos]
    };
    setSelectedProyecto(proyectoActualizado);
    const listaProyectosActualizada = proyectos.map(p => p.id === proyectoActualizado.id ? proyectoActualizado : p);
    setProyectos(listaProyectosActualizada);
    setSelectedPlotPlanId(nuevoPlotPlan.id); 
  };

  // ✨ NUEVO: Handler para seleccionar CWA
  const handleSelectCWA = (cwa) => {
    console.log("✅ [App] CWA seleccionado:", cwa);
    setSelectedCWA(cwa);
  };
  
  // --- Renderizado del Contenido Principal ---
  const renderMainContent = () => {
    if (!selectedProyecto) {
      return <div className="p-10 text-gray-400">Por favor, selecciona o crea un proyecto para comenzar.</div>;
    }

    const currentPlotPlan = selectedProyecto.plot_plans.find(pp => pp.id === selectedPlotPlanId);

    return (
      <div className="p-8">
        {/* Pestañas de Navegación (General / Configuración) */}
        <div className="mb-6 border-b border-gray-700">
          <button onClick={() => setCurrentView('general')} className={`py-2 px-4 text-lg font-medium ${currentView === 'general' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            General (Plot Plan & AWP)
          </button>
          <button onClick={() => setCurrentView('configuracion')} className={`py-2 px-4 ml-4 text-lg font-medium ${currentView === 'configuracion' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-200'}`}>
            Configuración
          </button>
        </div>

        {/* --- VISTA GENERAL --- */}
        {currentView === 'general' && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Vista General: {selectedProyecto.nombre}</h2>
            
            {/* 1. Sub-Pestañas de Plot Plan */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {selectedProyecto.plot_plans.map(pp => (
                <button
                  key={pp.id}
                  onClick={() => setSelectedPlotPlanId(pp.id)}
                  className={`py-2 px-4 rounded-md font-medium ${selectedPlotPlanId === pp.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {pp.nombre}
                </button>
              ))}
            </div>

            {/* 2. Formulario de Subida de Plano */}
            <UploadPlotPlanForm 
              proyecto={selectedProyecto}
              onUploadSuccess={handlePlotPlanUploaded}
            />

            {/* 3. El Lienzo y la Tabla AWP */}
            {currentPlotPlan ? (
              <div className="mt-6" key={currentPlotPlan.id}> 
                <PlotPlan 
                  plotPlan={currentPlotPlan} 
                  cwaToAssociate={selectedCWA}
                  onShapeSaved={handleShapeSaved}
                />
                
                <AWPEstructura
                  plotPlan={currentPlotPlan}
                  onCWACreada={handleCWACreada}
                  onCWPCreado={handleCWPCreado}
                  selectedCWA={selectedCWA}
                  onSelectCWA={handleSelectCWA}
                />
              </div>
            ) : (
              <div className="mt-6 p-8 bg-gray-800 rounded-lg text-center text-gray-400">
                Este proyecto no tiene ningún Plot Plan. ¡Añade uno para comenzar!
              </div>
            )}
          </div>
        )}

        {/* --- VISTA CONFIGURACIÓN --- */}
        {currentView === 'configuracion' && (
          <ProyectoDetalle
            proyecto={selectedProyecto}
            onDisciplinaCreada={handleDisciplinaCreada}
            onTipoEntregableCreado={handleTipoEntregableCreado}
            onCWACreada={handleCWACreada}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex">
      <Sidebar
        proyectos={proyectos}
        selectedProyecto={selectedProyecto}
        onSelectProyecto={handleSelectProyecto}
        onAddProyecto={handleAddProyecto}
      />
      <main className="flex-1 h-screen overflow-y-auto">
        {error && <p className="p-4 text-red-400">{error}</p>}
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;