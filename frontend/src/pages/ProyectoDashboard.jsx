import React, { useState } from 'react';
import ProyectoDashboardLayout from '../components/layouts/ProyectoDashboardLayout';

function ProyectoDashboard({ proyecto, onBack, onProyectoUpdate }) {
  const [selectedSection, setSelectedSection] = useState('resumen');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <ProyectoDashboardLayout
      proyecto={proyecto}
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