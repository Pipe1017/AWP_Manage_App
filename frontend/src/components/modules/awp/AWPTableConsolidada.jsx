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
    loadData();
  }, [plotPlanId, proyecto.id]);

  const loadData = async () => {
    if (!jerarquia) setLoading(true);
    
    try {
      // Columnas personalizadas
      const colsRes = await client.get(`/proyectos/${proyecto.id}/config/columnas`);
      setCustomColumns(colsRes.data);

      // Jerarquía global
      const url = `/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`;
      const res = await client.get(url);
      setJerarquia(res.data);
      
      // Auto-expandir todo al cargar (primera vez)
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
  // 6. HELPERS
  // ============================================================================
  const toggle = (set, id, setFn) => { 
    const newSet = new Set(set); 
    newSet.has(id) ? newSet.delete(id) : newSet.add(id); 
    setFn(newSet); 
  };

  // ============================================================================
  // 7. UPDATES EN LÍNEA
  // ============================================================================
  const updateCWAField = async (id, field, value) => {
    try { 
      await client.put(`/awp-nuevo/cwa/${id}`, { [field]: value }); 
      loadData(); 
    } catch(e) {
      console.error(e);
    }
  };

  const updateCWPField = async (id, field, value) => {
    try { 
      await client.put(`/awp-nuevo/cwp/${id}`, { [field]: value }); 
      loadData(); 
    } catch(e) {
      console.error(e);
    }
  };

  const updateItemForecast = async (id, date) => {
    try { 
      await client.put(`/awp-nuevo/item/${id}`, { forecast_fin: date }); 
      loadData(); 
    } catch(e) {
      console.error(e);
    }
  };

  // ============================================================================
  // 8. HANDLERS CWP
  // ============================================================================
  const openCWPModal = (cwa=null, cwp=null) => {
    if(cwp) { 
      setIsEditingCWP(true); 
      setEditingCWPId(cwp.id); 
      setFormData({ 
        nombre: cwp.nombre, 
        disciplina_id: cwp.disciplina_id, 
        metadata: cwp.metadata_json || {} 
      }); 
    } else { 
      setIsEditingCWP(false); 
      setSelectedParent(cwa); 
      setFormData({ 
        nombre: '', 
        disciplina_id: proyecto.disciplinas?.[0]?.id || '', 
        metadata: {} 
      }); 
    }
    setModals({...modals, cwp: true});
  };

  const handleSaveCWP = async () => {
    try {
      const payload = { 
        ...formData, 
        area_id: selectedParent?.id || 0, 
        descripcion: '', 
        metadata_json: formData.metadata 
      };
      
      if(isEditingCWP) {
        await client.put(`/awp-nuevo/cwp/${editingCWPId}`, payload);
      } else {
        await client.post(`/awp-nuevo/cwp`, payload);
      }
      
      setModals({...modals, cwp: false}); 
      loadData(); 
      if(onDataChange) onDataChange();
    } catch(e) { 
      alert("Error: " + e.message); 
    }
  };

  const handleDeleteCWP = async (id) => {
    if(!confirm("¿Eliminar CWP y todo su contenido?")) return;
    try { 
      await client.delete(`/awp-nuevo/cwp/${id}`); 
      loadData(); 
    } catch(e) { 
      alert("Error borrando CWP"); 
    }
  };

  // ============================================================================
  // 9. HANDLERS PAQUETE
  // ============================================================================
  const openPkgModal = (cwp, tipo) => { 
    setSelectedParent(cwp); 
    setFormData({
      nombre: '', 
      tipo, 
      responsable: 'Firma'
    }); 
    setModals({...modals, pkg: true}); 
  };

  const handleSavePkg = async () => { 
    try { 
      await client.post(`/awp-nuevo/cwp/${selectedParent.id}/paquete`, formData); 
      setModals({...modals, pkg: false}); 
      loadData(); 
    } catch(e) { 
      alert("Error creando paquete"); 
    } 
  };

  const handleDeletePkg = async (id) => { 
    if(confirm("¿Borrar Paquete y sus items?")) { 
      await client.delete(`/awp-nuevo/paquete/${id}`); 
      loadData(); 
    } 
  };

  // ============================================================================
  // 10. HANDLERS ITEMS (BATCH)
  // ============================================================================
  const addBatch = (pkgId) => {
    const count = parseInt(prompt("¿Cuántos items deseas crear?", "5")) || 0; 
    if(count <= 0) return;
    
    const current = pendingItems[pkgId] || [];
    const newRows = Array.from({length: count}).map((_, i) => ({
      id: `temp_${Date.now()}_${i}`, 
      nombre: ''
    }));
    
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
      await Promise.all(toSave.map(i => 
        client.post(`/awp-nuevo/paquete/${pkg.id}/item`, { nombre: i.nombre })
      ));
      
      const newP = {...pendingItems}; 
      delete newP[pkg.id]; 
      setPendingItems(newP); 
      loadData();
    } catch(e) { 
      alert("Error guardando lote de items"); 
    }
  };

  const handleDeleteItem = async (id) => { 
    if(confirm("¿Borrar este item?")) { 
      await client.delete(`/awp-nuevo/item/${id}`); 
      loadData(); 
    } 
  };

  // ============================================================================
  // 11. VINCULACIÓN
  // ============================================================================
  const openLinkModal = async (pkg) => { 
    setSelectedParent(pkg); 
    const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/items-disponibles?filter_type=ALL`); 
    setTransversalItems(res.data); 
    setSelectedLinkItems(new Set()); 
    setLinkFilter("ALL"); 
    setModals({...modals, link: true}); 
  };

  const handleLinkItems = async () => { 
    await client.post(`/awp-nuevo/paquete/${selectedParent.id}/vincular-items`, { 
      source_item_ids: Array.from(selectedLinkItems) 
    }); 
    setModals({...modals, link: false}); 
    loadData(); 
  };

  // ============================================================================
  // 12. CLASIFICACIÓN
  // ============================================================================
  const openClassifyModal = async (item, cwpId) => { 
    setEditingItem(item); 
    const res = await client.get(`/awp-nuevo/cwp/${cwpId}/tipos-entregables-disponibles`); 
    setItemTipos(res.data); 
    setModals({...modals, editItem: true}); 
  };

  const handleSaveClassify = async () => { 
    await client.put(`/awp-nuevo/item/${editingItem.id}`, { 
      tipo_entregable_id: editingItem.tipo_entregable_id 
    }); 
    setModals({...modals, editItem: false}); 
    loadData(); 
  };

  // ============================================================================
  // 13. IMPORT / EXPORT
  // ============================================================================
  const handleExport = () => window.open(`${client.defaults.baseURL}/awp-nuevo/exportar-csv/${proyecto.id}`, '_blank');

  const handleImport = async (e) => { 
    e.preventDefault(); 
    if(!importFile) return; 
    
    setImporting(true); 
    const fd = new FormData(); 
    fd.append('file', importFile); 
    
    try { 
      await client.post(`/awp-nuevo/importar-csv/${proyecto.id}`, fd); 
      alert("✅ Importación exitosa"); 
      setModals({...modals, import: false}); 
      loadData(); 
      if(onDataChange) onDataChange(); 
    } catch(e) { 
      alert("Error: " + (e.response?.data?.detail || e.message)); 
    } finally { 
      setImporting(false); 
    } 
  };

  // ============================================================================
  // 14. RENDER
  // ============================================================================
  if (loading && !jerarquia) {
    return (
      <div className="p-10 text-center">
        <div className="w-12 h-12 border-4 border-hatch-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-hatch-blue font-semibold">Cargando estructura AWP...</p>
      </div>
    );
  }

  const cwasToRender = jerarquia?.cwas?.filter(cwa => 
    !filters.codigo || cwa.codigo.toLowerCase().includes(filters.codigo.toLowerCase())
  ).sort((a, b) => a.codigo.localeCompare(b.codigo));

  return (
    <div className="flex flex-col h-full gap-4 bg-white">
      
      {/* ========================================================================
          HEADER DE TABLA
      ======================================================================== */}
      <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-hatch-gray shadow-sm">
        <div className="flex items-center gap-4">
          <h3 className="text-hatch-blue font-bold text-lg">📊 Control AWP</h3>
          <div className="h-6 w-px bg-hatch-gray"></div>
          <span className="text-sm text-gray-600 font-medium">Proyecto: {proyecto.nombre}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setModals({...modals, import: true})} 
            className="bg-white hover:bg-hatch-gray text-hatch-blue px-4 py-2 rounded-lg text-sm font-medium transition-colors border-2 border-hatch-gray"
          >
            📤 Importar
          </button>
          <button 
            onClick={handleExport} 
            className="bg-gradient-orange hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            📥 Exportar CSV
          </button>
        </div>
      </div>

      {/* ========================================================================
          TABLA PRINCIPAL
      ======================================================================== */}
      <div className="flex-1 overflow-auto border-2 border-hatch-gray rounded-lg bg-white shadow-md">
        <table className="w-full text-left border-collapse relative">
          
          {/* THEAD */}
          <thead className="bg-hatch-gray text-xs uppercase font-bold text-hatch-blue sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-3 w-10 sticky left-0 bg-hatch-gray z-30 border-b-2 border-hatch-gray-dark"></th>
              <th className="p-3 min-w-[300px] sticky left-10 bg-hatch-gray z-30 border-r-2 border-b-2 border-hatch-gray-dark">
                <div className="flex flex-col gap-2">
                  <span>Jerarquía AWP</span>
                  <input 
                    className="bg-white border-2 border-hatch-gray-dark rounded px-3 py-1 text-hatch-blue font-normal text-xs focus:border-hatch-orange outline-none placeholder-gray-400" 
                    placeholder="🔍 Filtrar por código..." 
                    onChange={e => setFilters({...filters, codigo: e.target.value})} 
                  />
                </div>
              </th>
              <th className="p-3 w-28 text-center border-b-2 border-hatch-gray-dark">Prioridad<br/><span className="text-[10px] font-normal text-gray-600">(Área)</span></th>
              <th className="p-3 w-20 text-center border-b-2 border-hatch-gray-dark">Seq</th>
              <th className="p-3 w-52 text-center border-b-2 border-hatch-gray-dark">Forecasts<br/><span className="text-[10px] font-normal text-gray-600">(CWP/Item)</span></th>
              <th className="p-3 w-32 text-center border-b-2 border-hatch-gray-dark">Progreso</th>
              {customColumns.map(c => (
                <th key={c.id} className="p-3 border-l-2 border-b-2 border-hatch-gray-dark text-hatch-orange whitespace-nowrap min-w-[120px]">
                  {c.nombre}
                </th>
              ))}
              <th className="p-3 text-right border-b-2 border-hatch-gray-dark min-w-[150px]">Acciones</th>
            </tr>
          </thead>

          {/* TBODY */}
          <tbody className="text-sm text-hatch-blue divide-y-2 divide-hatch-gray">
            {cwasToRender?.map(cwa => {
              const isExp = expandedCWAs.has(cwa.id);
              return (
                <React.Fragment key={cwa.id}>
                  
                  {/* ============================================================
                      NIVEL 1: CWA (ÁREA DE CONSTRUCCIÓN)
                  ============================================================ */}
                  <tr className="bg-white hover:bg-hatch-gray/30 transition-colors">
                    <td className="p-3 text-center sticky left-0 bg-inherit z-10">
                      <button 
                        onClick={() => toggle(expandedCWAs, cwa.id, setExpandedCWAs)} 
                        className="text-hatch-blue hover:text-hatch-orange font-bold text-lg w-full transition-colors"
                      >
                        {isExp ? '▼' : '▶'}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-hatch-blue sticky left-10 bg-inherit z-10 border-r-2 border-hatch-gray">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                          cwa.es_transversal 
                            ? 'bg-purple-100 border border-purple-300 text-purple-700' 
                            : 'bg-blue-100 border border-blue-300 text-blue-700'
                        }`}>
                          {cwa.es_transversal ? 'DWP' : 'CWA'}
                        </span>
                        <span className="text-base">{cwa.codigo}</span>
                        <span className="text-gray-600">-</span>
                        <span className="font-normal">{cwa.nombre}</span>
                      </div>
                    </td>
                    
                    {/* PRIORIDAD ÁREA */}
                    <td className="p-3 text-center">
                      <select 
                        className={`bg-white text-xs font-bold border-2 rounded-lg px-2 py-1 cursor-pointer transition-all hover:border-hatch-orange focus:outline-none focus:ring-2 focus:ring-hatch-orange ${
                          cwa.prioridad === 'CRITICA' ? 'border-red-400 text-red-600' :
                          cwa.prioridad === 'ALTA' ? 'border-orange-400 text-orange-600' :
                          'border-hatch-gray text-gray-600'
                        }`}
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
                    
                    <td colSpan={3 + customColumns.length} className="p-3 text-xs text-gray-500 italic">
                      📍 {cwa.plot_plan_nombre}
                    </td>
                    
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => openCWPModal(cwa)} 
                        className="text-xs bg-gradient-orange hover:shadow-lg text-white px-3 py-1.5 rounded-lg transition-all font-medium"
                      >
                        + CWP
                      </button>
                    </td>
                  </tr>

                  {/* ============================================================
                      NIVEL 2: CWP (CONSTRUCTION WORK PACKAGE)
                  ============================================================ */}
                  {isExp && cwa.cwps.sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0)).map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    return (
                      <React.Fragment key={cwp.id}>
                        <tr className="bg-hatch-gray/20 hover:bg-hatch-gray/40 border-t border-hatch-gray transition-colors">
                          <td className="sticky left-0 bg-inherit z-10"></td>
                          <td className="p-3 pl-8 sticky left-10 bg-inherit z-10 border-r-2 border-hatch-gray">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggle(expandedCWPs, cwp.id, setExpandedCWPs)} 
                                className="text-hatch-blue hover:text-hatch-orange text-sm font-bold w-4 transition-colors"
                              >
                                {isCwpExp ? '▼' : '▶'}
                              </button>
                              <span className="text-green-600 font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-200">
                                {cwp.codigo}
                              </span>
                              <span className="text-hatch-blue font-medium text-sm truncate max-w-[200px]" title={cwp.nombre}>
                                {cwp.nombre}
                              </span>
                            </div>
                          </td>
                          
                          <td className="p-3 text-center text-gray-400 text-xs">-</td>
                          
                          {/* SECUENCIA */}
                          <td className="p-3 text-center">
                            <input 
                              type="number" 
                              className="w-12 bg-white border-2 border-hatch-gray rounded text-center text-sm text-hatch-blue focus:border-hatch-orange outline-none hover:border-hatch-orange transition-colors" 
                              value={cwp.secuencia || 0}
                              onChange={e => updateCWPField(cwp.id, 'secuencia', e.target.value)} 
                            />
                          </td>

                          {/* FORECASTS CWP */}
                          <td className="p-3 text-center text-xs">
                            <div className="flex justify-center gap-2 items-center">
                              <input 
                                type="date" 
                                className="bg-white border-2 border-hatch-gray rounded w-28 text-hatch-blue text-[11px] px-2 py-1 hover:border-hatch-orange focus:border-hatch-orange cursor-pointer outline-none transition-colors" 
                                value={cwp.forecast_inicio?.split('T')[0] || ''} 
                                onChange={e => updateCWPField(cwp.id, 'forecast_inicio', e.target.value)} 
                                title="Inicio Estimado" 
                              />
                              <span className="text-gray-400 font-bold">➜</span>
                              <input 
                                type="date" 
                                className="bg-white border-2 border-hatch-gray rounded w-28 text-hatch-blue text-[11px] px-2 py-1 hover:border-hatch-orange focus:border-hatch-orange cursor-pointer outline-none transition-colors" 
                                value={cwp.forecast_fin?.split('T')[0] || ''} 
                                onChange={e => updateCWPField(cwp.id, 'forecast_fin', e.target.value)} 
                                title="Fin Estimado" 
                              />
                            </div>
                          </td>

                          {/* PROGRESO */}
                          <td className="p-3 text-center">
                            <div className="relative w-full bg-hatch-gray h-6 rounded-full overflow-hidden border border-hatch-gray-dark">
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300" 
                                style={{width: `${cwp.porcentaje_completitud}%`}}
                              ></div>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-hatch-blue">
                                {cwp.porcentaje_completitud}%
                              </span>
                            </div>
                          </td>

                          {/* METADATOS DINÁMICOS */}
                          {customColumns.map(c => (
                            <td key={c.id} className="p-3 border-l-2 border-hatch-gray text-xs">
                              <span className="bg-hatch-gray text-hatch-blue px-2 py-1 rounded border border-hatch-gray-dark">
                                {cwp.metadata_json?.[c.nombre] || '-'}
                              </span>
                            </td>
                          ))}

                          {/* ACCIONES CWP */}
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1 items-center">
                              <button 
                                onClick={() => openCWPModal(null, cwp)} 
                                className="text-gray-500 hover:text-hatch-orange text-sm p-1.5 rounded hover:bg-hatch-gray transition-colors" 
                                title="Editar CWP"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => handleDeleteCWP(cwp.id)} 
                                className="text-red-400 hover:text-red-600 text-sm p-1.5 rounded hover:bg-red-50 transition-colors" 
                                title="Eliminar CWP"
                              >
                                🗑️
                              </button>
                              <div className="w-px h-6 bg-hatch-gray mx-1"></div>
                              <button 
                                onClick={() => openPkgModal(cwp, 'EWP')} 
                                className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors border border-purple-300 font-semibold"
                              >
                                +EWP
                              </button>
                              <button 
                                onClick={() => openPkgModal(cwp, 'PWP')} 
                                className="text-[10px] bg-teal-100 text-teal-700 px-2 py-1 rounded hover:bg-teal-200 transition-colors border border-teal-300 font-semibold"
                              >
                                +PWP
                              </button>
                              <button 
                                onClick={() => openPkgModal(cwp, 'IWP')} 
                                className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors border border-orange-300 font-semibold"
                              >
                                +IWP
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ========================================================
                            NIVEL 3: PAQUETES (EWP, PWP, IWP)
                        ======================================================== */}
                        {isCwpExp && cwp.paquetes.map(pkg => {
                          const isPkgExp = expandedPaquetes.has(pkg.id);
                          return (
                            <React.Fragment key={pkg.id}>
                              <tr className="bg-white hover:bg-hatch-gray/10 text-xs group border-t border-hatch-gray/50 transition-colors">
                                <td className="sticky left-0 bg-inherit z-10"></td>
                                <td className="p-2 pl-16 sticky left-10 bg-inherit z-10 border-r-2 border-hatch-gray">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <button 
                                      onClick={() => toggle(expandedPaquetes, pkg.id, setExpandedPaquetes)} 
                                      className="hover:text-hatch-orange text-xs font-bold w-3 transition-colors"
                                    >
                                      {isPkgExp ? '▼' : '▶'}
                                    </button>
                                    <span className={`text-[9px] border px-1.5 py-0.5 rounded font-semibold ${
                                      pkg.tipo === 'EWP' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                                      pkg.tipo === 'PWP' ? 'border-teal-300 text-teal-700 bg-teal-50' :
                                      'border-orange-300 text-orange-700 bg-orange-50'
                                    }`}>
                                      {pkg.tipo}
                                    </span>
                                    <span className="font-mono text-[11px] text-gray-600">{pkg.codigo}</span>
                                  </div>
                                </td>
                                <td colSpan={3} className="p-2 text-gray-600 italic text-[11px]">{pkg.nombre}</td>
                                <td className="p-2 text-center text-gray-400">-</td>
                                {customColumns.map(c => <td key={c.id} className="border-l-2 border-hatch-gray/30"></td>)}
                                <td className="p-2 text-right opacity-60 group-hover:opacity-100 transition-opacity">
                                  <div className="flex justify-end gap-1">
                                    <button 
                                      onClick={() => handleDeletePkg(pkg.id)} 
                                      className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs transition-colors"
                                    >
                                      🗑️
                                    </button>
                                    <button 
                                      onClick={() => openLinkModal(pkg)} 
                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-xs transition-colors font-medium"
                                    >
                                      🔗 Link
                                    </button>
                                    <button 
                                      onClick={() => addBatch(pkg.id)} 
                                      className="text-hatch-orange hover:text-hatch-orange-dark hover:bg-orange-50 px-2 py-1 rounded text-xs font-bold transition-colors"
                                    >
                                      + Lote
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* ==================================================
                                  NIVEL 4: ITEMS (ENTREGABLES)
                              ================================================== */}
                              {isPkgExp && (
                                <>
                                  {pkg.items.map(item => (
                                    <tr key={item.id} className="bg-hatch-gray/5 text-[11px] hover:bg-hatch-gray/20 transition-colors border-t border-hatch-gray/30">
                                      <td className="sticky left-0 bg-inherit z-10"></td>
                                      <td className="p-2 pl-24 sticky left-10 bg-inherit z-10 border-r-2 border-hatch-gray/50 text-gray-500 truncate max-w-[250px]">
                                        {item.source_item_id ? (
                                          <span className="text-blue-500 flex items-center gap-1 text-[10px]" title={`Origen: ${item.origen_info}`}>
                                            🔗 {item.origen_info}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">ID: {item.id}</span>
                                        )}
                                      </td>
                                      <td colSpan={2} className="p-2 text-hatch-blue pl-4">
                                        <div className="flex items-center gap-2">
                                          <span>{item.nombre}</span>
                                          <button 
                                            onClick={() => openClassifyModal(item, cwp.id)} 
                                            className="text-[9px] text-gray-500 hover:text-hatch-orange border border-hatch-gray px-1.5 py-0.5 rounded hover:bg-hatch-gray transition-colors font-medium"
                                          >
                                            {item.tipo_entregable_codigo || "🏷️ Clasificar"}
                                          </button>
                                        </div>
                                      </td>
                                      <td className="p-2 text-center">
                                        <input 
                                          type="date" 
                                          className="bg-white border border-hatch-gray rounded w-24 text-gray-600 text-[10px] text-center px-1 py-0.5 hover:border-hatch-orange focus:border-hatch-orange outline-none transition-colors cursor-pointer" 
                                          value={item.forecast_fin?.split('T')[0] || ''} 
                                          onChange={e => updateItemForecast(item.id, e.target.value)} 
                                        />
                                      </td>
                                      <td colSpan={1 + customColumns.length}></td>
                                      <td className="p-2 text-right">
                                        <button 
                                          onClick={() => handleDeleteItem(item.id)} 
                                          className="text-gray-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                        >
                                          🗑️
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* ITEMS TEMPORALES (BATCH) */}
                                  {pendingItems[pkg.id]?.map(t => (
                                    <tr key={t.id} className="bg-yellow-50 text-xs animate-pulse border-t border-yellow-200">
                                      <td className="sticky left-0 bg-inherit"></td>
                                      <td className="p-2 pl-24 text-yellow-700 sticky left-10 border-r-2 border-yellow-200 font-semibold">
                                        ⚡ Nuevo
                                      </td>
                                      <td colSpan={3} className="p-2">
                                        <input 
                                          autoFocus 
                                          className="w-full bg-white border-2 border-yellow-400 rounded text-hatch-blue outline-none px-2 py-1 placeholder-yellow-600 focus:border-hatch-orange transition-colors" 
                                          value={t.nombre} 
                                          onChange={e => changeBatch(pkg.id, t.id, e.target.value)} 
                                          onKeyDown={e => {if(e.key === 'Enter') saveBatch(pkg)}} 
                                          placeholder="Escribe el nombre del entregable..." 
                                        />
                                      </td>
                                      <td colSpan={2 + customColumns.length}></td>
                                      <td className="p-2 text-right">
                                        <button 
                                          onClick={() => setPendingItems({...pendingItems, [pkg.id]: pendingItems[pkg.id].filter(i => i.id !== t.id)})} 
                                          className="text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                        >
                                          ✕
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  
                                  {/* BOTÓN GUARDAR LOTE */}
                                  {pendingItems[pkg.id]?.length > 0 && (
                                    <tr className="bg-yellow-100 border-t-2 border-yellow-400">
                                      <td colSpan="100%" className="text-center p-3">
                                        <button 
                                          onClick={() => saveBatch(pkg)} 
                                          className="bg-gradient-orange hover:shadow-lg text-white font-bold px-6 py-2 rounded-lg uppercase tracking-wider text-sm transition-all"
                                        >
                                          💾 Guardar {pendingItems[pkg.id].length} Item(s)
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

      {/* ========================================================================
          MODALES
      ======================================================================== */}
      
      {/* MODAL: CREAR/EDITAR CWP */}
      {modals.cwp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[500px] p-6 rounded-2xl border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2">
              <span className="text-hatch-orange">{isEditingCWP ? '✏️' : '➕'}</span>
              {isEditingCWP ? 'Editar' : 'Crear'} CWP
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre del Paquete</label>
                <input 
                  className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none transition-colors" 
                  placeholder="Ej: Paquete de Estructuras - Edificio A" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>
              
              {!isEditingCWP && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1 font-semibold">Disciplina</label>
                  <select 
                    className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none transition-colors" 
                    value={formData.disciplina_id} 
                    onChange={e => setFormData({...formData, disciplina_id: e.target.value})}
                  >
                    <option value="">Seleccionar disciplina...</option>
                    {proyecto.disciplinas?.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.codigo} - {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {customColumns.length > 0 && (
                <div className="border-t-2 border-hatch-gray pt-4">
                  <p className="text-hatch-orange text-xs font-bold mb-3 uppercase tracking-wider">
                    🏷️ Metadatos Personalizados
                  </p>
                  {customColumns.map(c => (
                    <div key={c.id} className="mb-3">
                      <label className="block text-xs text-gray-600 mb-1 font-semibold">{c.nombre}</label>
                      {c.tipo_dato === 'SELECCION' ? (
                        <select 
                          className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-2 py-1.5 text-sm focus:border-hatch-orange outline-none transition-colors" 
                          value={formData.metadata?.[c.nombre] || ''} 
                          onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})}
                        >
                          <option value="">- Seleccionar -</option>
                          {c.opciones_json?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input 
                          className="w-full bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-2 py-1.5 text-sm focus:border-hatch-orange outline-none transition-colors" 
                          value={formData.metadata?.[c.nombre] || ''} 
                          onChange={e => setFormData({...formData, metadata: {...formData.metadata, [c.nombre]: e.target.value}})} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-hatch-gray">
              <button 
                onClick={() => setModals({...modals, cwp: false})} 
                className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveCWP} 
                className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                {isEditingCWP ? 'Guardar Cambios' : 'Crear CWP'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: CREAR PAQUETE */}
      {modals.pkg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-96 border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2">
              <span className="text-hatch-orange">➕</span>
              Nuevo {formData.tipo}
            </h3>
            <input 
              className="w-full mb-4 bg-white text-hatch-blue border-2 border-hatch-gray rounded-lg px-3 py-2 focus:border-hatch-orange outline-none transition-colors" 
              placeholder="Nombre del Paquete" 
              value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: e.target.value})} 
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setModals({...modals, pkg: false})} 
                className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSavePkg} 
                className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: VINCULAR ITEMS */}
      {modals.link && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white w-[650px] p-6 rounded-2xl border-2 border-hatch-gray h-[85vh] flex flex-col shadow-2xl">
            <h3 className="text-xl font-bold text-hatch-blue mb-2">🔗 Vincular Entregables</h3>
            <p className="text-gray-600 text-sm mb-4">Selecciona items de otras áreas para traerlos a este paquete.</p>
            
            <div className="flex gap-2 mb-3">
              <button 
                onClick={() => setLinkFilter("ALL")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  linkFilter === "ALL" 
                    ? 'bg-gradient-orange text-white shadow-lg' 
                    : 'bg-hatch-gray text-hatch-blue hover:bg-hatch-gray-dark'
                }`}
              >
                Todo el Proyecto
              </button>
              <button 
                onClick={() => setLinkFilter("TRANSVERSAL")} 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  linkFilter === "TRANSVERSAL" 
                    ? 'bg-gradient-orange text-white shadow-lg' 
                    : 'bg-hatch-gray text-hatch-blue hover:bg-hatch-gray-dark'
                }`}
              >
                Solo Transversales
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-hatch-gray/20 p-3 rounded-lg border-2 border-hatch-gray">
              {transversalItems.filter(i => linkFilter === "ALL" || i.es_transversal).map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedLinkItems.has(item.id) 
                      ? 'border-hatch-orange bg-orange-50' 
                      : 'border-hatch-gray bg-white hover:border-hatch-orange/50'
                  }`} 
                  onClick={() => toggle(selectedLinkItems, item.id, setSelectedLinkItems)}
                >
                  <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center transition-colors ${
                    selectedLinkItems.has(item.id) 
                      ? 'bg-hatch-orange border-hatch-orange' 
                      : 'border-hatch-gray-dark'
                  }`}>
                    {selectedLinkItems.has(item.id) && <span className="text-white font-bold text-sm">✓</span>}
                  </div>
                  <div>
                    <p className="text-hatch-blue text-sm font-medium">{item.nombre}</p>
                    <p className="text-gray-500 text-xs">{item.cwa} ➝ {item.paquete}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
              <button 
                onClick={() => setModals({...modals, link: false})} 
                className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLinkItems} 
                className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Vincular ({selectedLinkItems.size})
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: CLASIFICAR ITEM */}
      {modals.editItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-96 border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-2 text-xl">🏷️ Clasificar Item</h3>
            <p className="text-gray-600 text-sm mb-4 italic">"{editingItem?.nombre}"</p>
            
            <label className="block text-xs text-gray-600 uppercase font-bold mb-1">Tipo de Entregable</label>
            <select 
              className="w-full bg-white text-hatch-blue p-2 rounded-lg mb-6 border-2 border-hatch-gray focus:border-hatch-orange outline-none transition-colors" 
              value={editingItem?.tipo_entregable_id || ''} 
              onChange={e => setEditingItem({...editingItem, tipo_entregable_id: e.target.value})}
            >
              <option value="">- Sin Tipo -</option>
              {itemTipos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.codigo} - {t.nombre}
                </option>
              ))}
            </select>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setModals({...modals, editItem: false})} 
                className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClassify} 
                className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL: IMPORTAR CSV/EXCEL */}
      {modals.import && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-[450px] border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-2 text-xl">📤 Importar Excel/CSV</h3>
            <p className="text-sm text-gray-600 mb-4">Sube tu archivo para crear o actualizar registros masivamente.</p>
            
            <form onSubmit={handleImport}>
              <label className="block mb-4 cursor-pointer">
                <div className="w-full border-2 border-dashed border-hatch-gray rounded-lg p-8 text-center hover:border-hatch-orange transition-colors bg-hatch-gray/20">
                  {importFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📄</span>
                      <span className="text-hatch-blue font-medium text-sm">{importFile.name}</span>
                      <span className="text-xs text-gray-500">Click para cambiar</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl text-gray-400">📁</span>
                      <span className="text-gray-600 text-sm">Haz click para seleccionar archivo</span>
                      <span className="text-xs text-gray-400">.csv o .xlsx</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  onChange={e => setImportFile(e.target.files[0])} 
                  className="hidden" 
                />
              </label>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setModals({...modals, import: false})} 
                  className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={importing || !importFile} 
                  className="bg-gradient-orange hover:shadow-lg disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
                >
                  {importing ? 'Procesando...' : 'Importar'}
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