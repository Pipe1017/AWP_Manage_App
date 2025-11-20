import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProyectosLanding from './pages/ProyectosLanding';
import ProyectoDashboard from './pages/ProyectoDashboard';

const API_URL = 'http://10.92.12.84:8000/api/v1';

function App() {
  const [view, setView] = useState('landing');
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  axios.defaults.baseURL = API_URL;

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const response = await axios.get('/proyectos/');
      
      // Cargar datos completos de cada proyecto
      const proyectosCompletos = await Promise.all(
        response.data.map(async (proyecto) => {
          try {
            const detalle = await axios.get(`/proyectos/${proyecto.id}`);
            return detalle.data;
          } catch (err) {
            console.error(`Error cargando proyecto ${proyecto.id}:`, err);
            return proyecto;
          }
        })
      );
      
      setProyectos(proyectosCompletos);
      setError(null);
    } catch (err) {
      console.error("❌ Error cargando proyectos:", err);
      setError("No se pudieron cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProyecto = async (nombreProyecto) => {
    try {
      const response = await axios.post('/proyectos/', {
        nombre: nombreProyecto,
        descripcion: ""
      });
      
      // Cargar proyecto completo con relaciones
      const proyectoCompleto = await axios.get(`/proyectos/${response.data.id}`);
      setProyectos([...proyectos, proyectoCompleto.data]);
      handleSelectProyecto(proyectoCompleto.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectProyecto = async (proyecto) => {
    try {
      const response = await axios.get(`/proyectos/${proyecto.id}`);
      setSelectedProyecto(response.data);
      setView('dashboard');
    } catch (err) {
      alert("Error cargando proyecto");
    }
  };

  const handleBackToProyectos = () => {
    setView('landing');
    setSelectedProyecto(null);
    fetchProyectos(); // Refrescar lista al volver
  };

  const handleProyectoUpdate = (updatedProyecto) => {
    setSelectedProyecto(updatedProyecto);
    setProyectos(proyectos.map(p => p.id === updatedProyecto.id ? updatedProyecto : p));
  };

  if (loading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-400">Cargando AWP Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'landing' && (
        <ProyectosLanding
          proyectos={proyectos}
          onSelectProyecto={handleSelectProyecto}
          onAddProyecto={handleAddProyecto}
          error={error}
        />
      )}

      {view === 'dashboard' && selectedProyecto && (
        <ProyectoDashboard
          proyecto={selectedProyecto}
          onBack={handleBackToProyectos}
          onProyectoUpdate={handleProyectoUpdate}
        />
      )}
    </>
  );
}

export default App;