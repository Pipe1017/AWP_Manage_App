// frontend/src/components/layouts/DashboardLayout.jsx

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
  // 1. Estado local para manejar actualizaciones inmediatas
  const [proyecto, setProyecto] = useState(proyectoInicial);

  // 2. Sincronizar si el padre manda un proyecto nuevo
  useEffect(() => {
    setProyecto(proyectoInicial);
  }, [proyectoInicial]);

  // 3. Handler local para actualizar estado y propagar al padre
  const handleProyectoUpdate = (nuevoProyecto) => {
    console.log("🔄 DashboardLayout: Actualizando proyecto...", nuevoProyecto);
    setProyecto(nuevoProyecto);
    
    if (onProyectoUpdate) {
      onProyectoUpdate(nuevoProyecto);
    }
  };

  return (
    <div className="bg-gray-900 text-hatch-blue min-h-screen flex flex-col">
      {/* Header */}
      <DashboardHeader
        proyecto={proyecto}
        onBack={onBack}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* Contenedor Principal con Sidebar y Contenido */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <DashboardSidebar
          proyecto={proyecto}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          isExpanded={sidebarExpanded}
        />

        {/* Área de Contenido Variable */}
        <div className="flex-1 overflow-auto bg-gray-900">
          
          {selectedSection === 'resumen' && (
            <ResumenTab
              proyecto={proyecto}
              onProyectoUpdate={handleProyectoUpdate}
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