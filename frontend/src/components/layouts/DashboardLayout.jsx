import React from 'react';
import DashboardHeader from '../common/DashboardHeader';
import DashboardSidebar from '../common/DashboardSidebar';
import ResumenTab from '../sections/ResumenTab';
import CronogramaTab from '../sections/CronogramaSection';
import ArbolTab from '../sections/ArbolSection';

function ProyectoDashboardLayout({
  proyecto,
  selectedSection,
  setSelectedSection,
  sidebarExpanded,
  setSidebarExpanded,
  onBack,
  onProyectoUpdate
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <DashboardHeader
        proyecto={proyecto}
        onBack={onBack}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          proyecto={proyecto}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          isExpanded={sidebarExpanded}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-900">
          {selectedSection === 'resumen' && (
            <ResumenTab
              proyecto={proyecto}
              onProyectoUpdate={onProyectoUpdate}
            />
          )}

          {selectedSection === 'cronograma' && (
            <CronogramaTab proyecto={proyecto} />
          )}

          {selectedSection === 'arbol' && (
            <ArbolTab proyecto={proyecto} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProyectoDashboardLayout;