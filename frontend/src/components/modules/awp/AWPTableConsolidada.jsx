// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
// Ruta relativa estándar que funciona en tu entorno
import client from '../../../api/axios';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [customColumns, setCustomColumns] = useState([]);

  // Estados de expansión
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  
  // Items temporales
  const [pendingItems, setPendingItems] = useState({});
  
  // Modales
  const [showModalCWP, setShowModalCWP] = useState(false);
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);

  const [showModalPaquete, setShowModalPaquete] = useState(false);
  const [showModalLink, setShowModalLink] = useState(false);
  const [showModalImport, setShowModalImport] = useState(false);
  const [showModalEditItem, setShowModalEditItem] = useState(false);
  
  // Datos temporales para formularios
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Datos para modales complejos
  const [transversalItems, setTransversalItems] = useState([]);
  const [selectedLinkItems, setSelectedLinkItems] = useState(new Set());
  const [linkFilter, setLinkFilter] = useState("ALL");
  const [editingItem, setEditingItem] = useState(null);
  const [itemTipos, setItemTipos] = useState([]);

  // Filtros
  const [filters, setFilters] = useState({ codigo: '' });

  useEffect(() => {
    loadData();
  }, [plotPlanId, proyecto.id]);

  const loadData = async () => {
    if (!jerarquia) setLoading(true);
    try {
      const colsRes = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setCustomColumns(colsRes.data);

      const url = plotPlanId 
        ? `/awp/plot_plans/${plotPlanId}/jerarquia` 
        : `/awp/plot_plans/${proyecto.plot_plans?.[0]?.id || 0}/jerarquia`; 

      const res = await client.get(url);
      setJerarquia(res.data);
      
      if (loading && res.data.cwas) {
        setExpandedCWAs(new Set(res.data.cwas.map(c => c.id)));
        const allCwps = new Set();
        res.data.cwas.forEach(c => c.cwps?.forEach(p => allCwps.add(p.id)));
        setExpandedCWPs(allCwps);
      }

    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (set, id) => {
    const newSet = new Set(set);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    return newSet;
  };

  // --- HANDLERS CWP ---
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
      const payload = { 
        nombre: formData.nombre,
        descripcion: '',
        area_id: isEditingCWP ? 0 : selectedParent.id,
        disciplina_id: formData.disciplina_id,
        metadata_json: formData.metadata
      };
      if (isEditingCWP) {
        await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload);
        alert("✅ CWP Actualizado");
      } else {
        await client.post(`/awp-nuevo/cwp`, payload);
        alert("✅ CWP Creado");
      }
      setShowModalCWP(false);
      loadData();
      if(onDataChange) onDataChange();
    } catch (e) { alert("Error guardando CWP: " + e.message); }
  };

  const handleDeleteCWP = async (id) => {
    if(!confirm("¿Eliminar este CWP y todo su contenido?")) return;
    try {
        await client.delete(`/awp-nuevo/cwp/${id}`);
        loadData();
    } catch(e) { alert("Error al eliminar CWP"); }
  };

  const updateCWPField = async (id, field, value) => {
    try {
        await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value });
        loadData();
    } catch(e) { console.error(e); }
  };
  
  const updateCWAField = async (id, field, value) => {
    try {
        await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value });
        loadData();
    } catch(e) { console.error(e); }
  };

  // --- HANDLERS PAQUETE ---
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

  const handleDeletePaquete = async (id) => {
    if(!confirm("¿Eliminar Paquete?")) return;
    try {
        await client.delete(`/awp-nuevo/paquete/${id}`);
        loadData();
    } catch(e) { alert("Error eliminando paquete"); }
  };

  // --- HANDLERS ITEMS ---
  const addBlankRows = (paqueteId) => {
    const countStr = prompt("¿Cuántos entregables quieres agregar?", "5");
    const count = parseInt(countStr);
    if (isNaN(count) || count <= 0) return;
    const currentList = pendingItems[paqueteId] || [];
    const newRows = Array.from({ length: count }).map((_, i) => ({ id: `temp_${Date.now()}_${i}`, nombre: '' }));
    setPendingItems({ ...pendingItems, [paqueteId]: [...currentList, ...newRows] });
  };

  const handleItemChange = (paqueteId, tempId, value) => {
    const list = pendingItems[paqueteId].map(item => item.id === tempId ? { ...item, nombre: value } : item);
    setPendingItems({ ...pendingItems, [paqueteId]: list });
  };

  const removeTempRow = (paqueteId, tempId) => {
    const list = pendingItems[paqueteId].filter(item => item.id !== tempId);
    setPendingItems({ ...pendingItems, [paqueteId]: list });
  };

  const saveBatchItems = async (paquete) => {
    const itemsToSave = pendingItems[paquete.id]?.filter(i => i.nombre.trim() !== "") || [];
    if (itemsToSave.length === 0) return;
    try {
      await Promise.all(itemsToSave.map(item => 
        client.post(`/awp-nuevo/paquete/${paquete.id}/item`, { nombre: item.nombre })
      ));
      const newPending = { ...pendingItems };
      delete newPending[paquete.id];
      setPendingItems(newPending);
      loadData();
    } catch (error) {
      alert("Error al guardar algunos items.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if(!confirm("¿Borrar item?")) return;
    try {
      await client.delete(`/awp-nuevo/item/${itemId}`);
      loadData();
    } catch(e) { alert("Error borrando item"); }
  };

  // --- LINK & CLASSIFY ---
  const openLinkModal = async (pkg) => {
    setSelectedParent(pkg);
    try {
      const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`);
      setTransversalItems(res.data);
      setSelectedLinkItems(new Set());
      setLinkFilter("ALL");
      setShowModalLink(true);
    } catch (e) { alert("Error cargando items disponibles"); }
  };

  const handleLinkItems = async () => {
    try {
      await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) });
      alert("✅ Items vinculados exitosamente");
      setShowModalLink(false);
      loadData();
    } catch (e) { alert("Error vinculando items"); }
  };

  const openEditItem = async (item, cwpId) => {
    setEditingItem(item);
    try {
      const res = await client.get(`/awp-nuevo/cwp/${cwpId}/tipos-entregables-disponibles`);
      setItemTipos(res.data);
      setShowModalEditItem(true);
    } catch (e) { console.error(e); }
  };

  const handleUpdateItemType = async () => {
    try {
      await client.put(`/awp-nuevo/item/${editingItem.id}`, { tipo_entregable_id: editingItem.tipo_entregable_id });
      setShowModalEditItem(false);
      loadData();
    } catch (e) { alert("Error actualizando item"); }
  };

  const updateItemForecast = async (id, date) => {
    try {
        await client.put(`/awp-nuevo/item/${id}`, { forecast_fin: date });
        loadData();
    } catch(e) { console.error(e); }
  };

  // --- IMPORT / EXPORT ---
  const handleExportAll = () => {
    const url = `${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`;
    window.open(url, '_blank');
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Selecciona un archivo primero");
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, formData);
      const stats = response.data.detalles;
      alert(`✅ Proceso Finalizado: Actualizados: ${stats.items_actualizados}, Creados: ${stats.items_creados}`);
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

  if (loading && !jerarquia) return <div className="p-8 text-center text-gray-400">⏳ Cargando datos AWP...</div>;

  const cwasToRender = jerarquia?.cwas?.filter(cwa => {
    if (filteredCWAId && cwa.id !== filteredCWAId) return false;
    if (filters.codigo && !cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) return false;
    return true;
  }).sort((a,b) => a.codigo.localeCompare(b.codigo));

  return (
    <div className="space-y-4">
      
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-white font-semibold">Jerarquía AWP</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowModalImport(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex gap-2"><span>📤</span> Importar CSV</button>
          <button onClick={handleExportAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex gap-2"><span>📥</span> Exportar Todo</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700 max-h-[80vh]">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-800 text-xs uppercase font-bold sticky top-0 z-10 shadow">
            <tr>
              <th className="px-4 py-3 w-10 bg-gray-800"></th>
              <th className="px-4 py-3 bg-gray-800 min-w-[200px]">Código<input className="w-full bg-gray-700 mt-1 px-1 rounded border border-gray-600 font-normal" placeholder="Filtrar..." onChange={e=>setFilters({...filters, codigo:e.target.value})} /></th>
              <th className="px-4 py-3 w-24 bg-gray-800">Prioridad (Área)</th>
              <th className="px-4 py-3 w-16 bg-gray-800">Seq.</th>
              <th className="px-4 py-3 w-32 bg-gray-800">Forecasts (CWP)</th>
              <th className="px-4 py-3 bg-gray-800">Progreso</th>
              {customColumns.map(col => <th key={col.id} className="px-4 py-3 text-blue-300 border-l border-gray-700 bg-gray-800">{col.nombre}</th>)}
              <th className="px-4 py-3 text-right bg-gray-800">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-900">
            {cwasToRender?.map(cwa => {
              const isExpanded = expandedCWAs.has(cwa.id);
              return (
                <React.Fragment key={cwa.id}>
                  <tr className="hover:bg-gray-800/50 bg-gray-900">
                    <td className="px-4 py-2 text-center"><button onClick={() => setExpandedCWAs(toggle(expandedCWAs, cwa.id))} className="text-blue-400 font-bold">{isExpanded ? '▼' : '▶'}</button></td>
                    <td className="px-4 font-medium text-white"><div className="text-xs text-gray-500">{cwa.codigo}</div>{cwa.nombre}</td>
                    <td className="px-4"><select className={`bg-transparent text-xs font-bold ${cwa.prioridad==='CRITICA'?'text-red-400':cwa.prioridad==='ALTA'?'text-orange-400':'text-gray-400'}`} value={cwa.prioridad || 'MEDIA'} onChange={e=>updateCWAField(cwa.id, 'prioridad', e.target.value)}><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></td>
                    <td className="px-4 text-center">-</td>
                    <td className="px-4">-</td>
                    <td className="px-4">-</td>
                    {customColumns.map(col => <td key={col.id} className="border-l border-gray-800"></td>)}
                    <td className="px-4 text-right"><button onClick={() => openCreateCWP(cwa)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">+ CWP</button></td>
                  </tr>

                  {isExpanded && cwa.cwps.sort((a,b)=>(a.secuencia||0)-(b.secuencia||0)).map(cwp => {
                    const isCwpExpanded = expandedCWPs.has(cwp.id);
                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="bg-gray-800/30 border-t border-gray-700">
                          <td className="pl-8 text-center"><button onClick={() => setExpandedCWPs(toggle(expandedCWPs, cwp.id))} className="text-green-400 font-bold">{isCwpExpanded ? '▼' : '▶'}</button></td>
                          <td className="px-4"><div className="text-xs text-green-500 font-mono">{cwp.codigo}</div><div className="flex items-center gap-2">{cwp.nombre}</div></td>
                          <td className="px-4"></td>
                          <td className="px-4"><input type="number" className="w-10 bg-transparent border-b border-gray-600 text-center text-xs text-white" defaultValue={cwp.secuencia} onBlur={e=>updateCWPField(cwp.id, 'secuencia', e.target.value)} /></td>
                          <td className="px-4 text-xs"><div className="flex gap-1 items-center mb-1"><span className="text-gray-500 w-2">I:</span><input type="date" className="bg-transparent w-24 text-gray-300 border-none p-0" defaultValue={cwp.forecast_inicio?.split('T')[0]} onBlur={e=>updateCWPField(cwp.id, 'forecast_inicio', e.target.value)} /></div><div className="flex gap-1 items-center"><span className="text-gray-500 w-2">F:</span><input type="date" className="bg-transparent w-24 text-gray-300 border-none p-0" defaultValue={cwp.forecast_fin?.split('T')[0]} onBlur={e=>updateCWPField(cwp.id, 'forecast_fin', e.target.value)} /></div></td>
                          <td className="px-4"><div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{ width: `${cwp.porcentaje_completitud}%` }}></div></div><span className="text-xs text-gray-400">{cwp.porcentaje_completitud}%</span></td>
                          {customColumns.map(col => {
                            const valor = cwp.metadata_json?.[col.nombre] || '-';
                            let badgeColor = "bg-gray-700 text-gray-200";
                            if (String(valor).toLowerCase().includes("parada")) badgeColor = "bg-red-900 text-red-200";
                            else if (String(valor).toLowerCase().includes("preparada")) badgeColor = "bg-green-900 text-green-200";
                            return (<td key={col.id} className="px-4 border-l border-gray-700 text-xs"><span className={`${badgeColor} px-2 py-0.5 rounded border border-gray-600`}>{valor}</span></td>);
                          })}
                          <td className="px-4 text-right flex justify-end gap-1"><button onClick={() => openEditCWP(cwp)} className="text-gray-400 hover:text-white">✏️</button><button onClick={() => handleDeleteCWP(cwp.id)} className="text-red-400 hover:text-red-200">🗑️</button><div className="w-px bg-gray-600 mx-1"></div><button onClick={() => openCreatePaquete(cwp, 'EWP')} className="text-[10px] bg-purple-900 text-purple-200 px-1 rounded hover:bg-purple-800">+E</button><button onClick={() => openCreatePaquete(cwp, 'PWP')} className="text-[10px] bg-teal-900 text-teal-200 px-1 rounded hover:bg-teal-800">+P</button><button onClick={() => openCreatePaquete(cwp, 'IWP')} className="text-[10px] bg-orange-900 text-orange-200 px-1 rounded hover:bg-orange-800">+I</button></td>
                        </tr>

                        {isCwpExpanded && cwp.paquetes.map(pkg => (
                          <React.Fragment key={pkg.id}>
                            <tr className="bg-gray-900/50 text-xs text-gray-400 border-b border-gray-800">
                              <td className="pl-12"></td>
                              <td className="px-4 py-2 border-l-2 border-gray-700"><span className="text-purple-400 mr-2">[{pkg.tipo}]</span>{pkg.codigo}</td>
                              <td colSpan={5 + customColumns.length} className="px-4 py-2">{pkg.nombre}</td>
                              <td className="px-4 text-right flex justify-end gap-2"><button onClick={() => handleDeletePaquete(pkg.id)} className="text-red-400 hover:text-red-200 mr-2">🗑️</button><button onClick={() => openLinkModal(pkg)} className="text-blue-400 hover:text-white bg-blue-900/30 px-2 py-1 rounded">🔗 Vincular</button><button onClick={() => addBlankRows(pkg.id)} className="text-yellow-500 hover:text-white bg-yellow-900/20 px-2 py-1 rounded">+ Lote</button></td>
                            </tr>

                            {pkg.items.map(item => (
                              <tr key={item.id} className="bg-black/20 text-xs border-b border-gray-800 hover:bg-black/40">
                                <td className="pl-16"></td>
                                <td className="px-4 py-1 border-l border-gray-700 text-gray-500">{item.source_item_id ? <span className="text-blue-400" title={item.origen_info}>🔗 {item.origen_info}</span> : `ID: ${item.id}`}</td>
                                <td colSpan={2} className="px-4 py-1">{item.nombre} <button onClick={()=>openEditItem(item, cwp.id)} className="ml-2 text-gray-600 hover:text-white">{item.tipo_entregable_codigo ? <span className="bg-gray-800 px-1 rounded border border-gray-600 text-[10px]">{item.tipo_entregable_codigo}</span> : "🏷️"}</button></td>
                                <td></td>
                                <td className="px-4 py-1"><input type="date" className="bg-transparent text-gray-500 w-20 border-none p-0" defaultValue={item.forecast_fin?.split('T')[0]} onBlur={(e)=>updateItemForecast(item.id, e.target.value)} /></td>
                                <td colSpan={1 + customColumns.length}></td>
                                <td className="px-4 text-right"><button onClick={() => handleDeleteItem(item.id)} className="text-gray-600 hover:text-red-400">🗑️</button></td>
                              </tr>
                            ))}

                            {pendingItems[pkg.id]?.map(temp => (
                              <tr key={temp.id} className="bg-yellow-900/10 text-xs">
                                <td className="pl-16 text-yellow-600">New</td>
                                <td className="px-4 border-l border-gray-700 text-yellow-500">Pendiente...</td>
                                <td colSpan={5} className="px-4 py-1"><input autoFocus className="w-full bg-gray-800 border border-yellow-700/50 rounded px-2 py-1 text-white outline-none" value={temp.nombre} onChange={e=>handleItemChange(pkg.id, temp.id, e.target.value)} onKeyDown={e => { if(e.key==='Enter') saveBatchItems(pkg); }} /></td>
                                <td className="px-4 text-right"><button onClick={()=>removeTempRow(pkg.id, temp.id)} className="text-red-400">✕</button></td>
                              </tr>
                            ))}
                            {pendingItems[pkg.id]?.length > 0 && (
                              <tr className="bg-yellow-900/20"><td colSpan={10 + customColumns.length} className="text-center py-1"><button onClick={()=>saveBatchItems(pkg)} className="text-yellow-300 font-bold hover:text-white">💾 Guardar Todo</button></td></tr>
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

      {/* MODAL CWP */}
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
                <p className="text-xs font-bold text-blue-300 mb-2">Metadatos</p>
                {customColumns.map(col => (
                  <div key={col.id} className="mb-2">
                    <label className="block text-xs text-gray-400 mb-1">{col.nombre}</label>
                    {col.tipo_dato === 'SELECCION' ? (
                      <select className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[col.nombre] || ''} onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, [col.nombre]: e.target.value } })}><option value="">- Seleccionar -</option>{col.opciones_json?.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>
                    ) : (
                      <input className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[col.nombre] || ''} onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, [col.nombre]: e.target.value } })} />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-4"><button onClick={() => setShowModalCWP(false)} className="text-gray-400 hover:text-white px-3">Cancelar</button><button onClick={handleSaveCWP} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Guardar</button></div>
          </div>
        </div>
      )}

      {/* MODAL PAQUETE */}
      {showModalPaquete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-80 border border-gray-700">
            <h3 className="text-white font-bold mb-2">Nuevo {formData.tipo}</h3>
            <input className="w-full mb-2 bg-gray-700 p-2 text-white rounded" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <button onClick={handleCreatePaquete} className="w-full bg-green-600 p-2 rounded text-white font-bold">Crear</button>
            <button onClick={() => setShowModalPaquete(false)} className="w-full mt-2 text-gray-400 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR */}
      {showModalImport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-700">
            <h3 className="text-white font-bold mb-4">Importar Items (Round-Trip)</h3>
            <form onSubmit={handleImport}>
              <input type="file" accept=".csv,.xlsx" onChange={e => setImportFile(e.target.files[0])} className="w-full mb-4 text-sm text-gray-300" />
              <div className="flex gap-2 justify-end"><button type="button" onClick={() => setShowModalImport(false)} className="text-gray-400">Cancelar</button><button type="submit" disabled={importing} className="bg-green-600 text-white px-4 py-2 rounded font-bold">{importing ? "..." : "Importar"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LINK ITEMS */}
      {showModalLink && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-[600px] p-6 rounded-lg border border-gray-600 h-[80vh] flex flex-col shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">🔗 Vincular Entregables</h3>
            <div className="flex gap-2 mb-4 text-sm"><button onClick={() => setLinkFilter("ALL")} className={`px-3 py-1 rounded ${linkFilter==="ALL"?'bg-blue-600 text-white':'bg-gray-700 text-gray-300'}`}>Todo el Proyecto</button><button onClick={() => setLinkFilter("TRANSVERSAL")} className={`px-3 py-1 rounded ${linkFilter==="TRANSVERSAL"?'bg-blue-600 text-white':'bg-gray-700 text-gray-300'}`}>Solo Transversales</button></div>
            <div className="flex-1 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700 mb-4">
              {transversalItems.filter(i => linkFilter==="ALL" || i.es_transversal).length === 0 ? <p className="text-gray-500 text-center p-4">No hay items disponibles.</p> : 
                transversalItems.filter(i => linkFilter==="ALL" || i.es_transversal).map(item => (
                  <div key={item.id} className={`flex items-center p-2 border-b border-gray-800 hover:bg-gray-800 cursor-pointer ${selectedLinkItems.has(item.id)?'bg-blue-900/30':''}`} onClick={() => { const s = new Set(selectedLinkItems); s.has(item.id) ? s.delete(item.id) : s.add(item.id); setSelectedLinkItems(s); }}>
                    <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${selectedLinkItems.has(item.id)?'bg-blue-500 border-blue-500':''}`}>{selectedLinkItems.has(item.id)&&'✓'}</div>
                    <div><p className="text-white text-sm">{item.nombre}</p><p className="text-gray-500 text-xs">{item.cwa} ➝ {item.paquete}</p></div>
                  </div>
                ))
              }
            </div>
            <div className="flex gap-2 justify-end"><button onClick={() => setShowModalLink(false)} className="text-gray-400 hover:text-white px-3">Cancelar</button><button onClick={handleLinkItems} disabled={selectedLinkItems.size===0} className="bg-green-600 text-white px-4 py-2 rounded font-bold disabled:opacity-50">Vincular ({selectedLinkItems.size})</button></div>
          </div>
        </div>
      )}

      {/* MODAL EDIT ITEM TYPE */}
      {showModalEditItem && editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded w-80 border border-gray-600 shadow-xl">
            <h3 className="text-white font-bold mb-2">Clasificar Item</h3>
            <p className="text-gray-400 text-sm mb-4">{editingItem.nombre}</p>
            <select className="w-full bg-gray-900 text-white p-2 rounded mb-4 border border-gray-700" value={editingItem.tipo_entregable_id||''} onChange={e=>setEditingItem({...editingItem, tipo_entregable_id:e.target.value})}><option value="">- Sin Tipo -</option>{itemTipos.map(t=><option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>)}</select>
            <div className="flex justify-end gap-2"><button onClick={() => setShowModalEditItem(false)} className="text-gray-400">Cancelar</button><button onClick={handleUpdateItemType} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Guardar</button></div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AWPTableConsolidada;