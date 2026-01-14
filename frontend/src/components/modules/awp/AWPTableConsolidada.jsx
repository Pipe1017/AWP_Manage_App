import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';

// --- ICONOS SVG MINIMALISTAS ---
const Icons = {
  Edit: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Link: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Plus: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>,
  ChevronRight: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>,
  ChevronDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>,
  Save: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Search: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Sync: () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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
  
  // Modales y Edición
  const [pendingItems, setPendingItems] = useState({});
  const [modals, setModals] = useState({ cwp: false, pkg: false, link: false, import: false, itemEdit: false });
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);
  const [isEditingPkg, setIsEditingPkg] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [editingItemData, setEditingItemData] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  
  // Link Logic
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
      
      // Auto-expand si viene cargado por primera vez y hay datos
      if (!jerarquia && res.data.cwas && res.data.cwas.length > 0 && !filteredCWAId) {
        // Opcional: expandir primer nivel por defecto
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- EXPANSIÓN ---
  const expandLevel1 = () => { if (!jerarquia) return; const allCwaIds = new Set(jerarquia.cwas.map(c => c.id)); setExpandedCWAs(allCwaIds); setExpandedCWPs(new Set()); setExpandedPaquetes(new Set()); };
  const expandLevel2 = () => { if (!jerarquia) return; const allCwaIds = new Set(); const allCwpIds = new Set(); jerarquia.cwas.forEach(cwa => { allCwaIds.add(cwa.id); cwa.cwps?.forEach(cwp => allCwpIds.add(cwp.id)); }); setExpandedCWAs(allCwaIds); setExpandedCWPs(allCwpIds); setExpandedPaquetes(new Set()); };
  const expandLevel3 = () => { if (!jerarquia) return; const allCwaIds = new Set(); const allCwpIds = new Set(); const allPkgIds = new Set(); jerarquia.cwas.forEach(cwa => { allCwaIds.add(cwa.id); cwa.cwps?.forEach(cwp => { allCwpIds.add(cwp.id); cwp.paquetes?.forEach(pkg => allPkgIds.add(pkg.id)); }); }); setExpandedCWAs(allCwaIds); setExpandedCWPs(allCwpIds); setExpandedPaquetes(allPkgIds); };
  const collapseAll = () => { setExpandedCWAs(new Set()); setExpandedCWPs(new Set()); setExpandedPaquetes(new Set()); };

  // --- FILTRADO ---
  const cwasToRender = jerarquia?.cwas?.filter(cwa => {
    const matchText = !filters.codigo || cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase());
    const matchSelection = !filteredCWAId || cwa.id === filteredCWAId;
    return matchText && matchSelection;
  }).sort((a, b) => {
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
  
  // Updates
  const updateCWAField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateCWPField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateCWPMetadata = async (id, key, value) => { try { await client.put(`/awp-nuevo/cwp/${id}`, { metadata_json: { [key]: value } }); loadData(); } catch(e) { console.error(e); } };
  const updatePaqueteField = async (id, field, value) => { try { await client.put(`/awp-nuevo/paquete/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };

  // Handlers Modales (Lógica IDÉNTICA al original, resumida)
  const openCWPModal = (cwa=null, cwp=null) => { if(cwp) { setIsEditingCWP(true); setEditingCWPId(cwp.id); setFormData({ nombre: cwp.nombre, disciplina_id: cwp.disciplina_id, metadata: cwp.metadata_json || {} }); } else { setIsEditingCWP(false); setSelectedParent(cwa); setFormData({ nombre: '', disciplina_id: proyecto.disciplinas?.[0]?.id || '', metadata: {} }); } setModals({...modals, cwp: true}); };
  const handleSaveCWP = async () => { try { const payload = { ...formData, area_id: selectedParent?.id || 0, descripcion: '', metadata_json: formData.metadata }; if(isEditingCWP) await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload); else await client.post(`/awp-nuevo/cwp`, payload); setModals({...modals, cwp: false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: " + e.message); } };
  const handleDeleteCWP = async (id) => { if(!confirm("¿Eliminar CWP?")) return; try { await client.delete(`/awp-nuevo/cwp/${id}`); loadData(); } catch(e) { alert("Error borrando CWP"); } };
  const openPkgModal = (cwp, tipo, pkgToEdit = null) => { setSelectedParent(cwp); if (pkgToEdit) { setIsEditingPkg(true); setEditingPkgId(pkgToEdit.id); setFormData({ nombre: pkgToEdit.nombre, tipo: pkgToEdit.tipo, responsable: 'Firma', forecast_inicio: pkgToEdit.forecast_inicio, forecast_fin: pkgToEdit.forecast_fin }); } else { setIsEditingPkg(false); setFormData({ nombre: '', tipo, responsable: 'Firma', forecast_inicio: getTodayDate(), forecast_fin: getTodayDate() }); } setModals({...modals, pkg: true}); };
  const handleSavePkg = async () => { try { if (isEditingPkg) await client.put(`/awp-nuevo/paquete/${editingPkgId}`, formData); else await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); setModals({...modals, pkg: false}); loadData(); } catch(e) { alert("Error guardando paquete"); } };
  const handleDeletePkg = async (id) => { if(confirm("¿Borrar Paquete?")) { await client.delete(`/awp-nuevo/paquete/${id}`); loadData(); } };
  const openEditItemModal = (item) => { setEditingItemData({ id: item.id, nombre: item.nombre }); setModals({ ...modals, itemEdit: true }); };
  const handleSaveItemEdit = async () => { try { await client.put(`/awp-nuevo/item/${editingItemData.id}`, { nombre: editingItemData.nombre }); setModals({ ...modals, itemEdit: false }); loadData(); } catch(e) { alert("Error actualizando item"); } };
  const handleDeleteItem = async (id) => { if(confirm("¿Borrar item?")) { await client.delete(`/awp-nuevo/item/${id}`); loadData(); } };

  // Batch & Link logic
  const addBatch = (pkgId) => { const count = parseInt(prompt("Cantidad de items:", "5")) || 0; if(count <= 0) return; const current = pendingItems[pkgId] || []; const newRows = Array.from({length: count}).map((_, i) => ({ id: `temp_${Date.now()}_${i}`, nombre: '' })); setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]}); setExpandedPaquetes(prev => new Set(prev).add(pkgId)); };
  const changeBatch = (pkgId, tempId, val) => { const list = pendingItems[pkgId].map(i => i.id === tempId ? {...i, nombre: val} : i); setPendingItems({...pendingItems, [pkgId]: list}); };
  const handlePasteBatch = (e, pkgId) => { e.preventDefault(); const pasteData = e.clipboardData.getData('text'); if (!pasteData) return; const lines = pasteData.split(/\r\n|\n|\r/).filter(line => line.trim() !== ''); if (lines.length === 0) return; const newRows = lines.map((line, i) => ({ id: `paste_${Date.now()}_${i}`, nombre: line.trim() })); const current = pendingItems[pkgId] || []; setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]}); setExpandedPaquetes(prev => new Set(prev).add(pkgId)); };
  const saveBatch = async (pkg) => { const toSave = pendingItems[pkg.id]?.filter(i => i.nombre.trim()) || []; if(!toSave.length) return; try { await Promise.all(toSave.map(i => client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre }))); const newP = {...pendingItems}; delete newP[pkg.id]; setPendingItems(newP); loadData(); } catch(e) { alert("Error guardando lote"); } };
  const openLinkModal = async (pkg) => { setSelectedParent(pkg); const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); setTransversalItems(res.data); setSelectedLinkItems(new Set()); setLinkFilter("ALL"); setLinkSearch(""); setModals({...modals, link: true}); };
  const handleLinkItems = async () => { await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) }); setModals({...modals, link: false}); loadData(); };
  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');
  const handleImport = async (e) => { e.preventDefault(); if(!importFile) return; setImporting(true); const fd = new FormData(); fd.append('file', importFile); try { await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); alert("Importación exitosa"); setModals({...modals, import: false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: " + (e.response?.data?.detail || e.message)); } finally { setImporting(false); } };
  const handleResetItems = async () => { if(!confirm("¿ESTÁS SEGURO? Borrarás TODOS los items. Irreversible.")) return; try { await client.delete(`/awp-nuevo/proyectos/${proyecto.id}/items-reset`); alert("Items eliminados."); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error al borrar: " + e.message); } };

  if (loading && !jerarquia) return <div className="p-10 text-center text-gray-400 text-xs animate-pulse">Cargando estructura...</div>;

  return (
    <div className="flex flex-col h-full bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      
      {/* HEADER DE CONTROL */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-gray-800 font-bold text-sm">Control AWP</h3>
            <span className="text-[10px] text-gray-400">Gestión de áreas y paquetes</span>
          </div>
          
          <div className="h-6 w-px bg-gray-200"></div>
          
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button onClick={expandLevel1} className="px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all">Áreas</button>
            <button onClick={expandLevel2} className="px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all">CWPs</button>
            <button onClick={expandLevel3} className="px-3 py-1 text-[10px] font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all">Items</button>
            <button onClick={collapseAll} className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-md transition-all ml-1">✕</button>
          </div>
          
          <button onClick={loadData} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Actualizar">
            <Icons.Sync />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleResetItems} className="text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 font-medium transition-colors">Reset</button>
          <button onClick={() => setModals({...modals, import: true})} className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg text-xs border border-gray-200 hover:bg-gray-50 transition-colors">Importar</button>
          <button onClick={handleExport} className="bg-gray-900 hover:bg-black text-white px-4 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-2">
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE TABLA (SOLUCIÓN SCROLL) */}
      <div className="flex-1 overflow-auto bg-white relative">
        <table className="w-full min-w-max border-collapse text-xs">
          
          {/* HEADERS FIJOS */}
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider h-10 shadow-sm z-50">
            <tr>
              {/* Columna 1: Toggle */}
              <th className="w-8 min-w-[32px] sticky left-0 top-0 z-50 bg-gray-50 border-r border-gray-200 border-b"></th>
              
              {/* Columna 2: Jerarquía (Nombre) */}
              <th className="w-80 min-w-[320px] sticky left-8 top-0 z-50 bg-gray-50 border-r border-gray-200 border-b p-2 text-left shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2 w-full">
                  <span>Estructura</span>
                  <div className="relative flex-1 group">
                    <input 
                      className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-gray-700 font-normal focus:border-blue-400 outline-none pl-7 transition-colors group-hover:border-gray-300" 
                      placeholder="Filtrar..." 
                      onChange={e => setFilters({...filters, codigo: e.target.value})} 
                    />
                    <span className="absolute left-2 top-1.5 text-gray-400"><Icons.Search /></span>
                  </div>
                </div>
              </th>

              {/* Columnas de Datos */}
              <th className="w-20 min-w-[80px] text-center border-r border-b border-gray-200 sticky top-0 z-40 bg-gray-50 px-2">Prioridad</th>
              <th className="w-16 min-w-[64px] text-center border-r border-b border-gray-200 sticky top-0 z-40 bg-gray-50 px-2">Seq.</th>
              <th className="w-48 min-w-[192px] text-center border-r border-b border-gray-200 sticky top-0 z-40 bg-gray-50 px-2">Forecasts (Inicio ➝ Fin)</th>
              
              {customColumns.map(c => (
                <th key={c.id} className="w-32 min-w-[128px] border-r border-b border-gray-200 sticky top-0 z-40 bg-gray-50 px-3 py-1 text-left align-middle break-words">
                  {c.nombre}
                </th>
              ))}
              
              <th className="w-32 min-w-[128px] text-right pr-4 border-b border-gray-200 sticky top-0 z-40 bg-gray-50">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-gray-700">
            {cwasToRender?.map(cwa => {
              const isExp = expandedCWAs.has(cwa.id);
              // Color base de la fila. Si está seleccionada, amarillo claro.
              const baseBg = filteredCWAId === cwa.id ? 'bg-amber-50' : 'bg-white';
              
              // Sticky styles con fondo sólido OBLIGATORIO
              const stickyCol1 = `sticky left-0 z-30 ${baseBg} border-r border-gray-200 align-top`;
              const stickyCol2 = `sticky left-8 z-30 ${baseBg} border-r border-gray-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top`;

              return (
                <React.Fragment key={cwa.id}>
                  {/* --- FILA CWA --- */}
                  <tr className={`group transition-colors hover:bg-gray-50`}>
                    <td className={`p-1 text-center ${stickyCol1}`}>
                      <button onClick={() => toggle(expandedCWAs, cwa.id, setExpandedCWAs)} className="w-full h-8 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors">
                        {isExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                      </button>
                    </td>
                    <td className={`p-2 ${stickyCol2}`}>
                      <div className="flex flex-col justify-center min-h-[32px]">
                        <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border tracking-wide ${cwa.es_transversal ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                {cwa.es_transversal ? 'DWP' : 'CWA'}
                            </span>
                            <span className="font-mono font-bold text-gray-900">{cwa.codigo}</span>
                        </div>
                        <span className="text-gray-500 text-[10px] mt-0.5 truncate">{cwa.nombre}</span>
                      </div>
                    </td>
                    
                    {/* Datos CWA */}
                    <td className={`p-1 align-top border-r border-gray-100 ${baseBg}`}>
                        <input 
                            type="number"
                            className="w-full text-center h-8 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-gray-300 focus:border-blue-400 rounded transition-colors text-gray-700 font-mono"
                            value={cwa.prioridad ?? 0}
                            onChange={e => updateCWAField(cwa.id, 'prioridad', e.target.value)}
                        />
                    </td>
                    <td className={`p-1 align-top border-r border-gray-100 ${baseBg}`}></td>
                    <td className={`p-1 align-top border-r border-gray-100 ${baseBg}`}></td>
                    {customColumns.map(c => <td key={c.id} className={`border-r border-gray-100 ${baseBg}`}></td>)}
                    
                    <td className={`p-2 text-right align-top ${baseBg}`}>
                      <button onClick={() => openCWPModal(cwa)} className="invisible group-hover:visible text-[10px] bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 px-2 py-1 rounded shadow-sm transition-all inline-flex items-center gap-1 ml-auto">
                        <Icons.Plus /> CWP
                      </button>
                    </td>
                  </tr>

                  {/* --- FILAS CWP --- */}
                  {isExp && cwa.cwps.sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0)).map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    const cwpBg = 'bg-gray-50'; // Fondo gris muy claro para diferenciar nivel
                    const stickyCwp1 = `sticky left-0 z-30 ${cwpBg} border-r border-gray-200 align-top`;
                    const stickyCwp2 = `sticky left-8 z-30 ${cwpBg} border-r border-gray-200 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top pl-6`;

                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="group/cwp border-t border-gray-100 hover:bg-gray-100/50">
                          <td className={stickyCwp1}></td>
                          <td className={`p-2 ${stickyCwp2}`}>
                            <div className="flex items-start gap-2 border-l-2 border-gray-300 pl-3">
                              <button onClick={() => toggle(expandedCWPs, cwp.id, setExpandedCWPs)} className="text-gray-400 hover:text-blue-500 mt-0.5">
                                {isCwpExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                              </button>
                              <div className="flex flex-col w-full min-w-0">
                                <span className="text-gray-800 font-mono text-[10px] font-bold truncate">{cwp.codigo}</span>
                                <span className="text-gray-500 text-[10px] truncate">{cwp.nombre}</span>
                              </div>
                            </div>
                          </td>
                          
                          <td className={`border-r border-gray-200 ${cwpBg}`}></td>
                          <td className={`p-1 align-top border-r border-gray-200 ${cwpBg}`}>
                            <input type="number" className="w-full text-center h-7 bg-transparent hover:bg-white border border-transparent hover:border-gray-300 rounded text-xs" value={cwp.secuencia ?? 0} onChange={e => updateCWPField(cwp.id, 'secuencia', e.target.value)} />
                          </td>
                          <td className={`border-r border-gray-200 ${cwpBg}`}></td>
                          
                          {/* Metadatos Dinámicos */}
                          {customColumns.map(c => (
                            <td key={c.id} className={`p-1 border-r border-gray-200 align-top ${cwpBg}`}>
                              {c.tipo_dato === 'SELECCION' ? (
                                <select className="w-full bg-transparent hover:bg-white border border-transparent hover:border-gray-300 rounded text-[10px] h-7 px-1 outline-none" value={cwp.metadata_json?.[c.nombre] || ''} onChange={e => updateCWPMetadata(cwp.id, c.nombre, e.target.value)}>
                                    <option value="">-</option>{c.opciones_json?.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                                </select>
                              ) : (
                                <input className="w-full bg-transparent hover:bg-white border border-transparent hover:border-gray-300 rounded text-[10px] h-7 px-2 outline-none" value={cwp.metadata_json?.[c.nombre] || ''} onChange={e => updateCWPMetadata(cwp.id, c.nombre, e.target.value)} />
                              )}
                            </td>
                          ))}
                          
                          {/* Acciones CWP */}
                          <td className={`p-1 text-right align-top ${cwpBg}`}>
                            <div className="flex justify-end gap-1 items-center opacity-0 group-hover/cwp:opacity-100 transition-opacity">
                              <div className="flex bg-white rounded border border-gray-200 shadow-sm overflow-hidden scale-90">
                                <button onClick={() => openPkgModal(cwp, 'EWP')} className="px-1.5 py-0.5 text-[9px] font-bold text-purple-600 hover:bg-purple-50 border-r border-gray-100">E</button>
                                <button onClick={() => openPkgModal(cwp, 'PWP')} className="px-1.5 py-0.5 text-[9px] font-bold text-teal-600 hover:bg-teal-50 border-r border-gray-100">P</button>
                                <button onClick={() => openPkgModal(cwp, 'IWP')} className="px-1.5 py-0.5 text-[9px] font-bold text-orange-600 hover:bg-orange-50">I</button>
                              </div>
                              <button onClick={() => openCWPModal(null, cwp)} className="p-1 text-gray-400 hover:text-blue-600"><Icons.Edit /></button>
                              <button onClick={() => handleDeleteCWP(cwp.id)} className="p-1 text-gray-400 hover:text-red-600"><Icons.Trash /></button>
                            </div>
                          </td>
                        </tr>

                        {/* --- FILAS PAQUETES --- */}
                        {isCwpExp && cwp.paquetes.map(pkg => {
                          const isPkgExp = expandedPaquetes.has(pkg.id);
                          const pkgBg = 'bg-white';
                          const stickyPkg1 = `sticky left-0 z-30 ${pkgBg} border-r border-gray-100 align-top`;
                          const stickyPkg2 = `sticky left-8 z-30 ${pkgBg} border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top pl-12`;

                          return (
                            <React.Fragment key={pkg.id}>
                              <tr className="group/pkg hover:bg-gray-50 border-t border-gray-50">
                                <td className={stickyPkg1}></td>
                                <td className={`p-2 ${stickyPkg2}`}>
                                  <div className="flex items-start gap-2 border-l-2 border-gray-200 pl-3">
                                    <button onClick={() => toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} className="text-gray-300 hover:text-blue-500 mt-0.5">
                                      {isPkgExp ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                                    </button>
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[8px] px-1 rounded-sm font-bold tracking-wider uppercase ${pkg.tipo === 'EWP' ? 'text-purple-600 bg-purple-50' : pkg.tipo === 'PWP' ? 'text-teal-600 bg-teal-50' : 'text-orange-600 bg-orange-50'}`}>{pkg.tipo}</span>
                                            <span className="font-mono text-[10px] text-gray-700">{pkg.codigo}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400 truncate">{pkg.nombre}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className={`border-r border-gray-100 ${pkgBg}`}></td>
                                <td className={`border-r border-gray-100 ${pkgBg}`}></td>
                                
                                {/* Fechas */}
                                <td className={`p-1 align-top border-r border-gray-100 ${pkgBg}`}>
                                    <div className="flex gap-1 items-center">
                                        <input type="date" className="w-1/2 border border-transparent hover:border-gray-300 rounded text-[9px] px-1 h-6 bg-transparent" value={pkg.forecast_inicio?.split('T')[0] || ''} onChange={e => updatePaqueteField(pkg.id, 'forecast_inicio', e.target.value)} title="Inicio" />
                                        <span className="text-gray-300">→</span>
                                        <input type="date" className="w-1/2 border border-transparent hover:border-gray-300 rounded text-[9px] px-1 h-6 bg-transparent" value={pkg.forecast_fin?.split('T')[0] || ''} onChange={e => updatePaqueteField(pkg.id, 'forecast_fin', e.target.value)} title="Fin" />
                                    </div>
                                </td>

                                {customColumns.map(c => <td key={c.id} className={`border-r border-gray-100 ${pkgBg}`}></td>)}
                                
                                <td className={`p-1 text-right align-top ${pkgBg}`}>
                                  <div className="flex justify-end gap-2 opacity-0 group-hover/pkg:opacity-100 transition-opacity items-center h-full">
                                    <button onClick={() => openLinkModal(pkg)} className="text-blue-400 hover:text-blue-600 text-[10px] font-medium flex items-center gap-0.5 border border-transparent hover:border-blue-100 hover:bg-blue-50 px-1.5 py-0.5 rounded transition-all"><Icons.Link /> Link</button>
                                    <button onClick={() => addBatch(pkg.id)} className="text-orange-400 hover:text-orange-600 text-[10px] font-bold flex items-center gap-0.5 border border-transparent hover:border-orange-100 hover:bg-orange-50 px-1.5 py-0.5 rounded transition-all"><Icons.Plus /> Item</button>
                                    <div className="w-px h-3 bg-gray-200"></div>
                                    <button onClick={() => openPkgModal(cwp, pkg.tipo, pkg)} className="text-gray-300 hover:text-gray-600"><Icons.Edit /></button>
                                    <button onClick={() => handleDeletePkg(pkg.id)} className="text-gray-300 hover:text-red-500"><Icons.Trash /></button>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* --- FILAS ITEMS --- */}
                              {isPkgExp && (
                                <>
                                  {pkg.items.map(item => {
                                    // Fondo ligeramente azulado para items
                                    const itemBg = 'bg-slate-50/50';
                                    const stickyItem1 = `sticky left-0 z-30 ${itemBg} border-r border-gray-100 align-top`;
                                    const stickyItem2 = `sticky left-8 z-30 ${itemBg} border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] align-top pl-20`; // Más indentación

                                    return (
                                      <tr key={item.id} className="group/item hover:bg-blue-50/30">
                                        <td className={stickyItem1}></td>
                                        <td className={`p-1.5 ${stickyItem2}`}>
                                          <div className="flex items-center gap-2 border-l-2 border-gray-200 pl-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                            <span className="text-gray-600 text-[10px] truncate flex-1">{item.nombre}</span>
                                            {item.source_item_id && (
                                                <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 rounded border border-blue-200 whitespace-nowrap">Link</span>
                                            )}
                                          </div>
                                        </td>
                                        <td colSpan={3} className={`border-r border-gray-100 ${itemBg}`}></td>
                                        {customColumns.map(c => <td key={c.id} className={`border-r border-gray-100 ${itemBg}`}></td>)}
                                        <td className={`p-1 text-right align-middle ${itemBg}`}>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <button onClick={() => openEditItemModal(item)} className="text-gray-300 hover:text-blue-500"><Icons.Edit /></button>
                                                <button onClick={() => handleDeleteItem(item.id)} className="text-gray-300 hover:text-red-500"><Icons.Trash /></button>
                                            </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  
                                  {/* --- INPUT BATCH (NUEVOS ITEMS) --- */}
                                  {pendingItems[pkg.id]?.map(t => (
                                    <tr key={t.id} className="bg-yellow-50">
                                      <td className="sticky left-0 z-30 bg-yellow-50 border-r border-yellow-100"></td>
                                      <td className="sticky left-8 z-30 bg-yellow-50 border-r border-yellow-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] p-2 pl-20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-500 animate-pulse">●</span>
                                            <input 
                                                autoFocus 
                                                className="w-full bg-white border border-yellow-300 rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-yellow-400 outline-none placeholder-yellow-300"
                                                value={t.nombre} 
                                                onChange={e => changeBatch(pkg.id, t.id, e.target.value)} 
                                                onPaste={(e) => handlePasteBatch(e, pkg.id)} 
                                                placeholder="Nombre del item..." 
                                            />
                                        </div>
                                      </td>
                                      <td colSpan={3 + customColumns.length} className="bg-yellow-50"></td>
                                      <td className="p-1 text-right bg-yellow-50 align-middle">
                                        <button onClick={() => setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i => i.id !== t.id)})} className="text-red-300 hover:text-red-500 px-2">✕</button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* BOTÓN GUARDAR BATCH */}
                                  {pendingItems[pkg.id]?.length > 0 && (
                                    <tr className="bg-yellow-50 border-b border-yellow-100">
                                        <td className="sticky left-0 z-30 bg-yellow-50"></td>
                                        <td className="sticky left-8 z-30 bg-yellow-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]"></td>
                                        <td colSpan={100} className="p-2 text-center">
                                            <button onClick={() => saveBatch(pkg)} className="bg-yellow-500 text-white font-bold px-8 py-1.5 rounded-full text-xs shadow hover:bg-yellow-600 transition-colors flex items-center gap-2 mx-auto">
                                                <Icons.Save /> Guardar {pendingItems[pkg.id].length} Items
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

      {/* --- MODALES --- */}
      {modals.cwp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-[2px]">
            <div className="bg-white w-[360px] p-5 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">{isEditingCWP ? 'Editar CWP' : 'Nuevo CWP'}</h3>
                    <button onClick={() => setModals({...modals, cwp: false})} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nombre</label>
                        <input className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} autoFocus />
                    </div>
                    {!isEditingCWP && (
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Disciplina</label>
                            <select className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white" value={formData.disciplina_id} onChange={e => setFormData({...formData, disciplina_id: e.target.value})}>
                                <option value="">Seleccionar...</option>
                                {proyecto.disciplinas?.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}
                            </select>
                        </div>
                    )}
                    {customColumns.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase">Metadatos</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {customColumns.map(c => (
                                    <div key={c.id}>
                                        <label className="text-[10px] text-gray-500 block mb-0.5">{c.nombre}</label>
                                        <input className="w-full border border-gray-200 p-1.5 rounded text-xs focus:border-blue-400 outline-none" value={formData.metadata?.[c.nombre] || ''} onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setModals({...modals, cwp: false})} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleSaveCWP} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">Guardar</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Modal Paquete */}
      {modals.pkg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-[2px]">
          <div className="bg-white w-80 p-5 rounded-xl shadow-2xl border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-1">{isEditingPkg ? 'Editar Paquete' : `Nuevo ${formData.tipo}`}</h3>
            <p className="text-xs text-gray-400 mb-4">Ingrese los detalles básicos</p>
            
            <div className="space-y-3">
                <input className="w-full border border-gray-300 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="Nombre del paquete" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} autoFocus />
                
                <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Inicio</label><input type="date" className="w-full border border-gray-300 p-1.5 rounded text-xs" value={formData.forecast_inicio || ''} onChange={e => setFormData({...formData, forecast_inicio: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Fin</label><input type="date" className="w-full border border-gray-300 p-1.5 rounded text-xs" value={formData.forecast_fin || ''} onChange={e => setFormData({...formData, forecast_fin: e.target.value})} /></div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setModals({...modals, pkg: false})} className="px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
              <button onClick={handleSavePkg} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Link (Simplificado Visualmente) */}
      {modals.link && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-[2px]">
          <div className="bg-white w-[500px] max-h-[80vh] flex flex-col rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">Vincular Items Existentes</h3>
                <button onClick={() => setModals({...modals, link: false})} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-4 space-y-3 shrink-0">
                <div className="relative">
                    <input type="text" className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-blue-500 outline-none" placeholder="Buscar item..." value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} autoFocus />
                    <span className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setLinkFilter("ALL")} className={`flex-1 py-1.5 text-xs rounded-md border transition-all ${linkFilter==="ALL" ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>Todos</button>
                    <button onClick={() => setLinkFilter("TRANSVERSAL")} className={`flex-1 py-1.5 text-xs rounded-md border transition-all ${linkFilter==="TRANSVERSAL" ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}>Transversales</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 bg-white">
                <div className="space-y-1">
                    {transversalItems.filter(i => {
                        const matchesFilter = linkFilter === "ALL" || i.es_transversal;
                        const matchesSearch = i.nombre.toLowerCase().includes(linkSearch.toLowerCase()) || (i.paquete && i.paquete.toLowerCase().includes(linkSearch.toLowerCase()));
                        return matchesFilter && matchesSearch;
                    }).map(item => (
                        <div key={item.id} onClick={() => toggle(selectedLinkItems, item.id, setSelectedLinkItems)} className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedLinkItems.has(item.id) ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${selectedLinkItems.has(item.id) ? 'text-blue-800' : 'text-gray-700'}`}>{item.nombre}</span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <span className="font-mono bg-gray-100 px-1 rounded">{item.cwa}</span> ➝ {item.paquete}
                                </span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedLinkItems.has(item.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                                {selectedLinkItems.has(item.id) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        </div>
                    ))}
                    {transversalItems.length === 0 && <p className="text-center text-gray-400 text-xs mt-4">No hay items disponibles para vincular.</p>}
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setModals({...modals, link: false})} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
                <button onClick={handleLinkItems} disabled={selectedLinkItems.size === 0} className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Vincular ({selectedLinkItems.size})
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simple Edit Item */}
      {modals.itemEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-[2px]">
            <div className="bg-white p-5 rounded-xl w-80 shadow-2xl">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Renombrar Item</h3>
                <input className="w-full border border-gray-300 p-2 rounded-lg text-sm mb-4 focus:border-blue-500 outline-none" value={editingItemData?.nombre || ''} onChange={e => setEditingItemData({...editingItemData, nombre: e.target.value})} autoFocus />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setModals({...modals, itemEdit: false})} className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
                    <button onClick={handleSaveItemEdit} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Guardar</button>
                </div>
            </div>
        </div>
      )}
      
      {/* Modal Import */}
      {modals.import && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-[2px]">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icons.Save />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Importar Datos CSV</h3>
                <p className="text-xs text-gray-500 mb-6 px-4">Sube un archivo CSV con la estructura requerida para cargar masivamente CWAs, Paquetes e Items.</p>
                
                <input type="file" className="text-xs mb-6 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => setImportFile(e.target.files[0])} accept=".csv" />
                
                <div className="flex justify-center gap-3">
                    <button onClick={() => setModals({...modals, import: false})} className="px-4 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded-lg">Cancelar</button>
                    <button onClick={handleImport} disabled={!importFile || importing} className="px-6 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-lg shadow-sm disabled:opacity-50">
                        {importing ? 'Procesando...' : 'Subir Archivo'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default AWPTableConsolidada;