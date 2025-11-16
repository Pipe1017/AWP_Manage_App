import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar.jsx'; 
import ProyectoDetalle from './components/ProyectoDetalle.jsx'; 
import AWPEstructura from './components/AWPEstructura.jsx';
import PlotPlan from './components/PlotPlan.jsx';
// Importa el nuevo componente
import UploadPlotPlanForm from './components/UploadPlotPlanForm.jsx'; 

const API_URL = 'http://localhost:8000/api/v1';

function App() {
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [currentView, setCurrentView] = useState('general');
  const [error, setError] = useState(null);
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(null);

  axios.defaults.baseURL = API_URL;

  const fetchProyectos = async () => { /* ... (código igual) ... */ };
  useEffect(() => { fetchProyectos(); }, []);

  const handleAddProyecto = async (nombreProyecto) => { /* ... (código igual) ... */ };
  const handleSelectProyecto = (proyecto) => { /* ... (código igual) ... */ };
  const handleDisciplinaCreada = (nuevaDisciplina) => { /* ... (código igual) ... */ };
  const handleTipoEntregableCreado = (disciplinaId, nuevoTipo) => { /* ... (código igual) ... */ };
  const handleCWACreada = (plotPlanId, nuevaCWA) => { /* ... (código igual) ... */ };
  const handleCWPCreado = (cwaId, nuevoCWP) => { /* ... (código igual) ... */ };
  const handlePlotPlanUploaded = (nuevoPlotPlan) => { /* ... (código igual) ... */ };
  
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

            {/* 2. Formulario de Subida de Plano (AHORA COMPONENTE EXTERNO) */}
            <UploadPlotPlanForm 
              proyecto={selectedProyecto}
              onUploadSuccess={handlePlotPlanUploaded}
            />

            {/* 3. El Lienzo y la Tabla AWP */}
            {currentPlotPlan ? (
              <div className="mt-6" key={currentPlotPlan.id}> 
                <PlotPlan plotPlan={currentPlotPlan} />
                
                <AWPEstructura
                  plotPlan={currentPlotPlan}
                  onCWACreada={handleCWACreada}
                  onCWPCreado={handleCWPCreado}
                />
              </div>
            ) : (
              <div className="mt-6 p-8 bg-gray-800 rounded-lg text-center text-gray-400">
                Este proyecto no tiene ningún Plot Plan. ¡Añade uno para comenzar!
              </div>
            )}
          </div>
        )}

        {/* --- VISTA CONFIGURACIÓN (Sin cambios) --- */}
        {currentView === 'configuracion' && (
          <ProyectoDetalle
            proyecto={selectedProyecto}
            onDisciplinaCreada={handleDisciplinaCreada}
            onTipoEntregableCreado={handleTipoEntregableCreado}
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