// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  // ============================================================================
  // 1. ESTADO DE DATOS
  // ============================================================================
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customColumns, setCustomColumns] = useState([]);

  // ============================================================================
  // 2. ESTADOS DE FILTROS Y EXPANSIÓN
  // ============================================================================
  const [filters, setFilters] = useState({ codigo: '', nombre: '' });
  const [expandedCWAs, setExpandedCWAs] = useState(new Set()); 
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());

  // ============================================================================
  // 3. ITEMS TEMPORALES (Batch Create)
  // ============================================================================
  const [pendingItems, setPendingItems] = useState({});
  
  // ============================================================================
  // 4. MODALES Y FORMULARIOS
  // ============================================================================
  const [modals, setModals] = useState({ 
    cwp: false, 
    pkg: false, 
    link: false, 
    import: false, 
    editItem: false 
  });
  
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const [transversalItems, setTransversalItems] = useState([]);
  const [selectedLinkItems, setSelectedLinkItems] = useState(new Set());
  const [linkFilter, setLinkFilter] = useState("ALL");

  const [editingItem, setEditingItem] = useState(null);
  const [itemTipos, setItemTipos] = useState([]);

  // ============================================================================
  // 5. CARGA DE DATOS
  // ============================================================================
  useEffect(() => {
    if (proyecto?.id) {
        loadData();
    }
  }, [plotPlanId, proyecto.id]);

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
        const allCwpIds = new Set();
        const allPkgIds = new Set();
        
        res.data.cwas.forEach(c => {
            c.cwps?.forEach(p => {
                allCwpIds.add(p.id);
                p.paquetes?.forEach(pkg => allPkgIds.add(pkg.id));
            });
        });
        
        setExpandedCWAs(allCwaIds);
        setExpandedCWPs(allCwpIds);
        setExpandedPaquetes(allPkgIds);
      }
      
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  // ============================================================================
  // 6. LÓGICA DE FILTRADO
  // ============================================================================
  const cwasToRender = jerarquia?.cwas?.filter(cwa => {
    const matchText = !filters.codigo || cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase());
    const matchSelection = !filteredCWAId || cwa.id === filteredCWAId;
    return matchText && matchSelection;
  }).sort((a, b) => a.codigo.localeCompare(b.codigo));

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

  // ============================================================================
  // 7. HELPERS & UPDATES
  // ============================================================================
  const toggle = (set, id, setFn) => { 
    const newSet = new Set(set); 
    newSet.has(id) ? newSet.delete(id) : newSet.add(id); 
    setFn(newSet); 
  };

  const updateCWAField = async (id, field, value) => {
    try { await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); }
  };

  const updateCWPField = async (id, field, value) => {
    try { await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); }
  };

  const updateItemForecast = async (id, date) => {
    try { await client.put(`/awp-nuevo/item/${id}`, { forecast_fin: date }); loadData(); } catch(e) { console.error(e); }
  };

  // ============================================================================
  // 8. HANDLERS MODALES
  // ============================================================================
  const openCWPModal = (cwa=null, cwp=null) => {
    if(cwp) { 
      setIsEditingCWP(true); setEditingCWPId(cwp.id); 
      setFormData({ nombre: cwp.nombre, disciplina_id: cwp.disciplina_id, metadata: cwp.metadata_json || {} }); 
    } else { 
      setIsEditingCWP(false); setSelectedParent(cwa); 
      setFormData({ nombre: '', disciplina_id: proyecto.disciplinas?.[0]?.id || '', metadata: {} }); 
    }
    setModals({...modals, cwp: true});
  };

  const handleSaveCWP = async () => {
    try {
      const payload = { ...formData, area_id: selectedParent?.id || 0, descripcion: '', metadata_json: formData.metadata };
      if(isEditingCWP) await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload);
      else await client.post(`/awp-nuevo/cwp`, payload);
      setModals({...modals, cwp: false}); loadData(); if(onDataChange) onDataChange();
    } catch(e) { alert("Error: " + e.message); }
  };

  const handleDeleteCWP = async (id) => {
    if(!confirm("¿Eliminar CWP y todo su contenido?")) return;
    try { await client.delete(`/awp-nuevo/cwp/${id}`); loadData(); } catch(e) { alert("Error borrando CWP"); }
  };

  const openPkgModal = (cwp, tipo) => { 
    setSelectedParent(cwp); setFormData({ nombre: '', tipo, responsable: 'Firma' }); setModals({...modals, pkg: true}); 
  };

  const handleSavePkg = async () => { 
    try { await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); setModals({...modals, pkg: false}); loadData(); } catch(e) { alert("Error creando paquete"); } 
  };

  const handleDeletePkg = async (id) => { 
    if(confirm("¿Borrar Paquete y sus items?")) { await client.delete(`/awp-nuevo/paquete/${id}`); loadData(); } 
  };

  const addBatch = (pkgId) => {
    const count = parseInt(prompt("¿Cuántos items deseas crear?", "5")) || 0; 
    if(count <= 0) return;
    const current = pendingItems[pkgId] || [];
    const newRows = Array.from({length: count}).map((_, i) => ({ id: `temp_${Date.now()}_${i}`, nombre: '' }));
    setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]});
    setExpandedPaquetes(prev => new Set(prev).add(pkgId));
  };

  const changeBatch = (pkgId, tempId, val) => { 
    const list = pendingItems[pkgId].map(i => i.id === tempId ? {...i, nombre: val} : i); 
    setPendingItems({...pendingItems, [pkgId]: list}); 
  };

  const saveBatch = async (pkg) => {
    const toSave = pendingItems[pkg.id]?.filter(i => i.nombre.trim()) || [];
    if(!toSave.length) return;
    try {
      await Promise.all(toSave.map(i => client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre })));
      const newP = {...pendingItems}; delete newP[pkg.id]; setPendingItems(newP); loadData();
    } catch(e) { alert("Error guardando lote de items"); }
  };

  const handleDeleteItem = async (id) => { 
    if(confirm("¿Borrar este item?")) { await client.delete(`/awp-nuevo/item/${id}`); loadData(); } 
  };

  const openLinkModal = async (pkg) => { 
    setSelectedParent(pkg); 
    const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); 
    setTransversalItems(res.data); setSelectedLinkItems(new Set()); setLinkFilter("ALL"); setModals({...modals, link: true}); 
  };

  const handleLinkItems = async () => { 
    await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) }); 
    setModals({...modals, link: false}); loadData(); 
  };

  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');

  const handleImport = async (e) => { 
    e.preventDefault(); 
    if(!importFile) return; 
    setImporting(true); const fd = new FormData(); fd.append('file', importFile); 
    try { 
      await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); 
      alert("✅ Importación exitosa"); setModals({...modals, import: false}); loadData(); if(onDataChange) onDataChange(); 
    } catch(e) { alert("Error: " + (e.response?.data?.detail || e.message)); } finally { setImporting(false); } 
  };

  // ============================================================================
  // 9. RENDER
  // ============================================================================
  if (loading && !jerarquia) {
    return (
      <div className="p-10 text-center">
        <div className="w-12 h-12 border-4 border-hatch-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-hatch-blue font-semibold">Cargando estructura AWP...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 bg-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-hatch-gray shadow-sm">
        <div className="flex items-center gap-4">
          <h3 className="text-hatch-blue font-bold text-lg">📊 Control AWP</h3>
          <div className="h-6 w-px bg-hatch-gray"></div>
          <span className="text-sm text-gray-600 font-medium">Proyecto: {proyecto.nombre}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModals({...modals, import: true})} className="bg-white hover:bg-hatch-gray text-hatch-blue px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 border-hatch-gray">📤 Importar</button>
          <button onClick={handleExport} className="bg-gradient-orange hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">📥 Exportar CSV</button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto border-2 border-hatch-gray rounded-lg bg-white shadow-md">
        {/* Usamos table-fixed para que las columnas respeten anchos y el texto haga wrap */}
        <table className="w-full text-left border-collapse relative table-fixed">
          
          <thead className="bg-hatch-gray text-xs uppercase font-bold text-hatch-blue sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-3 w-12 sticky left-0 bg-hatch-gray z-30 border-b-2 border-hatch-gray-dark"></th>
              <th className="p-3 w-1/3 sticky left-12 bg-hatch-gray z-30 border-r-2 border-b-2 border-hatch-gray-dark">
                <div className="flex flex-col gap-2">
                  <span>Jerarquía AWP</span>
                  <input className="bg-white border-2 border-hatch-gray-dark rounded px-2 py-1 text-hatch-blue font-normal text-xs w-full focus:border-hatch-orange outline-none" placeholder="🔍 Filtrar..." onChange={e => setFilters({...filters, codigo: e.target.value})} />
                </div>
              </th>
              <th className="p-3 w-24 text-center border-b-2 border-hatch-gray-dark">Prioridad<br/><span className="text-[9px] font-normal text-gray-600">(Área)</span></th>
              <th className="p-3 w-16 text-center border-b-2 border-hatch-gray-dark">Seq</th>
              <th className="p-3 w-48 text-center border-b-2 border-hatch-gray-dark">Forecasts<br/><span className="text-[9px] font-normal text-gray-600">(CWP/Item)</span></th>
              {/* Se eliminó Progreso y Tipo */}
              {customColumns.map(c => (<th key={c.id} className="p-3 border-l-2 border-b-2 border-hatch-gray-dark text-hatch-orange whitespace-normal w-32 break-words">{c.nombre}</th>))}
              <th className="p-3 text-right border-b-2 border-hatch-gray-dark w-40">Acciones</th>
            </tr>
          </thead>

          <tbody className="text-sm text-hatch-blue divide-y-2 divide-hatch-gray">
            {cwasToRender?.map(cwa => {
              const isExp = expandedCWAs.has(cwa.id);
              return (
                <React.Fragment key={cwa.id}>
                  {/* CWA ROW */}
                  <tr className={`transition-colors ${filteredCWAId === cwa.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white hover:bg-hatch-gray/30'}`}>
                    <td className="p-3 text-center sticky left-0 bg-inherit z-10 align-top">
                      <button onClick={() => toggle(expandedCWAs, cwa.id, setExpandedCWAs)} className="text-hatch-blue hover:text-hatch-orange font-bold text-lg w-full transition-colors">{isExp ? '▼' : '▶'}</button>
                    </td>
                    <td className="p-3 font-bold text-hatch-blue sticky left-12 bg-inherit z-10 border-r-2 border-hatch-gray align-top break-words whitespace-normal">
                      <div className="flex flex-col md:flex-row md:items-start gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold self-start ${cwa.es_transversal ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{cwa.es_transversal ? 'DWP' : 'CWA'}</span>
                        <span className="text-base leading-tight">{cwa.codigo} <span className="font-normal text-gray-600">- {cwa.nombre}</span></span>
                      </div>
                    </td>
                    <td className="p-3 text-center align-top">
                      <select 
                        className={`bg-white text-xs font-bold border-2 rounded-lg px-2 py-1 cursor-pointer w-full ${cwa.prioridad === 'CRITICA' ? 'border-red-400 text-red-600' : cwa.prioridad === 'ALTA' ? 'border-orange-400 text-orange-600' : 'border-hatch-gray text-gray-600'}`}
                        value={cwa.prioridad || 'MEDIA'} 
                        onChange={e => updateCWAField(cwa.id, 'prioridad', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      >
                        <option value="BAJA">🟢 Baja</option>
                        <option value="MEDIA">🟡 Media</option>
                        <option value="ALTA">🟠 Alta</option>
                        <option value="CRITICA">🔴 Crítica</option>
                      </select>
                    </td>
                    <td colSpan={2 + customColumns.length} className="p-3 text-xs text-gray-500 italic align-top">📍 {cwa.plot_plan_nombre}</td>
                    <td className="p-3 text-right align-top">
                      <button onClick={() => openCWPModal(cwa)} className="text-xs bg-gradient-orange hover:shadow-lg text-white px-3 py-1.5 rounded-lg transition-all font-medium">+ CWP</button>
                    </td>
                  </tr>

                  {/* CWP ROW */}
                  {isExp && cwa.cwps.sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0)).map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="bg-hatch-gray/20 hover:bg-hatch-gray/40 border-t border-hatch-gray transition-colors">
                          <td className="sticky left-0 bg-inherit z-10 align-top"></td>
                          <td className="p-3 pl-8 sticky left-12 bg-inherit z-10 border-r-2 border-hatch-gray align-top break-words whitespace-normal">
                            <div className="flex items-start gap-3">
                              <button onClick={() => toggle(expandedCWPs, cwp.id, setExpandedCWPs)} className="text-hatch-blue hover:text-hatch-orange text-sm font-bold w-4 transition-colors mt-0.5">{isCwpExp ? '▼' : '▶'}</button>
                              <div className="flex flex-col">
                                <span className="text-green-600 font-mono text-xs bg-green-50 px-1 rounded border border-green-200 w-fit mb-1">{cwp.codigo}</span>
                                <span className="text-hatch-blue font-medium text-sm leading-tight">{cwp.nombre}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center text-gray-400 text-xs align-top">-</td>
                          <td className="p-3 text-center align-top">
                            <input type="number" className="w-full bg-white border-2 border-hatch-gray rounded text-center text-sm text-hatch-blue focus:border-hatch-orange outline-none" value={cwp.secuencia || 0} onChange={e => updateCWPField(cwp.id, 'secuencia', e.target.value)} />
                          </td>
                          <td className="p-3 text-center text-xs align-top">
                            <div className="flex flex-col gap-1">
                              <input type="date" className="bg-white border-2 border-hatch-gray rounded w-full text-hatch-blue text-[10px] px-1 py-0.5" value={cwp.forecast_inicio?.split('T')[0] || ''} onChange={e => updateCWPField(cwp.id, 'forecast_inicio', e.target.value)} title="Inicio" />
                              <input type="date" className="bg-white border-2 border-hatch-gray rounded w-full text-hatch-blue text-[10px] px-1 py-0.5" value={cwp.forecast_fin?.split('T')[0] || ''} onChange={e => updateCWPField(cwp.id, 'forecast_fin', e.target.value)} title="Fin" />
                            </div>
                          </td>
                          {customColumns.map(c => (<td key={c.id} className="p-3 border-l-2 border-hatch-gray text-xs align-top break-words whitespace-normal"><span className="bg-hatch-gray text-hatch-blue px-2 py-1 rounded border border-hatch-gray-dark block w-full">{cwp.metadata_json?.[c.nombre] || '-'}</span></td>))}
                          <td className="p-3 text-right align-top">
                            <div className="flex justify-end gap-1 items-center flex-wrap">
                              <button onClick={() => openCWPModal(null, cwp)} className="text-gray-500 hover:text-hatch-orange text-xs p-1 rounded border border-transparent hover:border-hatch-gray">✏️</button>
                              <button onClick={() => handleDeleteCWP(cwp.id)} className="text-red-400 hover:text-red-600 text-xs p-1 rounded border border-transparent hover:border-red-200">🗑️</button>
                              <div className="w-full h-1"></div>
                              <button onClick={() => openPkgModal(cwp, 'EWP')} className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-300">+E</button>
                              <button onClick={() => openPkgModal(cwp, 'PWP')} className="text-[9px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded border border-teal-300">+P</button>
                              <button onClick={() => openPkgModal(cwp, 'IWP')} className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded border border-orange-300">+I</button>
                            </div>
                          </td>
                        </tr>

                        {/* PAQUETES ROW */}
                        {isCwpExp && cwp.paquetes.map(pkg => {
                          const isPkgExp = expandedPaquetes.has(pkg.id);
                          return (
                            <React.Fragment key={pkg.id}>
                              <tr className="bg-white hover:bg-hatch-gray/10 text-xs group border-t border-hatch-gray/50 transition-colors">
                                <td className="sticky left-0 bg-inherit z-10 align-top"></td>
                                <td className="p-2 pl-16 sticky left-12 bg-inherit z-10 border-r-2 border-hatch-gray align-top break-words whitespace-normal">
                                  <div className="flex items-start gap-2 text-gray-700">
                                    <button onClick={() => toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} className="hover:text-hatch-orange text-xs font-bold w-3 transition-colors mt-0.5">{isPkgExp ? '▼' : '▶'}</button>
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] border px-1 py-0.5 rounded font-semibold w-fit mb-1 ${pkg.tipo === 'EWP' ? 'border-purple-300 text-purple-700 bg-purple-50' : pkg.tipo === 'PWP' ? 'border-teal-300 text-teal-700 bg-teal-50' : 'border-orange-300 text-orange-700 bg-orange-50'}`}>{pkg.tipo}</span>
                                        <span className="font-mono text-[10px] text-gray-600">{pkg.codigo}</span>
                                    </div>
                                  </div>
                                </td>
                                <td colSpan={3} className="p-2 text-gray-600 italic text-[11px] align-top break-words whitespace-normal">{pkg.nombre}</td>
                                {customColumns.map(c => <td key={c.id} className="border-l-2 border-hatch-gray/30 align-top"></td>)}
                                <td className="p-2 text-right align-top opacity-60 group-hover:opacity-100 transition-opacity">
                                  <div className="flex justify-end gap-1 flex-wrap">
                                    <button onClick={() => handleDeletePkg(pkg.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors">🗑️</button>
                                    <button onClick={() => openLinkModal(pkg)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-xs transition-colors font-medium">🔗 Link</button>
                                    <button onClick={() => addBatch(pkg.id)} className="text-hatch-orange hover:text-hatch-orange-dark hover:bg-orange-50 px-2 py-1 rounded text-xs font-bold transition-colors">+Lote</button>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* ITEMS ROW */}
                              {isPkgExp && (
                                <>
                                  {pkg.items.map(item => (
                                    <tr key={item.id} className="bg-hatch-gray/5 text-[11px] hover:bg-hatch-gray/20 transition-colors border-t border-hatch-gray/30">
                                      <td className="sticky left-0 bg-inherit z-10 align-top"></td>
                                      <td className="p-2 pl-24 sticky left-12 bg-inherit z-10 border-r-2 border-hatch-gray/50 text-gray-500 align-top break-words whitespace-normal">
                                        {item.source_item_id ? (
                                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">
                                                <span className="text-xs">🔗</span>
                                                <span className="font-mono font-bold text-[10px]">ID: {item.source_item_id}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-mono">ID: {item.id}</span>
                                        )}
                                      </td>
                                      <td colSpan={2} className="p-2 text-hatch-blue pl-4 align-top break-words whitespace-normal leading-tight">
                                        {item.nombre}
                                      </td>
                                      <td className="p-2 text-center align-top">
                                        <input type="date" className="bg-white border border-hatch-gray rounded w-full text-gray-600 text-[10px] text-center px-1 py-0.5" value={item.forecast_fin?.split('T')[0] || ''} onChange={e => updateItemForecast(item.id, e.target.value)} />
                                      </td>
                                      {customColumns.map(c => <td key={c.id} className="border-l-2 border-hatch-gray/30 align-top"></td>)}
                                      <td className="p-2 text-right align-top">
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors">🗑️</button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* BATCH ITEMS */}
                                  {pendingItems[pkg.id]?.map(t => (
                                    <tr key={t.id} className="bg-yellow-50 text-xs animate-pulse border-t border-yellow-200">
                                      <td className="sticky left-0 bg-inherit align-top"></td>
                                      <td className="p-2 pl-24 text-yellow-700 sticky left-12 border-r-2 border-yellow-200 font-semibold align-top">⚡ Nuevo</td>
                                      <td colSpan={3} className="p-2 align-top">
                                        <input autoFocus className="w-full bg-white border-2 border-yellow-400 rounded text-hatch-blue outline-none px-2 py-1" value={t.nombre} onChange={e => changeBatch(pkg.id, t.id, e.target.value)} onKeyDown={e => {if(e.key === 'Enter') saveBatch(pkg)}} placeholder="Nombre del entregable..." />
                                      </td>
                                      <td colSpan={customColumns.length} className="align-top"></td>
                                      <td className="p-2 text-right align-top">
                                        <button onClick={() => setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i => i.id !== t.id)})} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded">✕</button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* SAVE BATCH BTN */}
                                  {pendingItems[pkg.id]?.length > 0 && (
                                    <tr className="bg-yellow-100 border-t-2 border-yellow-400">
                                      <td colSpan="100%" className="text-center p-2">
                                        <button onClick={() => saveBatch(pkg)} className="bg-gradient-orange text-white font-bold px-6 py-1 rounded text-xs uppercase shadow-md">💾 Guardar {pendingItems[pkg.id].length} Item(s)</button>
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

      {/* Los Modales (CWP, Paquete, Link, Import) se mantienen igual que la versión anterior */}
      {/* Se eliminó el Modal de Clasificar Item (editItem) ya que no se usa Tipo de Item */}
      {modals.cwp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[500px] p-6 rounded-2xl border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2"><span className="text-hatch-orange">{isEditingCWP ? '✏️' : '➕'}</span> {isEditingCWP ? 'Editar' : 'Crear'} CWP</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre del Paquete</label>
                <input className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              </div>
              {!isEditingCWP && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Disciplina</label>
                  <select className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none" value={formData.disciplina_id} onChange={e => setFormData({...formData, disciplina_id: e.target.value})}>
                    <option value="">Seleccionar disciplina...</option>
                    {proyecto.disciplinas?.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}
                  </select>
                </div>
              )}
              {customColumns.length > 0 && (
                <div className="border-t-2 border-hatch-gray pt-4">
                  <p className="text-hatch-orange text-xs font-bold mb-3 uppercase tracking-wider">🏷️ Restricciones / Metadatos</p>
                  {customColumns.map(c => (
                    <div key={c.id} className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1 font-semibold">{c.nombre}</label>
                      {c.tipo_dato === 'SELECCION' ? (
                        <select className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-2 py-1.5 text-sm focus:border-hatch-orange outline-none" value={formData.metadata?.[c.nombre] || ''} onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})}><option value="">- Seleccionar -</option>{c.opciones_json?.map(o => <option key={o} value={o}>{o}</option>)}</select>
                      ) : (
                        <input className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-2 py-1.5 text-sm focus:border-hatch-orange outline-none" value={formData.metadata?.[c.nombre] || ''} onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-hatch-gray">
              <button onClick={() => setModals({...modals, cwp: false})} className="text-gray-600 hover:text-hatch-blue px-4 py-2 font-medium">Cancelar</button>
              <button onClick={handleSaveCWP} className="bg-gradient-orange text-white px-6 py-2 rounded-lg font-bold">{isEditingCWP ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {modals.pkg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-96 border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2"><span className="text-hatch-orange">➕</span> Nuevo {formData.tipo}</h3>
            <input className="w-full mb-4 bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setModals({...modals, pkg: false})} className="text-gray-600 px-4 py-2">Cancelar</button>
              <button onClick={handleSavePkg} className="bg-gradient-orange text-white px-6 py-2 rounded-lg font-bold">Crear</button>
            </div>
          </div>
        </div>
      )}

      {modals.link && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[650px] p-6 rounded-2xl border-2 border-hatch-gray h-[85vh] flex flex-col shadow-2xl">
            <h3 className="text-xl font-bold text-hatch-blue mb-2">🔗 Vincular Entregables</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setLinkFilter("ALL")} className={`px-4 py-2 rounded-lg text-sm font-bold ${linkFilter === "ALL" ? 'bg-gradient-orange text-white' : 'bg-hatch-gray text-hatch-blue'}`}>Todo</button>
              <button onClick={() => setLinkFilter("TRANSVERSAL")} className={`px-4 py-2 rounded-lg text-sm font-bold ${linkFilter === "TRANSVERSAL" ? 'bg-gradient-orange text-white' : 'bg-hatch-gray text-hatch-blue'}`}>Transversales</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-hatch-gray/20 p-3 rounded-lg border-2 border-hatch-gray">
              {transversalItems.filter(i => linkFilter === "ALL" || i.es_transversal).map(item => (
                <div key={item.id} className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer border-2 ${selectedLinkItems.has(item.id) ? 'border-hatch-orange bg-orange-50' : 'border-hatch-gray bg-white'}`} onClick={() => toggle(selectedLinkItems, item.id, setSelectedLinkItems)}>
                  <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${selectedLinkItems.has(item.id) ? 'bg-hatch-orange border-hatch-orange' : 'border-hatch-gray-dark'}`}>{selectedLinkItems.has(item.id) && <span className="text-white font-bold text-sm">✓</span>}</div>
                  <div><p className="text-hatch-blue text-sm font-medium">{item.nombre}</p><p className="text-gray-500 text-xs">ID:{item.id} | {item.cwa} ➝ {item.paquete}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
              <button onClick={() => setModals({...modals, link: false})} className="text-gray-600 px-4 py-2">Cancelar</button>
              <button onClick={handleLinkItems} className="bg-gradient-orange text-white px-6 py-2 rounded-lg font-bold">Vincular ({selectedLinkItems.size})</button>
            </div>
          </div>
        </div>
      )}

      {modals.import && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-[450px] border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-2 text-xl">📤 Importar Excel/CSV</h3>
            <form onSubmit={handleImport}>
              <label className="block mb-4 cursor-pointer">
                <div className="w-full border-2 border-dashed border-hatch-gray rounded-lg p-8 text-center hover:border-hatch-orange bg-hatch-gray/20">
                  {importFile ? <div className="flex flex-col items-center gap-2"><span className="text-4xl">📄</span><span className="text-hatch-blue font-medium text-sm">{importFile.name}</span></div> : <div className="flex flex-col items-center gap-2"><span className="text-4xl text-gray-400">📁</span><span className="text-gray-600 text-sm">Seleccionar archivo</span></div>}
                </div>
                <input type="file" accept=".csv,.xlsx" onChange={e => setImportFile(e.target.files[0])} className="hidden" />
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModals({...modals, import: false})} className="text-gray-600 px-4 py-2">Cancelar</button>
                <button type="submit" disabled={importing || !importFile} className="bg-gradient-orange hover:shadow-lg disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold">{importing ? 'Procesando...' : 'Importar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AWPTableConsolidada;