import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // <-- Esta URL es del servidor

// Definimos el prefijo de la API que pusimos en main.py
const AWP_API_URL = `${API_URL}/api/v1/awp`; 

// --- Formulario para CWP (Componente interno) ---
// (Lógica actualizada para la nueva API)
function CWPForm({ cwaId, onCWPCreado }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nombre || !codigo) return alert("Nombre y Código son requeridos");
    
    setLoading(true);
    console.log(`🕵️‍♂️ [CWPForm] Enviando CWP para CWA ID: ${cwaId}`, { nombre, codigo });

    try {
      // ¡URL ACTUALIZADA!
      const response = await axios.post(
        `${AWP_API_URL}/cwa/${cwaId}/cwp/`, 
        { nombre, codigo }
      );
      console.log("👍 [CWPForm] Respuesta OK:", response.data);
      onCWPCreado(cwaId, response.data);
      setNombre("");
      setCodigo("");
    } catch (err) {
      console.error("🔥 [CWPForm] ERROR:", err);
      alert("Error al crear CWP: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-b-md">
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre CWP (ej. Piping Area 1)" className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" required />
      <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código CWP" className="w-24 mx-2 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" required />
      <button type="submit" className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50" disabled={loading}>
        {loading ? "..." : "+ CWP"}
      </button>
    </form>
  );
}


// --- Componente Principal de AWP (ACTUALIZADO) ---
// Recibe un plotPlan, no un proyecto
function AWPEstructura({ plotPlan, onCWACreada, onCWPCreado }) {
  const [cwaNombre, setCWANombre] = useState("");
  const [cwaCodigo, setCWACodigo] = useState("");
  const [selectedCWAId, setSelectedCWAId] = useState(null);

  const handleCWASubmit = async (e) => {
    e.preventDefault();
    if (!cwaNombre || !cwaCodigo) return alert("Nombre y Código son requeridos");

    console.log("🕵️‍♂️ [AWPEstructura] Enviando CWA:", { nombre: cwaNombre, codigo: cwaCodigo });

    try {
      // ¡URL ACTUALIZADA!
      const response = await axios.post(
        `${AWP_API_URL}/plotplans/${plotPlan.id}/cwa/`,
        { nombre: cwaNombre, codigo: cwaCodigo }
      );
      console.log("👍 [AWPEstructura] Respuesta OK:", response.data);
      onCWACreada(plotPlan.id, response.data); // Llama al handler de App.jsx
      setCWANombre("");
      setCWACodigo("");
    } catch (err) {
      console.error("🔥 [AWPEstructura] ERROR:", err);
      alert("Error al crear CWA: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-2">Estructura AWP (CWAs y CWPs)</h3>
      
      <form onSubmit={handleCWASubmit} className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2">Añadir CWA (Area)</h4>
        <input type="text" value={cwaNombre} onChange={(e) => setCWANombre(e.target.value)} placeholder="Nombre (ej. Area 01 - Procesos)" className="px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white" required />
        <input type="text" value={cwaCodigo} onChange={(e) => setCWACodigo(e.target.value)} placeholder="Código CWA" className="w-24 mx-2 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white" required />
        <button type="submit" className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
          + CWA
        </button>
      </form>

      {/* Lista de CWAs (ahora viene de plotPlan.cwas) */}
      <ul>
        {plotPlan.cwas.length > 0 ? (
          plotPlan.cwas.map(cwa => (
            <li key={cwa.id} className="bg-gray-800 my-2 rounded-md overflow-hidden border border-gray-700">
              <div 
                onClick={() => setSelectedCWAId(cwa.id === selectedCWAId ? null : cwa.id)}
                className="p-4 cursor-pointer hover:bg-gray-700"
              >
                <strong className="text-lg">{cwa.nombre} ({cwa.codigo})</strong>
              </div>
              
              <ul className="px-8 pb-2 text-sm text-gray-300">
                {cwa.cwps.map(cwp => (
                  <li key={cwp.id} className="my-1">
                    <span className="font-medium text-green-300 mr-2">[{cwp.codigo}]</span> {cwp.nombre}
                  </li>
                ))}
              </ul>
              
              {selectedCWAId === cwa.id && (
                <CWPForm 
                  cwaId={cwa.id}
                  onCWPCreado={onCWPCreado}
                />
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-400">Este Plot Plan aún no tiene CWAs.</p>
        )}
      </ul>
    </div>
  );
}

export default AWPEstructura;