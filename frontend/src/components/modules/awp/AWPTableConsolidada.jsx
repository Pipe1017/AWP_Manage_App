import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://10.92.12.84:8000/api/v1';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  
  // Modales
  const [showCreateCWP, setShowCreateCWP] = useState(false);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [showEditMetadata, setShowEditMetadata] = useState(false);
  const [showCreateEntregable, setShowCreateEntregable] = useState(false);
  const [showDependencias, setShowDependencias] = useState(false);
  const [showRestricciones, setShowRestricciones] = useState(false);
  
  // Estados de selección
  const [selectedCWAForCWP, setSelectedCWAForCWP] = useState(null);
  const [selectedCWPForPackage, setSelectedCWPForPackage] = useState(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [selectedEWPForEntregable, setSelectedEWPForEntregable] = useState(null);
  const [selectedCWPForDependencias, setSelectedCWPForDependencias] = useState(null);
  
  // Formularios
  const [packageType, setPackageType] = useState('EWP');
  const [cwpForm, setCwpForm] = useState({
    nombre: '',
    descripcion: '',
    disciplina_id: '',
    secuencia: 0,
    prioridad: 'MEDIA',
    duracion_dias: null,
    fecha_inicio_prevista: '',
    fecha_fin_prevista: ''
  });
  
  const [packageForm, setPackageForm] = useState({
    nombre: '',
    descripcion: ''
  });
  
  const [metadataForm, setMetadataForm] = useState({
    nombre: '',
    descripcion: '',
    prioridad: 'MEDIA',
    duracion_dias: null,
    fecha_inicio_prevista: '',
    fecha_fin_prevista: '',
    estado: 'NO_INICIADO'
  });
  
  const [entregableForm, setEntregableForm] = useState({
    nombre: '',
    descripcion: '',
    tipo_entregable_id: '',
    responsable: '',
    es_entregable_cliente: false
  });
  
  const [dependenciaForm, setDependenciaForm] = useState({
    cwp_destino_id: '',
    tipo_dependencia: 'FIN-INICIO',
    duracion_lag_dias: 0,
    descripcion: ''
  });
  
  const [restriccionesForm, setRestriccionesForm] = useState({
    restricciones_json: {},
    restricciones_levantadas: false
  });

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

  // ============================================================================
  // CREAR CWP (CORREGIDO)
  // ============================================================================
  
  const handleCreateCWP = async () => {
    if (!selectedCWAForCWP || !cwpForm.disciplina_id || !cwpForm.nombre) {
      alert("⚠️ Completa todos los campos obligatorios");
      return;
    }

    try {
      // 1. Este es el BODY (debe coincidir con schemas.CWPCreate)
      const payload = {
        nombre: cwpForm.nombre,
        descripcion: cwpForm.descripcion,
        secuencia: parseInt(cwpForm.secuencia) || 0,
        prioridad: cwpForm.prioridad,
        duracion_dias: cwpForm.duracion_dias ? parseInt(cwpForm.duracion_dias) : null,
        fecha_inicio_prevista: cwpForm.fecha_inicio_prevista || null,
        fecha_fin_prevista: cwpForm.fecha_fin_prevista || null
      };
      
      // 2. Estos son los PARÁMETROS DE CONSULTA (Query Params)
      const config = {
        params: {
          disciplina_id: parseInt(cwpForm.disciplina_id)
        }
      };

      const response = await axios.post(
        `${API_URL}/awp/cwa/${selectedCWAForCWP}/cwp`,
        payload, // Argumento 2: El Body
        config   // Argumento 3: La Configuración (con los params)
      );
      
      console.log("✅ CWP creado:", response.data);
      alert(`✅ CWP creado: ${response.data.codigo}`);
      
      resetCWPForm();
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando CWP:", error.response ? error.response.data : error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  const resetCWPForm = () => {
    setCwpForm({
      nombre: '',
      descripcion: '',
      disciplina_id: '',
      secuencia: 0,
      prioridad: 'MEDIA',
      duracion_dias: null,
      fecha_inicio_prevista: '',
      fecha_fin_prevista: ''
    });
    setShowCreateCWP(false);
    setSelectedCWAForCWP(null);
  };

  // ============================================================================
  // CREAR PAQUETE (EWP/IWP/PWP) (CORREGIDO)
  // ============================================================================
  
  const handleCreatePackage = async () => {
    if (!selectedCWPForPackage || !packageForm.nombre) {
      alert("⚠️ Completa el nombre del paquete");
      return;
    }

    try {
      let endpoint = '';
      let params = {}; // Objeto para los query params
      
      // El payload del body es el mismo para todos
      let payload = {
        nombre: packageForm.nombre,
        descripcion: packageForm.descripcion
      };

      if (packageType === 'EWP') {
        let disciplinaId = null;
        
        // ... (tu lógica para encontrar disciplinaId está bien)
        for (const cwa of jerarquia.cwas) {
          const cwp = cwa.cwps.find(c => c.id === selectedCWPForPackage);
          if (cwp && cwp.asignaciones_disciplina && cwp.asignaciones_disciplina.length > 0) {
            disciplinaId = cwp.asignaciones_disciplina[0].disciplina_id;
            break;
          }
        }
        
        if (!disciplinaId) {
          alert("⚠️ No se pudo determinar la disciplina del CWP");
          return;
        }
        
        // Asigna disciplinaId a los 'params', NO al 'payload'
        params = { disciplina_id: disciplinaId };
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/ewp`;
        
      } else if (packageType === 'IWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/iwp`;
      } else if (packageType === 'PWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/pwp`;
      }

      // Pasamos payload como Body, y { params } como Config
      const response = await axios.post(endpoint, payload, { params });
      
      console.log(`✅ ${packageType} creado:`, response.data);
      alert(`✅ ${packageType} creado: ${response.data.codigo}`);
      
      setPackageForm({ nombre: '', descripcion: '' });
      setShowCreatePackage(false);
      setSelectedCWPForPackage(null);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error(`Error creando ${packageType}:`, error.response ? error.response.data : error);
      alert(`❌ Error: ` + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // EDITAR METADATA
  // ============================================================================
  
  const handleOpenEditMetadata = (item, type) => {
    setSelectedItemForEdit({ ...item, type });
    setMetadataForm({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      prioridad: item.prioridad || 'MEDIA',
      duracion_dias: item.duracion_dias || null,
      fecha_inicio_prevista: item.fecha_inicio_prevista || '',
      fecha_fin_prevista: item.fecha_fin_prevista || '',
      estado: item.estado || 'NO_INICIADO'
    });
    setShowEditMetadata(true);
  };

  const handleUpdateMetadata = async () => {
    if (!selectedItemForEdit) return;

    try {
      let endpoint = '';
      
      if (selectedItemForEdit.type === 'CWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedItemForEdit.id}/metadata`;
      }
      
      await axios.put(endpoint, metadataForm);
      
      alert("✅ Metadata actualizada");
      setShowEditMetadata(false);
      setSelectedItemForEdit(null);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error actualizando metadata:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // CREAR ENTREGABLE
  // ============================================================================
  
  const handleOpenCreateEntregable = (ewpId) => {
    setSelectedEWPForEntregable(ewpId);
    setShowCreateEntregable(true);
  };

  const handleCreateEntregable = async () => {
    if (!selectedEWPForEntregable || !entregableForm.nombre || !entregableForm.tipo_entregable_id) {
      alert("⚠️ Completa los campos obligatorios");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/awp/ewp/${selectedEWPForEntregable}/entregables`,
        {
          ...entregableForm,
          tipo_entregable_id: parseInt(entregableForm.tipo_entregable_id)
        }
      );
      
      console.log("✅ Entregable creado:", response.data);
      alert(`✅ Entregable creado: ${response.data.codigo}`);
      
      setEntregableForm({
        nombre: '',
        descripcion: '',
        tipo_entregable_id: '',
        responsable: '',
        es_entregable_cliente: false
      });
      setShowCreateEntregable(false);
      setSelectedEWPForEntregable(null);
      await loadJerarquia();
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando entregable:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // DEPENDENCIAS
  // ============================================================================
  
  const handleOpenDependencias = (cwpId) => {
    setSelectedCWPForDependencias(cwpId);
    setShowDependencias(true);
  };

  const handleCreateDependencia = async () => {
    if (!selectedCWPForDependencias || !dependenciaForm.cwp_destino_id) {
      alert("⚠️ Selecciona un CWP predecesor");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/awp/cwp/${selectedCWPForDependencias}/dependencias`,
        {
          ...dependenciaForm,
          cwp_destino_id: parseInt(dependenciaForm.cwp_destino_id),
          duracion_lag_dias: parseInt(dependenciaForm.duracion_lag_dias) || 0
        }
      );
      
      alert("✅ Dependencia creada");
      setDependenciaForm({
        cwp_destino_id: '',
        tipo_dependencia: 'FIN-INICIO',
        duracion_lag_dias: 0,
        descripcion: ''
      });
      await loadJerarquia();
      
    } catch (error) {
      console.error("Error creando dependencia:", error);
      alert("❌ Error: " + (error.response?.data?.detail || error.message));
    }
  };

  // ============================================================================
  // RESTRICCIONES
  // ============================================================================
  
  const handleOpenRestricciones = (cwp) => {
    setSelectedItemForEdit(cwp);
    setRestriccionesForm({
      restricciones_json: cwp.restricciones_json || {},
      restricciones_levantadas: cwp.restricciones_levantadas || false
    });
    setShowRestricciones(true);
  };

  const handleUpdateRestricciones = async () => {
    if (!selectedItemForEdit) return;

    try {
      await axios.put(
        `${API_URL}/awp/cwp/${selectedItemForEdit.id}/restricciones`,
        restriccionesForm
      );
      
      alert("✅ Restricciones actualizadas");
      setShowRestricciones(false);
      setSelectedItemForEdit(null);
      await loadJerarquia();
      
    } catch (error) {
      console.error("Error actualizando restricciones:", error);
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

  const getPrioridadBadge = (prioridad) => {
    const badges = {
      'ALTA': 'bg-red-600/20 text-red-300',
      'MEDIA': 'bg-yellow-600/20 text-yellow-300',
      'BAJA': 'bg-green-600/20 text-green-300'
    };
    return badges[prioridad] || badges['MEDIA'];
  };

  return (
    <div className="space-y-4">
      {/* Filtro activo */}
      {filteredCWAId && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-blue-300 text-sm">🔍 Mostrando solo CWA seleccionado</span>
          <button className="text-xs text-blue-300 hover:text-blue-200">
            ✕ Limpiar filtro
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-700 text-gray-300 sticky top-0">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold w-8"></th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-16">Sec</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Código</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-20">Tipo</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-24">Prioridad</th>
              <th className="px-3 py-2 text-left text-xs font-semibold w-40">Fechas</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-24">Restricciones</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-24">Dependencias</th>
              <th className="px-2 py-2 text-left text-xs font-semibold w-20">Entregables</th>
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
                  {/* Fila CWA */}
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
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
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
                    <td className="px-3 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2 text-gray-500 text-xs">
                      {hasCWPs ? `${cwa.cwps.length}` : '0'}
                    </td>
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => {
                          setSelectedCWAForCWP(cwa.id);
                          setShowCreateCWP(true);
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        title="Crear CWP"
                      >
                        + CWP
                      </button>
                    </td>
                  </tr>

                  {/* Filas CWP */}
                  {isExpanded && hasCWPs && cwa.cwps.sort((a, b) => a.secuencia - b.secuencia).map((cwp, idx) => {
                    const isCWPExpanded = expandedCWPs.has(cwp.id);
                    const hasPackages = (cwp.ewps?.length || 0) + (cwp.iwps?.length || 0) + (cwp.pwps?.length || 0) > 0;

                    return (
                      <React.Fragment key={`cwp-${cwp.id}`}>
                        {/* Fila CWP */}
                        <tr className="border-b border-gray-700/50 bg-gray-800/70 hover:bg-gray-750/70">
                          <td className="px-2 py-2 pl-6">
                            {hasPackages && (
                              <button
                                onClick={() => toggleCWP(cwp.id)}
                                className="text-green-400 hover:text-green-300 text-xs"
                              >
                                {isCWPExpanded ? '▼' : '▶'}
                              </button>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={cwp.secuencia || idx + 1}
                              onChange={(e) => {
                                // TODO: Actualizar secuencia
                              }}
                              className="w-12 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs text-white text-center"
                            />
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
                          <td className="px-2 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${getPrioridadBadge(cwp.prioridad)}`}>
                              {cwp.prioridad}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-400">
                            {cwp.fecha_inicio_prevista && cwp.fecha_fin_prevista
                              ? `${cwp.fecha_inicio_prevista} → ${cwp.fecha_fin_prevista}`
                              : '-'}
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => handleOpenRestricciones(cwp)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              {cwp.restricciones_levantadas ? '✅' : (cwp.restricciones_json && Object.keys(cwp.restricciones_json).length > 0 ? '⚠️' : '-')}
                            </button>
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => handleOpenDependencias(cwp.id)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Ver
                            </button>
                          </td>
                          <td className="px-2 py-2 text-gray-500 text-xs">-</td>
                          <td className="px-2 py-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${cwp.porcentaje_completitud || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(cwp.porcentaje_completitud || 0)}%</span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleOpenEditMetadata(cwp, 'CWP')}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('EWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                                title="+ EWP"
                              >
                                +E
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('IWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                                title="+ IWP"
                              >
                                +I
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('PWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs"
                                title="+ PWP"
                              >
                                +P
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Continúa con los paquetes EWP/IWP/PWP en el siguiente mensaje... */}
                        {/* Filas de Paquetes (EWP/IWP/PWP) */}
                        {isCWPExpanded && (
                          <>
                            {/* EWPs */}
                            {cwp.ewps?.map(ewp => (
                              <tr key={`ewp-${ewp.id}`} className="border-b border-gray-700/30 bg-gray-800/50 hover:bg-gray-750/50">
                                <td className="px-2 py-2 pl-12"></td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">
                                  <span className="text-purple-400 font-mono text-xs">{ewp.codigo}</span>
                                </td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{ewp.nombre}</td>
                                <td className="px-2 py-2">
                                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                                    EWP
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {ewp.fecha_publicacion_prevista || '-'}
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2">
                                  <button
                                    onClick={() => handleOpenCreateEntregable(ewp.id)}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    {ewp.entregables?.length || 0}
                                  </button>
                                </td>
                                <td className="px-2 py-2">
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className="bg-purple-600 h-1.5 rounded-full"
                                      style={{ width: `${ewp.porcentaje_completitud || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{Math.round(ewp.porcentaje_completitud || 0)}%</span>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* IWPs */}
                            {cwp.iwps?.map(iwp => (
                              <tr key={`iwp-${iwp.id}`} className="border-b border-gray-700/30 bg-gray-800/50 hover:bg-gray-750/50">
                                <td className="px-2 py-2 pl-12"></td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">
                                  <span className="text-orange-400 font-mono text-xs">{iwp.codigo}</span>
                                </td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{iwp.nombre}</td>
                                <td className="px-2 py-2">
                                  <span className="px-2 py-1 bg-orange-600/20 text-orange-300 rounded text-xs">
                                    IWP
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {iwp.fecha_inicio_prevista && iwp.fecha_fin_prevista
                                    ? `${iwp.fecha_inicio_prevista} → ${iwp.fecha_fin_prevista}`
                                    : '-'}
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2 text-xs text-gray-400">
                                  {iwp.items_instalacion?.length || 0} item(s)
                                </td>
                                <td className="px-2 py-2">
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className="bg-orange-600 h-1.5 rounded-full"
                                      style={{ width: `${iwp.porcentaje_completitud || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{Math.round(iwp.porcentaje_completitud || 0)}%</span>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* PWPs */}
                            {cwp.pwps?.map(pwp => (
                              <tr key={`pwp-${pwp.id}`} className="border-b border-gray-700/30 bg-gray-800/50 hover:bg-gray-750/50">
                                <td className="px-2 py-2 pl-12"></td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">
                                  <span className="text-teal-400 font-mono text-xs">{pwp.codigo}</span>
                                </td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{pwp.nombre}</td>
                                <td className="px-2 py-2">
                                  <span className="px-2 py-1 bg-teal-600/20 text-teal-300 rounded text-xs">
                                    PWP
                                  </span>
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {pwp.fecha_ros_prevista || '-'}
                                </td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2 text-xs text-gray-500">-</td>
                                <td className="px-2 py-2 text-xs text-gray-400">
                                  {pwp.items_adquisicion?.length || 0} item(s)
                                </td>
                                <td className="px-2 py-2">
                                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                      className="bg-teal-600 h-1.5 rounded-full"
                                      style={{ width: `${pwp.porcentaje_completitud || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400">{Math.round(pwp.porcentaje_completitud || 0)}%</span>
                                </td>
                                <td className="px-2 py-2">
                                  <button
                                    className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ============================================================================ */}
      {/* MODALES */}
      {/* ============================================================================ */}

      {/* Modal: Crear CWP */}
      {showCreateCWP && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">✨ Crear CWP</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={cwpForm.nombre}
                  onChange={(e) => setCwpForm({ ...cwpForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Ej: Instalación de bombas sector norte"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={cwpForm.descripcion}
                  onChange={(e) => setCwpForm({ ...cwpForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Disciplina *</label>
                <select
                  value={cwpForm.disciplina_id}
                  onChange={(e) => setCwpForm({ ...cwpForm, disciplina_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {proyecto.disciplinas?.map(d => (
                    <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prioridad</label>
                <select
                  value={cwpForm.prioridad}
                  onChange={(e) => setCwpForm({ ...cwpForm, prioridad: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Secuencia</label>
                <input
                  type="number"
                  value={cwpForm.secuencia}
                  onChange={(e) => setCwpForm({ ...cwpForm, secuencia: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Duración (días)</label>
                <input
                  type="number"
                  value={cwpForm.duracion_dias || ''}
                  onChange={(e) => setCwpForm({ ...cwpForm, duracion_dias: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={cwpForm.fecha_inicio_prevista}
                  onChange={(e) => setCwpForm({ ...cwpForm, fecha_inicio_prevista: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={cwpForm.fecha_fin_prevista}
                  onChange={(e) => setCwpForm({ ...cwpForm, fecha_fin_prevista: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateCWP}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Crear CWP
              </button>
              <button
                onClick={resetCWPForm}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Paquete (EWP/IWP/PWP) */}
      {showCreatePackage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">✨ Crear {packageType}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={packageForm.nombre}
                  onChange={(e) => setPackageForm({ ...packageForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder={`Nombre del ${packageType}`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={packageForm.descripcion}
                  onChange={(e) => setPackageForm({ ...packageForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreatePackage}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreatePackage(false);
                  setSelectedCWPForPackage(null);
                  setPackageForm({ nombre: '', descripcion: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Metadata */}
      {showEditMetadata && selectedItemForEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ✏️ Editar {selectedItemForEdit.type}: {selectedItemForEdit.codigo}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  value={metadataForm.nombre}
                  onChange={(e) => setMetadataForm({ ...metadataForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={metadataForm.descripcion}
                  onChange={(e) => setMetadataForm({ ...metadataForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prioridad</label>
                <select
                  value={metadataForm.prioridad}
                  onChange={(e) => setMetadataForm({ ...metadataForm, prioridad: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Estado</label>
                <select
                  value={metadataForm.estado}
                  onChange={(e) => setMetadataForm({ ...metadataForm, estado: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="NO_INICIADO">No Iniciado</option>
                  <option value="EN_PROGRESO">En Progreso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="PAUSADO">Pausado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Duración (días)</label>
                <input
                  type="number"
                  value={metadataForm.duracion_dias || ''}
                  onChange={(e) => setMetadataForm({ ...metadataForm, duracion_dias: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={metadataForm.fecha_inicio_prevista}
                  onChange={(e) => setMetadataForm({ ...metadataForm, fecha_inicio_prevista: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={metadataForm.fecha_fin_prevista}
                  onChange={(e) => setMetadataForm({ ...metadataForm, fecha_fin_prevista: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateMetadata}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => {
                  setShowEditMetadata(false);
                  setSelectedItemForEdit(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Entregable */}
      {showCreateEntregable && selectedEWPForEntregable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">📄 Crear Entregable</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={entregableForm.nombre}
                  onChange={(e) => setEntregableForm({ ...entregableForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Ej: P&ID Sistema de Bombeo"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de Entregable *</label>
                <select
                  value={entregableForm.tipo_entregable_id}
                  onChange={(e) => setEntregableForm({ ...entregableForm, tipo_entregable_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {proyecto.disciplinas?.flatMap(d => 
                    d.tipos_entregables?.map(te => (
                      <option key={te.id} value={te.id}>
                        {te.codigo} - {te.nombre} ({d.codigo})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={entregableForm.descripcion}
                  onChange={(e) => setEntregableForm({ ...entregableForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Responsable</label>
                <input
                  type="text"
                  value={entregableForm.responsable}
                  onChange={(e) => setEntregableForm({ ...entregableForm, responsable: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={entregableForm.es_entregable_cliente}
                  onChange={(e) => setEntregableForm({ ...entregableForm, es_entregable_cliente: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-400">Es entregable al cliente</label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateEntregable}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Crear Entregable
              </button>
              <button
                onClick={() => {
                  setShowCreateEntregable(false);
                  setSelectedEWPForEntregable(null);
                  setEntregableForm({
                    nombre: '',
                    descripcion: '',
                    tipo_entregable_id: '',
                    responsable: '',
                    es_entregable_cliente: false
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dependencias */}
      {showDependencias && selectedCWPForDependencias && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">🔗 Gestionar Dependencias</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">➕ Agregar Nueva Dependencia</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">CWP Predecesor *</label>
                  <select
                    value={dependenciaForm.cwp_destino_id}
                    onChange={(e) => setDependenciaForm({ ...dependenciaForm, cwp_destino_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="">Seleccionar CWP...</option>
                    {jerarquia.cwas.flatMap(cwa =>
                      cwa.cwps
                        .filter(cwp => cwp.id !== selectedCWPForDependencias)
                        .map(cwp => (
                          <option key={cwp.id} value={cwp.id}>
                            {cwp.codigo} - {cwp.nombre}
                          </option>
                        ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo de Dependencia</label>
                  <select
                    value={dependenciaForm.tipo_dependencia}
                    onChange={(e) => setDependenciaForm({ ...dependenciaForm, tipo_dependencia: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  >
                    <option value="FIN-INICIO">Fin → Inicio</option>
                    <option value="FIN-FIN">Fin → Fin</option>
                    <option value="INICIO-INICIO">Inicio → Inicio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Lag (días)</label>
                  <input
                    type="number"
                    value={dependenciaForm.duracion_lag_dias}
                    onChange={(e) => setDependenciaForm({ ...dependenciaForm, duracion_lag_dias: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={dependenciaForm.descripcion}
                    onChange={(e) => setDependenciaForm({ ...dependenciaForm, descripcion: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateDependencia}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Agregar Dependencia
              </button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">📋 Dependencias Existentes</h4>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Las dependencias se cargarán aquí...</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDependencias(false);
                  setSelectedCWPForDependencias(null);
                  setDependenciaForm({
                    cwp_destino_id: '',
                    tipo_dependencia: 'FIN-INICIO',
                    duracion_lag_dias: 0,
                    descripcion: ''
                  });
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Restricciones */}
      {showRestricciones && selectedItemForEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ⚠️ Restricciones: {selectedItemForEdit.codigo}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Restricciones Actuales</label>
                <textarea
                  value={JSON.stringify(restriccionesForm.restricciones_json, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setRestriccionesForm({ ...restriccionesForm, restricciones_json: parsed });
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-xs font-mono"
                  rows="8"
                  placeholder='{"clave": "descripción"}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato JSON. Ejemplo: {`{"falta_material": "Tubería 6\"", "permisos": "Altura"}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restriccionesForm.restricciones_levantadas}
                  onChange={(e) => setRestriccionesForm({ ...restriccionesForm, restricciones_levantadas: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-400">Todas las restricciones están levantadas</label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleUpdateRestricciones}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowRestricciones(false);
                  setSelectedItemForEdit(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AWPTableConsolidada;