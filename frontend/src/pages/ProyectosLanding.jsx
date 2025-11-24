// frontend/src/pages/ProyectosLanding.jsx

import React, { useState } from 'react';
import client from '../api/axios';
import HatchLogo from '../components/common/HatchLogo';

function ProyectosLanding({ proyectos, onSelectProyecto, onAddProyecto, error }) {
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateProyecto = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddProyecto(formData.nombre);
      setModalCreate(false);
      setFormData({ nombre: '', descripcion: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (proyecto) => {
    setEditingProyecto(proyecto);
    setFormData({ nombre: proyecto.nombre, descripcion: proyecto.descripcion || '' });
    setModalEdit(true);
  };

  const handleUpdateProyecto = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await client.put(`/proyectos/${editingProyecto.id}`, formData);
      setModalEdit(false);
      setFormData({ nombre: '', descripcion: '' });
      setEditingProyecto(null);
      alert('✅ Proyecto actualizado exitosamente');
      window.location.reload();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProyecto = async (proyectoId, nombreProyecto) => {
    const confirmacion = window.prompt(
      `⚠️ ADVERTENCIA: Esta acción eliminará PERMANENTEMENTE el proyecto "${nombreProyecto}" y TODA su información:\n\n` +
      `• Todos los Plot Plans\n` +
      `• Todas las Áreas (CWA)\n` +
      `• Todos los CWPs\n` +
      `• Todos los Paquetes e Items\n` +
      `• Todas las configuraciones\n\n` +
      `Esta acción NO SE PUEDE DESHACER.\n\n` +
      `Para confirmar, escribe el nombre del proyecto: "${nombreProyecto}"`
    );

    if (confirmacion !== nombreProyecto) {
      if (confirmacion !== null) {
        alert('❌ Nombre incorrecto. Eliminación cancelada.');
      }
      return;
    }

    setLoading(true);
    try {
      await client.delete(`/proyectos/${proyectoId}`);
      alert('✅ Proyecto eliminado exitosamente');
      window.location.reload();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-hatch text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo y Título */}
          <div className="flex flex-col">
            <HatchLogo variant="full" className="h-16 w-auto object-contain mb-1" style={{ minWidth: '150px' }} />
            <p className="text-white/90 text-sm font-medium">Advanced Work Packaging</p>
          </div>

          {/* Botón Nuevo Proyecto */}
          <button 
            onClick={() => setModalCreate(true)}
            className="bg-white hover:shadow-xl text-hatch-blue px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl">➕</span> Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-hatch-blue mb-2">Mis Proyectos</h2>
          <p className="text-gray-600">Selecciona un proyecto para gestionar su estructura AWP</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {proyectos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-4">No tienes proyectos creados</p>
            <button 
              onClick={() => setModalCreate(true)}
              className="bg-gradient-orange hover:shadow-lg text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              Crear tu primer proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map(proyecto => {
              const totalCWAs = proyecto.plot_plans?.reduce((sum, pp) => sum + (pp.cwas?.length || 0), 0) || 0;
              const totalCWPs = proyecto.plot_plans?.reduce((sum, pp) => 
                sum + (pp.cwas?.reduce((s, c) => s + (c.cwps?.length || 0), 0) || 0), 0) || 0;

              return (
                <div 
                  key={proyecto.id} 
                  className="bg-white border-2 border-hatch-gray rounded-xl p-6 hover:border-hatch-orange hover:shadow-xl transition-all cursor-pointer group relative"
                >
                  {/* Botones de Acción */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(proyecto);
                      }}
                      className="bg-white hover:bg-hatch-gray text-hatch-blue p-2 rounded-lg border-2 border-hatch-gray hover:border-hatch-orange transition-all shadow-sm"
                      title="Editar proyecto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProyecto(proyecto.id, proyecto.nombre);
                      }}
                      className="bg-white hover:bg-red-50 text-red-600 p-2 rounded-lg border-2 border-red-300 hover:border-red-500 transition-all shadow-sm"
                      title="Eliminar proyecto"
                    >
                      🗑️
                    </button>
                  </div>

                  <div onClick={() => onSelectProyecto(proyecto)}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-gradient-orange text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold flex-shrink-0">
                        {proyecto.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-hatch-blue mb-1 truncate pr-16">
                          {proyecto.nombre}
                        </h3>
                        {proyecto.descripcion && (
                          <p className="text-sm text-gray-600 line-clamp-2">{proyecto.descripcion}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t-2 border-hatch-gray pt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">📍 Áreas (CWA)</span>
                        <span className="font-bold text-hatch-orange">{totalCWAs}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">📦 Paquetes CWP</span>
                        <span className="font-bold text-blue-600">{totalCWPs}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">🎨 Plot Plans</span>
                        <span className="font-bold text-teal-600">{proyecto.plot_plans?.length || 0}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-hatch-gray">
                      <button className="w-full bg-gradient-orange text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all group-hover:scale-105">
                        Abrir Proyecto →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Crear Proyecto */}
      {modalCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2">
              <span className="text-hatch-orange">➕</span>
              Nuevo Proyecto
            </h3>
            <form onSubmit={handleCreateProyecto} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre del Proyecto *</label>
                <input 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Planta Industrial XYZ"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Descripción (Opcional)</label>
                <textarea 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none resize-none"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Breve descripción del proyecto..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
                <button 
                  type="button"
                  onClick={() => {
                    setModalCreate(false);
                    setFormData({ nombre: '', descripcion: '' });
                  }}
                  className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Proyecto */}
      {modalEdit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl border-2 border-hatch-gray shadow-2xl">
            <h3 className="text-hatch-blue font-bold mb-4 text-xl flex items-center gap-2">
              <span className="text-hatch-orange">✏️</span>
              Editar Proyecto
            </h3>
            <form onSubmit={handleUpdateProyecto} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Nombre del Proyecto *</label>
                <input 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Planta Industrial XYZ"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1 font-semibold">Descripción (Opcional)</label>
                <textarea 
                  className="w-full bg-white border-2 border-hatch-gray rounded px-3 py-2 focus:border-hatch-orange outline-none resize-none"
                  value={formData.descripcion}
                  onChange={e => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Breve descripción del proyecto..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t-2 border-hatch-gray">
                <button 
                  type="button"
                  onClick={() => {
                    setModalEdit(false);
                    setFormData({ nombre: '', descripcion: '' });
                    setEditingProyecto(null);
                  }}
                  className="text-gray-600 hover:text-hatch-blue px-4 py-2 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-orange hover:shadow-lg text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-hatch-gray py-6 text-center text-gray-600 text-sm">
        <p>PROTOTYPE BY <span className="text-hatch-orange font-bold">HATCH</span></p>
      </div>
    </div>
  );
}

export default ProyectosLanding;