// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import client from "./api/axios"; 
import ProyectosLanding from './pages/ProyectosLanding';
import ProyectoDashboard from './pages/ProyectoDashboard';

function App() {
  const [view, setView] = useState('landing');
  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      const response = await client.get('/proyectos/');
      const proyectosCompletos = await Promise.all(
        response.data.map(async (proyecto) => {
          try {
            const detalle = await client.get(`/proyectos/${proyecto.id}`);
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
      const response = await client.post('/proyectos/', {
        nombre: nombreProyecto,
        descripcion: ""
      });
      const proyectoCompleto = await client.get(`/proyectos/${response.data.id}`);
      setProyectos([...proyectos, proyectoCompleto.data]);
      handleSelectProyecto(proyectoCompleto.data);
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectProyecto = async (proyecto) => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      setSelectedProyecto(response.data);
      setView('dashboard');
    } catch (err) {
      alert("Error cargando proyecto");
    }
  };

  const handleBackToProyectos = () => {
    setView('landing');
    setSelectedProyecto(null);
    fetchProyectos();
  };

  const handleProyectoUpdate = (updatedProyecto) => {
    setSelectedProyecto(updatedProyecto);
    setProyectos(proyectos.map(p => p.id === updatedProyecto.id ? updatedProyecto : p));
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-hatch-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-hatch-blue font-semibold">Cargando AWP Manager...</p>
          <p className="text-sm text-gray-500 mt-2">Powered by HATCH</p>
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