// frontend/src/components/sections/ConfiguracionSection.jsx

import React, { useState } from 'react';
// 1. CAMBIO: Importamos el cliente centralizado
import client from '../../api/axios';

// ❌ BORRADO: const API_URL = ...

function ConfiguracionSection({ proyecto, onProyectoUpdate }) {
  const [activeTab, setActiveTab] = useState('disciplinas');
  const [loading, setLoading] = useState(false);
  
  // Estados para formularios
  const [disciplinaForm, setDisciplinaForm] = useState({ nombre: '', codigo: '' });
  const [tipoEntregableForm, setTipoEntregableForm] = useState({
    nombre: '',
    codigo: '',
    categoria_awp: 'EWP',
    descripcion: '',
    disciplina_id: '',
    es_generico: false
  });
  
  const [cwaForm, setCwaForm] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    es_transversal: false,
    plot_plan_id: ''
  });
  const [editingCWA, setEditingCWA] = useState(null);

  // Recargar proyecto
  const recargarProyecto = async () => {
    try {
      // ✅ CAMBIO: client.get y ruta relativa
      const response = await client.get(`/proyectos/${proyecto.id}`);
      onProyectoUpdate(response.data);
    } catch (err) {
      console.error("Error recargando proyecto:", err);
    }
  };

  // ============================================================================
  // DISCIPLINAS
  // ============================================================================
  
  const handleCreateDisciplina = async (e) => {
    e.preventDefault();
    if (!disciplinaForm.nombre || !disciplinaForm.codigo) {
      alert("Completa todos los campos");
      return;
    }
    
    setLoading(true);
    try {
      // ✅ CAMBIO: client.post
      await client.post(
        `/proyectos/${proyecto.id}/disciplinas/`,
        disciplinaForm
      );
      
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
  // TIPOS DE ENTREGABLE
  // ============================================================================
  
  const handleCreateTipoEntregable = async (e) => {
    e.preventDefault();
    
    if (!tipoEntregableForm.nombre || !tipoEntregableForm.codigo) {
      alert("Completa nombre y código");
      return;
    }
    
    if (!tipoEntregableForm.es_generico && !tipoEntregableForm.disciplina_id) {
      alert("Selecciona una disciplina o marca como genérico");
      return;
    }
    
    setLoading(true);
    try {
      if (tipoEntregableForm.es_generico) {
        // ✅ CAMBIO: client.post
        await client.post(
          `/proyectos/${proyecto.id}/tipos_entregables_genericos/`,
          {
            ...tipoEntregableForm,
            disciplina_id: null
          }
        );
      } else {
        // ✅ CAMBIO: client.post
        await client.post(
          `/proyectos/${proyecto.id}/disciplinas/${tipoEntregableForm.disciplina_id}/tipos_entregables/`,
          tipoEntregableForm
        );
      }
      
      setTipoEntregableForm({
        nombre: '',
        codigo: '',
        categoria_awp: 'EWP',
        descripcion: '',
        disciplina_id: '',
        es_generico: false
      });
      
      await recargarProyecto();
      alert("✅ Tipo de entregable creado");
    } catch (err) {
      console.error("Error completo:", err);
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // CWA CRUD
  // ============================================================================
  
  const handleCreateCWA = async (e) => {
    e.preventDefault();
    
    if (!cwaForm.nombre || !cwaForm.codigo || !cwaForm.plot_plan_id) {
      alert("Completa todos los campos obligatorios");
      return;
    }
    
    setLoading(true);
    try {
      // ✅ CAMBIO: client.post
      await client.post(
        `/proyectos/${proyecto.id}/plot_plans/${cwaForm.plot_plan_id}/cwa/`,
        {
          nombre: cwaForm.nombre,
          codigo: cwaForm.codigo,
          descripcion: cwaForm.descripcion,
          es_transversal: cwaForm.es_transversal
        }
      );
      
      setCwaForm({
        nombre: '',
        codigo: '',
        descripcion: '',
        es_transversal: false,
        plot_plan_id: ''
      });
      
      await recargarProyecto();
      alert("✅ CWA creado");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCWA = (cwa, plotPlanId) => {
    setEditingCWA({ ...cwa, plot_plan_id: plotPlanId });
    setCwaForm({
      nombre: cwa.nombre,
      codigo: cwa.codigo,
      descripcion: cwa.descripcion || '',
      es_transversal: cwa.es_transversal,
      plot_plan_id: plotPlanId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCWA = async (e) => {
    e.preventDefault();
    
    if (!editingCWA) return;
    
    setLoading(true);
    try {
      // ✅ CAMBIO: client.put
      await client.put(
        `/proyectos/${proyecto.id}/plot_plans/${editingCWA.plot_plan_id}/cwa/${editingCWA.id}`,
        {
          nombre: cwaForm.nombre,
          codigo: cwaForm.codigo,
          descripcion: cwaForm.descripcion,
          es_transversal: cwaForm.es_transversal
        }
      );
      
      setCwaForm({
        nombre: '',
        codigo: '',
        descripcion: '',
        es_transversal: false,
        plot_plan_id: ''
      });
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
    if (!window.confirm("¿Estás seguro de eliminar este CWA? Esta acción no se puede deshacer.")) {
      return;
    }
    
    setLoading(true);
    try {
      // ✅ CAMBIO: client.delete
      await client.delete(
        `/proyectos/${proyecto.id}/plot_plans/${plotPlanId}/cwa/${cwaId}`
      );
      
      await recargarProyecto();
      alert("✅ CWA eliminado");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingCWA(null);
    setCwaForm({
      nombre: '',
      codigo: '',
      descripcion: '',
      es_transversal: false,
      plot_plan_id: ''
    });
  };

  const tabs = [
    { id: 'disciplinas', name: 'Disciplinas', icon: '🎓' },
    { id: 'tipos_entregables', name: 'Tipos de Entregables', icon: '📄' },
    { id: 'areas', name: 'Áreas (CWA)', icon: '📍' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-800/50">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuración del Proyecto
        </h2>
        <p className="text-gray-400 mt-2">
          Gestiona los catálogos maestros: disciplinas, tipos de entregables y áreas de construcción
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 bg-gray-800/30">
        <div className="flex gap-2 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-300 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* ========================================================= */}
        {/* ================== DISCIPLINAS TAB ================== */}
        {/* ========================================================= */}
        {activeTab === 'disciplinas' && (
          <div className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">➕ Crear Disciplina</h3>
              
              <form onSubmit={handleCreateDisciplina} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={disciplinaForm.nombre}
                      onChange={(e) => setDisciplinaForm({ ...disciplinaForm, nombre: e.target.value })}
                      placeholder="Ej: Civil, Mecánica, Eléctrica"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Código *</label>
                    <input
                      type="text"
                      value={disciplinaForm.codigo}
                      onChange={(e) => setDisciplinaForm({ ...disciplinaForm, codigo: e.target.value.toUpperCase() })}
                      placeholder="Ej: CIV, MEC, ELE"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Disciplina"}
                </button>
              </form>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Disciplinas Existentes</h3>
              
              {proyecto.disciplinas && proyecto.disciplinas.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {proyecto.disciplinas.map(disc => (
                    <div key={disc.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs font-mono">
                          {disc.codigo}
                        </span>
                        <span className="text-xs text-gray-400">
                          {disc.tipos_entregables?.length || 0} tipos
                        </span>
                      </div>
                      <p className="text-white font-medium">{disc.nombre}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No hay disciplinas creadas aún
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ================== TIPOS ENTREGABLES TAB ================== */}
        {/* ========================================================= */}
        {activeTab === 'tipos_entregables' && (
          <div className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">➕ Crear Tipo de Entregable</h3>
              
              <form onSubmit={handleCreateTipoEntregable} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={tipoEntregableForm.nombre}
                      onChange={(e) => setTipoEntregableForm({ ...tipoEntregableForm, nombre: e.target.value })}
                      placeholder="Ej: Plano, Cálculo, Hoja de Datos"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Código *</label>
                    <input
                      type="text"
                      value={tipoEntregableForm.codigo}
                      onChange={(e) => setTipoEntregableForm({ ...tipoEntregableForm, codigo: e.target.value.toUpperCase() })}
                      placeholder="Ej: PLN, CAL, HDJ"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Categoría AWP *</label>
                    <select
                      value={tipoEntregableForm.categoria_awp}
                      onChange={(e) => setTipoEntregableForm({ ...tipoEntregableForm, categoria_awp: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    >
                      <option value="EWP">EWP (Engineering)</option>
                      <option value="IWP">IWP (Installation)</option>
                      <option value="PWP">PWP (Procurement)</option>
                      <option value="DWP">DWP (Design)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Disciplina</label>
                    <select
                      value={tipoEntregableForm.disciplina_id}
                      onChange={(e) => setTipoEntregableForm({ 
                        ...tipoEntregableForm, 
                        disciplina_id: e.target.value,
                        es_generico: e.target.value === ''
                      })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      disabled={tipoEntregableForm.es_generico}
                    >
                      <option value="">-- Genérico (GEN) --</option>
                      {proyecto.disciplinas?.map(d => (
                        <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                  <textarea
                    value={tipoEntregableForm.descripcion}
                    onChange={(e) => setTipoEntregableForm({ ...tipoEntregableForm, descripcion: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tipoEntregableForm.es_generico}
                    onChange={(e) => setTipoEntregableForm({ 
                      ...tipoEntregableForm, 
                      es_generico: e.target.checked,
                      disciplina_id: e.target.checked ? '' : tipoEntregableForm.disciplina_id
                    })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-400">
                    Tipo Genérico (no vinculado a disciplina específica)
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Tipo de Entregable"}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              {proyecto.disciplinas?.some(d => d.tipos_entregables?.some(te => te.es_generico)) && (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">GEN</span>
                    Tipos Genéricos
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {proyecto.disciplinas?.flatMap(d => d.tipos_entregables || [])
                      .filter(te => te.es_generico)
                      .map(te => (
                        <div key={te.id} className="p-3 bg-purple-900/20 rounded border border-purple-700/30">
                          <span className="text-xs text-purple-300 font-mono">{te.codigo}</span>
                          <p className="text-sm text-white mt-1">{te.nombre}</p>
                          <span className="text-xs text-gray-500">{te.categoria_awp}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {proyecto.disciplinas?.map(disc => (
                disc.tipos_entregables && disc.tipos_entregables.filter(te => !te.es_generico).length > 0 && (
                  <div key={disc.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">{disc.codigo}</span>
                      {disc.nombre}
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {disc.tipos_entregables.filter(te => !te.es_generico).map(te => (
                        <div key={te.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                          <span className="text-xs text-blue-300 font-mono">{te.codigo}</span>
                          <p className="text-sm text-white mt-1">{te.nombre}</p>
                          <span className="text-xs text-gray-500">{te.categoria_awp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ================== AREAS (CWA) TAB ================== */}
        {/* ========================================================= */}
        {activeTab === 'areas' && (
          <div className="max-w-4xl">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingCWA ? '✏️ Editar CWA' : '➕ Crear CWA'}
              </h3>
              
              <form onSubmit={editingCWA ? handleUpdateCWA : handleCreateCWA} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Plot Plan *</label>
                    <select
                      value={cwaForm.plot_plan_id}
                      onChange={(e) => setCwaForm({ ...cwaForm, plot_plan_id: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                      disabled={editingCWA !== null}
                    >
                      <option value="">Seleccionar Plot Plan...</option>
                      {proyecto.plot_plans?.map(pp => (
                        <option key={pp.id} value={pp.id}>{pp.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Código *</label>
                    <input
                      type="text"
                      value={cwaForm.codigo}
                      onChange={(e) => setCwaForm({ ...cwaForm, codigo: e.target.value.toUpperCase() })}
                      placeholder="Ej: CWA-01, TRV-000"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={cwaForm.nombre}
                      onChange={(e) => setCwaForm({ ...cwaForm, nombre: e.target.value })}
                      placeholder="Ej: Patios Sector 5, Diseño Transversal"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Descripción</label>
                    <textarea
                      value={cwaForm.descripcion}
                      onChange={(e) => setCwaForm({ ...cwaForm, descripcion: e.target.value })}
                      rows="2"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cwaForm.es_transversal}
                    onChange={(e) => setCwaForm({ ...cwaForm, es_transversal: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-400">
                    Área Transversal (servicios compartidos, no geográfica)
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? "Guardando..." : (editingCWA ? "Actualizar CWA" : "Crear CWA")}
                  </button>
                  
                  {editingCWA && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              {proyecto.plot_plans?.map(pp => (
                pp.cwas && pp.cwas.length > 0 && (
                  <div key={pp.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-blue-400">📐</span>
                      {pp.nombre}
                      <span className="ml-auto text-xs text-gray-500">{pp.cwas.length} área(s)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {pp.cwas.map(cwa => (
                        <div 
                          key={cwa.id} 
                          className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs font-mono">
                                  {cwa.codigo}
                                </span>
                                {cwa.es_transversal && (
                                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                                    Transversal
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {cwa.cwps?.length || 0} CWP(s)
                                </span>
                              </div>
                              
                              <p className="text-white font-medium">{cwa.nombre}</p>
                              
                              {cwa.descripcion && (
                                <p className="text-sm text-gray-400 mt-1">{cwa.descripcion}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditCWA(cwa, pp.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteCWA(cwa.id, pp.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                title="Eliminar"
                                disabled={(cwa.cwps?.length || 0) > 0}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
              
              {!proyecto.plot_plans || proyecto.plot_plans.every(pp => !pp.cwas || pp.cwas.length === 0) ? (
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-gray-400 mb-2">No hay áreas creadas aún</p>
                  <p className="text-sm text-gray-500">Usa el formulario de arriba para crear tu primera área</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfiguracionSection;