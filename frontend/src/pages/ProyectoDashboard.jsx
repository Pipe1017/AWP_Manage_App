import React, { useState } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';

function ProyectoDashboard({ proyecto, onBack, onProyectoUpdate }) {
  // Asegurar valores por defecto
  const safeProyecto = {
    ...proyecto,
    disciplinas: proyecto.disciplinas || [],
    plot_plans: proyecto.plot_plans || [],
  };

  const [selectedSection, setSelectedSection] = useState('resumen');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <DashboardLayout
      proyecto={safeProyecto}
      selectedSection={selectedSection}
      setSelectedSection={setSelectedSection}
      sidebarExpanded={sidebarExpanded}
      setSidebarExpanded={setSidebarExpanded}
      onBack={onBack}
      onProyectoUpdate={onProyectoUpdate}
    />
  );
}

export default ProyectoDashboard;