import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';

// Iconos SVG simples para la interfaz
const Icons = {
  Edit: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Plus: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>,
  ChevronRight: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>,
  ChevronDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>,
  Save: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Search: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  // --- ESTADOS ---
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customColumns, setCustomColumns] = useState([]);
  
  const [filters, setFilters] = useState({ codigo: '', nombre: '' });
  
  // Sets de expansión
  const [expandedCWAs, setExpandedCWAs] = useState(new Set()); 
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());
  
  // Lógica Batch y Modales
  const [pendingItems, setPendingItems] = useState({});
  const [modals, setModals] = useState({ cwp: false, pkg: false, link: false, import: false, itemEdit: false });
  
  // Estados de Edición
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);
  const [isEditingPkg, setIsEditingPkg] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [editingItemData, setEditingItemData] = useState(null);

  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  // Link
  const [transversalItems, setTransversalItems] = useState([]);
  const [selectedLinkItems, setSelectedLinkItems] = useState(new Set());
  const [linkFilter, setLinkFilter] = useState("ALL");
  const [linkSearch, setLinkSearch] = useState("");

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useEffect(() => { if (proyecto?.id) loadData(); }, [plotPlanId, proyecto.id]);

  const loadData = async () => {
    if (!jerarquia) setLoading(true);
    try {
      const colsRes = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setCustomColumns(colsRes.data);
      const url = `/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`;
      const res = await client.get(url);
      setJerarquia(res.data);
      
      if (!jerarquia && res.data.cwas) {
        const allCwaIds = new Set(res.data.cwas.map(c => c.id));
        setExpandedCWAs(allCwaIds);
        setExpandedCWPs(new Set());
        setExpandedPaquetes(new Set());
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- EXPANSIÓN ---
  const expandLevel1 = () => { if (!jerarquia) return; const allCwaIds = new Set(jerarquia.cwas.map(c => c.id)); setExpandedCWAs(allCwaIds); setExpandedCWPs(new Set()); setExpandedPaquetes(new Set()); };
  const expandLevel2 = () => { if (!jerarquia) return; const allCwaIds = new Set(); const allCwpIds = new Set(); jerarquia.cwas.forEach(cwa => { allCwaIds.add(cwa.id); cwa.cwps?.forEach(cwp => allCwpIds.add(cwp.id)); }); setExpandedCWAs(allCwaIds); setExpandedCWPs(allCwpIds); setExpandedPaquetes(new Set()); };
  const expandLevel3 = () => { if (!jerarquia) return; const allCwaIds = new Set(); const allCwpIds = new Set(); const allPkgIds = new Set(); jerarquia.cwas.forEach(cwa => { allCwaIds.add(cwa.id); cwa.cwps?.forEach(cwp => { allCwpIds.add(cwp.id); cwp.paquetes?.forEach(pkg => allPkgIds.add(pkg.id)); }); }); setExpandedCWAs(allCwaIds); setExpandedCWPs(allCwpIds); setExpandedPaquetes(allPkgIds); };
  const collapseAll = () => { setExpandedCWAs(new Set()); setExpandedCWPs(new Set()); setExpandedPaquetes(new Set()); };

  // --- FILTRADO Y ORDENAMIENTO ---
  const cwasToRender = jerarquia?.cwas?.filter(cwa => {
    const matchText = !filters.codigo || cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase());
    const matchSelection = !filteredCWAId || cwa.id === filteredCWAId;
    return matchText && matchSelection;
  }).sort((a, b) => {
    // ✅ CORRECCIÓN: Usar nullish coalescing (??) para que el 0 no sea tratado como falso
    const pA = a.prioridad ?? 9999; 
    const pB = b.prioridad ?? 9999;
    
    if (pA !== pB) return pA - pB;
    return a.codigo.localeCompare(b.codigo);
  });

  useEffect(() => {
    if (filteredCWAId && jerarquia) {
      setExpandedCWAs(prev => new Set(prev).add(filteredCWAId));
      const cwa = jerarquia.cwas.find(c => c.id === filteredCWAId);
      if (cwa && cwa.cwps) {
        const newExpandedCwps = new Set(expandedCWPs);
        cwa.cwps.forEach(cwp => newExpandedCwps.add(cwp.id));
        setExpandedCWPs(newExpandedCwps);
      }
    }
  }, [filteredCWAId, jerarquia]);

  const toggle = (set, id, setFn) => { const newSet = new Set(set); newSet.has(id) ? newSet.delete(id) : newSet.add(id); setFn(newSet); };
  
  // Actualizaciones en línea
  const updateCWAField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateCWPField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateCWPMetadata = async (id, key, value) => { try { await client.put(`/awp-nuevo/cwp/${id}`, { metadata_json: { [key]: value } }); loadData(); } catch(e) { console.error(e); } };
  const updatePaqueteField = async (id, field, value) => { try { await client.put(`/awp-nuevo/paquete/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };

  // --- HANDLERS MODALES ---
  // (Lógica idéntica, solo renderizado cambia)
  const openCWPModal = (cwa=null, cwp=null) => { if(cwp) { setIsEditingCWP(true); setEditingCWPId(cwp.id); setFormData({ nombre: cwp.nombre, disciplina_id: cwp.disciplina_id, metadata: cwp.metadata_json || {} }); } else { setIsEditingCWP(false); setSelectedParent(cwa); setFormData({ nombre: '', disciplina_id: proyecto.disciplinas?.[0]?.id || '', metadata: {} }); } setModals({...modals, cwp: true}); };
  const handleSaveCWP = async () => { try { const payload = { ...formData, area_id: selectedParent?.id || 0, descripcion: '', metadata_json: formData.metadata }; if(isEditingCWP) await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload); else await client.post(`/awp-nuevo/cwp`, payload); setModals({...modals, cwp: false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: " + e.message); } };
  const handleDeleteCWP = async (id) => { if(!confirm("¿Eliminar CWP?")) return; try { await client.delete(`/awp-nuevo/cwp/${id}`); loadData(); } catch(e) { alert("Error borrando CWP"); } };
  const openPkgModal = (cwp, tipo, pkgToEdit = null) => { setSelectedParent(cwp); if (pkgToEdit) { setIsEditingPkg(true); setEditingPkgId(pkgToEdit.id); setFormData({ nombre: pkgToEdit.nombre, tipo: pkgToEdit.tipo, responsable: 'Firma', forecast_inicio: pkgToEdit.forecast_inicio, forecast_fin: pkgToEdit.forecast_fin }); } else { setIsEditingPkg(false); setFormData({ nombre: '', tipo, responsable: 'Firma', forecast_inicio: getTodayDate(), forecast_fin: getTodayDate() }); } setModals({...modals, pkg: true}); };
  const handleSavePkg = async () => { try { if (isEditingPkg) await client.put(`/awp-nuevo/paquete/${editingPkgId}`, formData); else await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); setModals({...modals, pkg: false}); loadData(); } catch(e) { alert("Error guardando paquete"); } };
  const handleDeletePkg = async (id) => { if(confirm("¿Borrar Paquete?")) { await client.delete(`/awp-nuevo/paquete/${id}`); loadData(); } };
  const openEditItemModal = (item) => { setEditingItemData({ id: item.id, nombre: item.nombre }); setModals({ ...modals, itemEdit: true }); };
  const handleSaveItemEdit = async () => { try { await client.put(`/awp-nuevo/item/${editingItemData.id}`, { nombre: editingItemData.nombre }); setModals({ ...modals, itemEdit: false }); loadData(); } catch(e) { alert("Error actualizando item"); } };
  const handleDeleteItem = async (id) => { if(confirm("¿Borrar item?")) { await client.delete(`/awp-nuevo/item/${id}`); loadData(); } };

  // Batch & Link
  const addBatch = (pkgId) => { const count = parseInt(prompt("Cantidad de items:", "5")) || 0; if(count <= 0) return; const current = pendingItems[pkgId] || []; const newRows = Array.from({length: count}).map((_, i) => ({ id: `temp_${Date.now()}_${i}`, nombre: '' })); setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]}); setExpandedPaquetes(prev => new Set(prev).add(pkgId)); };
  const changeBatch = (pkgId, tempId, val) => { const list = pendingItems[pkgId].map(i => i.id === tempId ? {...i, nombre: val} : i); setPendingItems({...pendingItems, [pkgId]: list}); };
  const handlePasteBatch = (e, pkgId) => { e.preventDefault(); const pasteData = e.clipboardData.getData('text'); if (!pasteData) return; const lines = pasteData.split(/\r\n|\n|\r/).filter(line => line.trim() !== ''); if (lines.length === 0) return; const newRows = lines.map((line, i) => ({ id: `paste_${Date.now()}_${i}`, nombre: line.trim() })); const current = pendingItems[pkgId] || []; setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]}); setExpandedPaquetes(prev => new Set(prev).add(pkgId)); };
  const saveBatch = async (pkg) => { const toSave = pendingItems[pkg.id]?.filter(i => i.nombre.trim()) || []; if(!toSave.length) return; try { await Promise.all(toSave.map(i => client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre }))); const newP = {...pendingItems}; delete newP[pkg.id]; setPendingItems(newP); loadData(); } catch(e) { alert("Error guardando lote"); } };
  const openLinkModal = async (pkg) => { setSelectedParent(pkg); const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); setTransversalItems(res.data); setSelectedLinkItems(new Set()); setLinkFilter("ALL"); setLinkSearch(""); setModals({...modals, link: true}); };
  const handleLinkItems = async () => { await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) }); setModals({...modals, link: false}); loadData(); };
  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');
  const handleImport = async (e) => { e.preventDefault(); if(!importFile) return; setImporting(true); const fd = new FormData(); fd.append('file', importFile); try { await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); alert("Importación exitosa"); setModals({...modals, import: false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: " + (e.response?.data?.detail || e.message)); } finally { setImporting(false); } };
  const handleResetItems = async () => { if(!confirm("¿ESTÁS SEGURO? Borrarás TODOS los items. Irreversible.")) return; try { await client.delete(`/awp-nuevo/proyectos/${proyecto.id}/items-reset`); alert("Items eliminados."); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error al borrar: " + e.message); } };

  if (loading && !jerarquia) return <div className="p-10 text-center text-hatch-blue text-sm">Cargando estructura...</div>;

  return (
    <div className="flex flex-col h-full gap-0 bg-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded-t-lg border border-gray-300 border-b-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-hatch-blue font-bold text-sm">Control AWP</h3>
          <div className="h-4 w-px bg-gray-300"></div>
          
          {/* Botones Nivel */}
          <div className="flex items-center bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <button onClick={expandLevel1} className="px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 border-r border-gray-200 transition-colors" title="Ver solo Áreas">N1</button>
            <button onClick={expandLevel2} className="px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 border-r border-gray-200 transition-colors" title="Ver CWPs">N2</button>
            <button onClick={expandLevel3} className="px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-100 border-r border-gray-200 transition-colors" title="Ver Entregables">N3</button>
            <button onClick={collapseAll} className="px-3 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors" title="Cerrar Todo">✕</button>
          </div>
          
          <button onClick={loadData} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Actualizar">
            <Icons.Save className="w-4 h-4 transform rotate-180" /> {/* Usando icono como refresh temporal */}
            <span className="text-xs ml-1">Sync</span>
          </button>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleResetItems} className="text-red-500 hover:text-red-700 px-3 py-1 rounded text-xs border border-red-200 hover:bg-red-50 font-bold transition-colors">Reset Items</button>
          <button onClick={() => setModals({...modals, import: true})} className="text-gray-600 hover:text-hatch-blue px-3 py-1 rounded text-xs border border-gray-300 hover:bg-gray-50 transition-colors">Importar</button>
          <button onClick={handleExport} className="bg-hatch-blue hover:bg-hatch-blue-dark text-white px-3 py-1 rounded text-xs font-medium shadow-sm transition-colors">Exportar CSV</button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto border border-gray-300 rounded-b-lg bg-white shadow-sm relative">
        <table className="text-left border-collapse relative w-full min-w-max text-xs">
          
          {/* HEADER FIXED */}
          <thead className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 h-9 border-b border-gray-300">
            <tr>
              <th className="w-8 min-w-[32px] sticky left-0 top-0 z-50 bg-gray-50 border-r border-gray-300 text-center"></th>
              <th className="w-80 min-w-[320px] sticky left-8 top-0 z-50 bg-gray-50 border-r border-gray-300 p-1 shadow-sm">
                <div className="flex items-center gap-2 h-full">
                  <span className="pl-1">Jerarquía</span>
                  <div className="relative flex-1">
                    <input className="w-full bg-white border border-gray-300 rounded px-2 py-0.5 text-gray-700 font-normal focus:border-blue-400 outline-none h-6 pl-6" placeholder="Filtrar..." onChange={e => setFilters({...filters, codigo: e.target.value})} />
                    <span className="absolute left-1.5 top-1 text-gray-400"><Icons.Search /></span>
                  </div>
                </div>
              </th>
              <th className="w-20 min-w-[80px] text-center border-r border-gray-200 sticky top-0 z-40 bg-gray-50">Prioridad</th>
              <th className="w-14 min-w-[56px] text-center border-r border-gray-200 sticky top-0 z-40 bg-gray-50">Seq.</th>
              <th className="w-48 min-w-[192px] text-center border-r border-gray-200 sticky top-0 z-40 bg-gray-50">Forecasts (Inicio ➝ Fin)</th>
              {customColumns.map(c => (
                <th key={c.id} className="px-2 border-r border-gray-200 w-32 min-w-[128px] whitespace-normal break-words sticky top-0 z-40 bg-gray-50 align-middle py-1">
                  {c.nombre}
                </th>
              ))}
              <th className="w-32 min-w-[128px] text-right pr-3 sticky top-0 z-40 bg-gray-50">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {cwasToRender?.map(cwa => {
              const isExp = expandedCWAs.has(cwa.id);
              const rowBg = filteredCWAId === cwa.id ? 'bg-yellow-50' : 'bg-white';
              // Sticky classes para mantener la izquierda fija
              const stickyClass = `sticky left-0 z-30 ${rowBg} border-r border-gray-300 align-top`;
              const stickyClass2 = `sticky left-8 z-30 ${rowBg} border-r border-gray-300 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] align-top`;

              return (
                <React.Fragment key={cwa.id}>
                  {/* CWA ROW */}
                  <tr className={`hover:bg-gray-50 group transition-colors ${filteredCWAId === cwa.id ? 'border-l-4 border-yellow-400' : ''}`}>
                    <td className={`p-1 text-center ${stickyClass}`}>
                      <button onClick={() => toggle(expandedCWAs, cwa.id, setExpandedCWAs)} className="w-full h-6 flex items-center justify-center text-gray-400 hover:text-hatch-blue transition-colors">
                        {isExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                      </button>
                    </td>
                    <td className={`p-2 ${stickyClass2}`}>
                      <div className="flex flex-col justify-center h-full">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 rounded font-bold border ${cwa.es_transversal ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                {cwa.es_transversal ? 'DWP' : 'CWA'}
                            </span>
                            <span className="font-mono font-bold text-gray-900">{cwa.codigo}</span>
                        </div>
                        <span className="text-gray-500 text-[10px] mt-0.5 leading-tight">{cwa.nombre}</span>
                      </div>
                    </td>
                    {/* PRIORIDAD NUMÉRICA */}
                    <td className={`p-1 align-top ${rowBg} border-r border-gray-100`}>
                        <input 
                            type="number"
                            className="w-full border border-transparent hover:border-gray-300 focus:border-blue-400 rounded text-center text-xs h-7 bg-transparent focus:bg-white transition-colors font-medium text-gray-700"
                            value={cwa.prioridad ?? 0}
                            onChange={e => updateCWAField(cwa.id, 'prioridad', e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                    </td>
                    <td colSpan={2 + customColumns.length} className={`p-2 text-[10px] text-gray-400 italic align-top ${rowBg} border-r border-gray-100`}>
                        {cwa.plot_plan_nombre}
                    </td>
                    <td className={`p-1.5 text-right align-top ${rowBg}`}>
                      <button onClick={() => openCWPModal(cwa)} className="text-[10px] bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 px-2 py-1 rounded shadow-sm transition-all flex items-center gap-1 ml-auto">
                        <Icons.Plus /> CWP
                      </button>
                    </td>
                  </tr>

                  {/* CWP ROW */}
                  {isExp && cwa.cwps.sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0)).map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    const cwpBg = 'bg-gray-50/30'; // Fondo sutil
                    const stickyCwp = `sticky left-0 z-30 ${cwpBg} align-top`;
                    const stickyCwp2 = `sticky left-8 z-30 ${cwpBg} border-r border-gray-300 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] align-top pl-5`;

                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="hover:bg-gray-50 border-t border-gray-100 group/cwp">
                          <td className={stickyCwp}></td>
                          <td className={`p-1.5 ${stickyCwp2}`}>
                            <div className="flex items-start gap-2 border-l-2 border-gray-300 pl-2">
                              <button onClick={() => toggle(expandedCWPs, cwp.id, setExpandedCWPs)} className="text-gray-400 hover:text-hatch-blue mt-0.5">
                                {isCwpExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                              </button>
                              <div className="flex flex-col w-full">
                                <span className="text-green-700 font-mono text-[10px] font-bold">{cwp.codigo}</span>
                                <span className="text-gray-500 text-[10px] leading-tight">{cwp.nombre}</span>
                              </div>
                            </div>
                          </td>
                          <td className={`p-1 align-top ${cwpBg} border-r border-gray-100`}></td>
                          {/* SECUENCIA */}
                          <td className={`p-1 align-top ${cwpBg} border-r border-gray-100`}>
                            <input type="number" className="w-full border border-transparent hover:border-gray-300 focus:border-blue-400 rounded text-center text-xs h-6 bg-transparent focus:bg-white" value={cwp.secuencia ?? 0} onChange={e => updateCWPField(cwp.id, 'secuencia', e.target.value)} />
                          </td>
                          <td className={`p-1 align-top ${cwpBg} border-r border-gray-100`}></td>
                          
                          {/* METADATOS */}
                          {customColumns.map(c => (
                            <td key={c.id} className={`p-1 border-r border-gray-100 align-top ${cwpBg}`}>
                              {c.tipo_dato === 'SELECCION' ? (
                                <select className="w-full border border-transparent hover:border-gray-300 focus:border-blue-400 rounded text-[10px] h-6 bg-transparent focus:bg-white" value={cwp.metadata_json?.[c.nombre] || ''} onChange={e => updateCWPMetadata(cwp.id, c.nombre, e.target.value)}>
                                    <option value="">-</option>{c.opciones_json?.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                              ) : (
                                <input className="w-full border border-transparent hover:border-gray-300 focus:border-blue-400 rounded text-[10px] h-6 bg-transparent focus:bg-white px-1" value={cwp.metadata_json?.[c.nombre] || ''} onChange={e => updateCWPMetadata(cwp.id, c.nombre, e.target.value)} />
                              )}
                            </td>
                          ))}
                          
                          {/* ACCIONES CWP */}
                          <td className={`p-1 text-right align-top ${cwpBg}`}>
                            <div className="flex justify-end gap-1 items-center opacity-40 group-hover/cwp:opacity-100 transition-opacity">
                              <button onClick={() => openCWPModal(null, cwp)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Icons.Edit /></button>
                              <button onClick={() => handleDeleteCWP(cwp.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Icons.Trash /></button>
                              
                              <div className="h-4 w-px bg-gray-300 mx-1"></div>
                              
                              <div className="flex gap-1">
                                <button onClick={() => openPkgModal(cwp, 'EWP')} className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 rounded hover:bg-purple-100">+E</button>
                                <button onClick={() => openPkgModal(cwp, 'PWP')} className="text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-200 px-1.5 rounded hover:bg-teal-100">+P</button>
                                <button onClick={() => openPkgModal(cwp, 'IWP')} className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 rounded hover:bg-orange-100">+I</button>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* PAQUETES ROW */}
                        {isCwpExp && cwp.paquetes.map(pkg => {
                          const isPkgExp = expandedPaquetes.has(pkg.id);
                          const pkgBg = 'bg-white';
                          const stickyPkg = `sticky left-0 z-30 ${pkgBg} align-top`;
                          const stickyPkg2 = `sticky left-8 z-30 ${pkgBg} border-r border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top pl-10`;

                          return (
                            <React.Fragment key={pkg.id}>
                              <tr className="hover:bg-gray-50 border-t border-gray-100 group/pkg">
                                <td className={stickyPkg}></td>
                                <td className={`p-1.5 ${stickyPkg2}`}>
                                  <div className="flex items-start gap-2 border-l-2 border-gray-200 pl-2">
                                    <button onClick={() => toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} className="text-gray-300 hover:text-hatch-orange mt-0.5">
                                      {isPkgExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                                    </button>
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className={`text-[8px] px-1.5 rounded-sm font-bold border ${pkg.tipo === 'EWP' ? 'bg-purple-50 text-purple-700 border-purple-200' : pkg.tipo === 'PWP' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{pkg.tipo}</span>
                                            <span className="font-mono text-[10px] text-gray-600">{pkg.codigo}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 leading-tight">{pkg.nombre}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className={`p-1 ${pkgBg} border-r border-gray-100`}></td>
                                <td className={`p-1 ${pkgBg} border-r border-gray-100`}></td>
                                
                                {/* FECHAS PAQUETE */}
                                <td className={`p-1 align-top ${pkgBg} border-r border-gray-100`}>
                                    <div className="flex flex-col gap-1 pt-1">
                                        <div className="flex items-center">
                                            <span className="text-[8px] text-gray-400 w-6">In:</span>
                                            <input type="date" className="border border-transparent hover:border-gray-300 rounded w-full text-[9px] px-1 bg-transparent focus:bg-white h-5" value={pkg.forecast_inicio?.split('T')[0] || ''} onChange={e => updatePaqueteField(pkg.id, 'forecast_inicio', e.target.value)} />
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-[8px] text-gray-400 w-6">Fin:</span>
                                            <input type="date" className="border border-transparent hover:border-gray-300 rounded w-full text-[9px] px-1 bg-transparent focus:bg-white h-5" value={pkg.forecast_fin?.split('T')[0] || ''} onChange={e => updatePaqueteField(pkg.id, 'forecast_fin', e.target.value)} />
                                        </div>
                                    </div>
                                </td>

                                {customColumns.map(c => <td key={c.id} className={`p-1 border-r border-gray-100 ${pkgBg}`}></td>)}
                                
                                <td className={`p-1 text-right align-top ${pkgBg}`}>
                                  <div className="flex justify-end gap-2 opacity-0 group-hover/pkg:opacity-100 transition-opacity pt-1 pr-1">
                                    <button onClick={() => openPkgModal(cwp, pkg.tipo, pkg)} className="text-gray-400 hover:text-blue-500" title="Editar"><Icons.Edit /></button>
                                    <button onClick={() => handleDeletePkg(pkg.id)} className="text-gray-400 hover:text-red-600" title="Borrar"><Icons.Trash /></button>
                                    <button onClick={() => openLinkModal(pkg)} className="text-blue-500 hover:text-blue-700 text-[10px] font-medium flex items-center gap-1"><Icons.Link /> Link</button>
                                    <button onClick={() => addBatch(pkg.id)} className="text-hatch-orange font-bold text-[10px] flex items-center gap-1"><Icons.Plus /> Item</button>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* ITEMS ROW */}
                              {isPkgExp && (
                                <>
                                  {pkg.items.map(item => {
                                    const itemBg = 'bg-gray-50/20';
                                    const stickyItem = `sticky left-0 z-30 ${itemBg} align-top`;
                                    const stickyItem2 = `sticky left-8 z-30 ${itemBg} border-r border-gray-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top pl-16`;

                                    return (
                                      <tr key={item.id} className="hover:bg-blue-50/30 border-t border-gray-50 group/item">
                                        <td className={stickyItem}></td>
                                        <td className={`p-1.5 ${stickyItem2}`}>
                                          <div className="flex flex-col border-l-2 border-gray-200 pl-2">
                                            <div className="flex justify-between items-start">
                                                <span className="text-gray-700 font-medium text-[10px] leading-tight">{item.nombre}</span>
                                                {item.source_item_id ? (
                                                    <span className="text-[8px] text-blue-500 bg-blue-50 px-1 rounded border border-blue-100 ml-1 whitespace-nowrap">🔗 {item.source_item_id}</span>
                                                ) : (
                                                    <span className="text-[8px] text-gray-300 font-mono ml-1">#{item.id}</span>
                                                )}
                                            </div>
                                          </div>
                                        </td>
                                        <td colSpan={3} className={`p-1 ${itemBg} border-r border-gray-100`}></td>
                                        {customColumns.map(c => <td key={c.id} className={`border-r border-gray-100 ${itemBg}`}></td>)}
                                        <td className={`p-1.5 text-right align-top ${itemBg}`}>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => openEditItemModal(item)} className="text-gray-300 hover:text-blue-500"><Icons.Edit /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Icons.Trash /></button>
                                            </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  
                                  {/* BATCH INPUT */}
                                  {pendingItems[pkg.id]?.map(t => (
                                    <tr key={t.id} className="bg-yellow-50/50 text-xs">
                                      <td className="sticky left-0 z-30 bg-yellow-50"></td>
                                      <td className="p-1 pl-16 sticky left-8 z-30 bg-yellow-50 border-r border-gray-300">
                                        <div className="flex items-center gap-2 text-yellow-700 font-bold text-[10px]">
                                            <span className="animate-pulse">⚡</span> Nuevo
                                        </div>
                                      </td>
                                      <td colSpan={3} className="p-1 bg-yellow-50/20">
                                        <input 
                                            autoFocus 
                                            className="w-full border border-yellow-300 rounded text-[10px] px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400" 
                                            value={t.nombre} 
                                            onChange={e => changeBatch(pkg.id, t.id, e.target.value)} 
                                            onPaste={(e) => handlePasteBatch(e, pkg.id)} 
                                            placeholder="Nombre..." 
                                        />
                                      </td>
                                      <td colSpan={customColumns.length}></td>
                                      <td className="p-1 text-right">
                                        <button onClick={() => setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i => i.id !== t.id)})} className="text-red-400 hover:text-red-600 px-1">✕</button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* SAVE BUTTON */}
                                  {pendingItems[pkg.id]?.length > 0 && (
                                    <tr className="bg-yellow-50/30 border-b border-yellow-200">
                                      <td colSpan="100%" className="text-center p-1.5">
                                        <button onClick={() => saveBatch(pkg)} className="bg-gradient-orange text-white font-bold px-6 py-1 rounded text-[10px] shadow-sm hover:shadow-md transition-all flex items-center gap-2 mx-auto">
                                            <Icons.Save /> GUARDAR ({pendingItems[pkg.id].length})
                                        </button>
                                      </td>
                                    </tr>
                                  )}
                                </>
                              )}
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

      {/* ... (MODALES: CWP, PKG, LINK, IMPORT, EDIT ITEM) ... */}
      {/* (Se mantienen igual que antes, solo asegúrate de copiarlos si ya los tenías en el archivo anterior) */}
      {modals.cwp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-[400px] p-4 rounded shadow-lg border border-gray-300">
                <h3 className="font-bold text-hatch-blue mb-3 text-sm">{isEditingCWP ? 'Editar CWP' : 'Crear CWP'}</h3>
                <input className="w-full border p-2 rounded text-sm mb-2" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                {!isEditingCWP && (
                    <select className="w-full border p-2 rounded text-sm mb-2" value={formData.disciplina_id} onChange={e => setFormData({...formData, disciplina_id: e.target.value})}>
                        <option value="">Disciplina...</option>
                        {proyecto.disciplinas?.map(d => <option key={d.id} value={d.id}>{d.codigo}</option>)}
                    </select>
                )}
                {customColumns.length > 0 && (
                    <div className="border-t pt-2 mt-2">
                        <p className="text-xs font-bold text-gray-500 mb-1">Metadatos</p>
                        {customColumns.map(c => (
                            <div key={c.id} className="mb-1">
                                <label className="text-[10px] block text-gray-600">{c.nombre}</label>
                                <input className="w-full border p-1 rounded text-xs" value={formData.metadata?.[c.nombre] || ''} onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})} />
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => setModals({...modals, cwp: false})} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                    <button onClick={handleSaveCWP} className="text-xs bg-hatch-orange text-white px-3 py-1.5 rounded hover:bg-orange-600">Guardar</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Modales PKG, LINK, ITEM, IMPORT (Iguales al código anterior, compactos) */}
      {modals.pkg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded w-80 shadow-lg">
            <h3 className="font-bold text-sm mb-2 text-hatch-blue">{isEditingPkg ? 'Editar Paquete' : `Nuevo ${formData.tipo}`}</h3>
            <input className="w-full border p-1.5 rounded text-sm mb-3" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div><label className="text-[10px] text-gray-500">Inicio</label><input type="date" className="w-full border p-1 rounded text-xs" value={formData.forecast_inicio || ''} onChange={e => setFormData({...formData, forecast_inicio: e.target.value})} /></div>
                <div><label className="text-[10px] text-gray-500">Fin</label><input type="date" className="w-full border p-1 rounded text-xs" value={formData.forecast_fin || ''} onChange={e => setFormData({...formData, forecast_fin: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModals({...modals, pkg: false})} className="text-xs text-gray-500">Cancelar</button>
              <button onClick={handleSavePkg} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">Guardar</button>
            </div>
          </div>
        </div>
      )}
      
      {modals.link && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[600px] h-[80vh] p-4 rounded flex flex-col shadow-lg">
            <h3 className="font-bold text-sm mb-2 text-hatch-blue">Vincular Items</h3>
            
            {/* BARRA SUPERIOR MODAL */}
            <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs pl-7 focus:border-hatch-orange outline-none"
                        placeholder="Buscar por nombre o código..."
                        value={linkSearch}
                        onChange={(e) => setLinkSearch(e.target.value)}
                    />
                    <span className="absolute left-2 top-1 text-gray-400 text-xs"><Icons.Search /></span>
                </div>
                <div className="flex bg-gray-100 rounded p-0.5 border border-gray-300">
                    <button onClick={() => setLinkFilter("ALL")} className={`px-3 py-0.5 text-[10px] rounded ${linkFilter==="ALL" ? 'bg-white text-hatch-blue shadow-sm' : 'text-gray-500'}`}>Todos</button>
                    <button onClick={() => setLinkFilter("TRANSVERSAL")} className={`px-3 py-0.5 text-[10px] rounded ${linkFilter==="TRANSVERSAL" ? 'bg-white text-hatch-blue shadow-sm' : 'text-gray-500'}`}>Transversales</button>
                </div>
            </div>

            {/* LISTA FILTRADA */}
            <div className="flex-1 overflow-y-auto border p-2 rounded bg-gray-50">
                {transversalItems.filter(i => {
                    const matchesFilter = linkFilter === "ALL" || i.es_transversal;
                    const matchesSearch = i.nombre.toLowerCase().includes(linkSearch.toLowerCase()) || 
                                          (i.paquete && i.paquete.toLowerCase().includes(linkSearch.toLowerCase()));
                    return matchesFilter && matchesSearch;
                }).map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => toggle(selectedLinkItems, item.id, setSelectedLinkItems)} 
                        className={`text-xs p-2 mb-1 rounded border cursor-pointer flex justify-between items-center ${selectedLinkItems.has(item.id) ? 'bg-blue-50 border-blue-400' : 'bg-white hover:border-gray-400'}`}
                    >
                        <div>
                            <span className="font-bold text-hatch-blue">{item.nombre}</span>
                            <span className="text-gray-400 ml-2">({item.cwa} ➝ {item.paquete})</span>
                        </div>
                        {selectedLinkItems.has(item.id) && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
                <button onClick={() => setModals({...modals, link: false})} className="text-xs text-gray-500 px-3 py-1 hover:bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleLinkItems} disabled={selectedLinkItems.size === 0} className="text-xs bg-hatch-orange text-white px-4 py-1 rounded disabled:opacity-50">
                    Vincular ({selectedLinkItems.size})
                </button>
            </div>
          </div>
        </div>
      )}

      {modals.itemEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-4 rounded w-80 shadow-lg">
                <h3 className="font-bold text-sm mb-2">Editar Item</h3>
                <input className="w-full border p-1.5 rounded text-sm mb-3" value={editingItemData?.nombre || ''} onChange={e => setEditingItemData({...editingItemData, nombre: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setModals({...modals, itemEdit: false})} className="text-xs text-gray-500">Cancelar</button>
                    <button onClick={handleSaveItemEdit} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">Guardar</button>
                </div>
            </div>
        </div>
      )}
      
      {modals.import && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded w-96 shadow-lg">
                <h3 className="font-bold text-sm mb-2">Importar CSV</h3>
                <input type="file" className="text-xs mb-4" onChange={e => setImportFile(e.target.files[0])} />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setModals({...modals, import: false})} className="text-xs text-gray-500">Cancelar</button>
                    <button onClick={handleImport} disabled={!importFile || importing} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">
                        {importing ? '...' : 'Subir'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default AWPTableConsolidada;