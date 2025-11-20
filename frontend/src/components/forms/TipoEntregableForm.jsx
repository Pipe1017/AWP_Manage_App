import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://10.92.12.84:8000';

function TipoEntregableForm({ disciplina, onTipoCreado }) {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [categoria, setCategoria] = useState("EWP");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); 

    if (!nombre || !codigo || !categoria) {
      alert("Por favor completa todos los campos.");
      return;
    }
    
    setLoading(true);
    console.log("🕵️‍♂️ [TipoEntregableForm] Enviando:", { nombre, codigo, categoria_awp: categoria });

    try {
      // ESTA ES LA URL CORREGIDA DEL 404
      const response = await axios.post(
        `${API_URL}/api/v1/proyectos/${disciplina.proyecto_id}/disciplinas/${disciplina.id}/tipos_entregables/`,
        {
          nombre: nombre,
          codigo: codigo,
          categoria_awp: categoria,
        }
      );

      console.log("👍 [TipoEntregableForm] Respuesta OK:", response.data);
      onTipoCreado(disciplina.id, response.data); 
      setNombre("");
      setCodigo("");
      setCategoria("EWP");
    } catch (err) {
      console.error("🔥 [TipoEntregableForm] ERROR:", err);
      alert("Error al crear el tipo de entregable: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-700 rounded-b-md">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre (ej. P&ID)"
        className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
        required
      />
      <input
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Código (ej. PID)"
        className="w-20 mx-2 px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
        required
      />
      <select 
        value={categoria} 
        onChange={(e) => setCategoria(e.target.value)}
        className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-white"
      >
        <option value="EWP">EWP</option>
        <option value="IWP">IWP</option>
        <option value="PWP">PWP</option>
        <option value="DWP">DWP</option>
      </select>
      <button 
        type="submit" 
        className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "..." : "+"}
      </button>
    </form>
  );
}

export default TipoEntregableForm;