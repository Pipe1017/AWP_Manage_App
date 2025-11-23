// frontend/src/components/forms/ConfigPanel.jsx
import React from 'react';
import ProyectoDetalle from './ProyectoDetalle'; // Cambiar la ruta aquí

function ConfigPanel({ proyecto, onDisciplinaCreada, selectedPlotPlanId }) {
  const handleDisciplinaCreada = (nuevaDisciplina) => {
    onDisciplinaCreada(nuevaDisciplina);
  };

  const handleCWACreada = () => {
    // Notificar al padre para que recargue
    if (onDisciplinaCreada) {
      onDisciplinaCreada(null); // Trigger refresh
    }
  };

  return (
    <ProyectoDetalle
      proyecto={proyecto}
      onDisciplinaCreada={handleDisciplinaCreada}
      onTipoEntregableCreado={handleDisciplinaCreada}
      onCWACreada={handleCWACreada}
    />
  );
}

export default ConfigPanel;