// frontend/src/components/layouts/DashboardLayout.jsx

// --- IMPORTACIONES EXISTENTES ---
import ConfiguracionSection from '../sections/ConfiguracionSection';

// --- IMPORTACIONES FALTANTES (AGREGAR ESTAS) ---
import DashboardHeader from '../common/DashboardHeader'; // (Ajusta la ruta si es necesario)
import DashboardSidebar from '../common/DashboardSidebar'; // (Ajusta la ruta si es necesario)
import ResumenTab from '../sections/ResumenTab'; // (Probablemente en una carpeta 'sections')
import CronogramaTab from '../sections/CronogramaSection'; // (Probablemente en una carpeta 'sections')
import ArbolTab from '../sections/ArbolSection'; // (Probablemente en una carpeta 'sections')

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
      <DashboardHeader
        proyecto={proyecto}
        onBack={onBack}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar
          proyecto={proyecto}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          isExpanded={sidebarExpanded}
        />

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

          {/* ✨ NUEVA SECCIÓN */}
          {selectedSection === 'configuracion' && (
            <ConfiguracionSection
              proyecto={proyecto}
              onProyectoUpdate={onProyectoUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProyectoDashboardLayout;