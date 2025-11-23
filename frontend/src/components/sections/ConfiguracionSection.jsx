// frontend/src/components/sections/ConfiguracionSection.jsx

import React, { useState, useEffect } from 'react';
// Ajustamos la ruta para asegurar que encuentre el cliente axios
import client from '../../api/axios.js';

function ConfiguracionSection({ proyecto, onProyectoUpdate }) {
  const [activeTab, setActiveTab] = useState('disciplinas');
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS: Disciplinas ---
  const [disciplinaForm, setDisciplinaForm] = useState({ nombre: '', codigo: '' });

  // --- ESTADOS: CWA (Áreas) ---
  const [cwaForm, setCwaForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    es_transversal: false,
    plot_plan_id: ''
  });
  const [editingCWA, setEditingCWA] = useState(null);

  // --- ESTADOS: Metadatos (Columnas Personalizadas) ---
  const [columnasMetadata, setColumnasMetadata] = useState([]);
  const [metaForm, setMetaForm] = useState({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });

  // Efecto para cargar metadatos cuando se abre esa pestaña
  useEffect(() => {
    if (activeTab === 'metadata') {
      cargarColumnasMetadata();
    }
  }, [activeTab, proyecto.id]);

  const cargarColumnasMetadata = async () => {
    try {
      const res = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setColumnasMetadata(res.data);
    } catch (err) {
      console.error("Error cargando metadatos:", err);
    }
  };

  // Función auxiliar para recargar todo el proyecto
  const recargarProyecto = async () => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) {
      console.error("Error recargando proyecto:", err);
    }
  };

  // ============================================================================
  // 1. GESTIÓN DE DISCIPLINAS
  // ============================================================================
  
  const handleCreateDisciplina = async (e) => {
    e.preventDefault();
    if (!disciplinaForm.nombre || !disciplinaForm.codigo) return alert("Completa todos los campos");
    
    setLoading(true);
    try {
      await client.post(`/proyectos/${proyecto.id}/disciplinas/`, disciplinaForm);
      setDisciplinaForm({ nombre: '', codigo: '' });
      await recargarProyecto();
      alert("✅ Disciplina creada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 2. GESTIÓN DE ÁREAS (CWA)
  // ============================================================================
  
  const handleCreateCWA = async (e) => {
    e.preventDefault();
    if (!cwaForm.nombre || !cwaForm.codigo || !cwaForm.plot_plan_id) return alert("Completa campos obligatorios");
    
    setLoading(true);
    try {
      await client.post(`/proyectos/${proyecto.id}/plot_plans/${cwaForm.plot_plan_id}/cwa/`, cwaForm);
      setCwaForm({ ...cwaForm, nombre: '', codigo: '', descripcion: '', es_transversal: false });
      await recargarProyecto();
      alert("✅ CWA creado");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCWA = async (e) => {
    e.preventDefault();
    if (!editingCWA) return;
    
    setLoading(true);
    try {
      await client.put(
        `/proyectos/${proyecto.id}/plot_plans/${editingCWA.plot_plan_id}/cwa/${editingCWA.id}`,
        cwaForm
      );
      setCwaForm({ ...cwaForm, nombre: '', codigo: '', descripcion: '', es_transversal: false });
      setEditingCWA(null);
      await recargarProyecto();
      alert("✅ CWA actualizado");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCWA = async (cwaId, plotPlanId) => {
    if (!confirm("¿Eliminar este CWA?")) return;
    setLoading(true);
    try {
      await client.delete(`/proyectos/${proyecto.id}/plot_plans/${plotPlanId}/cwa/${cwaId}`);
      await recargarProyecto();
      alert("✅ CWA eliminado");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const startEditCWA = (cwa, plotPlanId) => {
    setEditingCWA({ ...cwa, plot_plan_id: plotPlanId });
    setCwaForm({
      nombre: cwa.nombre,
      codigo: cwa.codigo,
      descripcion: cwa.descripcion || '',
      es_transversal: cwa.es_transversal,
      plot_plan_id: plotPlanId
    });
  };

  // ============================================================================
  // 3. GESTIÓN DE METADATOS (Columnas Personalizadas)
  // ============================================================================

  const handleCreateMetadata = async (e) => {
    e.preventDefault();
    if (!metaForm.nombre) return alert("Nombre requerido");

    // Convertir texto de opciones a array si es selección
    const opcionesArray = metaForm.tipo_dato === 'SELECCION' 
      ? metaForm.opciones.split(',').map(s => s.trim()) 
      : [];

    setLoading(true);
    try {
      await client.post(`/proyectos/${proyecto.id}/config/columnas`, {
        nombre: metaForm.nombre,
        tipo_dato: metaForm.tipo_dato,
        opciones: opcionesArray
      });
      setMetaForm({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
      cargarColumnasMetadata();
      alert("✅ Columna creada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const tabs = [
    { id: 'disciplinas', name: 'Disciplinas', icon: '🎓' },
    { id: 'areas', name: 'Áreas (CWA)', icon: '📍' },
    { id: 'metadata', name: 'Metadatos CWP', icon: '🏷️' }, // Nueva pestaña
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-800/50">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-purple-400">⚙️</span> Configuración del Proyecto
        </h2>
        <p className="text-gray-400 mt-2">Gestiona catálogos maestros y reglas del proyecto.</p>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b border-gray-700 bg-gray-800/30 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-purple-500 text-purple-300' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>{tab.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* --- TAB: DISCIPLINAS --- */}
        {activeTab === 'disciplinas' && (
          <div className="max-w-4xl space-y-6">
            {/* Formulario */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4">➕ Nueva Disciplina</h3>
              <form onSubmit={handleCreateDisciplina} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Nombre</label>
                  <input 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    value={disciplinaForm.nombre}
                    onChange={e => setDisciplinaForm({...disciplinaForm, nombre: e.target.value})}
                    placeholder="Ej: Civil" required
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-400 mb-1">Código</label>
                  <input 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 uppercase"
                    value={disciplinaForm.codigo}
                    onChange={e => setDisciplinaForm({...disciplinaForm, codigo: e.target.value.toUpperCase()})}
                    placeholder="CIV" required maxLength={5}
                  />
                </div>
                <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
                  Crear
                </button>
              </form>
            </div>

            {/* Lista */}
            <div className="grid grid-cols-2 gap-3">
              {proyecto.disciplinas?.map(d => (
                <div key={d.id} className="p-4 bg-gray-800 border border-gray-700 rounded flex justify-between items-center">
                  <div>
                    <span className="text-blue-300 font-mono text-xs bg-blue-900/50 px-2 py-1 rounded mr-2">{d.codigo}</span>
                    <span className="font-medium">{d.nombre}</span>
                  </div>
                </div>
              ))}
              {(!proyecto.disciplinas || proyecto.disciplinas.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center">No hay disciplinas configuradas.</p>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: ÁREAS (CWA) --- */}
        {activeTab === 'areas' && (
          <div className="max-w-4xl space-y-6">
            {/* Formulario */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4">{editingCWA ? '✏️ Editar Área' : '➕ Nueva Área (CWA)'}</h3>
              <form onSubmit={editingCWA ? handleUpdateCWA : handleCreateCWA} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Plot Plan *</label>
                    <select 
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                      value={cwaForm.plot_plan_id}
                      onChange={e => setCwaForm({...cwaForm, plot_plan_id: e.target.value})}
                      disabled={!!editingCWA} required
                    >
                      <option value="">Seleccionar...</option>
                      {proyecto.plot_plans?.map(pp => <option key={pp.id} value={pp.id}>{pp.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Código *</label>
                    <input 
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 uppercase"
                      value={cwaForm.codigo}
                      onChange={e => setCwaForm({...cwaForm, codigo: e.target.value.toUpperCase()})}
                      placeholder="CWA-01" required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                  <input 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    value={cwaForm.nombre}
                    onChange={e => setCwaForm({...cwaForm, nombre: e.target.value})}
                    placeholder="Ej: Planta de Procesos" required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={cwaForm.es_transversal}
                    onChange={e => setCwaForm({...cwaForm, es_transversal: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-300">Es Área Transversal (Diseño/Ingeniería Global)</label>
                </div>
                <div className="flex gap-2">
                  <button disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
                    {editingCWA ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingCWA && (
                    <button type="button" onClick={() => { setEditingCWA(null); setCwaForm({ nombre: '', codigo: '', descripcion: '', es_transversal: false, plot_plan_id: '' }); }} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancelar</button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista */}
            <div className="space-y-4">
              {proyecto.plot_plans?.map(pp => (
                pp.cwas && pp.cwas.length > 0 && (
                  <div key={pp.id} className="bg-gray-800 border border-gray-700 rounded p-4">
                    <h4 className="font-bold text-blue-300 mb-3 border-b border-gray-700 pb-2">📍 {pp.nombre}</h4>
                    <div className="space-y-2">
                      {pp.cwas.map(cwa => (
                        <div key={cwa.id} className="flex justify-between items-center bg-gray-900/50 p-3 rounded border border-gray-700 hover:border-gray-500">
                          <div>
                            <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded mr-2">{cwa.codigo}</span>
                            <span className="font-medium">{cwa.nombre}</span>
                            {cwa.es_transversal && <span className="ml-2 text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">Transversal</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditCWA(cwa, pp.id)} className="text-blue-400 hover:text-white text-xs">✏️ Editar</button>
                            <button onClick={() => handleDeleteCWA(cwa.id, pp.id)} className="text-red-400 hover:text-white text-xs">🗑️ Borrar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: METADATOS (NUEVO) --- */}
        {activeTab === 'metadata' && (
          <div className="max-w-4xl space-y-6">
            {/* Explicación */}
            <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded text-sm text-blue-200">
              ℹ️ Aquí puedes definir columnas personalizadas para tus CWPs (ej: "Fase", "Contrato", "Prioridad").
              Estas columnas aparecerán en la tabla principal y en los formularios.
            </div>

            {/* Formulario */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-bold mb-4">➕ Nueva Columna Personalizada</h3>
              <form onSubmit={handleCreateMetadata} className="flex gap-4 items-end flex-wrap">
                <div className="w-1/3">
                  <label className="block text-xs text-gray-400 mb-1">Nombre Columna</label>
                  <input 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    value={metaForm.nombre}
                    onChange={e => setMetaForm({...metaForm, nombre: e.target.value})}
                    placeholder="Ej: Fase de Ejecución" required
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-xs text-gray-400 mb-1">Tipo de Dato</label>
                  <select 
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    value={metaForm.tipo_dato}
                    onChange={e => setMetaForm({...metaForm, tipo_dato: e.target.value})}
                  >
                    <option value="TEXTO">Texto Libre</option>
                    <option value="SELECCION">Lista de Opciones</option>
                  </select>
                </div>
                
                {metaForm.tipo_dato === 'SELECCION' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-gray-400 mb-1">Opciones (separar por coma)</label>
                    <input 
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                      value={metaForm.opciones}
                      onChange={e => setMetaForm({...metaForm, opciones: e.target.value})}
                      placeholder="Preparada, Parada, Post-Parada"
                    />
                  </div>
                )}
                
                <button disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                  Agregar
                </button>
              </form>
            </div>

            {/* Lista de Columnas */}
            <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Opciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {columnasMetadata.map(col => (
                    <tr key={col.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 font-medium">{col.nombre}</td>
                      <td className="px-4 py-3"><span className="bg-gray-700 px-2 py-1 rounded text-xs">{col.tipo_dato}</span></td>
                      <td className="px-4 py-3 text-gray-400">
                        {col.opciones_json ? col.opciones_json.join(', ') : '-'}
                      </td>
                    </tr>
                  ))}
                  {columnasMetadata.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No hay columnas personalizadas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ConfiguracionSection;