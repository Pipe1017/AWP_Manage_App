// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://192.168.1.4:8000/api/v1';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());
  
  // ✨ Estados para nuevos modales
  const [showModalCWP, setShowModalCWP] = useState(false);
  const [showModalPaquete, setShowModalPaquete] = useState(false);
  const [showModalItem, setShowModalItem] = useState(false);
  
  const [selectedCWAForCWP, setSelectedCWAForCWP] = useState(null);
  const [selectedCWPForPaquete, setSelectedCWPForPaquete] = useState(null);
  const [selectedPaqueteForItem, setSelectedPaqueteForItem] = useState(null);
  
  // ✨ Formularios compactos
  const [cwpForm, setCwpForm] = useState({
    nombre: '',
    descripcion: '',
    disciplina_id: '',
    area_id: null
  });
  
  const [paqueteForm, setPaqueteForm] = useState({
    nombre: '',
    tipo: 'EWP',
    responsable: 'Firma'
  });
  
  const [itemForm, setItemForm] = useState({
    nombre: '',
    tipo_entregable_id: '',
    responsable: 'Firma'
  });
  
  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  useEffect(() => {
    loadJerarquia();
  }, [plotPlanId]);

  const loadJerarquia = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/awp/plot_plans/${plotPlanId}/jerarquia`);
      console.log("✅ Jerarquía cargada:", response.data);
      setJerarquia(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando jerarquía:", error);
      setLoading(false);
    }
  };

  const toggleCWA = (cwaId) => {
    const newSet = new Set(expandedCWAs);
    if (newSet.has(cwaId)) {
      newSet.delete(cwaId);
    } else {
      newSet.add(cwaId);
    }
    setExpandedCWAs(newSet);
  };

  const toggleCWP = (cwpId) => {
    const newSet = new Set(expandedCWPs);
    if (newSet.has(cwpId)) {
      newSet.delete(cwpId);
    } else {
      newSet.add(cwpId);
    }
    setExpandedCWPs(newSet);
  };

  const togglePaquete = (paqueteId) => {
    const newSet = new Set(expandedPaquetes);
    if (newSet.has(paqueteId)) {
      newSet.delete(paqueteId);
    } else {
      newSet.add(paqueteId);
    }
    setExpandedPaquetes(newSet);
  };

  // ============================================================================
  // ✨ CREAR CWP
  // ============================================================================
  
  const openModalCWP = (cwa) => {
    setSelectedCWAForCWP(cwa);
    setCwpForm({
      nombre: '',
      descripcion: '',
      disciplina_id: proyecto.disciplinas?.[0]?.id || '',
      area_id: cwa.id
    });
    setShowModalCWP(true);
  };

  const handleCreateCWP = async (e) => {
    e.preventDefault();
    
    if (!cwpForm.nombre || !cwpForm.disciplina_id) {
      alert("⚠️ Completa nombre y disciplina");
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/awp-nuevo/cwp`,
        cwpForm
      );
      
      console.log("✅ CWP creado:", response.data);
      alert(`✅ CWP creado: ${response.data.codigo}`);
      
      setShowModalCWP(false);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando CWP:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // ✨ CREAR PAQUETE
  // ============================================================================
  
  const openModalPaquete = (cwp, tipo) => {
    setSelectedCWPForPaquete(cwp);
    setPaqueteForm({
      nombre: '',
      tipo: tipo,
      responsable: 'Firma'
    });
    setShowModalPaquete(true);
  };

  const handleCreatePaquete = async (e) => {
    e.preventDefault();
    
    if (!paqueteForm.nombre) {
      alert("⚠️ Completa el nombre");
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/awp-nuevo/cwp/${selectedCWPForPaquete.id}/paquete`,
        paqueteForm
      );
      
      console.log("✅ Paquete creado:", response.data);
      alert(`✅ ${paqueteForm.tipo} creado: ${response.data.codigo}`);
      
      setShowModalPaquete(false);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando Paquete:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // ✨ CREAR ITEM
  // ============================================================================
  
  const openModalItem = async (paquete) => {
    setSelectedPaqueteForItem(paquete);
    
    // Cargar tipos disponibles según la disciplina del CWP
    try {
      const response = await axios.get(
        `${API_URL}/awp-nuevo/cwp/${paquete.cwp_id}/tipos-entregables-disponibles`
      );
      setTiposDisponibles(response.data);
      
      setItemForm({
        nombre: '',
        tipo_entregable_id: response.data[0]?.id || '',
        responsable: 'Firma'
      });
      
      setShowModalItem(true);
    } catch (error) {
      console.error("Error cargando tipos:", error);
      alert("Error cargando tipos de entregable");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    
    if (!itemForm.nombre || !itemForm.tipo_entregable_id) {
      alert("⚠️ Completa todos los campos");
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/awp-nuevo/paquete/${selectedPaqueteForItem.id}/item`,
        itemForm
      );
      
      console.log("✅ Item creado:", response.data);
      alert(`✅ Item creado: ${response.data.codigo}`);
      
      setShowModalItem(false);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando Item:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">⏳ Cargando jerarquía AWP...</div>
      </div>
    );
  }

  if (!jerarquia || !jerarquia.cwas || jerarquia.cwas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>📭 No hay CWAs creados aún</p>
        <p className="text-sm mt-2">Ve a Configuración para crear CWAs</p>
      </div>
    );
  }

  const displayCWAs = filteredCWAId 
    ? jerarquia.cwas.filter(cwa => cwa.id === filteredCWAId)
    : jerarquia.cwas;

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-700 text-gray-300 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold w-8"></th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Código</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-20">Tipo</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-24">Responsable</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-20">Progreso</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {displayCWAs.map(cwa => {
              const isExpanded = expandedCWAs.has(cwa.id);
              const hasCWPs = cwa.cwps && cwa.cwps.length > 0;

              return (
                <React.Fragment key={`cwa-${cwa.id}`}>
                  {/* ============================================================
                      FILA: CWA
                  ============================================================ */}
                  <tr className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-2 py-2">
                      {hasCWPs && (
                        <button
                          onClick={() => toggleCWA(cwa.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-blue-400 font-medium">{cwa.codigo}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-300">{cwa.nombre}</td>
                    <td className="px-2 py-2">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                        CWA
                      </span>
                    </td>
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => openModalCWP(cwa)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        title="Crear CWP"
                      >
                        + CWP
                      </button>
                    </td>
                  </tr>

                  {/* ============================================================
                      FILAS: CWP (hijos de CWA)
                  ============================================================ */}
                  {isExpanded && hasCWPs && cwa.cwps.map((cwp) => {
                    const isCWPExpanded = expandedCWPs.has(cwp.id);
                    // ✨ NUEVO: Obtener paquetes del nuevo sistema
                    const paquetes = cwp.paquetes || [];
                    const hasPaquetes = paquetes.length > 0;

                    return (
                      <React.Fragment key={`cwp-${cwp.id}`}>
                        <tr className="border-b border-gray-700/50 bg-gray-800/70 hover:bg-gray-750/70">
                          <td className="px-2 py-2 pl-6">
                            {hasPaquetes && (
                              <button
                                onClick={() => toggleCWP(cwp.id)}
                                className="text-green-400 hover:text-green-300 text-xs"
                              >
                                {isCWPExpanded ? '▼' : '▶'}
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-green-400 font-mono text-xs">{cwp.codigo}</span>
                          </td>
                          <td className="px-3 py-2 text-gray-300 text-sm">{cwp.nombre}</td>
                          <td className="px-2 py-2">
                            <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                              CWP
                            </span>
                          </td>
                          <td className="px-2 py-2 text-xs text-gray-500">-</td>
                          <td className="px-2 py-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${cwp.porcentaje_completitud || 0}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => openModalPaquete(cwp, 'EWP')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                                title="+ EWP"
                              >
                                +E
                              </button>
                              <button
                                onClick={() => openModalPaquete(cwp, 'IWP')}
                                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                                title="+ IWP"
                              >
                                +I
                              </button>
                              <button
                                onClick={() => openModalPaquete(cwp, 'PWP')}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs"
                                title="+ PWP"
                              >
                                +P
                              </button>
                              <button
                                onClick={() => openModalPaquete(cwp, 'DWP')}
                                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs"
                                title="+ DWP"
                              >
                                +D
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ============================================================
                            FILAS: PAQUETE (hijos de CWP)
                        ============================================================ */}
                        {isCWPExpanded && paquetes.map(paquete => {
                          const isPaqueteExpanded = expandedPaquetes.has(paquete.id);
                          const items = paquete.items || [];
                          const hasItems = items.length > 0;
                          
                          const colorMap = {
                            'EWP': 'purple',
                            'IWP': 'orange',
                            'PWP': 'teal',
                            'DWP': 'cyan'
                          };
                          const color = colorMap[paquete.tipo] || 'gray';

                          return (
                            <React.Fragment key={`paquete-${paquete.id}`}>
                              <tr className="border-b border-gray-700/30 bg-gray-800/50 hover:bg-gray-750/50">
                                <td className="px-2 py-2 pl-12">
                                  {hasItems && (
                                    <button
                                      onClick={() => togglePaquete(paquete.id)}
                                      className="text-yellow-400 hover:text-yellow-300 text-xs"
                                    >
                                      {isPaqueteExpanded ? '▼' : '▶'}
                                    </button>
                                  )}
                                </td>
                                <td className="px-3 py-2">
                                  <span className={`text-${color}-400 font-mono text-xs`}>
                                    {paquete.codigo}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{paquete.nombre}</td>
                                <td className="px-2 py-2">
                                  <span className={`px-2 py-1 bg-${color}-600/20 text-${color}-300 rounded text-xs`}>
                                    {paquete.tipo}
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-400">{paquete.responsable}</td>
                                <td className="px-2 py-2">
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className={`bg-${color}-600 h-1.5 rounded-full`}
                                      style={{ width: `${paquete.porcentaje_completitud || 0}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() => openModalItem(paquete)}
                                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                                  >
                                    + Item
                                  </button>
                                </td>
                              </tr>

                              {/* ============================================================
                                  FILAS: ITEM (hijos de Paquete)
                              ============================================================ */}
                              {isPaqueteExpanded && items.map(item => (
                                <tr key={`item-${item.id}`} className="border-b border-gray-700/20 bg-gray-800/30 hover:bg-gray-750/30">
                                  <td className="px-2 py-2 pl-16"></td>
                                  <td className="px-3 py-2">
                                    <span className="text-yellow-400 font-mono text-xs">
                                      {item.codigo}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-500 text-xs">{item.nombre}</td>
                                  <td className="px-2 py-2">
                                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs">
                                      Item
                                    </span>
                                  </td>
                                  <td className="px-2 py-2 text-xs text-gray-500">{item.responsable}</td>
                                  <td className="px-2 py-2">
                                    <div className="w-full bg-gray-700 rounded-full h-1">
                                      <div
                                        className="bg-yellow-600 h-1 rounded-full"
                                        style={{ width: `${item.porcentaje_completitud || 0}%` }}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-2">
                                    <button className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">
                                      ✏️
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============================================================================
          MODALES COMPACTOS
      ============================================================================ */}

      {/* Modal: Crear CWP */}
      {showModalCWP && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✨ Crear CWP en {selectedCWAForCWP?.codigo}
            </h3>
            
            <form onSubmit={handleCreateCWP} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={cwpForm.nombre}
                  onChange={(e) => setCwpForm({ ...cwpForm, nombre: e.target.value })}
                  placeholder="Ej: Cimentaciones Patios 5"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Disciplina *</label>
                <select
                  value={cwpForm.disciplina_id}
                  onChange={(e) => setCwpForm({ ...cwpForm, disciplina_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {proyecto.disciplinas?.map(d => (
                    <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalCWP(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Paquete */}
      {showModalPaquete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✨ Crear {paqueteForm.tipo}
            </h3>
            
            <form onSubmit={handleCreatePaquete} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={paqueteForm.nombre}
                  onChange={(e) => setPaqueteForm({ ...paqueteForm, nombre: e.target.value })}
                  placeholder={`Nombre del ${paqueteForm.tipo}`}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Responsable *</label>
                <select
                  value={paqueteForm.responsable}
                  onChange={(e) => setPaqueteForm({ ...paqueteForm, responsable: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="Firma">Firma de Ingeniería</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalPaquete(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear Item */}
      {showModalItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✨ Crear Item
            </h3>
            
            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={itemForm.nombre}
                  onChange={(e) => setItemForm({ ...itemForm, nombre: e.target.value })}
                  placeholder="Nombre del item"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de Entregable *</label>
                <select
                  value={itemForm.tipo_entregable_id}
                  onChange={(e) => setItemForm({ ...itemForm, tipo_entregable_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {tiposDisponibles.map(t => (
                    <option key={t.id} value={t.id}>
                      ({t.disciplina_codigo}) {t.nombre} - {t.codigo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Responsable *</label>
                <select
                  value={itemForm.responsable}
                  onChange={(e) => setItemForm({ ...itemForm, responsable: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="Firma">Firma de Ingeniería</option>
                  <option value="Cliente">Cliente</option>
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowModalItem(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AWPTableConsolidada;