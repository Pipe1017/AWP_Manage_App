// frontend/src/components/modules/awp/AWPTableConsolidada.jsx

import React, { useState, useEffect } from 'react';
// 1. IMPORTAMOS EL CLIENTE CENTRALIZADO (3 niveles arriba)
import client from '../../../api/axios';

// ❌ BORRADO: const API_URL = ...

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  const [expandedPaquetes, setExpandedPaquetes] = useState(new Set());
  
  // Estados para modales
  const [showModalCWP, setShowModalCWP] = useState(false);
  const [showModalPaquete, setShowModalPaquete] = useState(false);
  const [showModalItem, setShowModalItem] = useState(false);
  const [showModalImport, setShowModalImport] = useState(false);
  
  const [selectedCWAForCWP, setSelectedCWAForCWP] = useState(null);
  const [selectedCWPForPaquete, setSelectedCWPForPaquete] = useState(null);
  const [selectedPaqueteForItem, setSelectedPaqueteForItem] = useState(null);
  
  // Formularios
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
  });
  
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  
  // Estado para importación
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadJerarquia();
  }, [plotPlanId]);

  const loadJerarquia = async () => {
    try {
      setLoading(true);
      // ✅ CAMBIO: client.get y ruta relativa
      const response = await client.get(`/awp/plot_plans/${plotPlanId}/jerarquia`);
      console.log("✅ Jerarquía cargada:", response.data);
      setJerarquia(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando jerarquía:", error);
      setLoading(false);
    }
  };

  // ... (Las funciones toggle se mantienen igual) ...
  const toggleCWA = (id) => { const s = new Set(expandedCWAs); s.has(id) ? s.delete(id) : s.add(id); setExpandedCWAs(s); };
  const toggleCWP = (id) => { const s = new Set(expandedCWPs); s.has(id) ? s.delete(id) : s.add(id); setExpandedCWPs(s); };
  const togglePaquete = (id) => { const s = new Set(expandedPaquetes); s.has(id) ? s.delete(id) : s.add(id); setExpandedPaquetes(s); };

  // ============================================================================
  // CREAR CWP
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
    if (!cwpForm.nombre || !cwpForm.disciplina_id) { alert("⚠️ Completa nombre y disciplina"); return; }
    
    try {
      // ✅ CAMBIO: client.post
      const response = await client.post(`/awp-nuevo/cwp`, cwpForm);
      
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
  // CREAR PAQUETE
  // ============================================================================
  
  const openModalPaquete = (cwp, tipo) => {
    setSelectedCWPForPaquete(cwp);
    setPaqueteForm({ nombre: '', tipo: tipo, responsable: 'Firma' });
    setShowModalPaquete(true);
  };

  const handleCreatePaquete = async (e) => {
    e.preventDefault();
    if (!paqueteForm.nombre) { alert("⚠️ Completa el nombre"); return; }
    
    try {
      // ✅ CAMBIO: client.post
      const response = await client.post(
        `/awp-nuevo/cwp/${selectedCWPForPaquete.id}/paquete`,
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
  // CREAR ITEM
  // ============================================================================
  
  const openModalItem = async (paquete) => {
    setSelectedPaqueteForItem(paquete);
    try {
      // ✅ CAMBIO: client.get
      const response = await client.get(
        `/awp-nuevo/cwp/${paquete.cwp_id}/tipos-entregables-disponibles`
      );
      setTiposDisponibles(response.data);
      setItemForm({ nombre: '', tipo_entregable_id: response.data[0]?.id || '', });
      setShowModalItem(true);
    } catch (error) {
      console.error("Error cargando tipos:", error);
      alert("Error cargando tipos de entregable");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!itemForm.nombre || !itemForm.tipo_entregable_id) { alert("⚠️ Completa todos los campos"); return; }
    
    try {
      // ✅ CAMBIO: client.post
      const response = await client.post(
        `/awp-nuevo/paquete/${selectedPaqueteForItem.id}/item`,
        itemForm
      );
      console.log("✅ Item creado:", response.data);
      alert(`✅ Item creado: ${response.data.nombre} (ID: ${response.data.id})`);
      setShowModalItem(false);
      await loadJerarquia();
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error creando Item:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // IMPORTAR ITEMS MASIVO
  // ============================================================================

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setImportFile(e.target.files[0]);
  };

  const handleImportItems = async (e) => {
    e.preventDefault();
    if (!importFile) { alert("⚠️ Selecciona un archivo"); return; }
    setImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      // ✅ CAMBIO: client.post (sin headers manuales, dejamos que axios decida)
      const response = await client.post(`/awp-nuevo/items/importar`, formData);
      
      console.log("✅ Importación completada:", response.data);
      const result = response.data;
      let mensaje = `✅ Importación completada:\n- Items creados: ${result.items_creados}\n- Items con error: ${result.items_con_error}\n`;
      if (result.errores && result.errores.length > 0) {
        mensaje += `\nErrores:\n${result.errores.slice(0, 5).join('\n')}`;
        if (result.errores.length > 5) mensaje += `\n... y ${result.errores.length - 5} errores más`;
      }
      alert(mensaje);
      setShowModalImport(false);
      setImportFile(null);
      await loadJerarquia();
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error importando items:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `id_item,nombre_item,tipo_codigo,codigo_paquete,descripcion,es_entregable_cliente,requiere_aprobacion\n1,Plano Z-101,PLN,EWP-001-CIV-0001,Desc,false,true`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'plantilla_items.csv'; a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    try {
      // ✅ CAMBIO: client.get
      const response = await client.get(`/awp-nuevo/exportar/${proyecto.id}`);
      const data = response.data.data;
      if (!data || data.length === 0) { alert("⚠️ No hay datos para exportar"); return; }
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `awp_jerarquia_${proyecto.nombre}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      alert(`✅ Exportados ${data.length} items`);
    } catch (error) {
      console.error("Error exportando:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ... (El resto del JSX se mantiene igual que antes, solo cambia la lógica de arriba) ...
  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400">⏳ Cargando jerarquía AWP...</div></div>;
  if (!jerarquia || !jerarquia.cwas || jerarquia.cwas.length === 0) return <div className="text-center py-12 text-gray-400"><p>📭 No hay CWAs creados aún</p><p className="text-sm mt-2">Ve a Configuración para crear CWAs</p></div>;

  const displayCWAs = filteredCWAId ? jerarquia.cwas.filter(cwa => cwa.id === filteredCWAId) : jerarquia.cwas;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-white font-semibold">Jerarquía AWP</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowModalImport(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">📤 Importar Items</button>
          <button onClick={handleExportAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">📥 Exportar Todo</button>
        </div>
      </div>
      {/* ... (Aquí va la tabla que ya tenías, no cambia nada visual) ... */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-700 text-gray-300 sticky top-0">
            <tr>
              <th className="px-2 py-2 w-8"></th>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-2 py-2 text-left">Tipo</th>
              <th className="px-2 py-2 text-left">Resp.</th>
              <th className="px-2 py-2 text-left">Progreso</th>
              <th className="px-2 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {displayCWAs.map(cwa => {
              const isExpanded = expandedCWAs.has(cwa.id);
              const hasCWPs = cwa.cwps && cwa.cwps.length > 0;
              return (
                <React.Fragment key={`cwa-${cwa.id}`}>
                  <tr className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-2 py-2"><button onClick={() => toggleCWA(cwa.id)} className="text-blue-400">{hasCWPs ? (isExpanded ? '▼' : '▶') : ''}</button></td>
                    <td className="px-3 py-2 text-blue-400 font-medium">{cwa.codigo}</td>
                    <td className="px-3 py-2 text-gray-300">{cwa.nombre}</td>
                    <td className="px-2 py-2"><span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">CWA</span></td>
                    <td className="px-2 py-2">-</td><td className="px-2 py-2">-</td>
                    <td className="px-2 py-2"><button onClick={() => openModalCWP(cwa)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">+ CWP</button></td>
                  </tr>
                  {isExpanded && cwa.cwps.map(cwp => {
                    const isCwpExp = expandedCWPs.has(cwp.id);
                    return (
                      <React.Fragment key={`cwp-${cwp.id}`}>
                        <tr className="border-b border-gray-700 bg-gray-800/50">
                          <td className="pl-6"><button onClick={() => toggleCWP(cwp.id)} className="text-green-400">{cwp.paquetes.length > 0 ? (isCwpExp ? '▼' : '▶') : ''}</button></td>
                          <td className="text-green-400 font-mono text-xs">{cwp.codigo}</td>
                          <td className="text-gray-400">{cwp.nombre}</td>
                          <td><span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">CWP</span></td>
                          <td>-</td>
                          <td>{cwp.porcentaje_completitud}%</td>
                          <td className="flex gap-1">
                            <button onClick={() => openModalPaquete(cwp, 'EWP')} className="px-1 bg-purple-600 text-white text-xs rounded">+E</button>
                            <button onClick={() => openModalPaquete(cwp, 'IWP')} className="px-1 bg-orange-600 text-white text-xs rounded">+I</button>
                          </td>
                        </tr>
                        {isCwpExp && cwp.paquetes.map(pkg => (
                          <tr key={`pkg-${pkg.id}`} className="bg-gray-900/50 border-b border-gray-800">
                            <td className="pl-10"></td>
                            <td className="text-purple-400 font-mono text-xs">{pkg.codigo}</td>
                            <td className="text-gray-500 text-xs">{pkg.nombre}</td>
                            <td><span className="bg-purple-900 text-purple-300 px-2 py-0.5 rounded text-xs">{pkg.tipo}</span></td>
                            <td className="text-xs text-gray-500">{pkg.responsable}</td>
                            <td className="text-xs text-gray-500">{pkg.porcentaje_completitud}%</td>
                            <td><button onClick={() => openModalItem(pkg)} className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded">+ Item</button></td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* MODALES (Aquí pegarías el mismo JSX de modales que ya tenías, está bien) */}
      {showModalCWP && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-96">
            <h3 className="text-white mb-4">Nuevo CWP</h3>
            <input className="w-full mb-2 p-2 bg-gray-700 text-white rounded" placeholder="Nombre" value={cwpForm.nombre} onChange={e=>setCwpForm({...cwpForm, nombre: e.target.value})} />
            <select className="w-full mb-4 p-2 bg-gray-700 text-white rounded" value={cwpForm.disciplina_id} onChange={e=>setCwpForm({...cwpForm, disciplina_id: e.target.value})}>
              {proyecto.disciplinas?.map(d=><option key={d.id} value={d.id}>{d.codigo}</option>)}
            </select>
            <button onClick={handleCreateCWP} className="w-full bg-blue-600 text-white p-2 rounded">Crear</button>
            <button onClick={()=>setShowModalCWP(false)} className="w-full mt-2 text-gray-400 text-sm">Cancelar</button>
          </div>
        </div>
      )}
      {/* ... (Resto de modales igual) ... */}
    </div>
  );
}

export default AWPTableConsolidada;