// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Columnas dinámicas (Metadatos configurados en la sección Configuración)
  const [customColumns, setCustomColumns] = useState([]);

  // Estados de expansión del árbol
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  
  // --- ESTADO PARA ITEMS TEMPORALES (La clave del "Relleno Rápido") ---
  // Estructura: { paqueteId: [ { id: 'temp_1', nombre: '' }, ... ] }
  const [pendingItems, setPendingItems] = useState({});
  
  // --- MODALES ---
  const [showModalCWP, setShowModalCWP] = useState(false);
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);

  const [showModalPaquete, setShowModalPaquete] = useState(false);
  
  // Modal para vincular items de otras áreas (Transversales)
  const [showModalLink, setShowModalLink] = useState(false);
  const [transversalItems, setTransversalItems] = useState([]);
  const [selectedLinkItems, setSelectedLinkItems] = useState(new Set());

  // Modal para editar tipo de item (Clasificar)
  const [showModalEditItem, setShowModalEditItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemTipos, setItemTipos] = useState([]);

  // Modal Importación
  const [showModalImport, setShowModalImport] = useState(false);
  
  // Datos temporales
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadData();
  }, [plotPlanId, proyecto.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Cargar columnas personalizadas
      const colsRes = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setCustomColumns(colsRes.data);

      // 2. Cargar jerarquía de datos
      const jerarquiaRes = await client.get(`/awp/plot_plans/${plotPlanId}/jerarquia`);
      setJerarquia(jerarquiaRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoading(false);
    }
  };

  const toggle = (set, id) => {
    const newSet = new Set(set);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    return newSet;
  };

  // ============================================================================
  // 1. LÓGICA DE RELLENO DE ITEMS (BATCH CREATE)
  // ============================================================================

  // Paso 1: Añadir filas vacías visuales
  const addBlankRows = (paqueteId) => {
    const countStr = prompt("¿Cuántos entregables quieres agregar?", "5");
    const count = parseInt(countStr);
    if (isNaN(count) || count <= 0) return;

    const currentList = pendingItems[paqueteId] || [];
    const newRows = Array.from({ length: count }).map((_, i) => ({
      id: `temp_${Date.now()}_${i}`,
      nombre: ''
    }));

    setPendingItems({
      ...pendingItems,
      [paqueteId]: [...currentList, ...newRows]
    });
    // Expandir el CWP automáticamente si no lo está
    // (Esto requeriría saber el ID del padre, lo dejamos manual por ahora)
  };

  // Paso 2: Manejar escritura en los inputs
  const handleItemChange = (paqueteId, tempId, value) => {
    const list = pendingItems[paqueteId].map(item => 
      item.id === tempId ? { ...item, nombre: value } : item
    );
    setPendingItems({ ...pendingItems, [paqueteId]: list });
  };

  // Paso 3: Eliminar fila temporal
  const removeTempRow = (paqueteId, tempId) => {
    const list = pendingItems[paqueteId].filter(item => item.id !== tempId);
    setPendingItems({ ...pendingItems, [paqueteId]: list });
  };

  // Paso 4: Guardar todo el lote
  const saveBatchItems = async (paquete) => {
    const itemsToSave = pendingItems[paquete.id]?.filter(i => i.nombre.trim() !== "") || [];
    if (itemsToSave.length === 0) return;

    try {
      // Enviamos sin tipo_id (ahora es opcional en back)
      await Promise.all(itemsToSave.map(item => 
        client.post(`/awp-nuevo/paquete/${paquete.id}/item`, {
          nombre: item.nombre
          // tipo_entregable_id: null (se envía implícito)
        })
      ));

      // Limpiar estado y recargar
      const newPending = { ...pendingItems };
      delete newPending[paquete.id];
      setPendingItems(newPending);
      
      loadData();
    } catch (error) {
      console.error("Error guardando lote:", error);
      alert("Error al guardar algunos items.");
    }
  };

  // ============================================================================
  // 2. HANDLERS DE GESTIÓN (CWP / PAQUETE)
  // ============================================================================

  // --- CWP ---
  const openCreateCWP = (cwa) => {
    setSelectedParent(cwa);
    setIsEditingCWP(false);
    setEditingCWPId(null);
    setFormData({ nombre: '', disciplina_id: proyecto.disciplinas?.[0]?.id || '', metadata: {} });
    setShowModalCWP(true);
  };

  const openEditCWP = (cwp) => {
    setIsEditingCWP(true);
    setEditingCWPId(cwp.id);
    setFormData({
      nombre: cwp.nombre,
      disciplina_id: cwp.disciplina_id,
      metadata: cwp.metadata_json || {}
    });
    setShowModalCWP(true);
  };

  const handleSaveCWP = async () => {
    try {
      if (isEditingCWP) {
        await client.put(`/awp-nuevo/cwp/${editingCWPId}`, {
          nombre: formData.nombre,
          descripcion: '',
          area_id: 0, // Ignorado al editar
          disciplina_id: formData.disciplina_id,
          metadata_json: formData.metadata
        });
        alert("✅ CWP Actualizado");
      } else {
        await client.post(`/awp-nuevo/cwp`, {
          nombre: formData.nombre,
          descripcion: '',
          area_id: selectedParent.id,
          disciplina_id: formData.disciplina_id,
          metadata_json: formData.metadata
        });
        alert("✅ CWP Creado");
      }
      setShowModalCWP(false);
      loadData();
      if(onDataChange) onDataChange();
    } catch (e) { alert("Error guardando CWP: " + e.message); }
  };

  // --- PAQUETE ---
  const openCreatePaquete = (cwp, tipo) => {
    setSelectedParent(cwp);
    setFormData({ nombre: '', tipo, responsable: 'Firma' });
    setShowModalPaquete(true);
  };

  const handleCreatePaquete = async () => {
    try {
      await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, {
        nombre: formData.nombre,
        tipo: formData.tipo,
        responsable: formData.responsable
      });
      setShowModalPaquete(false);
      loadData();
    } catch (e) { alert("Error creando Paquete"); }
  };

  // --- VINCULACIÓN (LINK TRANSVERSAL) ---
  const openLinkModal = async (pkg) => {
    setSelectedParent(pkg);
    try {
      const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-transversales`);
      setTransversalItems(res.data);
      setSelectedLinkItems(new Set());
      setShowModalLink(true);
    } catch (e) { alert("Error cargando items transversales"); }
  };

  const handleLinkItems = async () => {
    try {
      await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, {
        source_item_ids: Array.from(selectedLinkItems)
      });
      alert("✅ Items vinculados exitosamente");
      setShowModalLink(false);
      loadData();
    } catch (e) { alert("Error vinculando items"); }
  };

  // --- EDICIÓN DE ITEM (CLASIFICAR TIPO) ---
  const openEditItem = async (item, cwpId) => {
    setEditingItem(item);
    try {
      // Traer tipos disponibles para la disciplina del CWP
      const res = await client.get(`/awp-nuevo/cwp/${cwpId}/tipos-entregables-disponibles`);
      setItemTipos(res.data);
      setShowModalEditItem(true);
    } catch (e) { console.error(e); }
  };

  const handleUpdateItem = async () => {
    try {
      await client.put(`/awp-nuevo/item/${editingItem.id}`, {
        tipo_entregable_id: editingItem.tipo_entregable_id
      });
      setShowModalEditItem(false);
      loadData();
    } catch (e) { alert("Error actualizando item"); }
  };

  const handleDeleteItem = async (itemId) => {
    if(!confirm("¿Borrar item?")) return;
    try {
      await client.delete(`/awp-nuevo/item/${itemId}`);
      loadData();
    } catch(e) { alert("Error borrando item"); }
  };

  // ============================================================================
  // 3. IMPORT / EXPORT
  // ============================================================================

  const handleExportAll = () => {
    const url = `${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`;
    window.open(url, '_blank');
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Selecciona un archivo");
    setImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, formData);
      const stats = response.data.detalles;
      
      let msg = `✅ Proceso Finalizado:\n`;
      msg += `- CWPs creados: ${stats.cwp_creados}\n`;
      msg += `- Paquetes creados: ${stats.paquetes_creados}\n`;
      msg += `- Items creados: ${stats.items_creados}\n`;
      
      if (stats.errores && stats.errores.length > 0) {
        msg += `\n⚠️ Errores (${stats.errores.length}):\n` + stats.errores.slice(0, 5).join('\n');
      }
      alert(msg);
      
      setShowModalImport(false);
      setImportFile(null);
      loadData();
      if(onDataChange) onDataChange();
    } catch (error) {
      alert("Error al importar: " + (error.response?.data?.detail || error.message));
    } finally {
      setImporting(false);
    }
  };

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  if (loading) return <div className="p-8 text-center text-gray-400">⏳ Cargando datos AWP...</div>;
  if (!jerarquia?.cwas) return <div className="p-8 text-center">No hay datos.</div>;

  const cwasToRender = filteredCWAId 
    ? jerarquia.cwas.filter(c => c.id === filteredCWAId)
    : jerarquia.cwas;

  return (
    <div className="space-y-4">
      
      {/* BARRA HERRAMIENTAS */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-white font-semibold">Jerarquía AWP</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowModalImport(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex gap-2">
            <span>📤</span> Importar CSV
          </button>
          <button onClick={handleExportAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex gap-2">
            <span>📥</span> Exportar Todo
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase font-bold">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Código / Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Progreso</th>
              {customColumns.map(col => (
                <th key={col.id} className="px-4 py-3 text-blue-300 border-l border-gray-700">{col.nombre}</th>
              ))}
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {cwasToRender.map(cwa => {
              const isExpanded = expandedCWAs.has(cwa.id);
              return (
                <React.Fragment key={cwa.id}>
                  {/* FILA CWA */}
                  <tr className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setExpandedCWAs(toggle(expandedCWAs, cwa.id))} className="text-blue-400 font-bold">
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="text-xs text-gray-500">{cwa.codigo}</div>
                      {cwa.nombre}
                    </td>
                    <td className="px-4 py-3"><span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">CWA</span></td>
                    <td className="px-4 py-3">-</td>
                    {customColumns.map(col => <td key={col.id} className="border-l border-gray-800"></td>)}
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openCreateCWP(cwa)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">+ CWP</button>
                    </td>
                  </tr>

                  {/* FILA CWP */}
                  {isExpanded && cwa.cwps.map(cwp => {
                    const isCwpExpanded = expandedCWPs.has(cwp.id);
                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="bg-gray-800/30 hover:bg-gray-800/60">
                          <td className="px-4 py-3 text-center pl-8">
                            <button onClick={() => setExpandedCWPs(toggle(expandedCWPs, cwp.id))} className="text-green-400 font-bold">
                              {isCwpExpanded ? '▼' : '▶'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-green-500 font-mono">{cwp.codigo}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-200">{cwp.nombre}</span>
                              <button onClick={() => openEditCWP(cwp)} className="text-gray-500 hover:text-yellow-400" title="Editar">✏️</button>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="bg-green-900/50 text-green-300 px-2 py-1 rounded text-xs">CWP</span></td>
                          <td className="px-4 py-3">
                            <div className="w-20 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full" style={{ width: `${cwp.porcentaje_completitud}%` }}></div>
                            </div>
                          </td>
                          
                          {/* Metadatos Dinámicos */}
                          {customColumns.map(col => {
                            const valor = cwp.metadata_json?.[col.nombre] || '-';
                            let badgeColor = "bg-gray-700 text-gray-200";
                            if (String(valor).toLowerCase().includes("parada")) badgeColor = "bg-red-900 text-red-200";
                            if (String(valor).toLowerCase().includes("preparada")) badgeColor = "bg-green-900 text-green-200";
                            return (
                              <td key={col.id} className="px-4 py-3 border-l border-gray-700 text-xs">
                                <span className={`${badgeColor} px-2 py-0.5 rounded border border-gray-600`}>{valor}</span>
                              </td>
                            );
                          })}

                          <td className="px-4 py-3 text-right flex justify-end gap-1">
                            <button onClick={() => openCreatePaquete(cwp, 'EWP')} className="px-1 py-0.5 bg-purple-600 text-white text-[10px] rounded">+E</button>
                            <button onClick={() => openCreatePaquete(cwp, 'PWP')} className="px-1 py-0.5 bg-teal-600 text-white text-[10px] rounded">+P</button>
                            <button onClick={() => openCreatePaquete(cwp, 'IWP')} className="px-1 py-0.5 bg-orange-600 text-white text-[10px] rounded">+I</button>
                          </td>
                        </tr>

                        {/* FILA PAQUETE (EWP/IWP) */}
                        {isCwpExpanded && cwp.paquetes.map(pkg => (
                          <React.Fragment key={pkg.id}>
                            <tr className="bg-gray-900/50 text-xs text-gray-400 border-b border-gray-800">
                              <td className="pl-12"></td>
                              <td className="px-4 py-2 border-l-2 border-gray-700">
                                <span className="text-purple-400 mr-2">[{pkg.tipo}]</span>
                                {pkg.codigo}
                              </td>
                              <td colSpan={2 + customColumns.length} className="px-4 py-2">{pkg.nombre}</td>
                              <td className="px-4 py-2 text-right flex justify-end gap-2">
                                <button onClick={() => openLinkModal(pkg)} className="text-blue-400 hover:text-white bg-blue-900/30 px-2 py-1 rounded">🔗 Vincular</button>
                                <button onClick={() => addBlankRows(pkg.id)} className="text-yellow-500 hover:text-white bg-yellow-900/20 px-2 py-1 rounded">+ Lote</button>
                              </td>
                            </tr>

                            {/* LISTADO DE ITEMS */}
                            {pkg.items.map(item => (
                              <tr key={item.id} className="bg-black/20 text-xs border-b border-gray-800">
                                <td className="pl-16"></td>
                                <td className="px-4 py-1 border-l border-gray-700 text-gray-500">
                                  {item.source_item_id ? "🔗 Vinculado" : `ID: ${item.id}`}
                                </td>
                                <td colSpan={1 + customColumns.length} className="px-4 py-1 flex items-center gap-2">
                                  {item.nombre}
                                  {item.archivo_url && <span className="text-blue-400">📎</span>}
                                </td>
                                <td className="px-4 py-1 text-right flex justify-end gap-2">
                                  <button onClick={()=>openEditItem(item, cwp.id)} className="text-gray-500 hover:text-white">
                                    {item.tipo_entregable_codigo ? <span className="bg-gray-700 px-1 rounded">{item.tipo_entregable_codigo}</span> : "Clasificar ✏️"}
                                  </button>
                                  <button onClick={() => handleDeleteItem(item.id)} className="hover:text-red-400">🗑️</button>
                                </td>
                              </tr>
                            ))}

                            {/* FILAS TEMPORALES (RELLENO) */}
                            {pendingItems[pkg.id]?.map(temp => (
                              <tr key={temp.id} className="bg-yellow-900/10 text-xs">
                                <td className="pl-16 text-yellow-600">New</td>
                                <td className="px-4 border-l border-gray-700 text-yellow-500">Pendiente...</td>
                                <td colSpan={2 + customColumns.length} className="px-4 py-1">
                                  <input autoFocus className="w-full bg-gray-800 border border-yellow-700/50 rounded px-2 py-1 text-white" value={temp.nombre} onChange={e=>handleItemChange(pkg.id, temp.id, e.target.value)} onKeyDown={e => { if(e.key==='Enter') saveBatchItems(pkg); }} />
                                </td>
                                <td className="px-4 text-right"><button onClick={()=>removeTempRow(pkg.id, temp.id)} className="text-red-400">✕</button></td>
                              </tr>
                            ))}
                            {pendingItems[pkg.id]?.length > 0 && (
                              <tr className="bg-yellow-900/20"><td colSpan={5+customColumns.length} className="text-center py-2"><button onClick={()=>saveBatchItems(pkg)} className="bg-yellow-600 text-white px-6 rounded shadow font-bold hover:bg-yellow-500">💾 Guardar {pendingItems[pkg.id].length} Items</button></td></tr>
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CWP --- */}
      {showModalCWP && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-96 p-6 rounded-lg border border-gray-600 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">{isEditingCWP ? 'Editar CWP' : 'Nuevo CWP'}</h3>
            <label className="block text-xs text-gray-400 mb-1">Nombre del Paquete</label>
            <input className="w-full mb-3 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            {!isEditingCWP && (
              <>
                <label className="block text-xs text-gray-400 mb-1">Disciplina</label>
                <select className="w-full mb-4 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" value={formData.disciplina_id} onChange={e => setFormData({...formData, disciplina_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {proyecto.disciplinas?.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}
                </select>
              </>
            )}
            {customColumns.length > 0 && (
              <div className="mb-4 border-t border-gray-700 pt-3">
                <p className="text-xs font-bold text-blue-300 mb-2">Etiquetas / Restricciones</p>
                {customColumns.map(col => (
                  <div key={col.id} className="mb-2">
                    <label className="block text-xs text-gray-400 mb-1">{col.nombre}</label>
                    {col.tipo_dato === 'SELECCION' ? (
                      <select className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[col.nombre] || ''} onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, [col.nombre]: e.target.value } })}>
                        <option value="">- Seleccionar -</option>
                        {col.opciones_json?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[col.nombre] || ''} onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, [col.nombre]: e.target.value } })} />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowModalCWP(false)} className="text-gray-400 hover:text-white px-3">Cancelar</button>
              <button onClick={handleSaveCWP} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">{isEditingCWP ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PAQUETE --- */}
      {showModalPaquete && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-gray-800 p-6 rounded w-80"><h3 className="text-white mb-2">Nuevo {formData.tipo}</h3><input className="w-full bg-gray-700 p-2 text-white rounded mb-2" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} /><button onClick={handleCreatePaquete} className="w-full bg-green-600 p-2 rounded text-white font-bold">Crear</button><button onClick={()=>setShowModalPaquete(false)} className="w-full mt-2 text-gray-400">Cancelar</button></div></div>}

      {/* --- MODAL IMPORTAR --- */}
      {showModalImport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-96 border border-gray-700">
            <h3 className="text-white font-bold mb-4">Importar Items (Excel/CSV)</h3>
            <form onSubmit={handleImportItems}>
              <input type="file" accept=".csv,.xlsx" onChange={e => setImportFile(e.target.files[0])} className="w-full mb-4 text-sm text-gray-300" />
              <div className="flex gap-2 justify-end"><button type="button" onClick={()=>setShowModalImport(false)} className="text-gray-400">Cancelar</button><button type="submit" disabled={importing} className="bg-green-600 text-white px-4 py-2 rounded">{importing?"...":"Importar"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL VINCULAR ITEMS --- */}
      {showModalLink && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-[500px] p-6 rounded-lg border border-gray-600 shadow-xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-white mb-2">🔗 Vincular Transversales</h3>
            <p className="text-xs text-gray-400 mb-4">Traer entregables de áreas de diseño (DWP) a construcción.</p>
            <div className="flex-1 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700 mb-4">
              {transversalItems.length===0?<p className="text-center text-gray-500 p-4">No hay items.</p>:transversalItems.map(item=>(
                <div key={item.id} className={`flex items-center p-2 rounded cursor-pointer border mb-1 ${selectedLinkItems.has(item.id)?'border-blue-500 bg-blue-900/20':'border-gray-800'}`} onClick={()=>{const s=new Set(selectedLinkItems);s.has(item.id)?s.delete(item.id):s.add(item.id);setSelectedLinkItems(s)}}>
                  <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${selectedLinkItems.has(item.id)?'bg-blue-500':''}`}>{selectedLinkItems.has(item.id)&&'✓'}</div>
                  <div><p className="text-sm text-white">{item.nombre}</p><p className="text-xs text-gray-500">{item.cwa}</p></div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end"><button onClick={()=>setShowModalLink(false)} className="text-gray-400">Cancelar</button><button onClick={handleLinkItems} className="bg-blue-600 text-white px-4 py-2 rounded">Vincular</button></div>
          </div>
        </div>
      )}

      {/* --- MODAL EDITAR TIPO --- */}
      {showModalEditItem && editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-80 border border-gray-600">
            <h3 className="text-white font-bold mb-2">Clasificar Item</h3>
            <p className="text-sm text-gray-300 mb-4">{editingItem.nombre}</p>
            <select className="w-full bg-gray-700 text-white p-2 rounded mb-4" value={editingItem.tipo_entregable_id||''} onChange={e=>setEditingItem({...editingItem, tipo_entregable_id:e.target.value})}>
              <option value="">- Sin Clasificar -</option>
              {itemTipos.map(t=><option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>)}
            </select>
            <div className="flex gap-2 justify-end"><button onClick={()=>setShowModalEditItem(false)} className="text-gray-400">Cancelar</button><button onClick={handleUpdateItem} className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button></div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AWPTableConsolidada;