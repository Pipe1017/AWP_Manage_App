import React, { useState } from 'react';

// Este componente recibe la lista de proyectos, cuál está seleccionado,
// y las funciones para seleccionar o crear uno nuevo.
function Sidebar({ proyectos, selectedProyecto, onSelectProyecto, onAddProyecto }) {
  const [nombreProyecto, setNombreProyecto] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreProyecto) return;
    // Llama a la función que vive en App.jsx
    onAddProyecto(nombreProyecto);
    setNombreProyecto("");
  };

  return (
    <div className="w-1/4 min-w-[300px] bg-gray-800 p-4 border-r border-gray-700 h-screen overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-white">Proyectos</h2>

      {/* Formulario para crear proyecto (movido de App.jsx) */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={nombreProyecto}
          onChange={(e) => setNombreProyecto(e.target.value)}
          placeholder="Nombre del nuevo proyecto"
          className="w-full px-3 py-2 rounded bg-gray-900 border border-gray-700 text-white"
          required
        />
        <button type="submit" className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">
          Crear Proyecto
        </button>
      </form>

      {/* Lista de proyectos */}
      <h3 className="text-xl font-semibold mb-2 text-gray-300">Seleccionar Proyecto</h3>
      <ul className="list-none p-0">
        {proyectos.length > 0 ? (
          proyectos.map((proyecto) => (
            <li
              key={proyecto.id}
              onClick={() => onSelectProyecto(proyecto)}
              className={`
                cursor-pointer p-3 my-2 rounded-lg border
                ${selectedProyecto?.id === proyecto.id ?
                  'bg-blue-600 border-blue-500 text-white' :
                  'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                }
              `}
            >
              {proyecto.nombre}
            </li>
          ))
        ) : (
          <p className="text-gray-400">No hay proyectos.</p>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;