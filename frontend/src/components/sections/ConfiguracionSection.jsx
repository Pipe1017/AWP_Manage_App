import React, { useState, useEffect } from 'react';
import client from '../../api/axios.js';

function ConfiguracionSection({ proyecto, onProyectoUpdate }) {
  const [activeTab, setActiveTab] = useState('disciplinas');
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS FORMULARIOS ---
  const [disciplinaForm, setDisciplinaForm] = useState({ nombre: '', codigo: '' });
  const [editingDisciplina, setEditingDisciplina] = useState(null);

  const [cwaForm, setCwaForm] = useState({ nombre: '', codigo: '', descripcion: '', es_transversal: false, plot_plan_id: '' });
  const [editingCWA, setEditingCWA] = useState(null);

  const [columnasMetadata, setColumnasMetadata] = useState([]);
  // Estado para editar Metadata
  const [metaForm, setMetaForm] = useState({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
  const [editingMeta, setEditingMeta] = useState(null);

  useEffect(() => {
    if (activeTab === 'metadata') {
      cargarColumnasMetadata();
    }
  }, [activeTab, proyecto.id]);

  const cargarColumnasMetadata = async () => {
    try {
      const res = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setColumnasMetadata(res.data);
    } catch (err) { console.error(err); }
  };

  const recargarProyecto = async () => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) { console.error(err); }
  };

  // --- HANDLERS DISCIPLINAS ---
  const handleSaveDisciplina = async (e) => {
    e.preventDefault();
    if (!disciplinaForm.nombre || !disciplinaForm.codigo) return;
    
    setLoading(true);
    try {
      if (editingDisciplina) {
        await client.put(`/proyectos/${proyecto.id}/disciplinas/${editingDisciplina.id}`, disciplinaForm);
        alert("✅ Disciplina actualizada");
      } else {
        await client.post(`/proyectos/${proyecto.id}/disciplinas/`, disciplinaForm);
        alert("✅ Disciplina creada");
      }
      setDisciplinaForm({ nombre: '', codigo: '' });
      setEditingDisciplina(null);
      await recargarProyecto();
    } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  const handleDeleteDisciplina = async (id) => {
    if (!confirm("¿Eliminar disciplina? Se perderá la asociación en los paquetes.")) return;
    try {
      await client.delete(`/proyectos/${proyecto.id}/disciplinas/${id}`);
      await recargarProyecto();
    } catch (err) { alert("Error eliminando"); }
  };

  const startEditDisciplina = (d) => {
    setEditingDisciplina(d);
    setDisciplinaForm({ nombre: d.nombre, codigo: d.codigo });
  };

  // --- HANDLERS CWA ---
  const handleSaveCWA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        if(editingCWA) {
            await client.put(`/proyectos/${proyecto.id}/plot_plans/${editingCWA.plot_plan_id}/cwa/${editingCWA.id}`, cwaForm);
        } else {
            await client.post(`/proyectos/${proyecto.id}/plot_plans/${cwaForm.plot_plan_id}/cwa/`, cwaForm);
        }
        setCwaForm({ ...cwaForm, nombre: '', codigo: '', descripcion: '', es_transversal: false });
        setEditingCWA(null);
        await recargarProyecto();
        alert("✅ CWA Guardado");
    } catch(err) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  const handleDeleteCWA = async (cwaId, plotPlanId) => {
    if (!confirm("¿Eliminar este CWA?")) return;
    try {
      await client.delete(`/proyectos/${proyecto.id}/plot_plans/${plotPlanId}/cwa/${cwaId}`);
      await recargarProyecto();
    } catch (err) { alert("Error: " + err.message); }
  };

  const startEditCWA = (cwa, plotPlanId) => {
    setEditingCWA({ ...cwa, plot_plan_id: plotPlanId });
    setCwaForm({ nombre: cwa.nombre, codigo: cwa.codigo, descripcion: cwa.descripcion || '', es_transversal: cwa.es_transversal, plot_plan_id: plotPlanId });
  };

  // --- HANDLERS METADATA ---
  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    const opcionesArray = metaForm.tipo_dato === 'SELECCION' ? metaForm.opciones.split(',').map(s => s.trim()) : [];
    setLoading(true);
    try {
      const payload = {
        nombre: metaForm.nombre,
        tipo_dato: metaForm.tipo_dato,
        opciones: opcionesArray
      };

      if (editingMeta) {
        await client.put(`/proyectos/${proyecto.id}/config/columnas/${editingMeta.id}`, payload);
        alert("✅ Columna actualizada (Datos migrados)");
      } else {
        await client.post(`/proyectos/${proyecto.id}/config/columnas`, payload);
        alert("✅ Columna creada");
      }
      
      setMetaForm({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
      setEditingMeta(null);
      cargarColumnasMetadata();
    } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  const startEditMetadata = (col) => {
    setEditingMeta(col);
    setMetaForm({
        nombre: col.nombre,
        tipo_dato: col.tipo_dato,
        opciones: col.opciones_json ? col.opciones_json.join(', ') : ''
    });
  };

  const handleDeleteMetadata = async (id) => {
    if (!confirm("¿Eliminar esta columna? Los datos guardados en los CWPs bajo esta columna podrían perderse visualmente.")) return;
    try {
        await client.delete(`/proyectos/${proyecto.id}/config/columnas/${id}`);
        cargarColumnasMetadata();
    } catch(err) { alert("Error eliminando columna"); }
  };

  const tabs = [
    { id: 'disciplinas', name: 'Disciplinas', icon: '🎓' },
    { id: 'areas', name: 'Áreas (CWA)', icon: '📍' },
    { id: 'metadata', name: 'Metadatos CWP', icon: '🏷️' },
  ];

  return (
    <div className="h-full flex flex-col bg-white text-hatch-blue">
      {/* Header */}
      <div className="p-6 border-b-2 border-hatch-gray bg-white shadow-sm">
        <h2 className="text-2xl font-bold flex items-center gap-3 text-hatch-blue">
          <span className="text-hatch-orange">⚙️</span> Configuración del Proyecto
        </h2>
        <p className="text-gray-600 mt-2">Gestiona catálogos maestros y reglas del proyecto.</p>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b-2 border-hatch-gray bg-hatch-gray/30 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-hatch-orange text-hatch-orange' : 'border-transparent text-gray-600 hover:text-hatch-blue'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>{tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-hatch-gray/20">
        
        {/* TAB: DISCIPLINAS */}
        {activeTab === 'disciplinas' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
              <h3 className="text-lg font-bold mb-4 text-hatch-blue">{editingDisciplina ? '✏️ Editar Disciplina' : '➕ Nueva Disciplina'}</h3>
              <form onSubmit={handleSaveDisciplina} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre</label>
                  <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={disciplinaForm.nombre} onChange={e => setDisciplinaForm({...disciplinaForm, nombre: e.target.value})} placeholder="Ej: Civil" required />
                </div>
                <div className="w-32">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Código</label>
                  <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 uppercase focus:border-hatch-orange outline-none" value={disciplinaForm.codigo} onChange={e => setDisciplinaForm({...disciplinaForm, codigo: e.target.value.toUpperCase()})} placeholder="CIV" required maxLength={5} />
                </div>
                <button disabled={loading} className="bg-gradient-orange text-white px-4 py-2 rounded font-medium hover:shadow-lg transition-all">
                  {editingDisciplina ? 'Guardar' : 'Crear'}
                </button>
                {editingDisciplina && <button type="button" onClick={() => {setEditingDisciplina(null); setDisciplinaForm({nombre:'', codigo:''})}} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancelar</button>}
              </form>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {proyecto.disciplinas?.map(d => (
                <div key={d.id} className="p-4 bg-white border-2 border-hatch-gray rounded shadow-sm flex justify-between items-center hover:border-hatch-orange transition-colors group">
                  <div>
                    <span className="text-hatch-orange font-mono text-xs bg-hatch-gray px-2 py-1 rounded mr-2">{d.codigo}</span>
                    <span className="font-medium text-hatch-blue">{d.nombre}</span>
                  </div>
                  <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditDisciplina(d)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">✏️</button>
                    <button onClick={() => handleDeleteDisciplina(d.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ÁREAS (CWA) */}
        {activeTab === 'areas' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
              <h3 className="text-lg font-bold mb-4 text-hatch-blue">{editingCWA ? '✏️ Editar Área' : '➕ Nueva Área (CWA)'}</h3>
              <form onSubmit={handleSaveCWA} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">Plot Plan *</label>
                    <select className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={cwaForm.plot_plan_id} onChange={e => setCwaForm({...cwaForm, plot_plan_id: e.target.value})} disabled={!!editingCWA} required>
                      <option value="">Seleccionar...</option>
                      {proyecto.plot_plans?.map(pp => <option key={pp.id} value={pp.id}>{pp.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">Código *</label>
                    <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 uppercase focus:border-hatch-orange outline-none" value={cwaForm.codigo} onChange={e => setCwaForm({...cwaForm, codigo: e.target.value.toUpperCase()})} placeholder="CWA-01" required />
                  </div>
                </div>
                <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={cwaForm.nombre} onChange={e => setCwaForm({...cwaForm, nombre: e.target.value})} placeholder="Nombre del Área" required />
                <div className="flex items-center gap-2"><input type="checkbox" checked={cwaForm.es_transversal} onChange={e => setCwaForm({...cwaForm, es_transversal: e.target.checked})} /> <label className="text-sm text-gray-700">Es Área Transversal</label></div>
                <div className="flex gap-2">
                    <button disabled={loading} className="bg-gradient-orange text-white px-6 py-2 rounded font-medium hover:shadow-lg transition-all">{editingCWA ? 'Actualizar' : 'Crear'}</button>
                    {editingCWA && <button type="button" onClick={() => { setEditingCWA(null); setCwaForm({ nombre: '', codigo: '', descripcion: '', es_transversal: false, plot_plan_id: '' }); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancelar</button>}
                </div>
              </form>
            </div>
            <div className="space-y-4">
              {proyecto.plot_plans?.map(pp => (
                pp.cwas && pp.cwas.length > 0 && (
                  <div key={pp.id} className="bg-white border-2 border-hatch-gray rounded p-4 shadow-sm">
                    <h4 className="font-bold text-hatch-orange mb-3 border-b-2 border-hatch-gray pb-2">📍 {pp.nombre}</h4>
                    <div className="space-y-2">
                      {pp.cwas.map(cwa => (
                        <div key={cwa.id} className="flex justify-between items-center bg-hatch-gray/30 p-3 rounded border-2 border-hatch-gray hover:border-hatch-orange transition-colors group">
                          <div>
                            <span className="text-xs font-mono bg-white border-2 border-hatch-gray px-2 py-1 rounded mr-2">{cwa.codigo}</span>
                            <span className="font-medium">{cwa.nombre}</span>
                            {cwa.es_transversal && <span className="ml-2 text-xs bg-hatch-orange text-white px-2 py-0.5 rounded">Transversal</span>}
                          </div>
                          <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditCWA(cwa, pp.id)} className="text-blue-500 hover:bg-blue-50 p-1 rounded">✏️</button>
                            <button onClick={() => handleDeleteCWA(cwa.id, pp.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
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

        {/* TAB: METADATOS */}
        {activeTab === 'metadata' && (
          <div className="max-w-4xl space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
              <h3 className="text-lg font-bold mb-4 text-hatch-blue">{editingMeta ? '✏️ Editar Columna' : '➕ Nueva Columna'}</h3>
              <form onSubmit={handleSaveMetadata} className="flex gap-4 items-end flex-wrap">
                <div className="w-1/3">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre Columna</label>
                  <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={metaForm.nombre} onChange={e => setMetaForm({...metaForm, nombre: e.target.value})} placeholder="Ej: Fase" required />
                </div>
                <div className="w-1/4">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Tipo</label>
                  <select className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={metaForm.tipo_dato} onChange={e => setMetaForm({...metaForm, tipo_dato: e.target.value})}>
                    <option value="TEXTO">Texto Libre</option>
                    <option value="SELECCION">Lista de Opciones</option>
                  </select>
                </div>
                {metaForm.tipo_dato === 'SELECCION' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">Opciones (coma)</label>
                    <input className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none" value={metaForm.opciones} onChange={e => setMetaForm({...metaForm, opciones: e.target.value})} placeholder="A, B, C" />
                  </div>
                )}
                <button disabled={loading} className="bg-gradient-orange text-white px-4 py-2 rounded font-medium hover:shadow-lg transition-all">
                    {editingMeta ? 'Actualizar' : 'Agregar'}
                </button>
                {editingMeta && <button type="button" onClick={() => { setEditingMeta(null); setMetaForm({ nombre: '', tipo_dato: 'TEXTO', opciones: '' }); }} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancelar</button>}
              </form>
            </div>

            <div className="bg-white rounded border-2 border-hatch-gray overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-hatch-gray text-hatch-blue uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Opciones</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hatch-gray">
                  {columnasMetadata.map(col => (
                    <tr key={col.id} className="hover:bg-hatch-gray/20 group">
                      <td className="px-4 py-3 font-medium">{col.nombre}</td>
                      <td className="px-4 py-3"><span className="bg-hatch-gray px-2 py-1 rounded text-xs">{col.tipo_dato}</span></td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{col.opciones_json ? col.opciones_json.join(', ') : '-'}</td>
                      <td className="px-4 py-3 text-right opacity-50 group-hover:opacity-100">
                        <button onClick={() => startEditMetadata(col)} className="text-blue-500 hover:bg-blue-50 p-1 rounded mr-2">✏️</button>
                        <button onClick={() => handleDeleteMetadata(col.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">🗑️</button>
                      </td>
                    </tr>
                  ))}
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