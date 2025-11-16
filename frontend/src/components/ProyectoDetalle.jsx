import React, { useState } from 'react';
import axios from 'axios';
import TipoEntregableForm from './TipoEntregableForm';

const API_URL = 'http://localhost:8000';

// Este componente ahora es 100% para "Configuración"
function ProyectoDetalle({ proyecto, onDisciplinaCreada, onTipoEntregableCreado }) {
  const [discNombre, setDiscNombre] = useState("");
  const [discCodigo, setDiscCodigo] = useState("");
  const [selectedDiscId, setSelectedDiscId] = useState(null);

  const handleDisciplinaSubmit = async (e) => {
    e.preventDefault();
    if (!discNombre || !discCodigo) {
        alert("Por favor completa los campos de la disciplina.");
        return;
    }
    console.log("🕵️‍♂️ [ProyectoDetalle] Enviando disciplina:", { nombre: discNombre, codigo: discCodigo });
    try {
      const response = await axios.post(
        `${API_URL}/proyectos/${proyecto.id}/disciplinas/`,
        { nombre: discNombre, codigo: discCodigo }
      );
      console.log("👍 [ProyectoDetalle] Respuesta OK:", response.data);
      onDisciplinaCreada(response.data); 
      setDiscNombre("");
      setDiscCodigo("");
    } catch (err) {
      console.error("🔥 [ProyectoDetalle] ERROR:", err);
      alert("Error al crear la disciplina: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    // Ya no tiene el borde principal, es solo un contenedor de lógica
    <div>
      <h2 className="text-3xl font-bold mb-6">Configuración del Proyecto: {proyecto.nombre}</h2>
      
      {/* Formulario de Disciplinas */}
      <form onSubmit={handleDisciplinaSubmit} className="p-4 mb-6 bg-gray-800 rounded-lg">
        <h4 className="font-semibold mb-2">Añadir Disciplina</h4>
        <input 
          type="text" 
          value={discNombre} 
          onChange={(e) => setDiscNombre(e.target.value)} 
          placeholder="Nombre (ej. Piping)" 
          className="px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white" 
          required 
        />
        <input 
          type="text" 
          value={discCodigo} 
          onChange={(e) => setDiscCodigo(e.target.value)} 
          placeholder="Código (ej. PI)" 
          className="w-20 mx-2 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white" 
          required 
        />
        <button type="submit" className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
          Añadir Disciplina
        </button>
      </form>

      {/* Biblioteca de Entregables */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Biblioteca de Entregables</h3>
        <ul>
          {proyecto.disciplinas.length > 0 ? (
            proyecto.disciplinas.map(disc => (
              <li key={disc.id} className="bg-gray-900 my-2 rounded-md overflow-hidden border border-gray-700">
                <div 
                  onClick={() => setSelectedDiscId(disc.id === selectedDiscId ? null : disc.id)} 
                  className="p-4 cursor-pointer hover:bg-gray-700"
                >
                  <strong>{disc.nombre} ({disc.codigo})</strong>
                </div>
                
                <ul className="px-8 pb-2 text-sm text-gray-300">
                  {disc.tipos_entregables.map(tipo => (
                    <li key={tipo.id} className="my-1">
                      <span className="font-medium text-blue-300 mr-2">[{tipo.categoria_awp}]</span> {tipo.nombre} ({tipo.codigo})
                    </li>
                  ))}
                </ul>
                
                {selectedDiscId === disc.id && (
                  <TipoEntregableForm 
                    disciplina={disc} 
                    onTipoCreado={onTipoEntregableCreado} 
                  />
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-400">Este proyecto aún no tiene disciplinas.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default ProyectoDetalle;