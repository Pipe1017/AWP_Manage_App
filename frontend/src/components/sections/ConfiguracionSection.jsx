// frontend/src/components/sections/ConfiguracionSection.jsx

import React, { useState, useEffect } from 'react';
import client from '../../api/axios.js';

function ConfiguracionSection({ proyecto, onProyectoUpdate }) {
  const [activeTab, setActiveTab] = useState('disciplinas');
  const [loading, setLoading] = useState(false);
  
  // Estados: Disciplinas
  const [disciplinaForm, setDisciplinaForm] = useState({ nombre: '', codigo: '' });
  const [editingDisciplina, setEditingDisciplina] = useState(null);
  const [modalDisciplina, setModalDisciplina] = useState(false);

  // Estados: CWA (Áreas)
  const [cwaForm, setCwaForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    es_transversal: false,
    plot_plan_id: ''
  });
  const [editingCWA, setEditingCWA] = useState(null);

  // Estados: Metadatos/Restricciones
  const [columnasMetadata, setColumnasMetadata] = useState([]);
  const [metaForm, setMetaForm] = useState({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
  const [editingMetadata, setEditingMetadata] = useState(null); // ✅ NUEVO

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

  const recargarProyecto = async () => {
    try {
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) {
      console.error("Error recargando proyecto:", err);
    }
  };

  // ============================================================================
  // DISCIPLINAS
  // ============================================================================
  const openDisciplinaModal = (disciplina = null) => {
    if (disciplina) {
      setEditingDisciplina(disciplina);
      setDisciplinaForm({ nombre: disciplina.nombre, codigo: disciplina.codigo });
    } else {
      setEditingDisciplina(null);
      setDisciplinaForm({ nombre: '', codigo: '' });
    }
    setModalDisciplina(true);
  };

  const handleSaveDisciplina = async (e) => {
    e.preventDefault();
    if (!disciplinaForm.nombre || !disciplinaForm.codigo) return alert("Completa todos los campos");
    
    setLoading(true);
    try {
      if (editingDisciplina) {
        await client.put(`/proyectos/${proyecto.id}/disciplinas/${editingDisciplina.id}`, disciplinaForm);
        alert("✅ Disciplina actualizada");
      } else {
        await client.post(`/proyectos/${proyecto.id}/disciplinas/`, disciplinaForm);
        alert("✅ Disciplina creada");
      }
      setModalDisciplina(false);
      setDisciplinaForm({ nombre: '', codigo: '' });
      await recargarProyecto();
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDisciplina = async (disciplinaId) => {
    if (!confirm("¿Eliminar esta disciplina? Se eliminarán sus tipos de entregables asociados.")) return;
    
    setLoading(true);
    try {
      await client.delete(`/proyectos/${proyecto.id}/disciplinas/${disciplinaId}`);
      await recargarProyecto();
      alert("✅ Disciplina eliminada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CWA
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
  // METADATOS/RESTRICCIONES
  // ============================================================================
  const handleCreateMetadata = async (e) => {
    e.preventDefault();
    if (!metaForm.nombre) return alert("Nombre requerido");

    const opcionesArray = metaForm.tipo_dato === 'SELECCION' 
      ? metaForm.opciones.split(',').map(s => s.trim()).filter(s => s) 
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
      alert("✅ Restricción creada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Iniciar edición
  const startEditMetadata = (columna) => {
    setEditingMetadata(columna);
    setMetaForm({
      nombre: columna.nombre,
      tipo_dato: columna.tipo_dato,
      opciones: columna.opciones_json ? columna.opciones_json.join(', ') : ''
    });
  };

  // ✅ NUEVO: Actualizar metadata
  const handleUpdateMetadata = async (e) => {
    e.preventDefault();
    if (!metaForm.nombre) return alert("Nombre requerido");

    const opcionesArray = metaForm.tipo_dato === 'SELECCION' 
      ? metaForm.opciones.split(',').map(s => s.trim()).filter(s => s) 
      : [];

    setLoading(true);
    try {
      await client.put(`/proyectos/${proyecto.id}/config/columnas/${editingMetadata.id}`, {
        nombre: metaForm.nombre,
        tipo_dato: metaForm.tipo_dato,
        opciones: opcionesArray
      });
      setMetaForm({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
      setEditingMetadata(null);
      cargarColumnasMetadata();
      alert("✅ Restricción actualizada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: Eliminar metadata
  const handleDeleteMetadata = async (columnaId) => {
    if (!confirm("¿Eliminar esta restricción? Los valores guardados en CWPs se perderán.")) return;
    
    setLoading(true);
    try {
      await client.delete(`/proyectos/${proyecto.id}/config/columnas/${columnaId}`);
      cargarColumnasMetadata();
      alert("✅ Restricción eliminada");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'disciplinas', name: 'Disciplinas', icon: '🎓' },
    { id: 'areas', name: 'Áreas (CWA)', icon: '📍' },
    { id: 'metadata', name: 'Restricciones CWP', icon: '🏷️' },
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
              activeTab === tab.id 
                ? 'border-hatch-orange text-hatch-orange' 
                : 'border-transparent text-gray-600 hover:text-hatch-blue'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>{tab.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-hatch-gray/20">
        
        {/* ====================================================================
            TAB: DISCIPLINAS
        ==================================================================== */}
        {activeTab === 'disciplinas' && (
          <div className="max-w-4xl space-y-6">
            {/* Botón crear */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-hatch-blue">Disciplinas del Proyecto</h3>
              <button 
                onClick={() => openDisciplinaModal()} 
                className="bg-gradient-orange hover:shadow-lg text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                ➕ Nueva Disciplina
              </button>
            </div>

            {/* Lista */}
            <div className="grid grid-cols-2 gap-3">
              {proyecto.disciplinas?.map(d => (
                <div key={d.id} className="p-4 bg-white border-2 border-hatch-gray rounded-lg shadow-sm hover:border-hatch-orange transition-colors group">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-hatch-orange font-mono text-xs bg-hatch-gray px-2 py-1 rounded mr-2">
                        {d.codigo}
                      </span>
                      <span className="font-medium text-hatch-blue">{d.nombre}</span>
                      <p className="text-xs text-gray-500 mt-2">
                        {d.tipos_entregables?.length || 0} tipo(s) de entregables
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openDisciplinaModal(d)} 
                        className="text-gray-500 hover:text-hatch-orange p-1 rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteDisciplina(d.id)} 
                        className="text-red-400 hover:text-red-600 p-1 rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!proyecto.disciplinas || proyecto.disciplinas.length === 0) && (
                <p className="text-gray-500 col-span-2 text-center py-8">No hay disciplinas configuradas.</p>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: ÁREAS (CWA)
        ==================================================================== */}
        {activeTab === 'areas' && (
          <div className="max-w-4xl space-y-6">
            {/* Formulario */}
            <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
              <h3 className="text-lg font-bold mb-4 text-hatch-blue">
                {editingCWA ? '✏️ Editar Área' : '➕ Nueva Área (CWA)'}
              </h3>
              <form onSubmit={editingCWA ? handleUpdateCWA : handleCreateCWA} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">Plot Plan *</label>
                    <select 
                      className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                      value={cwaForm.plot_plan_id}
                      onChange={e => setCwaForm({...cwaForm, plot_plan_id: e.target.value})}
                      disabled={!!editingCWA} 
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {proyecto.plot_plans?.map(pp => <option key={pp.id} value={pp.id}>{pp.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">Código *</label>
                    <input 
                      className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 uppercase focus:border-hatch-orange outline-none"
                      value={cwaForm.codigo}
                      onChange={e => setCwaForm({...cwaForm, codigo: e.target.value.toUpperCase()})}
                      placeholder="CWA-01" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre *</label>
                  <input 
                    className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                    value={cwaForm.nombre}
                    onChange={e => setCwaForm({...cwaForm, nombre: e.target.value})}
                    placeholder="Ej: Planta de Procesos" 
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={cwaForm.es_transversal}
                    onChange={e => setCwaForm({...cwaForm, es_transversal: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Es Área Transversal (Diseño/Ingeniería Global)</label>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={loading} 
                    className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-medium transition-all"
                  >
                    {editingCWA ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingCWA && (
                    <button 
                      type="button" 
                      onClick={() => { 
                        setEditingCWA(null); 
                        setCwaForm({ nombre: '', codigo: '', descripcion: '', es_transversal: false, plot_plan_id: '' }); 
                      }} 
                      className="bg-gray-300 hover:bg-gray-400 text-hatch-blue px-4 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista */}
            <div className="space-y-4">
              {proyecto.plot_plans?.map(pp => (
                pp.cwas && pp.cwas.length > 0 && (
                  <div key={pp.id} className="bg-white border-2 border-hatch-gray rounded-lg p-4 shadow-sm">
                    <h4 className="font-bold text-hatch-orange mb-3 border-b-2 border-hatch-gray pb-2">
                      📍 {pp.nombre}
                    </h4>
                    <div className="space-y-2">
                      {pp.cwas.map(cwa => (
                        <div 
                          key={cwa.id} 
                          className="flex justify-between items-center bg-hatch-gray/30 p-3 rounded-lg border-2 border-hatch-gray hover:border-hatch-orange transition-colors group"
                        >
                          <div>
                            <span className="text-xs font-mono bg-white border-2 border-hatch-gray px-2 py-1 rounded mr-2">
                              {cwa.codigo}
                            </span>
                            <span className="font-medium">{cwa.nombre}</span>
                            {cwa.es_transversal && (
                              <span className="ml-2 text-xs bg-hatch-orange text-white px-2 py-0.5 rounded">
                                Transversal
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditCWA(cwa, pp.id)} 
                              className="text-hatch-blue hover:text-hatch-orange text-xs font-medium"
                            >
                              ✏️ Editar
                            </button>
                            <button 
                              onClick={() => handleDeleteCWA(cwa.id, pp.id)} 
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              🗑️ Borrar
                            </button>
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

        {/* ====================================================================
            TAB: METADATOS/RESTRICCIONES (CON EDICIÓN Y ELIMINACIÓN)
        ==================================================================== */}
        {activeTab === 'metadata' && (
          <div className="max-w-4xl space-y-6">
            {/* Explicación */}
            <div className="bg-hatch-orange/10 border-l-4 border-hatch-orange p-4 rounded-r text-sm text-hatch-blue">
              ℹ️ Define <strong>restricciones personalizadas</strong> para tus CWPs (ej: "Permiso Ambiental", "Diseño IFC Aprobado", "Materiales en Sitio").
              Estas restricciones aparecerán como columnas en la tabla AWP y podrás marcar su estado en cada CWP.
            </div>

            {/* Formulario */}
            <div className="bg-white p-6 rounded-lg border-2 border-hatch-gray shadow-md">
              <h3 className="text-lg font-bold mb-4 text-hatch-blue">
                {editingMetadata ? '✏️ Editar Restricción' : '➕ Nueva Restricción Personalizada'}
              </h3>
              <form onSubmit={editingMetadata ? handleUpdateMetadata : handleCreateMetadata} className="flex gap-4 items-end flex-wrap">
                <div className="w-1/3">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre de la Restricción *</label>
                  <input 
                    className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                    value={metaForm.nombre}
                    onChange={e => setMetaForm({...metaForm, nombre: e.target.value})}
                    placeholder="Ej: Permiso Ambiental" 
                    required
                  />
                </div>
                <div className="w-1/4">
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Tipo de Dato</label>
                  <select 
                    className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                    value={metaForm.tipo_dato}
                    onChange={e => setMetaForm({...metaForm, tipo_dato: e.target.value})}
                  >
                    <option value="TEXTO">Texto Libre</option>
                    <option value="SELECCION">Lista de Opciones</option>
                  </select>
                </div>
                
                {metaForm.tipo_dato === 'SELECCION' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">
                      Opciones (separar por coma)
                    </label>
                    <input 
                      className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                      value={metaForm.opciones}
                      onChange={e => setMetaForm({...metaForm, opciones: e.target.value})}
                      placeholder="Aprobado, Pendiente, No Aplica"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={loading} 
                    className="bg-gradient-orange hover:shadow-lg text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    {editingMetadata ? 'Actualizar' : 'Agregar'}
                  </button>
                  {editingMetadata && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingMetadata(null);
                        setMetaForm({ nombre: '', tipo_dato: 'TEXTO', opciones: '' });
                      }}
                      className="bg-gray-300 hover:bg-gray-400 text-hatch-blue px-4 py-2 rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Lista de Restricciones/Metadatos */}
            <div className="bg-white rounded-lg border-2 border-hatch-gray overflow-hidden shadow-sm">
              <div className="bg-hatch-gray px-4 py-3 border-b-2 border-hatch-gray-dark">
                <h4 className="text-sm font-bold text-hatch-blue uppercase">Restricciones Configuradas</h4>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-hatch-gray/30 text-hatch-blue uppercase text-xs font-bold border-b-2 border-hatch-gray">
                  <tr>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Opciones</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hatch-gray">
                  {columnasMetadata.map(col => (
                    <tr key={col.id} className="hover:bg-hatch-gray/20 group transition-colors">
                      <td className="px-4 py-3 font-medium text-hatch-blue">{col.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded font-semibold border-2 ${
                          col.tipo_dato === 'SELECCION' 
                            ? 'bg-purple-50 border-purple-300 text-purple-700' 
                            : 'bg-gray-100 border-gray-300 text-gray-700'
                        }`}>
                          {col.tipo_dato}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {col.opciones_json && col.opciones_json.length > 0 
                          ? col.opciones_json.join(', ') 
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEditMetadata(col)}
                            className="text-hatch-blue hover:text-hatch-orange px-2 py-1 rounded hover:bg-hatch-orange/10 transition-colors text-xs font-medium"
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteMetadata(col.id)}
                            className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors text-xs font-medium"
                            title="Eliminar"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {columnasMetadata.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        No hay restricciones configuradas. Crea tu primera restricción arriba.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r text-sm text-blue-800">
              💡 <strong>Uso:</strong> Estas restricciones aparecerán como columnas en la tabla AWP principal.
              Podrás actualizar sus valores directamente al editar cada CWP.
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================
          MODAL: DISCIPLINA
      ======================================================================== */}
      {modalDisciplina && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[450px] p-6 rounded-2xl border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2">
              <span className="text-hatch-orange">{editingDisciplina ? '✏️' : '➕'}</span>
              {editingDisciplina ? 'Editar' : 'Nueva'} Disciplina
            </h3>
            
            <form onSubmit={handleSaveDisciplina} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre</label>
                <input 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                  value={disciplinaForm.nombre}
                  onChange={e => setDisciplinaForm({...disciplinaForm, nombre: e.target.value})}
                  placeholder="Ej: Civil" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Código</label>
                <input 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 uppercase focus:border-hatch-orange outline-none"
                  value={disciplinaForm.codigo}
                  onChange={e => setDisciplinaForm({...disciplinaForm, codigo: e.target.value.toUpperCase()})}
                  placeholder="CIV" 
                  required 
                  maxLength={5}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
                <button 
                  type="button"
                  onClick={() => setModalDisciplina(false)} 
                  className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  {editingDisciplina ? 'Guardar Cambios' : 'Crear Disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfiguracionSection;