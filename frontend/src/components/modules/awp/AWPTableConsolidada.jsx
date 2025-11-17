import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://192.168.1.4:8000/api/v1';

function AWPTableConsolidada({ plotPlanId, proyecto, filteredCWAId, onDataChange }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCWAs, setExpandedCWAs] = useState(new Set());
  const [expandedCWPs, setExpandedCWPs] = useState(new Set());
  
  // Estados para modales de creación
  const [showCreateCWP, setShowCreateCWP] = useState(false);
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [selectedCWAForCWP, setSelectedCWAForCWP] = useState(null);
  const [selectedCWPForPackage, setSelectedCWPForPackage] = useState(null);
  const [packageType, setPackageType] = useState('EWP'); // EWP, IWP, PWP
  
  // Formularios
  const [cwpForm, setCwpForm] = useState({ nombre: '', descripcion: '', disciplina_id: '' });
  const [packageForm, setPackageForm] = useState({ nombre: '', descripcion: '' });

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

  // Crear CWP
  const handleCreateCWP = async () => {
    if (!selectedCWAForCWP || !cwpForm.disciplina_id || !cwpForm.nombre) {
      alert("⚠️ Completa todos los campos obligatorios");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/awp/cwa/${selectedCWAForCWP}/cwp`,
        {
          nombre: cwpForm.nombre,
          descripcion: cwpForm.descripcion,
          disciplina_id: parseInt(cwpForm.disciplina_id)
        }
      );
      
      console.log("✅ CWP creado:", response.data);
      alert("✅ CWP creado exitosamente");
      
      // Reset y recargar
      setCwpForm({ nombre: '', descripcion: '', disciplina_id: '' });
      setShowCreateCWP(false);
      setSelectedCWAForCWP(null);
      await loadJerarquia();
      
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error("Error creando CWP:", error);
      alert("❌ Error creando CWP: " + (error.response?.data?.detail || error.message));
    }
  };

  // Crear paquete (EWP/IWP/PWP)
  const handleCreatePackage = async () => {
    if (!selectedCWPForPackage || !packageForm.nombre) {
      alert("⚠️ Completa el nombre del paquete");
      return;
    }

    try {
      let endpoint = '';
      let payload = {
        nombre: packageForm.nombre,
        descripcion: packageForm.descripcion
      };

      if (packageType === 'EWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/ewp`;
        payload.disciplina_id = parseInt(cwpForm.disciplina_id); // Usar disciplina del CWP padre
      } else if (packageType === 'IWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/iwp`;
      } else if (packageType === 'PWP') {
        endpoint = `${API_URL}/awp/cwp/${selectedCWPForPackage}/pwp`;
      }

      const response = await axios.post(endpoint, payload);
      
      console.log(`✅ ${packageType} creado:`, response.data);
      alert(`✅ ${packageType} creado exitosamente`);
      
      // Reset y recargar
      setPackageForm({ nombre: '', descripcion: '' });
      setShowCreatePackage(false);
      setSelectedCWPForPackage(null);
      await loadJerarquia();
      
      if (onDataChange) onDataChange();
      
    } catch (error) {
      console.error(`Error creando ${packageType}:`, error);
      alert(`❌ Error creando ${packageType}: ` + (error.response?.data?.detail || error.message));
    }
  };

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

  // Filtrar por CWA si se hizo clic en el plot plan
  const displayCWAs = filteredCWAId 
    ? jerarquia.cwas.filter(cwa => cwa.id === filteredCWAId)
    : jerarquia.cwas;

  return (
    <div className="space-y-4">
      {/* Header con filtro activo */}
      {filteredCWAId && (
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-sm">🔍 Filtrando por CWA seleccionado</span>
          </div>
          <button
            onClick={() => {/* Callback para limpiar filtro */}}
            className="text-xs text-blue-300 hover:text-blue-200"
          >
            ✕ Limpiar filtro
          </button>
        </div>
      )}

      {/* Tabla consolidada */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold">CWA Código</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Descripción</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Prioridad</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">CWP</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Descripción CWP</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Secuencia</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Transversal</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Código Paquete</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Descripción Paquete</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Entregables</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Fechas</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800">
            {displayCWAs.map(cwa => {
              const isExpanded = expandedCWAs.has(cwa.id);
              const hasCWPs = cwa.cwps && cwa.cwps.length > 0;

              return (
                <React.Fragment key={cwa.id}>
                  {/* Fila CWA */}
                  <tr className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleCWA(cwa.id)}
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                      >
                        <span>{isExpanded ? '▼' : '▶'}</span>
                        {cwa.codigo}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-gray-300">{cwa.nombre}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs">
                        Media
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-xs">
                      {hasCWPs ? `${cwa.cwps.length} CWP(s)` : 'Sin CWPs'}
                    </td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2">
                      {cwa.es_transversal ? (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                          Transversal
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                          Local
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2 text-gray-500">-</td>
                    <td className="px-3 py-2">
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

                  {/* Filas CWP (si está expandido) */}
                  {isExpanded && hasCWPs && cwa.cwps.map(cwp => {
                    const isCWPExpanded = expandedCWPs.has(cwp.id);
                    const hasPackages = (cwp.ewps?.length || 0) + (cwp.iwps?.length || 0) + (cwp.pwps?.length || 0) > 0;

                    return (
                      <React.Fragment key={cwp.id}>
                        {/* Fila CWP */}
                        <tr className="border-b border-gray-700/50 bg-gray-800/50 hover:bg-gray-750/50">
                          <td className="px-3 py-2 pl-12">
                            <button
                              onClick={() => toggleCWP(cwp.id)}
                              className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
                            >
                              <span className="text-xs">{isCWPExpanded ? '▼' : '▶'}</span>
                              {cwp.codigo}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-gray-400 text-sm">-</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-300 font-medium">{cwp.codigo}</td>
                          <td className="px-3 py-2 text-gray-400">{cwp.nombre}</td>
                          <td className="px-3 py-2 text-gray-400 text-xs">
                            {cwp.duracion_dias ? `${cwp.duracion_dias} días` : '-'}
                          </td>
                          <td className="px-3 py-2 text-gray-500">-</td>
                          <td className="px-3 py-2">-</td>
                          <td className="px-3 py-2 text-gray-500">-</td>
                          <td className="px-3 py-2 text-gray-500">-</td>
                          <td className="px-3 py-2 text-gray-500">-</td>
                          <td className="px-3 py-2 text-xs text-gray-400">
                            {cwp.fecha_inicio_prevista && cwp.fecha_fin_prevista
                              ? `${cwp.fecha_inicio_prevista} / ${cwp.fecha_fin_prevista}`
                              : '-'}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('EWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs"
                                title="Crear EWP"
                              >
                                + EWP
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('IWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs"
                                title="Crear IWP"
                              >
                                + IWP
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCWPForPackage(cwp.id);
                                  setPackageType('PWP');
                                  setShowCreatePackage(true);
                                }}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs"
                                title="Crear PWP"
                              >
                                + PWP
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Filas de Paquetes (EWP/IWP/PWP) */}
                        {isCWPExpanded && (
                          <>
                            {/* EWPs */}
                            {cwp.ewps?.map(ewp => (
                              <tr key={`ewp-${ewp.id}`} className="border-b border-gray-700/30 bg-gray-800/30 hover:bg-gray-750/30">
                                <td className="px-3 py-2 pl-20 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                                    EWP
                                  </span>
                                </td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-purple-400 font-mono text-xs">{ewp.codigo}</td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{ewp.nombre}</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {ewp.entregables?.length || 0} entregable(s)
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {ewp.fecha_publicacion_prevista || '-'}
                                </td>
                                <td className="px-3 py-2">
                                  <button className="text-xs text-blue-400 hover:text-blue-300">
                                    Ver
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* IWPs */}
                            {cwp.iwps?.map(iwp => (
                              <tr key={`iwp-${iwp.id}`} className="border-b border-gray-700/30 bg-gray-800/30 hover:bg-gray-750/30">
                                <td className="px-3 py-2 pl-20 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-orange-600/20 text-orange-300 rounded text-xs">
                                    IWP
                                  </span>
                                </td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-orange-400 font-mono text-xs">{iwp.codigo}</td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{iwp.nombre}</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {iwp.items_instalacion?.length || 0} item(s)
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {iwp.fecha_inicio_prevista && iwp.fecha_fin_prevista
                                    ? `${iwp.fecha_inicio_prevista} / ${iwp.fecha_fin_prevista}`
                                    : '-'}
                                </td>
                                <td className="px-3 py-2">
                                  <button className="text-xs text-blue-400 hover:text-blue-300">
                                    Ver
                                  </button>
                                </td>
                              </tr>
                            ))}

                            {/* PWPs */}
                            {cwp.pwps?.map(pwp => (
                              <tr key={`pwp-${pwp.id}`} className="border-b border-gray-700/30 bg-gray-800/30 hover:bg-gray-750/30">
                                <td className="px-3 py-2 pl-20 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2 text-xs text-gray-500">-</td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2">
                                  <span className="px-2 py-1 bg-teal-600/20 text-teal-300 rounded text-xs">
                                    PWP
                                  </span>
                                </td>
                                <td className="px-3 py-2">-</td>
                                <td className="px-3 py-2 text-teal-400 font-mono text-xs">{pwp.codigo}</td>
                                <td className="px-3 py-2 text-gray-400 text-xs">{pwp.nombre}</td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {pwp.items_adquisicion?.length || 0} item(s)
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-400">
                                  {pwp.fecha_ros_prevista || '-'}
                                </td>
                                <td className="px-3 py-2">
                                  <button className="text-xs text-blue-400 hover:text-blue-300">
                                    Ver
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

      {/* Modal Crear CWP */}
      {showCreateCWP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Crear CWP</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={cwpForm.nombre}
                  onChange={(e) => setCwpForm({ ...cwpForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  placeholder="Ej: Instalación de bombas"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea
                  value={cwpForm.descripcion}
                  onChange={(e) => setCwpForm({ ...cwpForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  rows="3"
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
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateCWP}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowCreateCWP(false);
                  setSelectedCWAForCWP(null);
                  setCwpForm({ nombre: '', descripcion: '', disciplina_id: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Paquete */}
      {showCreatePackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Crear {packageType}</h3>
            
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
    </div>
  );
}

export default AWPTableConsolidada;