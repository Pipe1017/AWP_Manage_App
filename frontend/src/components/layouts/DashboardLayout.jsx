import React, { useState, useEffect } from 'react';
import DashboardHeader from '../common/DashboardHeader';
import DashboardSidebar from '../common/DashboardSidebar';

// Secciones
import ResumenTab from '../sections/ResumenTab';
import CronogramaTab from '../sections/CronogramaSection';
import ArbolTab from '../sections/ArbolSection';
import ConfiguracionSection from '../sections/ConfiguracionSection';

function ProyectoDashboardLayout({
  proyecto: proyectoInicial,
  selectedSection,
  setSelectedSection,
  sidebarExpanded,
  setSidebarExpanded,
  onBack,
  onProyectoUpdate
}) {
  const [proyecto, setProyecto] = useState(proyectoInicial);
  const [globalCWAFilter, setGlobalCWAFilter] = useState(null);

  useEffect(() => {
    setProyecto(proyectoInicial);
  }, [proyectoInicial]);

  const handleProyectoUpdate = (nuevoProyecto) => {
    setProyecto(nuevoProyecto);
    if (onProyectoUpdate) {
      onProyectoUpdate(nuevoProyecto);
    }
  };

  return (
    // ✅ CAMBIO: min-h-screen permite que la página crezca y el scroll sea global
    <div className="bg-gray-900 text-hatch-blue min-h-screen flex flex-col">
      <DashboardHeader
        proyecto={proyecto}
        onBack={onBack}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* ✅ CAMBIO: flex-1 sin overflow-hidden, permitiendo scroll natural */}
      <div className="flex flex-1 items-stretch">
        
        {/* Sidebar (Crecerá con el contenido pero scrolleará con la página) */}
        <DashboardSidebar
          proyecto={proyecto}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          isExpanded={sidebarExpanded}
          activeCWAId={globalCWAFilter}
        />

        {/* Contenido Principal */}
        <div className="flex-1 bg-gray-900 p-0 min-w-0">
          
          {selectedSection === 'resumen' && (
            <ResumenTab
              proyecto={proyecto}
              onProyectoUpdate={handleProyectoUpdate}
              globalFilterCWA={globalCWAFilter}
              setGlobalFilterCWA={setGlobalCWAFilter}
            />
          )}

          {selectedSection === 'cronograma' && (
            <CronogramaTab proyecto={proyecto} />
          )}

          {selectedSection === 'arbol' && (
            <ArbolTab proyecto={proyecto} />
          )}

          {selectedSection === 'configuracion' && (
            <ConfiguracionSection 
              proyecto={proyecto} 
              onProyectoUpdate={handleProyectoUpdate} 
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default ProyectoDashboardLayout;