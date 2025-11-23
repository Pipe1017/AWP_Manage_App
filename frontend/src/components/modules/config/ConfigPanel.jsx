// frontend/src/components/modules/config/ConfigPanel.jsx
import React from 'react';
import ProyectoDetalle from './ProyectoDetalle';

function ConfigPanel({ proyecto, onDisciplinaCreada, selectedPlotPlanId }) {
  const handleDisciplinaCreada = (nuevaDisciplina) => {
    onDisciplinaCreada(nuevaDisciplina);
  };

  return (
    <ProyectoDetalle
      proyecto={proyecto}
      onDisciplinaCreada={handleDisciplinaCreada}
      onTipoEntregableCreado={() => {}}
      onCWACreada={() => {}}
    />
  );
}

export default ConfigPanel;