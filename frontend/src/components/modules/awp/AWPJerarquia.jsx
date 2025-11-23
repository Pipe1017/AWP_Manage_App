// frontend/src/components/modules/awp/AWPJerarquia.jsx
import React, { useState, useEffect } from 'react';
import client from '../../../api/axios';
import './AWPJerarquia.css';


function AWPJerarquia({ plotPlanId, proyecto }) {
  const [jerarquia, setJerarquia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCWAs, setExpandedCWAs] = useState({});
  const [expandedCWPs, setExpandedCWPs] = useState({});
  const [expandedEWPs, setExpandedEWPs] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plotPlanId) return;
    cargarJerarquia();
  }, [plotPlanId]);

  const cargarJerarquia = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/awp/plot_plan/${plotPlanId}/jerarquia/`);
      setJerarquia(response.data);
      setError(null);
      console.log('✅ Jerarquía cargada:', response.data);
    } catch (err) {
      console.error('🔥 Error cargando jerarquía:', err);
      setError('Error al cargar la estructura AWP');
    } finally {
      setLoading(false);
    }
  };

  const toggleCWA = (cwaId) => {
    setExpandedCWAs(prev => ({
      ...prev,
      [cwaId]: !prev[cwaId]
    }));
  };

  const toggleCWP = (cwpId) => {
    setExpandedCWPs(prev => ({
      ...prev,
      [cwpId]: !prev[cwpId]
    }));
  };

  const toggleEWP = (ewpId) => {
    setExpandedEWPs(prev => ({
      ...prev,
      [ewpId]: !prev[ewpId]
    }));
  };

  if (loading) {
    return <div className="awp-loading">⏳ Cargando estructura AWP...</div>;
  }

  if (error) {
    return <div className="awp-error">❌ {error}</div>;
  }

  if (!jerarquia || !jerarquia.cwas) {
    return <div className="awp-empty">📭 Sin datos disponibles</div>;
  }

  return (
    <div className="awp-jerarquia">
      <div className="awp-header">
        <h3>📊 Estructura AWP</h3>
        <button onClick={cargarJerarquia} className="awp-refresh-btn" title="Refrescar datos">
          🔄 Refrescar
        </button>
      </div>

      <table className="awp-table">
        <thead>
          <tr>
            <th className="col-expand"></th>
            <th className="col-codigo">Código</th>
            <th className="col-nombre">Nombre</th>
            <th className="col-tipo">Tipo</th>
            <th className="col-estado">Estado</th>
            <th className="col-completitud">Completitud</th>
            <th className="col-duracion">Duración</th>
            <th className="col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {jerarquia.cwas.map(cwa => (
            <React.Fragment key={`cwa-${cwa.id}`}>
              {/* NIVEL 1: CWA */}
              <tr className="row-cwa">
                <td className="cell-expand">
                  <button
                    className="expand-btn"
                    onClick={() => toggleCWA(cwa.id)}
                    title={expandedCWAs[cwa.id] ? 'Contraer' : 'Expandir'}
                  >
                    {expandedCWAs[cwa.id] ? '▼' : '▶'} {cwa.cwps.length > 0 && `(${cwa.cwps.length})`}
                  </button>
                </td>
                <td className="cell-codigo">
                  <strong>{cwa.codigo}</strong>
                </td>
                <td className="cell-nombre">
                  <span className="icon-cwa">📍</span> {cwa.nombre}
                  {cwa.es_transversal && <span className="badge-transversal">Transversal</span>}
                </td>
                <td className="cell-tipo">CWA</td>
                <td className="cell-estado">-</td>
                <td className="cell-completitud">-</td>
                <td className="cell-duracion">-</td>
                <td className="cell-acciones">
                  <button className="btn-action btn-edit" title="Editar">✏️</button>
                  <button className="btn-action btn-delete" title="Eliminar">🗑️</button>
                </td>
              </tr>

              {/* NIVEL 2: CWPs dentro de CWA */}
              {expandedCWAs[cwa.id] && cwa.cwps.map(cwp => (
                <React.Fragment key={`cwp-${cwp.id}`}>
                  <tr className="row-cwp">
                    <td className="cell-expand" style={{ paddingLeft: '40px' }}>
                      <button
                        className="expand-btn"
                        onClick={() => toggleCWP(cwp.id)}
                        title={expandedCWPs[cwp.id] ? 'Contraer' : 'Expandir'}
                      >
                        {expandedCWPs[cwp.id] ? '▼' : '▶'} ({(cwp.ewps?.length || 0) + (cwp.pwps?.length || 0) + (cwp.iwps?.length || 0)})
                      </button>
                    </td>
                    <td className="cell-codigo">
                      <strong>{cwp.codigo}</strong>
                    </td>
                    <td className="cell-nombre">
                      <span className="icon-cwp">📦</span> {cwp.nombre}
                    </td>
                    <td className="cell-tipo">CWP</td>
                    <td className="cell-estado">
                      <span className={`badge-estado badge-${cwp.estado.toLowerCase()}`}>
                        {cwp.estado}
                      </span>
                    </td>
                    <td className="cell-completitud">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${cwp.porcentaje_completitud}%`,
                            backgroundColor: cwp.porcentaje_completitud >= 75 ? '#10b981' : 
                                            cwp.porcentaje_completitud >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        ></div>
                        <span className="progress-text">{cwp.porcentaje_completitud}%</span>
                      </div>
                    </td>
                    <td className="cell-duracion">
                      {cwp.duracion_dias && `${cwp.duracion_dias}d`}
                    </td>
                    <td className="cell-acciones">
                      <button className="btn-action btn-edit" title="Editar">✏️</button>
                      <button className="btn-action btn-delete" title="Eliminar">🗑️</button>
                    </td>
                  </tr>

                  {/* NIVEL 3: EWPs dentro de CWP */}
                  {expandedCWPs[cwp.id] && cwp.ewps?.length > 0 && cwp.ewps.map(ewp => (
                    <React.Fragment key={`ewp-${ewp.id}`}>
                      <tr className="row-ewp">
                        <td className="cell-expand" style={{ paddingLeft: '80px' }}>
                          <button
                            className="expand-btn"
                            onClick={() => toggleEWP(ewp.id)}
                            title={expandedEWPs[ewp.id] ? 'Contraer' : 'Expandir'}
                          >
                            {expandedEWPs[ewp.id] ? '▼' : '▶'} ({ewp.entregables?.length || 0})
                          </button>
                        </td>
                        <td className="cell-codigo">
                          <strong>{ewp.codigo}</strong>
                        </td>
                        <td className="cell-nombre">
                          <span className="icon-ewp">📋</span> {ewp.nombre}
                        </td>
                        <td className="cell-tipo">EWP</td>
                        <td className="cell-estado">
                          <span className={`badge-estado badge-${ewp.estado.toLowerCase()}`}>
                            {ewp.estado}
                          </span>
                        </td>
                        <td className="cell-completitud">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${ewp.porcentaje_completitud}%`,
                                backgroundColor: ewp.porcentaje_completitud >= 75 ? '#10b981' : 
                                                ewp.porcentaje_completitud >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            ></div>
                            <span className="progress-text">{ewp.porcentaje_completitud}%</span>
                          </div>
                        </td>
                        <td className="cell-duracion">-</td>
                        <td className="cell-acciones">
                          <button className="btn-action btn-edit" title="Editar">✏️</button>
                          <button className="btn-action btn-delete" title="Eliminar">🗑️</button>
                        </td>
                      </tr>

                      {/* NIVEL 4: Entregables dentro de EWP */}
                      {expandedEWPs[ewp.id] && ewp.entregables?.length > 0 && ewp.entregables.map((entregable, idx) => (
                        <tr key={`entregable-${entregable.id}`} className="row-entregable">
                          <td className="cell-expand" style={{ paddingLeft: '120px' }}></td>
                          <td className="cell-codigo">
                            <small>{entregable.codigo}</small>
                          </td>
                          <td className="cell-nombre">
                            <span className="icon-entregable">📄</span> {entregable.nombre}
                          </td>
                          <td className="cell-tipo">Entregable</td>
                          <td className="cell-estado">
                            <span className={`badge-estado badge-${entregable.estado_documento.toLowerCase()}`}>
                              {entregable.estado_documento}
                            </span>
                          </td>
                          <td className="cell-completitud">-</td>
                          <td className="cell-duracion">-</td>
                          <td className="cell-acciones">
                            <button className="btn-action btn-view" title="Ver">👁️</button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  {/* NIVEL 3: PWPs dentro de CWP */}
                  {expandedCWPs[cwp.id] && cwp.pwps?.length > 0 && cwp.pwps.map(pwp => (
                    <tr key={`pwp-${pwp.id}`} className="row-pwp">
                      <td className="cell-expand" style={{ paddingLeft: '80px' }}></td>
                      <td className="cell-codigo">
                        <strong>{pwp.codigo}</strong>
                      </td>
                      <td className="cell-nombre">
                        <span className="icon-pwp">🛒</span> {pwp.nombre}
                      </td>
                      <td className="cell-tipo">PWP</td>
                      <td className="cell-estado">
                        <span className={`badge-estado badge-${pwp.estado.toLowerCase()}`}>
                          {pwp.estado}
                        </span>
                      </td>
                      <td className="cell-completitud">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${pwp.porcentaje_completitud}%`,
                              backgroundColor: pwp.porcentaje_completitud >= 75 ? '#10b981' : 
                                              pwp.porcentaje_completitud >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                          <span className="progress-text">{pwp.porcentaje_completitud}%</span>
                        </div>
                      </td>
                      <td className="cell-duracion">-</td>
                      <td className="cell-acciones">
                        <button className="btn-action btn-edit" title="Editar">✏️</button>
                      </td>
                    </tr>
                  ))}

                  {/* NIVEL 3: IWPs dentro de CWP */}
                  {expandedCWPs[cwp.id] && cwp.iwps?.length > 0 && cwp.iwps.map(iwp => (
                    <tr key={`iwp-${iwp.id}`} className="row-iwp">
                      <td className="cell-expand" style={{ paddingLeft: '80px' }}></td>
                      <td className="cell-codigo">
                        <strong>{iwp.codigo}</strong>
                      </td>
                      <td className="cell-nombre">
                        <span className="icon-iwp">🔧</span> {iwp.nombre}
                      </td>
                      <td className="cell-tipo">IWP</td>
                      <td className="cell-estado">
                        <span className={`badge-estado badge-${iwp.estado.toLowerCase()}`}>
                          {iwp.estado}
                        </span>
                      </td>
                      <td className="cell-completitud">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${iwp.porcentaje_completitud}%`,
                              backgroundColor: iwp.porcentaje_completitud >= 75 ? '#10b981' : 
                                              iwp.porcentaje_completitud >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          ></div>
                          <span className="progress-text">{iwp.porcentaje_completitud}%</span>
                        </div>
                      </td>
                      <td className="cell-duracion">-</td>
                      <td className="cell-acciones">
                        <button className="btn-action btn-edit" title="Editar">✏️</button>
                      </td>
                    </tr>
                  ))}

                  {/* REFERENCIAS A TRANSVERSALES */}
                  {expandedCWPs[cwp.id] && cwp.referencias_transversales?.length > 0 && (
                    <tr className="row-transversal-ref">
                      <td colSpan="8" style={{ paddingLeft: '80px' }}>
                        <div className="transversal-references">
                          <span className="badge-info">🔗 Referencias Transversales ({cwp.referencias_transversales.length})</span>
                          {cwp.referencias_transversales.map((ref, idx) => (
                            <span key={idx} className={`ref-status ${ref.completado ? 'completed' : 'pending'}`}>
                              {ref.completado ? '✅' : '⏳'} ID:{ref.id}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AWPJerarquia;