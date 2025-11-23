// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
// Ruta relativa estándar (sube 3 niveles hasta src/api/axios)
import client from '../../../api/axios';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  // 1. ESTADO DE DATOS
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customColumns, setCustomColumns] = useState([]);

  // 2. ESTADOS DE FILTROS Y EXPANSIÓN
  const [filters, setFilters] = useState({ codigo: '', nombre: '' });
  const [expandedCWAs, setExpandedCWAs] = useState(new Set()); 
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());

  // 3. ITEMS TEMPORALES (Batch Create)
  const [pendingItems, setPendingItems] = useState({});
  
  // 4. MODALES
  const [modals, setModals] = useState({ 
    cwp: false, 
    pkg: false, 
    link: false, 
    import: false, 
    editItem: false 
  });
  
  // Estados de edición / formularios
  const [isEditingCWP, setIsEditingCWP] = useState(false);
  const [editingCWPId, setEditingCWPId] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [formData, setFormData] = useState({});
  
  // Importación
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Vinculación
  const [transversalItems, setTransversalItems] = useState([]);
  const [selectedLinkItems, setSelectedLinkItems] = useState(new Set());
  const [linkFilter, setLinkFilter] = useState("ALL");

  // Clasificación Item
  const [editingItem, setEditingItem] = useState(null);
  const [itemTipos, setItemTipos] = useState([]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    loadData();
  }, [plotPlanId, proyecto.id]);

  const loadData = async () => {
    // Truco visual: No mostramos loading si ya hay datos para evitar saltos de scroll
    if (!jerarquia) setLoading(true);
    
    try {
      // 1. Columnas
      const colsRes = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setCustomColumns(colsRes.data);

      // 2. Jerarquía (Global o Filtrada)
      const url = `/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`;
        
      const res = await client.get(url);
      setJerarquia(res.data);
      
      // 3. AUTO-EXPANDIR TODO AL CARGAR (Solo la primera vez)
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
      
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const toggle = (set, id, setFn) => { 
      const newSet = new Set(set); 
      newSet.has(id) ? newSet.delete(id) : newSet.add(id); 
      setFn(newSet); 
  };

  // --- UPDATES EN LÍNEA ---
  const updateCWAField = async (id, field, value) => {
      try { await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); loadData(); } catch(e){console.error(e)}
  };
  const updateCWPField = async (id, field, value) => {
      try { await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); loadData(); } catch(e){console.error(e)}
  };
  const updateItemForecast = async (id, date) => {
      try { await client.put(`/awp-nuevo/item/${id}`, { forecast_fin: date }); loadData(); } catch(e){console.error(e)}
  };

  // --- HANDLERS CWP ---
  const openCWPModal = (cwa=null, cwp=null) => {
      if(cwp) { 
          setIsEditingCWP(true); setEditingCWPId(cwp.id); 
          setFormData({ nombre:cwp.nombre, disciplina_id:cwp.disciplina_id, metadata:cwp.metadata_json||{} }); 
      } else { 
          setIsEditingCWP(false); setSelectedParent(cwa); 
          setFormData({ nombre:'', disciplina_id: proyecto.disciplinas?.[0]?.id||'', metadata:{} }); 
      }
      setModals({...modals, cwp:true});
  };

  const handleSaveCWP = async () => {
      try {
          const payload = { ...formData, area_id: selectedParent?.id||0, descripcion: '', metadata_json: formData.metadata };
          if(isEditingCWP) await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload);
          else await client.post(`/awp-nuevo/cwp`, payload);
          setModals({...modals, cwp:false}); loadData(); if(onDataChange) onDataChange();
      } catch(e){ alert("Error: "+e.message); }
  };

  const handleDeleteCWP = async (id) => {
      if(!confirm("¿Eliminar CWP y contenido?")) return;
      try { await client.delete(`/awp-nuevo/cwp/${id}`); loadData(); } catch(e){ alert("Error borrando CWP"); }
  };

  // --- HANDLERS PAQUETE ---
  const openPkgModal = (cwp, tipo) => { setSelectedParent(cwp); setFormData({nombre:'', tipo, responsable:'Firma'}); setModals({...modals, pkg:true}); };
  const handleSavePkg = async () => { try { await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); setModals({...modals, pkg:false}); loadData(); } catch(e){ alert("Error"); } };
  const handleDeletePkg = async (id) => { if(confirm("¿Borrar Paquete?")) { await client.delete(`/awp-nuevo/paquete/${id}`); loadData(); } };

  // --- HANDLERS ITEMS (BATCH) ---
  const addBatch = (pkgId) => {
      const count = parseInt(prompt("Cantidad:", "5")) || 0; if(count<=0) return;
      const current = pendingItems[pkgId] || [];
      const newRows = Array.from({length:count}).map((_,i)=>({id:`temp_${Date.now()}_${i}`, nombre:''}));
      setPendingItems({...pendingItems, [pkgId]: [...current, ...newRows]});
      setExpandedPaquetes(prev => new Set(prev).add(pkgId)); // Auto-expandir
  };
  const changeBatch = (pkgId, tempId, val) => { const list = pendingItems[pkgId].map(i => i.id===tempId ? {...i, nombre:val} : i); setPendingItems({...pendingItems, [pkgId]: list}); };
  const saveBatch = async (pkg) => {
      const toSave = pendingItems[pkg.id]?.filter(i=>i.nombre.trim()) || [];
      if(!toSave.length) return;
      try {
          await Promise.all(toSave.map(i => client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre })));
          const newP = {...pendingItems}; delete newP[pkg.id]; setPendingItems(newP); loadData();
      } catch(e){ alert("Error guardando batch"); }
  };
  const handleDeleteItem = async (id) => { if(confirm("¿Borrar?")) { await client.delete(`/awp-nuevo/item/${id}`); loadData(); } };

  // --- VINCULACIÓN ---
  const openLinkModal = async (pkg) => { setSelectedParent(pkg); const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); setTransversalItems(res.data); setSelectedLinkItems(new Set()); setLinkFilter("ALL"); setModals({...modals, link:true}); };
  const handleLinkItems = async () => { await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { source_item_ids: Array.from(selectedLinkItems) }); setModals({...modals, link:false}); loadData(); };

  // --- CLASIFICACIÓN ---
  const openClassifyModal = async (item, cwpId) => { setEditingItem(item); const res = await client.get(`/awp-nuevo/cwp/${cwpId}/tipos-entregables-disponibles`); setItemTipos(res.data); setModals({...modals, editItem:true}); };
  const handleSaveClassify = async () => { await client.put(`/awp-nuevo/item/${editingItem.id}`, { tipo_entregable_id: editingItem.tipo_entregable_id }); setModals({...modals, editItem:false}); loadData(); };

  // --- IMPORT / EXPORT ---
  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');
  const handleImport = async (e) => { e.preventDefault(); if(!importFile) return; setImporting(true); const fd = new FormData(); fd.append('file', importFile); try { await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); alert("Importado"); setModals({...modals, import:false}); loadData(); if(onDataChange) onDataChange(); } catch(e) { alert("Error: "+(e.response?.data?.detail||e.message)); } finally { setImporting(false); } };

  if (loading && !jerarquia) return <div className="p-10 text-center">Cargando...</div>;
  const cwasToRender = jerarquia?.cwas?.filter(cwa => !filters.codigo || cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase())).sort((a,b) => a.codigo.localeCompare(b.codigo));

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* HEADER DE TABLA */}
      <div className="flex justify-between items-center p-3 bg-gray-800 rounded border border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
            <h3 className="text-white font-bold text-lg">Control AWP</h3>
            <div className="h-6 w-px bg-gray-600"></div>
            <span className="text-xs text-gray-400">Proyecto: {proyecto.nombre}</span>
        </div>
        <div className="flex gap-2">
            <button onClick={()=>setModals({...modals, import:true})} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors border border-gray-600">📤 Importar</button>
            <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-sm">📥 Exportar</button>
        </div>
      </div>

      {/* TABLA (DISEÑO MINIMALISTA) */}
      <div className="flex-1 overflow-auto border border-gray-700 rounded bg-gray-900 shadow-inner custom-scrollbar">
        <table className="w-full text-left border-collapse relative">
            <thead className="bg-gray-800 text-xs uppercase font-bold text-gray-400 sticky top-0 z-20 shadow-md">
                <tr>
                    <th className="p-3 w-8 sticky left-0 bg-gray-800 z-30 border-b border-gray-700"></th>
                    <th className="p-3 min-w-[280px] sticky left-8 bg-gray-800 z-30 border-r border-b border-gray-700">
                        <div className="flex flex-col gap-1">
                            <span>Jerarquía</span>
                            <input className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-white font-normal text-[10px] focus:border-blue-500 outline-none" placeholder="Filtrar código..." onChange={e=>setFilters({...filters, codigo:e.target.value})} />
                        </div>
                    </th>
                    <th className="p-3 w-24 text-center border-b border-gray-700">Prioridad (Área)</th>
                    <th className="p-3 w-16 text-center border-b border-gray-700">Seq</th>
                    <th className="p-3 w-48 text-center border-b border-gray-700">Forecasts (CWP/Item)</th>
                    <th className="p-3 w-24 text-center border-b border-gray-700">Progreso</th>
                    {customColumns.map(c=><th key={c.id} className="p-3 border-l border-b border-gray-700 text-blue-300 whitespace-nowrap">{c.nombre}</th>)}
                    <th className="p-3 text-right border-b border-gray-700 min-w-[120px]">Acciones</th>
                </tr>
            </thead>
            <tbody className="text-sm text-gray-300 divide-y divide-gray-800">
                {cwasToRender?.map(cwa => {
                    const isExp = expandedCWAs.has(cwa.id);
                    return (
                        <React.Fragment key={cwa.id}>
                            {/* NIVEL 1: CWA (AREA) */}
                            <tr className="bg-gray-800/90 hover:bg-gray-800 transition-colors">
                                <td className="p-2 text-center sticky left-0 bg-inherit z-10"><button onClick={()=>toggle(expandedCWAs, cwa.id, setExpandedCWAs)} className="text-gray-400 hover:text-white font-bold w-full">{isExp?'▼':'▶'}</button></td>
                                <td className="p-2 font-bold text-white sticky left-8 bg-inherit z-10 border-r border-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-1.5 rounded border ${cwa.es_transversal ? 'bg-purple-900/50 border-purple-700 text-purple-200':'bg-blue-900/50 border-blue-800 text-blue-200'}`}>
                                            {cwa.es_transversal ? 'DWP' : 'CWA'}
                                        </span>
                                        {cwa.codigo} - {cwa.nombre}
                                    </div>
                                </td>
                                
                                {/* PRIORIDAD AREA */}
                                <td className="p-2 text-center">
                                    <select 
                                        className={`bg-transparent text-xs font-bold border border-transparent hover:border-gray-600 rounded cursor-pointer p-1 ${cwa.prioridad==='CRITICA'?'text-red-400':cwa.prioridad==='ALTA'?'text-orange-400':'text-gray-400'}`} 
                                        value={cwa.prioridad || 'MEDIA'} 
                                        onChange={e=>updateCWAField(cwa.id, 'prioridad', e.target.value)}
                                        onClick={e=>e.stopPropagation()}
                                    >
                                        <option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option>
                                    </select>
                                </td>
                                
                                <td colSpan={3+customColumns.length} className="p-2 text-xs text-gray-500 italic text-center">{cwa.plot_plan_nombre}</td>
                                <td className="p-2 text-right"><button onClick={()=>openCWPModal(cwa)} className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors shadow">+ CWP</button></td>
                            </tr>

                            {/* NIVEL 2: CWP */}
                            {isExp && cwa.cwps.sort((a,b)=>(a.secuencia||0)-(b.secuencia||0)).map(cwp => {
                                const isCwpExp = expandedCWPs.has(cwp.id);
                                return (
                                    <React.Fragment key={cwp.id}>
                                        <tr className="bg-gray-900/40 hover:bg-gray-800/40 border-t border-gray-800">
                                            <td className="sticky left-0 bg-inherit z-10"></td>
                                            <td className="p-2 pl-8 sticky left-8 bg-inherit z-10 border-r border-gray-700 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={()=>toggle(expandedCWPs, cwp.id, setExpandedCWPs)} className="text-gray-500 hover:text-white text-xs mr-1 w-4">{isCwpExp?'▼':'▶'}</button>
                                                    <span className="text-green-500 font-mono text-xs">{cwp.codigo}</span>
                                                    <span className="text-gray-300 text-xs truncate max-w-[150px]" title={cwp.nombre}>{cwp.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-2 text-center text-gray-600 border-r border-gray-800/50">-</td>
                                            
                                            {/* SECUENCIA */}
                                            <td className="p-2 text-center border-r border-gray-800/50">
                                                <input type="number" className="w-8 bg-transparent border-b border-gray-700 text-center text-xs text-gray-300 focus:border-blue-500 outline-none" defaultValue={cwp.secuencia} onBlur={e=>updateCWPField(cwp.id, 'secuencia', e.target.value)} />
                                            </td>

                                            {/* FORECASTS CWP */}
                                            <td className="p-2 text-center text-xs border-r border-gray-800/50">
                                                <div className="flex justify-center gap-2">
                                                    <input type="date" className="bg-transparent w-20 text-gray-400 text-[10px] border-none p-0 hover:text-white cursor-pointer" defaultValue={cwp.forecast_inicio?.split('T')[0]} onBlur={e=>updateCWPField(cwp.id, 'forecast_inicio', e.target.value)} title="Inicio Estimado" />
                                                    <span className="text-gray-600">➜</span>
                                                    <input type="date" className="bg-transparent w-20 text-gray-400 text-[10px] border-none p-0 hover:text-white cursor-pointer" defaultValue={cwp.forecast_fin?.split('T')[0]} onBlur={e=>updateCWPField(cwp.id, 'forecast_fin', e.target.value)} title="Fin Estimado" />
                                                </div>
                                            </td>

                                            <td className="p-2 text-center border-r border-gray-800/50">
                                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full" style={{width: `${cwp.porcentaje_completitud}%`}}></div></div>
                                            </td>

                                            {/* METADATOS DINÁMICOS */}
                                            {customColumns.map(c => (
                                                <td key={c.id} className="p-2 border-l border-gray-800 text-xs whitespace-nowrap">
                                                    <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">{cwp.metadata_json?.[c.nombre]||'-'}</span>
                                                </td>
                                            ))}

                                            <td className="p-2 text-right flex justify-end gap-1 items-center">
                                                <button onClick={()=>openCWPModal(null, cwp)} className="text-gray-500 hover:text-white text-xs mr-1 p-1 rounded hover:bg-gray-700" title="Editar">✏️</button>
                                                <button onClick={()=>handleDeleteCWP(cwp.id)} className="text-red-500 hover:text-red-400 text-xs mr-2 p-1 rounded hover:bg-red-900/20" title="Eliminar">✕</button>
                                                <button onClick={()=>openPkgModal(cwp,'EWP')} className="text-[9px] bg-purple-900/40 text-purple-200 px-1.5 py-0.5 rounded hover:bg-purple-800 transition-colors border border-purple-900">+E</button>
                                                <button onClick={()=>openPkgModal(cwp,'PWP')} className="text-[9px] bg-teal-900/40 text-teal-200 px-1.5 py-0.5 rounded hover:bg-teal-800 transition-colors border border-teal-900">+P</button>
                                                <button onClick={()=>openPkgModal(cwp,'IWP')} className="text-[9px] bg-orange-900/40 text-orange-200 px-1.5 py-0.5 rounded hover:bg-orange-800 transition-colors border border-orange-900">+I</button>
                                            </td>
                                        </tr>

                                        {/* NIVEL 3: PAQUETES */}
                                        {isCwpExp && cwp.paquetes.map(pkg => {
                                            const isPkgExp = expandedPaquetes.has(pkg.id);
                                            return (
                                            <React.Fragment key={pkg.id}>
                                                <tr className="bg-gray-900 hover:bg-gray-900/80 text-xs group border-t border-gray-800/50">
                                                    <td className="sticky left-0 bg-inherit z-10"></td>
                                                    <td className="p-2 pl-14 sticky left-8 bg-inherit z-10 border-r border-gray-800">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <button onClick={()=>toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} className="hover:text-white mr-1 w-3">{isPkgExp?'▼':'▶'}</button>
                                                            <span className="text-[9px] border border-gray-700 px-1 rounded text-purple-400 bg-purple-900/10">{pkg.tipo}</span>
                                                            {pkg.codigo}
                                                        </div>
                                                    </td>
                                                    <td colSpan={3} className="p-2 text-gray-500 italic">{pkg.nombre}</td>
                                                    <td className="p-2 text-center text-gray-600">-</td>
                                                    {customColumns.map(c=><td key={c.id} className="border-l border-gray-800"></td>)}
                                                    <td className="p-2 text-right opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={()=>handleDeletePkg(pkg.id)} className="text-red-500 mr-3 hover:bg-red-900/20 px-1 rounded">✕</button>
                                                        <button onClick={()=>openLinkModal(pkg)} className="text-blue-400 mr-3 hover:underline">🔗 Link</button>
                                                        <button onClick={()=>addBatch(pkg.id)} className="text-yellow-500 hover:underline font-bold">+ Lote</button>
                                                    </td>
                                                </tr>

                                                {/* NIVEL 4: ITEMS */}
                                                {isPkgExp && (
                                                    <>
                                                        {pkg.items.map(item => (
                                                            <tr key={item.id} className="bg-black/20 text-[11px] hover:bg-black/40 transition-colors">
                                                                <td className="sticky left-0 bg-gray-900/0 z-10"></td>
                                                                <td className="p-1 pl-24 sticky left-8 bg-gray-900/0 z-10 border-r border-gray-800/50 text-gray-500 truncate max-w-[200px]">
                                                                    {item.source_item_id ? <span className="text-blue-400 flex items-center gap-1" title={`Origen: ${item.origen_info}`}>🔗 {item.origen_info}</span> : `ID: ${item.id}`}
                                                                </td>
                                                                <td colSpan={2} className="p-1 text-gray-300 pl-4">
                                                                    {item.nombre}
                                                                    <button onClick={()=>openClassifyModal(item, cwp.id)} className="ml-2 text-[9px] text-gray-500 hover:text-white border border-gray-700 px-1 rounded hover:bg-gray-700">
                                                                        {item.tipo_entregable_codigo || "Clasificar 🏷️"}
                                                                    </button>
                                                                </td>
                                                                <td className="p-1 text-center">
                                                                    {/* FORECAST ITEM */}
                                                                    <input type="date" className="bg-transparent w-20 text-gray-500 border-none p-0 hover:text-white text-[10px] text-center" defaultValue={item.forecast_fin?.split('T')[0]} onBlur={e=>updateItemForecast(item.id, e.target.value)} />
                                                                </td>
                                                                <td colSpan={1+customColumns.length}></td>
                                                                <td className="p-1 text-right"><button onClick={()=>handleDeleteItem(item.id)} className="text-gray-700 hover:text-red-500 px-2">🗑️</button></td>
                                                            </tr>
                                                        ))}
                                                        
                                                        {/* RELLENO RÁPIDO */}
                                                        {pendingItems[pkg.id]?.map(t => (
                                                            <tr key={t.id} className="bg-yellow-900/5 text-xs animate-pulse">
                                                                <td className="sticky left-0"></td>
                                                                <td className="p-1 pl-24 text-yellow-600 sticky left-8 border-r border-yellow-900/30">Nuevo</td>
                                                                <td colSpan={3} className="p-1">
                                                                    <input autoFocus className="w-full bg-transparent border-b border-yellow-700/50 text-white outline-none px-1 placeholder-yellow-800" value={t.nombre} onChange={e=>changeBatch(pkg.id, t.id, e.target.value)} onKeyDown={e=>{if(e.key==='Enter') saveBatch(pkg)}} placeholder="Escribe nombre entregable..." />
                                                                </td>
                                                                <td colSpan={2+customColumns.length}></td>
                                                                <td className="p-1 text-right"><button onClick={()=>setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i=>i.id!==t.id)})} className="text-red-400 hover:bg-red-900/20 px-1 rounded">✕</button></td>
                                                            </tr>
                                                        ))}
                                                        {pendingItems[pkg.id]?.length > 0 && (
                                                            <tr className="bg-yellow-900/10"><td colSpan="100%" className="text-center p-1"><button onClick={()=>saveBatch(pkg)} className="text-yellow-400 font-bold hover:text-white text-xs uppercase tracking-wider border border-yellow-800 px-4 py-1 rounded bg-yellow-900/40 hover:bg-yellow-800">💾 Guardar Lote</button></td></tr>
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
      {modals.cwp && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"><div className="bg-gray-800 w-96 p-6 rounded-lg border border-gray-600 shadow-2xl"><h3 className="text-white font-bold mb-4 text-lg">{isEditingCWP?'Editar':'Crear'} CWP</h3><input className="w-full mb-3 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:border-blue-500 outline-none" placeholder="Nombre del Paquete" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} />{!isEditingCWP && <div className="mb-4"><label className="text-xs text-gray-400 block mb-1">Disciplina</label><select className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2" value={formData.disciplina_id} onChange={e=>setFormData({...formData, disciplina_id:e.target.value})}><option value="">Seleccionar...</option>{proyecto.disciplinas?.map(d=><option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}</select></div>}<div className="border-t border-gray-700 pt-3"><p className="text-blue-400 text-xs font-bold mb-2 uppercase tracking-wider">Etiquetas / Metadatos</p>{customColumns.map(c=><div key={c.id} className="mb-3"><label className="text-xs text-gray-400 block mb-1">{c.nombre}</label>{c.tipo_dato==='SELECCION'?<select className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[c.nombre]||''} onChange={e=>setFormData({...formData, metadata:{...formData.metadata, [c.nombre]:e.target.value}})}><option value="">- Seleccionar -</option>{c.opciones_json?.map(o=><option key={o} value={o}>{o}</option>)}</select>:<input className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm" value={formData.metadata?.[c.nombre]||''} onChange={e=>setFormData({...formData, metadata:{...formData.metadata, [c.nombre]:e.target.value}})} />}</div>)}</div><div className="flex justify-end gap-2 mt-6"><button onClick={()=>setModals({...modals, cwp:false})} className="text-gray-400 hover:text-white px-3 transition-colors">Cancelar</button><button onClick={handleSaveCWP} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold shadow-lg transition-transform transform hover:scale-105">{isEditingCWP?'Guardar Cambios':'Crear CWP'}</button></div></div></div>}
      
      {modals.pkg && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"><div className="bg-gray-800 p-6 rounded-lg w-80 border border-gray-600 shadow-2xl"><h3 className="text-white font-bold mb-4">Nuevo {formData.tipo}</h3><input className="w-full mb-4 bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:border-green-500 outline-none" placeholder="Nombre del Paquete" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} /><div className="flex justify-end gap-2"><button onClick={()=>setModals({...modals, pkg:false})} className="text-gray-400 hover:text-white px-3">Cancelar</button><button onClick={handleSavePkg} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold shadow-lg">Crear</button></div></div></div>}
      
      {modals.link && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"><div className="bg-gray-800 w-[600px] p-6 rounded-lg border border-gray-600 h-[80vh] flex flex-col shadow-2xl"><h3 className="text-xl font-bold text-white mb-1">🔗 Vincular Entregables</h3><p className="text-gray-400 text-xs mb-4">Selecciona items de otras áreas para traerlos a este paquete.</p><div className="flex gap-2 mb-3"><button onClick={()=>setLinkFilter("ALL")} className={`px-3 py-1 rounded text-xs font-bold ${linkFilter==="ALL"?'bg-blue-600 text-white':'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Todo el Proyecto</button><button onClick={()=>setLinkFilter("TRANSVERSAL")} className={`px-3 py-1 rounded text-xs font-bold ${linkFilter==="TRANSVERSAL"?'bg-blue-600 text-white':'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Solo Transversales</button></div><div className="flex-1 overflow-y-auto bg-gray-900 p-2 rounded border border-gray-700 custom-scrollbar">{transversalItems.filter(i=>linkFilter==="ALL"||i.es_transversal).map(item=>(<div key={item.id} className={`flex items-center p-3 mb-1 rounded cursor-pointer border transition-all ${selectedLinkItems.has(item.id)?'border-blue-500 bg-blue-900/20':'border-gray-800 hover:bg-gray-800'}`} onClick={()=>toggle(selectedLinkItems, item.id, setSelectedLinkItems)}><div className={`w-5 h-5 border rounded mr-3 flex items-center justify-center transition-colors ${selectedLinkItems.has(item.id)?'bg-blue-500 border-blue-500':'border-gray-500'}`}>{selectedLinkItems.has(item.id)&&'✓'}</div><div><p className="text-white text-sm font-medium">{item.nombre}</p><p className="text-gray-500 text-xs">{item.cwa} ➝ {item.paquete}</p></div></div>))}</div><div className="mt-4 flex justify-end gap-3 pt-3 border-t border-gray-700"><button onClick={()=>setModals({...modals, link:false})} className="text-gray-400 hover:text-white px-3">Cancelar</button><button onClick={handleLinkItems} className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow-lg">Vincular ({selectedLinkItems.size})</button></div></div></div>}
      
      {modals.editItem && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"><div className="bg-gray-800 p-6 rounded-lg w-80 border border-gray-600 shadow-2xl"><h3 className="text-white font-bold mb-2">Clasificar Item</h3><p className="text-gray-400 text-sm mb-4 italic">"{auxData.editingItem.nombre}"</p><label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Tipo de Entregable</label><select className="w-full bg-gray-900 text-white p-2 rounded mb-6 border border-gray-700 focus:border-blue-500 outline-none" value={auxData.editingItem.tipo_entregable_id||''} onChange={e=>setAuxData({...auxData, editingItem:{...auxData.editingItem, tipo_entregable_id:e.target.value}})}><option value="">- Sin Tipo -</option>{auxData.itemTipos.map(t=><option key={t.id} value={t.id}>{t.codigo} - {t.nombre}</option>)}</select><div className="flex justify-end gap-2"><button onClick={()=>setModals({...modals, editItem:false})} className="text-gray-400 hover:text-white px-3">Cancelar</button><button onClick={handleSaveClassify} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold shadow">Guardar</button></div></div></div>}
      
      {modals.import && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"><div className="bg-gray-800 p-6 rounded-lg w-96 border border-gray-700 shadow-2xl"><h3 className="text-white font-bold mb-2">Importar Excel/CSV</h3><p className="text-xs text-gray-400 mb-4">Sube tu archivo para crear o actualizar registros masivamente.</p><form onSubmit={handleImport}><label className="block mb-4 cursor-pointer"><div className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors"><span className="text-gray-400 text-sm">{importFile ? importFile.name : "Haz clic para seleccionar archivo"}</span></div><input type="file" accept=".csv,.xlsx" onChange={e=>setImportFile(e.target.files[0])} className="hidden" /></label><div className="flex justify-end gap-2"><button type="button" onClick={()=>setModals({...modals, import:false})} className="text-gray-400 hover:text-white px-3">Cancelar</button><button type="submit" disabled={importing || !importFile} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2 rounded font-bold shadow-lg">{importing?'Procesando...':'Importar'}</button></div></form></div></div>}

    </div>
  );
}

export default AWPTableConsolidada;