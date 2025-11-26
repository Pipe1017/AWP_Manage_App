// frontend/src/components/common/DashboardSidebar.jsx

import React, { useState, useEffect } from 'react';
import client from '../../api/axios';

function DashboardSidebar({ proyecto, selectedSection, setSelectedSection, isExpanded }) {
  
  // Estado local para las estadísticas
  const [stats, setStats] = useState({ 
    cwas: 0, 
    cwps: 0, 
    ewps: 0, 
    pwps: 0, 
    iwps: 0,
    items: 0 // Total de entregables
  });

  // 🔄 EFECTO: Cargar la jerarquía completa para contar con precisión
  useEffect(() => {
    const fetchStats = async () => {
      if (!proyecto?.id) return;

      try {
        const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`);
        const data = res.data;

        let counts = { cwas: 0, cwps: 0, ewps: 0, pwps: 0, iwps: 0, items: 0 };

        if (data.cwas) {
          counts.cwas = data.cwas.length;
          data.cwas.forEach(cwa => {
            if (cwa.cwps) {
              counts.cwps += cwa.cwps.length;
              cwa.cwps.forEach(cwp => {
                if (cwp.paquetes) {
                  cwp.paquetes.forEach(pkg => {
                    // Contar tipo de paquete
                    const tipo = pkg.tipo?.toUpperCase();
                    if (tipo === 'EWP') counts.ewps++;
                    else if (tipo === 'PWP') counts.pwps++;
                    else if (tipo === 'IWP') counts.iwps++;

                    // Contar items dentro del paquete
                    if (pkg.items) {
                        counts.items += pkg.items.length;
                    }
                  });
                }
              });
            }
          });
        }
        setStats(counts);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    fetchStats();
    // Recargar cada vez que se abre el sidebar o cambia el proyecto
    // (Podrías agregar un intervalo aquí si quisieras tiempo real estricto)
  }, [proyecto.id]);

  // --- VERSIÓN COLAPSADA (ICONOS) ---
  if (!isExpanded) {
    return (
      <div className="w-20 bg-white border-r-2 border-hatch-gray flex flex-col items-center py-6 gap-4 shadow-lg z-20">
        <SidebarIcon 
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
            label="Resumen"
            active={selectedSection === 'resumen'}
            onClick={() => setSelectedSection('resumen')}
        />
        <SidebarIcon 
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
            label="Cronograma"
            active={selectedSection === 'cronograma'}
            onClick={() => setSelectedSection('cronograma')}
        />
        <SidebarIcon 
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />}
            label="Árbol"
            active={selectedSection === 'arbol'}
            onClick={() => setSelectedSection('arbol')}
        />
        
        <div className="w-10 border-t-2 border-hatch-gray my-2"></div>

        <SidebarIcon 
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
            label="Config"
            active={selectedSection === 'configuracion'}
            onClick={() => setSelectedSection('configuracion')}
        />
      </div>
    );
  }

  // --- VERSIÓN EXPANDIDA (MENÚ COMPLETO) ---
  return (
    <div className="w-72 bg-white border-r-2 border-hatch-gray flex flex-col overflow-hidden shadow-xl z-20">
      
      {/* Header Sidebar */}
      <div className="p-5 border-b-2 border-hatch-gray bg-gray-50">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navegación</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        
        <SidebarItem 
            title="Resumen General"
            desc="Plot Plan y estructura"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
            active={selectedSection === 'resumen'}
            onClick={() => setSelectedSection('resumen')}
        />

        <SidebarItem 
            title="Cronograma (PoC)"
            desc="Secuencia constructiva"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
            active={selectedSection === 'cronograma'}
            onClick={() => setSelectedSection('cronograma')}
        />

        <SidebarItem 
            title="Árbol de Proyecto"
            desc="Jerarquía completa"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />}
            active={selectedSection === 'arbol'}
            onClick={() => setSelectedSection('arbol')}
        />

        {/* STATS CARD - AWP METRICS */}
        <div className="mt-6 mx-1 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Métricas AWP</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-400 font-mono">Total</span>
          </div>
          
          {/* Grid de Métricas */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="CWA" count={stats.cwas} color="bg-blue-50 text-blue-800 border-blue-200" />
            <StatBox label="CWP" count={stats.cwps} color="bg-green-50 text-green-800 border-green-200" />
          </div>
          
          <div className="h-px bg-gray-200 my-3"></div>
          
          <div className="grid grid-cols-3 gap-1.5">
            {/* Colores HATCH / AWP Standard */}
            <StatBox label="EWP" count={stats.ewps} color="bg-purple-50 text-purple-800 border-purple-200" size="sm" />
            <StatBox label="PWP" count={stats.pwps} color="bg-teal-50 text-teal-800 border-teal-200" size="sm" />
            <StatBox label="IWP" count={stats.iwps} color="bg-orange-50 text-orange-800 border-orange-200" size="sm" />
          </div>

          {/* Entregables Totales */}
          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
             <span className="text-[10px] font-bold text-gray-500 uppercase">Entregables Totales</span>
             <span className="text-sm font-bold text-hatch-blue">{stats.items}</span>
          </div>
        </div>

        <div className="my-4 border-t border-hatch-gray mx-2"></div>

        <SidebarItem 
            title="Configuración"
            desc="Catálogos y metadatos"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />}
            active={selectedSection === 'configuracion'}
            onClick={() => setSelectedSection('configuracion')}
        />

      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-hatch-gray bg-gray-50 text-[10px] text-gray-400 text-center">
        <p>ID de Proyecto: <strong className="text-hatch-blue">{proyecto.id}</strong></p>
        <p className="mt-1 text-hatch-orange font-bold">HATCH AWP</p>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function SidebarIcon({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group ${
        active
          ? 'bg-hatch-orange text-white shadow-lg transform scale-105'
          : 'text-gray-400 hover:bg-gray-100 hover:text-hatch-blue'
      }`}
      title={label}
    >
      <svg className={`w-6 h-6 ${active ? 'text-white' : 'group-hover:text-hatch-orange'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icon}
      </svg>
    </button>
  );
}

function SidebarItem({ title, desc, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 group ${
        active
          ? 'bg-gradient-to-r from-hatch-blue to-hatch-blue-light text-white shadow-md border border-hatch-blue-dark'
          : 'hover:bg-gray-100 text-hatch-blue'
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? 'bg-white/20 text-white' : 'bg-white border border-gray-200 text-gray-400 group-hover:text-hatch-orange'}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="flex-1">
        <p className={`font-bold text-sm ${active ? 'text-white' : 'text-gray-700'}`}>{title}</p>
        <p className={`text-xs ${active ? 'text-white/70' : 'text-gray-400 group-hover:text-gray-500'}`}>
          {desc}
        </p>
      </div>
    </button>
  );
}

function StatBox({ label, count, color, size = 'md' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border ${color} ${size === 'md' ? 'p-2' : 'p-1.5'}`}>
      <span className={`font-bold text-hatch-blue ${size === 'md' ? 'text-lg' : 'text-sm'}`}>{count}</span>
      <span className={`text-[9px] font-bold uppercase tracking-wider opacity-80 ${color.includes('text-') ? '' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}

export default DashboardSidebar;