import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';
const AWP_API_URL = `${API_URL}/api/v1/awp`;

function UploadPlotPlanForm({ proyecto, onUploadSuccess }) {
  const [nombre, setNombre] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !nombre) {
      setError("Se necesita un nombre y un archivo.");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("nombre", nombre);

    try {
      const response = await axios.post(
        `${AWP_API_URL}/proyectos/${proyecto.id}/plotplans/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      onUploadSuccess(response.data);
      setFile(null);
      setNombre("");
    } catch (err) {
      console.error("🔥 [UploadForm] ERROR subiendo:", err);
      setError("Error al subir el plano: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="p-4 bg-gray-700 rounded-lg flex items-center gap-4">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del Plano (ej. Nivel 1)"
        className="flex-grow px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
        required
      />
      <input 
        type="file" 
        accept="image/jpeg, image/png"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm text-gray-300 file:mr-2 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        required
      />
      <button
        type="submit"
        disabled={loading || !file || !nombre}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "+ Añadir Plano"}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}

export default UploadPlotPlanForm;