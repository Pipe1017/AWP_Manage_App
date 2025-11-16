import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';
const AWP_API_URL = `${API_URL}/api/v1/awp`; 
// ... (Aquí iría la lógica para EWP/IWP/PWP en el futuro)

// --- Formulario para CWP (Componente interno) ---
function CWPForm({ cwaId, onCWPCreado }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  
  // URL actualizada para el nuevo router AWP:
  const handleSubmit = async (e) => { /* ... (axios.post(`${AWP_API_URL}/cwa/${cwaId}/cwp/`, ...) ) ... */ }; 
    e.preventDefault();
    if (!nombre || !codigo) return alert("Nombre y Código son requeridos");
    
    setLoading(true);
    try {
      const response = await axios.post(`${AWP_API_URL}/cwa/${cwaId}/cwp/`, { nombre, codigo });
      onCWPCreado(cwaId, response.data);
      setNombre("");
      setCodigo("");
    } catch (err) {
      alert("Error al crear CWP: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-b-md flex gap-2">
      <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre CWP" className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white flex-grow" required />
      <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Código" className="w-20 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white" required />
      <button type="submit" className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50" disabled={loading}>
        {loading ? "..." : "+ CWP"}
      </button>
    </form>
  );
}


// --- Componente Principal de AWP (EL CORAZÓN) ---
// Recibe un plotPlan, no un proyecto
function AWPEstructura({ plotPlan, onCWACreada, onCWPCreado, selectedCWA, onSelectCWA }) {
  const [selectedCWAId, setSelectedCWAId] = useState(null); 

  // Esta función ahora solo maneja la selección visual y funcional
  const handleSelectCWA = (cwa) => {
    setSelectedCWAId(cwa.id);
    onSelectCWA(cwa); // Envía el objeto CWA al PlotPlan
  };

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-lg shadow-xl">
      <h3 className="text-lg font-semibold mb-4 text-blue-300">AWP Data Grid (El Corazón de la App)</h3>
      
      {/* Aviso: En el futuro, aquí estará el Data Grid editable */}

      <h4 className="text-md font-semibold mb-2">CWAs para {plotPlan.nombre}</h4>
      
      {/* Lista de CWAs existentes */}
      <ul className="space-y-2">
        {plotPlan.cwas.length > 0 ? (
          plotPlan.cwas.map(cwa => (
            <li key={cwa.id} className={`
              bg-gray-700 my-1 rounded-md overflow-hidden border transition-all
              ${selectedCWAId === cwa.id ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-600 hover:bg-gray-600'}
            `}>
              <div 
                onClick={() => handleSelectCWA(cwa)} // El clic ahora selecciona CWA
                className="p-3 cursor-pointer flex justify-between items-center"
              >
                <strong className="text-md text-white">
                  {cwa.nombre} ({cwa.codigo})
                </strong>
                <span className="text-xs text-gray-400">
                    {cwa.cwps.length} CWPs
                </span>
              </div>
              
              {/* Lista de CWPs anidados - visible si la CWA está seleccionada */}
              {selectedCWAId === cwa.id && (
                <div className="border-t border-gray-600 p-2">
                    <ul className="px-4 text-sm text-gray-300 space-y-1">
                        {cwa.cwps.map(cwp => (
                            <li key={cwp.id} className="text-green-300">
                                [{cwp.codigo}] {cwp.nombre}
                            </li>
                        ))}
                    </ul>
                    
                    {/* Formulario para añadir CWP */}
                    <CWPForm cwaId={cwa.id} onCWPCreado={onCWPCreado} />
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-400 p-4">Aún no hay CWAs para este plano.</p>
        )}
      </ul>
    </div>
  );
}

export default AWPEstructura;