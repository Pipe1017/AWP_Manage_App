// frontend/src/components/modules/upload/UploadPlotPlanForm.jsx

import React, { useState } from 'react';
import client from '../../../api/axios';

function UploadPlotPlanForm({ proyecto, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [nombre, setNombre] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      setError(`Tipo de archivo no válido: ${selectedFile.type}. Usa JPG, PNG o WEBP.`);
      setFile(null);
      setPreview(null);
      return;
    }

    // Validar tamaño (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    
    // Auto-llenar nombre desde el archivo si está vacío
    if (!nombre.trim()) {
      const fileNameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
      setNombre(fileNameWithoutExt);
    }
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!nombre.trim()) {
      setError('Por favor ingresa un nombre para el Plot Plan');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('nombre', nombre.trim());
    formData.append('file', file);

    console.log("\n" + "=".repeat(60));
    console.log("📤 ENVIANDO PLOT PLAN");
    console.log("=".repeat(60));
    console.log("Proyecto ID:", proyecto.id);
    console.log("Nombre:", nombre.trim());
    console.log("Archivo:", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type
    });
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].type})`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }
    console.log("=".repeat(60) + "\n");

    try {
      const response = await client.post(
        `/proyectos/${proyecto.id}/plot_plans/`,
        formData
        // NO agregar headers - axios los maneja automáticamente para FormData
      );
      
      console.log("✅ Plot Plan creado exitosamente:", response.data);
      
      // Resetear formulario
      setFile(null);
      setNombre('');
      setPreview(null);
      
      // Notificar al padre
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
      
    } catch (err) {
      console.error("\n" + "=".repeat(60));
      console.error("❌ ERROR SUBIENDO PLOT PLAN");
      console.error("=".repeat(60));
      console.error("Error completo:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("=".repeat(60) + "\n");
      
      let errorMsg = "Error al subir el plano";
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          // Error de validación de FastAPI
          const errors = err.response.data.detail.map(e => {
            const field = e.loc?.join('.') || 'unknown';
            return `${field}: ${e.msg}`;
          });
          errorMsg = errors.join(', ');
          console.error("Errores de validación:", errors);
        } else {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      
    } finally {
      setUploading(false);
    }
  };

  // Validación de props
  if (!proyecto || !proyecto.id) {
    return (
      <div className="bg-red-50 border-2 border-red-500 p-4 rounded">
        <p className="text-red-700 font-bold">❌ Error: No se recibió el proyecto correctamente</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
      <h3 className="text-lg font-bold mb-4 text-hatch-blue flex items-center gap-2">
        <span className="text-hatch-orange">📤</span>
        Subir Nuevo Plot Plan
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre del Plot Plan */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Plot Plan *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Planta General - Nivel 1"
            className="w-full px-4 py-2 rounded-lg bg-white border-2 border-hatch-gray text-hatch-blue placeholder-gray-400 focus:outline-none focus:border-hatch-orange transition-colors"
            required
            disabled={uploading}
          />
        </div>

        {/* Archivo de imagen */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagen del Plano * (JPG, PNG, WEBP - Max 10MB)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                file 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-hatch-gray bg-hatch-gray/20 hover:border-hatch-orange'
              }`}>
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-gray-600">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <svg className="w-8 h-8 mx-auto mb-2 text-hatch-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">Haz clic para seleccionar imagen</p>
                    <p className="text-xs text-gray-500 mt-1">o arrastra y suelta aquí</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
                required
                disabled={uploading}
              />
            </label>
            
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition-colors"
                disabled={uploading}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Vista previa */}
        {preview && (
          <div className="border-2 border-hatch-gray rounded-lg overflow-hidden">
            <div className="bg-hatch-gray px-3 py-2 text-xs font-semibold text-hatch-blue">
              Vista Previa
            </div>
            <div className="p-4 bg-white">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-48 mx-auto rounded border border-hatch-gray"
              />
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
          <button
            type="submit"
            disabled={uploading || !file || !nombre.trim()}
            className="w-full px-6 py-3 bg-gradient-orange hover:shadow-lg text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Subiendo...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Subir Plot Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UploadPlotPlanForm;