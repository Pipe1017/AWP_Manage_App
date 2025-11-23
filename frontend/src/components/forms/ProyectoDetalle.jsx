import React, { useState } from 'react';
import client from '../../api/axios';
import TipoEntregableForm from './TipoEntregableForm';


function ProyectoDetalle({ proyecto, onDisciplinaCreada, onTipoEntregableCreado, onCWACreada }) {
  const [discNombre, setDiscNombre] = useState("");
  const [discCodigo, setDiscCodigo] = useState("");
  const [selectedDiscId, setSelectedDiscId] = useState(null);
  
  const [cwaNombre, setCwaNombre] = useState("");
  const [cwaCodigo, setCwaCodigo] = useState("");
  const [selectedPlotPlanId, setSelectedPlotPlanId] = useState(
    proyecto.plot_plans && proyecto.plot_plans.length > 0 
      ? proyecto.plot_plans[0].id 
      : null
  );

  const handleDisciplinaSubmit = async (e) => {
    e.preventDefault();
    if (!discNombre || !discCodigo) {
        alert("Por favor completa los campos de la disciplina.");
        return;
    }
    console.log("🕵️‍♂️ [ProyectoDetalle] Enviando disciplina:", { nombre: discNombre, codigo: discCodigo });
    try {
      const response = await client.post(
        `/proyectos/${proyecto.id}/disciplinas/`,
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

  const handleCWASubmit = async (e) => {
  e.preventDefault();
  if (!cwaNombre || !cwaCodigo || !selectedPlotPlanId) {
    alert("Por favor completa todos los campos de CWA y selecciona un Plot Plan.");
    return;
  }
  
  console.log("🕵️‍♂️ [ProyectoDetalle] Creando CWA:", { nombre: cwaNombre, codigo: cwaCodigo });
  
  try {
    const response = await client.post(
      `/proyectos/${proyecto.id}/plot_plans/${selectedPlotPlanId}/cwa/`,
      { nombre: cwaNombre, codigo: cwaCodigo }
    );
    
    console.log("👍 [ProyectoDetalle] CWA creada:", response.data);
    onCWACreada(selectedPlotPlanId, response.data);
    
    setCwaNombre("");
    setCwaCodigo("");
    alert(`✅ CWA "${response.data.nombre}" creada exitosamente`);
    
  } catch (err) {
    console.error("🔥 [ProyectoDetalle] ERROR creando CWA:", err);
    alert("Error al crear CWA: " + (err.response?.data?.detail || err.message));
  }
};

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Configuración del Proyecto: {proyecto.nombre}</h2>
      
      {/* Sección de CWAs */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-2 border-blue-700 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-hatch-orange flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Áreas de Construcción (CWAs)
        </h3>
        
        {proyecto.plot_plans && proyecto.plot_plans.length > 0 ? (
          <form onSubmit={handleCWASubmit} className="space-y-4">
            {/* Selector de Plot Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plot Plan asociado:
              </label>
              <select
                value={selectedPlotPlanId || ''}
                onChange={(e) => setSelectedPlotPlanId(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-white border-r-2 border-hatch-gray border border-gray-600 text-hatch-blue"
                required
              >
                {proyecto.plot_plans.map(pp => (
                  <option key={pp.id} value={pp.id}>
                    {pp.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Inputs de CWA */}
            <div className="flex gap-3">
              <input 
                type="text" 
                value={cwaNombre} 
                onChange={(e) => setCwaNombre(e.target.value)} 
                placeholder="Nombre del CWA (ej. Área Norte)" 
                className="flex-1 px-4 py-2 rounded-lg bg-white border-r-2 border-hatch-gray border border-gray-600 text-hatch-blue placeholder-gray-500" 
                required 
              />
              <input 
                type="text" 
                value={cwaCodigo} 
                onChange={(e) => setCwaCodigo(e.target.value.toUpperCase())} 
                placeholder="Código (ej. CWA-01)" 
                className="w-32 px-4 py-2 rounded-lg bg-white border-r-2 border-hatch-gray border border-gray-600 text-hatch-blue placeholder-gray-500" 
                required 
              />
              <button 
                type="submit" 
                className="px-6 py-2 bg-gradient-orange hover:bg-blue-700 text-hatch-blue font-bold rounded-lg transition-colors"
              >
                + Crear CWA
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-200">
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Primero debes crear un Plot Plan en la vista General antes de poder crear CWAs.
          </div>
        )}

        {/* Lista de CWAs existentes */}
        {proyecto.plot_plans && proyecto.plot_plans.some(pp => pp.cwas && pp.cwas.length > 0) && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-hatch-blue mb-3">CWAs Existentes:</h4>
            {proyecto.plot_plans.map(pp => (
              pp.cwas && pp.cwas.length > 0 && (
                <div key={pp.id} className="mb-4">
                  <p className="text-xs text-hatch-orange mb-2">📍 {pp.nombre}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {pp.cwas.map(cwa => (
                      <div key={cwa.id} className="p-3 bg-white border-r-2 border-hatch-gray rounded-lg border border-gray-700">
                        <p className="font-medium text-hatch-blue">{cwa.nombre}</p>
                        <p className="text-xs text-hatch-blue">{cwa.codigo}</p>
                        <p className="text-xs text-green-400 mt-1">
                          {(cwa.cwps || []).length} CWP(s)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Separador */}
      <div className="my-8 border-t-2 border-gray-700"></div>

      {/* Formulario de Disciplinas */}
      <div className="mb-8 p-6 bg-white border-r-2 border-hatch-gray rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-300">Disciplinas del Proyecto</h3>
        <form onSubmit={handleDisciplinaSubmit} className="flex gap-3">
          <input 
            type="text" 
            value={discNombre} 
            onChange={(e) => setDiscNombre(e.target.value)} 
            placeholder="Nombre (ej. Piping)" 
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-hatch-blue" 
            required 
          />
          <input 
            type="text" 
            value={discCodigo} 
            onChange={(e) => setDiscCodigo(e.target.value.toUpperCase())} 
            placeholder="Código (ej. PI)" 
            className="w-24 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-hatch-blue" 
            required 
          />
          <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-hatch-blue font-bold rounded-lg">
            + Añadir
          </button>
        </form>
      </div>

      {/* Biblioteca de Entregables */}
      <div className="p-6 bg-white border-r-2 border-hatch-gray rounded-lg border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-gray-300">Biblioteca de Entregables</h3>
        <ul>
          {(proyecto.disciplinas || []).length > 0 ? (
            (proyecto.disciplinas || []).map(disc => (
              <li key={disc.id} className="bg-gray-900 my-2 rounded-md overflow-hidden border border-gray-700">
                <div 
                  onClick={() => setSelectedDiscId(disc.id === selectedDiscId ? null : disc.id)} 
                  className="p-4 cursor-pointer hover:bg-hatch-gray transition-colors"
                >
                  <strong className="text-hatch-blue">{disc.nombre}</strong>
                  <span className="ml-2 text-hatch-blue">({disc.codigo})</span>
                  <span className="ml-4 text-xs text-gray-500">
                    {(disc.tipos_entregables || []).length} tipo(s)
                  </span>
                </div>
                
                <ul className="px-8 pb-2 text-sm text-gray-300">
                  {(disc.tipos_entregables || []).map(tipo => (
                    <li key={tipo.id} className="my-1">
                      <span className="font-medium text-hatch-orange mr-2">[{tipo.categoria_awp}]</span> 
                      {tipo.nombre} 
                      <span className="text-gray-500 ml-2">({tipo.codigo})</span>
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
            <p className="text-hatch-blue p-4">Este proyecto aún no tiene disciplinas.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default ProyectoDetalle;