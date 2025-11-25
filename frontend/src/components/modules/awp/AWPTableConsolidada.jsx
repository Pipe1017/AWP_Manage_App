// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  // ... (ESTADOS Y LÓGICA DE DATOS SE MANTIENEN IGUAL) ...
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customColumns, setCustomColumns] = useState([]);
  const [filters, setFilters] = useState({ codigo: '', nombre: '' });
  const [expandedCWAs, setExpandedCWAs] = useState(new Set()); 
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());
  const [pendingItems, setPendingItems] = useState({});
  const [modals, setModals] = useState({ cwp: false, pkg: false, link: false, import: false, editItem: false });
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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

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

  // Helpers
  const toggle = (set, id, setFn) => { const newSet = new Set(set); newSet.has(id) ? newSet.delete(id) : newSet.add(id); setFn(newSet); };
  const updateCWAField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateCWPField = async (id, field, value) => { try { await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); loadData(); } catch(e) { console.error(e); } };
  const updateItemForecast = async (id, date) => { try { await client.put(`/awp-nuevo/item/${id}`, { forecast_fin: date }); loadData(); } catch(e) { console.error(e); } };

  // Modales handlers
  const openCWPModal = (cwa=null, cwp=null) => {
    if(cwp) { setIsEditingCWP(true); setEditingCWPId(cwp.id); setFormData({ nombre: cwp.nombre, disciplina_id: cwp.disciplina_id, metadata: cwp.metadata_json || {} }); } 
    else { setIsEditingCWP(false); setSelectedParent(cwa); setFormData({ nombre: '', disciplina_id: proyecto.disciplinas?.[0]?.id || '', metadata: {} }); }
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
  const handleDeleteCWP = async (id) => { if(!confirm("¿Eliminar CWP?")) return; try { await client.delete(`/awp-nuevo/cwp/${id}`); loadData(); } catch(e) { alert("Error borrando CWP"); } };
  const openPkgModal = (cwp, tipo) => { setSelectedParent(cwp); setFormData({ nombre: '', tipo, responsable: 'Firma' }); setModals({...modals, pkg: true}); };
  const handleSavePkg = async () => { try { await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); setModals({...modals, pkg: false}); loadData(); } catch(e) { alert("Error creando paquete"); } };
  const handleDeletePkg = async (id) => { if(confirm("¿Borrar Paquete?")) { await client.delete(`/awp-nuevo/paquete/${id}`); loadData(); } };
  const addBatch = (pkgId) => {
    const count = parseInt(prompt("Cantidad de items:", "5")) || 0; 
    if(count <= 0) return;
    const current = pendingItems[pkgId] || [];
    const newRows = Array.from({length: count}).map((_, i) => ({ id: `temp_${Date.now()}_${i}`, nombre: '' }));
    setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]});
    setExpandedPaquetes(prev => new Set(prev).add(pkgId));
  };
  const changeBatch = (pkgId, tempId, val) => { const list = pendingItems[pkgId].map(i => i.id === tempId ? {...i, nombre: val} : i); setPendingItems({...pendingItems, [pkgId]: list}); };
  const saveBatch = async (pkg) => {
    const toSave = pendingItems[pkg.id]?.filter(i => i.nombre.trim()) || [];
    if(!toSave.length) return;
    try { await Promise.all(toSave.map(i => client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre }))); const newP = {...pendingItems}; delete newP[pkg.id]; setPendingItems(newP); loadData(); } catch(e) { alert("Error guardando lote"); }
  };
  const handleDeleteItem = async (id) => { if(confirm("¿Borrar item?")) { await client.delete(`/awp-nuevo/item/${id}`); loadData(); } };
  const openLinkModal = async (pkg) => { setSelectedParent(pkg); const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); setTransversalItems(res.data); setSelectedLinkItems(new Set()); setLinkFilter("ALL"); setModals({...modals, link: true}); };
  const handleLinkItems = async () => { await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) }); setModals({...modals, link: false}); loadData(); };
  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');
  const handleImport = async (e) => { e.preventDefault(); if(!importFile) return; setImporting(true); const fd = new FormData(); fd.append('file', importFile); try { await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); alert("Importación exitosa"); setModals({...modals, import: false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: " + (e.response?.data?.detail || e.message)); } finally { setImporting(false); } };

  if (loading && !jerarquia) return <div className="p-10 text-center text-hatch-blue">Cargando...</div>;

  return (
    <div className="flex flex-col h-full gap-2 bg-white">
      
      {/* HEADER COMPACTO */}
      <div className="flex justify-between items-center px-4 py-2 bg-white rounded border border-hatch-gray shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="text-hatch-blue font-bold text-sm">📊 Control AWP</h3>
          <div className="h-4 w-px bg-hatch-gray"></div>
          <span className="text-xs text-gray-600 font-medium">{proyecto.nombre}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModals({...modals, import: true})} className="bg-white hover:bg-gray-50 text-hatch-blue px-3 py-1 rounded text-xs border border-hatch-gray">📤 Importar</button>
          <button onClick={handleExport} className="bg-hatch-blue hover:bg-hatch-blue-dark text-white px-3 py-1 rounded text-xs transition-all">📥 Exportar CSV</button>
        </div>
      </div>

      {/* TABLA WRAPPER */}
      <div className="flex-1 overflow-auto border border-hatch-gray rounded bg-white shadow-sm relative">
        <table className="text-left border-collapse relative w-full min-w-max">
          
          {/* HEADER FIXED (STICKY) */}
          {/* Nota: Quitamos sticky de thead y lo dejamos solo en th para mayor compatibilidad */}
          <thead className="text-[10px] uppercase font-bold text-hatch-blue bg-hatch-gray">
            <tr className="h-8">
              {/* 1. Expandir (Fija: Left 0, Top 0, Z-50) */}
              <th className="p-1 w-8 min-w-[32px] sticky left-0 top-0 z-50 bg-hatch-gray border-b border-r border-hatch-gray-dark text-center"></th>
              
              {/* 2. Jerarquía (Fija: Left 8, Top 0, Z-50) */}
              <th className="p-1 w-72 min-w-[288px] sticky left-8 top-0 z-50 bg-hatch-gray border-r-2 border-b border-hatch-gray-dark shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-2">
                  <span>Jerarquía</span>
                  <input className="bg-white border border-gray-300 rounded px-1 py-0.5 text-hatch-blue font-normal text-[10px] w-full focus:border-hatch-orange outline-none h-5" placeholder="Filtro..." onChange={e => setFilters({...filters, codigo: e.target.value})} />
                </div>
              </th>
              
              {/* Datos Scrollables (Sticky Top 0, Z-40) */}
              <th className="p-1 w-24 min-w-[96px] text-center border-b border-hatch-gray-dark bg-hatch-gray sticky top-0 z-40">Prioridad<br/><span className="text-[8px] font-normal text-gray-600">(Área)</span></th>
              <th className="p-1 w-12 min-w-[48px] text-center border-b border-hatch-gray-dark bg-hatch-gray sticky top-0 z-40">Seq</th>
              <th className="p-1 w-40 min-w-[160px] text-center border-b border-hatch-gray-dark bg-hatch-gray sticky top-0 z-40">Forecasts<br/><span className="text-[8px] font-normal text-gray-600">(Inicio ➜ Fin)</span></th>
              
              {/* Columnas Dinámicas (Sticky Top 0, Z-40) */}
              {customColumns.map(c => (
                <th key={c.id} className="p-1 border-l border-b border-hatch-gray-dark text-hatch-orange whitespace-normal w-32 min-w-[128px] break-words bg-hatch-gray align-top sticky top-0 z-40">
                  {c.nombre}
                </th>
              ))}
              
              <th className="p-1 text-right border-b border-hatch-gray-dark w-32 min-w-[128px] bg-hatch-gray sticky top-0 z-40">Acciones</th>
            </tr>
          </thead>

          {/* BODY COMPACTO */}
          <tbody className="text-xs text-hatch-blue divide-y divide-gray-200">
            {cwasToRender?.map(cwa => {
              const isExp = expandedCWAs.has(cwa.id);
              const rowBg = filteredCWAId === cwa.id ? 'bg-yellow-50' : 'bg-white';
              const stickyClass = `sticky left-0 z-30 ${rowBg} border-r border-gray-200 align-top`;
              const stickyClass2 = `sticky left-8 z-30 ${rowBg} border-r-2 border-hatch-gray shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top break-words whitespace-normal`;

              return (
                <React.Fragment key={cwa.id}>
                  {/* CWA ROW */}
                  <tr className={`hover:bg-gray-50 group ${filteredCWAId === cwa.id ? 'border-l-2 border-yellow-400' : ''}`}>
                    <td className={`p-1 text-center ${stickyClass}`}>
                      <button onClick={() => toggle(expandedCWAs, cwa.id, setExpandedCWAs)} className="text-hatch-blue hover:text-hatch-orange font-bold w-full h-full flex items-center justify-center">{isExp ? '▼' : '▶'}</button>
                    </td>
                    <td className={`p-2 font-bold text-hatch-blue ${stickyClass2}`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className={`text-[8px] px-1 rounded font-semibold ${cwa.es_transversal ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{cwa.es_transversal ? 'DWP' : 'CWA'}</span>
                            <span className="text-xs">{cwa.codigo}</span>
                        </div>
                        <span className="font-normal text-gray-500 text-[10px] leading-tight">{cwa.nombre}</span>
                      </div>
                    </td>
                    <td className={`p-1 text-center align-top ${rowBg}`}>
                      <select className={`text-[10px] border rounded px-1 py-0.5 w-full h-6 ${cwa.prioridad === 'CRITICA' ? 'border-red-300 text-red-600' : 'border-gray-300'}`} value={cwa.prioridad || 'MEDIA'} onChange={e => updateCWAField(cwa.id, 'prioridad', e.target.value)} onClick={e => e.stopPropagation()}>
                        <option value="BAJA">🟢 Baja</option><option value="MEDIA">🟡 Media</option><option value="ALTA">🟠 Alta</option><option value="CRITICA">🔴 Crítica</option>
                      </select>
                    </td>
                    <td colSpan={2 + customColumns.length} className={`p-2 text-[10px] text-gray-400 italic align-top ${rowBg}`}>📍 {cwa.plot_plan_nombre}</td>
                    <td className={`p-1 text-right align-top ${rowBg}`}>
                      <button onClick={() => openCWPModal(cwa)} className="text-[10px] bg-gray-100 hover:bg-hatch-orange hover:text-white text-gray-600 px-2 py-0.5 rounded border border-gray-300 transition-colors">+ CWP</button>
                    </td>
                  </tr>

                  {/* CWP ROW */}
                  {isExp && cwa.cwps.sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0)).map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    const cwpBg = 'bg-gray-50/50';
                    const stickyCwp = `sticky left-0 z-30 ${cwpBg} align-top`;
                    const stickyCwp2 = `sticky left-8 z-30 ${cwpBg} border-r-2 border-hatch-gray shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top break-words whitespace-normal pl-4`;

                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="hover:bg-gray-100 border-t border-gray-100">
                          <td className={stickyCwp}></td>
                          <td className={`p-1 ${stickyCwp2}`}>
                            <div className="flex items-start gap-2">
                              <button onClick={() => toggle(expandedCWPs, cwp.id, setExpandedCWPs)} className="text-hatch-blue hover:text-hatch-orange font-bold w-3 mt-0.5 text-[10px]">{isCwpExp ? '▼' : '▶'}</button>
                              <div className="flex flex-col w-full">
                                <span className="text-green-700 font-mono text-[10px] bg-green-50 px-1 rounded border border-green-100 w-fit mb-0.5">{cwp.codigo}</span>
                                <span className="text-hatch-blue font-medium text-[11px] leading-tight">{cwp.nombre}</span>
                              </div>
                            </div>
                          </td>
                          <td className={`p-1 text-center align-top ${cwpBg} text-[10px] text-gray-300`}>-</td>
                          <td className={`p-1 text-center align-top ${cwpBg}`}>
                            <input type="number" className="w-full border border-gray-300 rounded text-center text-[10px] h-6 focus:border-hatch-orange outline-none bg-white" value={cwp.secuencia || 0} onChange={e => updateCWPField(cwp.id, 'secuencia', e.target.value)} />
                          </td>
                          <td className={`p-1 text-center align-top ${cwpBg}`}>
                            <div className="flex gap-1">
                              <input type="date" className="border border-gray-300 rounded w-full text-[9px] px-0.5 py-0 bg-white h-6" value={cwp.forecast_inicio?.split('T')[0] || ''} onChange={e => updateCWPField(cwp.id, 'forecast_inicio', e.target.value)} />
                              <input type="date" className="border border-gray-300 rounded w-full text-[9px] px-0.5 py-0 bg-white h-6" value={cwp.forecast_fin?.split('T')[0] || ''} onChange={e => updateCWPField(cwp.id, 'forecast_fin', e.target.value)} />
                            </div>
                          </td>
                          {customColumns.map(c => (
                            <td key={c.id} className={`p-1 border-l border-gray-200 align-top ${cwpBg}`}>
                              <span className="text-[10px] bg-white px-1 py-0.5 rounded border border-gray-200 block w-full min-h-[20px] break-words">
                                {cwp.metadata_json?.[c.nombre] || ''}
                              </span>
                            </td>
                          ))}
                          <td className={`p-1 text-right align-top ${cwpBg}`}>
                            <div className="flex justify-end gap-1 flex-wrap">
                              <button onClick={() => openCWPModal(null, cwp)} className="text-gray-400 hover:text-hatch-blue text-[10px]">✏️</button>
                              <button onClick={() => handleDeleteCWP(cwp.id)} className="text-gray-400 hover:text-red-600 text-[10px]">🗑️</button>
                              <span className="text-gray-300 mx-1">|</span>
                              <button onClick={() => openPkgModal(cwp, 'EWP')} className="text-[9px] bg-white text-purple-700 border border-purple-200 px-1 rounded hover:bg-purple-50">+E</button>
                              <button onClick={() => openPkgModal(cwp, 'PWP')} className="text-[9px] bg-white text-teal-700 border border-teal-200 px-1 rounded hover:bg-teal-50">+P</button>
                              <button onClick={() => openPkgModal(cwp, 'IWP')} className="text-[9px] bg-white text-orange-700 border border-orange-200 px-1 rounded hover:bg-orange-50">+I</button>
                            </div>
                          </td>
                        </tr>

                        {/* PAQUETES ROW */}
                        {isCwpExp && cwp.paquetes.map(pkg => {
                          const isPkgExp = expandedPaquetes.has(pkg.id);
                          const pkgBg = 'bg-white';
                          const stickyPkg = `sticky left-0 z-30 ${pkgBg} align-top`;
                          const stickyPkg2 = `sticky left-8 z-30 ${pkgBg} border-r-2 border-hatch-gray shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top break-words whitespace-normal pl-8`;

                          return (
                            <React.Fragment key={pkg.id}>
                              <tr className="hover:bg-gray-50 border-t border-gray-100">
                                <td className={stickyPkg}></td>
                                <td className={`p-1 ${stickyPkg2}`}>
                                  <div className="flex items-start gap-1 text-gray-600">
                                    <button onClick={() => toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} className="hover:text-hatch-orange text-[10px] font-bold w-3 mt-0.5">{isPkgExp ? '▼' : '▶'}</button>
                                    <div className="flex flex-col w-full">
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className={`text-[8px] border px-1 rounded font-bold ${pkg.tipo === 'EWP' ? 'text-purple-700 bg-purple-50' : pkg.tipo === 'PWP' ? 'text-teal-700 bg-teal-50' : 'text-orange-700 bg-orange-50'}`}>{pkg.tipo}</span>
                                            <span className="font-mono text-[9px] text-gray-500">{pkg.codigo}</span>
                                        </div>
                                        <span className="text-[10px] italic text-gray-500 leading-tight">{pkg.nombre}</span>
                                    </div>
                                  </div>
                                </td>
                                <td colSpan={3} className={`p-1 ${pkgBg}`}></td>
                                {customColumns.map(c => <td key={c.id} className={`border-l border-gray-200 ${pkgBg}`}></td>)}
                                <td className={`p-1 text-right align-top ${pkgBg} opacity-50 hover:opacity-100`}>
                                  <div className="flex justify-end gap-1">
                                    <button onClick={() => handleDeletePkg(pkg.id)} className="text-gray-400 hover:text-red-600 text-[10px]">🗑️</button>
                                    <button onClick={() => openLinkModal(pkg)} className="text-blue-600 hover:underline text-[10px]">Link</button>
                                    <button onClick={() => addBatch(pkg.id)} className="text-hatch-orange font-bold text-[10px]">+Lote</button>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* ITEMS ROW */}
                              {isPkgExp && (
                                <>
                                  {pkg.items.map(item => {
                                    const itemBg = 'bg-gray-50/30';
                                    const stickyItem = `sticky left-0 z-30 ${itemBg} align-top`;
                                    const stickyItem2 = `sticky left-8 z-30 ${itemBg} border-r-2 border-hatch-gray shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top break-words whitespace-normal pl-12`;

                                    return (
                                      <tr key={item.id} className="hover:bg-blue-50/30 border-t border-gray-50">
                                        <td className={stickyItem}></td>
                                        <td className={`p-1 ${stickyItem2} text-[10px]`}>
                                          <div className="flex flex-col">
                                            <div className="flex justify-between items-start">
                                                <span className="text-hatch-blue font-medium leading-tight">{item.nombre}</span>
                                                {item.source_item_id && <span className="text-[8px] text-blue-500 bg-blue-50 px-1 rounded border border-blue-100 ml-1 whitespace-nowrap">🔗 {item.source_item_id}</span>}
                                            </div>
                                            {!item.source_item_id && <span className="text-[8px] text-gray-300 font-mono">#{item.id}</span>}
                                          </div>
                                        </td>
                                        <td className={`p-1 ${itemBg}`}></td>
                                        <td className={`p-1 ${itemBg}`}></td>
                                        <td className={`p-1 text-center align-top ${itemBg}`}>
                                          <input type="date" className="border border-gray-200 rounded w-full text-gray-500 text-[9px] px-0.5 py-0 h-5 bg-white text-center" value={item.forecast_fin?.split('T')[0] || ''} onChange={e => updateItemForecast(item.id, e.target.value)} />
                                        </td>
                                        {customColumns.map(c => <td key={c.id} className={`border-l border-gray-200 ${itemBg}`}></td>)}
                                        <td className={`p-1 text-right align-top ${itemBg}`}>
                                          <button onClick={() => handleDeleteItem(item.id)} className="text-gray-300 hover:text-red-500 text-[10px] px-1">×</button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  
                                  {/* BATCH ITEMS */}
                                  {pendingItems[pkg.id]?.map(t => (
                                    <tr key={t.id} className="bg-yellow-50 text-xs">
                                      <td className="sticky left-0 z-30 bg-yellow-50"></td>
                                      <td className="p-1 pl-12 sticky left-8 z-30 bg-yellow-50 border-r-2 border-hatch-gray text-[10px] font-bold text-yellow-700">⚡ Nuevo</td>
                                      <td colSpan={3} className="p-1">
                                        <input autoFocus className="w-full border border-yellow-300 rounded text-[10px] px-1 py-0.5 bg-white" value={t.nombre} onChange={e => changeBatch(pkg.id, t.id, e.target.value)} onKeyDown={e => {if(e.key === 'Enter') saveBatch(pkg)}} placeholder="Nombre..." />
                                      </td>
                                      <td colSpan={customColumns.length}></td>
                                      <td className="p-1 text-right">
                                        <button onClick={() => setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i => i.id !== t.id)})} className="text-red-400 hover:text-red-600 px-1">×</button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* SAVE BTN */}
                                  {pendingItems[pkg.id]?.length > 0 && (
                                    <tr className="bg-yellow-50 border-b border-yellow-200">
                                      <td colSpan="100%" className="text-center p-1">
                                        <button onClick={() => saveBatch(pkg)} className="bg-gradient-orange text-white font-bold px-4 py-0.5 rounded text-[10px] shadow-sm">GUARDAR ({pendingItems[pkg.id].length})</button>
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

      {/* Modales se mantienen igual, solo asegurate de que estén al final */}
      {modals.cwp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white w-[400px] p-4 rounded shadow-lg border border-gray-300">
                <h3 className="font-bold text-hatch-blue mb-3">Gestión CWP</h3>
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
                    <button onClick={() => setModals({...modals, cwp: false})} className="text-xs text-gray-500">Cancelar</button>
                    <button onClick={handleSaveCWP} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">Guardar</button>
                </div>
            </div>
        </div>
      )}
      
      {/* (Resto de modales Link, Pkg, Import: Mismos que antes pero con estilos compactos si lo deseas, o déjalos igual) */}
      {modals.pkg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-4 rounded w-80 shadow-lg">
            <h3 className="font-bold text-sm mb-2">Nuevo {formData.tipo}</h3>
            <input className="w-full border p-1.5 rounded text-sm mb-3" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModals({...modals, pkg: false})} className="text-xs text-gray-500">Cancelar</button>
              <button onClick={handleSavePkg} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">Crear</button>
            </div>
          </div>
        </div>
      )}

      {modals.link && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[600px] h-[80vh] p-4 rounded flex flex-col shadow-lg">
            <h3 className="font-bold text-sm mb-2">Vincular Items</h3>
            <div className="flex gap-2 mb-2 text-xs">
                <button onClick={() => setLinkFilter("ALL")} className={`px-2 py-1 rounded ${linkFilter==="ALL" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>Todos</button>
                <button onClick={() => setLinkFilter("TRANSVERSAL")} className={`px-2 py-1 rounded ${linkFilter==="TRANSVERSAL" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>Transversales</button>
            </div>
            <div className="flex-1 overflow-y-auto border p-2 rounded bg-gray-50">
                {transversalItems.filter(i => linkFilter === "ALL" || i.es_transversal).map(item => (
                    <div key={item.id} onClick={() => toggle(selectedLinkItems, item.id, setSelectedLinkItems)} className={`text-xs p-2 mb-1 rounded border cursor-pointer ${selectedLinkItems.has(item.id) ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                        {selectedLinkItems.has(item.id) && "✅ "} {item.nombre} <span className="text-gray-400">({item.cwa})</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setModals({...modals, link: false})} className="text-xs text-gray-500">Cancelar</button>
                <button onClick={handleLinkItems} className="text-xs bg-hatch-orange text-white px-3 py-1 rounded">Vincular</button>
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