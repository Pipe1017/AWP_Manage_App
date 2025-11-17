import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://192.168.1.4:8000';
const AWP_API_URL = `${API_URL}/api/v1/awp`;

// --- Formulario para CWP (Componente interno) ---
function CWPForm({ cwaId, onCWPCreado, disciplinas = [] }) {
  const [nombre, setNombre] = useState("");
  const [disciplinaId, setDisciplinaId] = useState(disciplinas.length > 0 ? disciplinas[0].id : "");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !disciplinaId) {
      alert("Nombre y Disciplina son requeridos");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${AWP_API_URL}/cwa/${cwaId}/cwp/?disciplina_id=${disciplinaId}`,
        { 
          nombre,
          descripcion: ""
        }
      );
      onCWPCreado(cwaId, response.data);
      setNombre("");
      setDisciplinaId(disciplinas.length > 0 ? disciplinas[0].id : "");
    } catch (err) {
      alert("Error al crear CWP: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-b-md flex gap-2">
      <input 
        type="text" 
        value={nombre} 
        onChange={(e) => setNombre(e.target.value)} 
        placeholder="Nombre CWP" 
        className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white flex-grow" 
        required 
      />
      
      {disciplinas.length > 0 ? (
        <select 
          value={disciplinaId} 
          onChange={(e) => setDisciplinaId(Number(e.target.value))}
          className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
          required
        >
          <option value="">Selecciona disciplina</option>
          {disciplinas.map(d => (
            <option key={d.id} value={d.id}>
              {d.codigo} - {d.nombre}
            </option>
          ))}
        </select>
      ) : (
        <div className="px-2 py-1 rounded bg-red-900 border border-red-700 text-red-200 text-sm">
          Sin disciplinas
        </div>
      )}
      
      <button 
        type="submit" 
        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50" 
        disabled={loading || !disciplinaId}
      >
        {loading ? "..." : "+ CWP"}
      </button>
    </form>
  );
}


// --- Componente Principal de AWP ---
function AWPEstructura({ plotPlan, proyecto, onCWACreada, onCWPCreado, selectedCWA, onSelectCWA }) {
  const [selectedCWAId, setSelectedCWAId] = useState(null);

  // Esta función maneja la selección visual y funcional
  const handleSelectCWA = (cwa) => {
    setSelectedCWAId(cwa.id);
    onSelectCWA(cwa); // Envía el objeto CWA al componente padre
  };

  return (
    <div className="mt-6 p-4 border-t border-gray-700 bg-gray-800 rounded-lg shadow-xl">
      <h3 className="text-lg font-semibold mb-4 text-blue-300">
        📋 Estructura AWP - {plotPlan?.nombre}
      </h3>
      
      {/* Instrucción visual */}
      <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-sm text-blue-200">
        <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <strong>Selecciona un CWA</strong> para asociar las formas que dibujes en el plano superior
      </div>

      <h4 className="text-md font-semibold mb-2 text-gray-300">
        Construction Work Areas (CWAs)
      </h4>
      
      {/* Lista de CWAs existentes */}
      <ul className="space-y-2">
        {plotPlan?.cwas && plotPlan.cwas.length > 0 ? (
          plotPlan.cwas.map(cwa => (
            <li key={cwa.id} className={`
              bg-gray-700 my-1 rounded-md overflow-hidden border transition-all
              ${selectedCWAId === cwa.id ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-lg' : 'border-gray-600 hover:bg-gray-600'}
            `}>
              <div 
                onClick={() => handleSelectCWA(cwa)}
                className="p-3 cursor-pointer flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {/* Indicador visual de selección */}
                  <div className={`w-3 h-3 rounded-full ${selectedCWAId === cwa.id ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
                  <div>
                    <strong className="text-md text-white">
                      {cwa.nombre}
                    </strong>
                    <span className="ml-2 text-xs text-gray-400">
                      ({cwa.codigo})
                    </span>
                    {cwa.es_transversal && (
                      <span className="ml-2 px-2 py-0.5 bg-purple-700 text-purple-200 text-xs rounded">
                        Transversal
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                    {cwa.cwps?.length || 0} CWP{cwa.cwps?.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Lista de CWPs anidados - visible si la CWA está seleccionada */}
              {selectedCWAId === cwa.id && (
                <div className="border-t border-gray-600 p-2 bg-gray-750">
                    <div className="px-4 py-2">
                      <p className="text-xs text-gray-400 mb-2">
                        Work Packages en esta área:
                      </p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {cwa.cwps?.length > 0 ? (
                          cwa.cwps.map(cwp => (
                            <li key={cwp.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                              {/* Ícono según si tiene geometría o no */}
                              {cwp.shape_type ? (
                                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="text-green-300 font-mono text-xs">
                                [{cwp.codigo}]
                              </span>
                              <span className="flex-1">{cwp.nombre}</span>
                              {cwp.shape_type && (
                                <span className="ml-auto text-xs bg-green-900 text-green-200 px-2 py-1 rounded">
                                  {cwp.shape_type}
                                </span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic text-xs">
                            No hay CWPs todavía. Dibuja formas en el plano o créalos manualmente.
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Formulario para añadir CWP manualmente */}
                    <div className="border-t border-gray-600 mt-2">
                      <p className="text-xs text-gray-400 px-4 pt-2">
                        O crea un CWP manualmente:
                      </p>
                      <CWPForm 
                        cwaId={cwa.id} 
                        onCWPCreado={onCWPCreado}
                        disciplinas={proyecto?.disciplinas || []}
                      />
                    </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400 bg-gray-750 rounded-lg border border-gray-600">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aún no hay CWAs para este plano.</p>
            <p className="text-xs mt-1">Ve a la pestaña de Configuración para crear áreas de construcción.</p>
          </div>
        )}
      </ul>
    </div>
  );
}

export default AWPEstructura;