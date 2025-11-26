import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'react-google-charts';
import client from '../../api/axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function CronogramaTab({ proyecto }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    if (proyecto?.id) loadData();
  }, [proyecto.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`);
      const cwas = res.data.cwas || [];
      
      // 1. Ordenar CWA por Prioridad (1, 2, 3...)
      // Si no tiene prioridad, lo mandamos al final
      const sortedCwas = cwas.sort((a, b) => {
        const pA = a.prioridad || 9999;
        const pB = b.prioridad || 9999;
        return pA - pB;
      });

      // Definir columnas para Google Timeline
      // Columna 1: Row Label (El carril, en este caso el Área/CWA)
      // Columna 2: Bar Label (El nombre del bloque, en este caso el CWP)
      // Columna 3: Tooltip (Información extra al pasar el mouse)
      // Columna 4: Start (Fecha simulada)
      // Columna 5: End (Fecha simulada)
      const chartData = [
        [
          { type: "string", id: "Area" },
          { type: "string", id: "Name" },
          { type: 'string', role: 'tooltip' },
          { type: "date", id: "Start" },
          { type: "date", id: "End" },
        ],
      ];

      // Fecha base "abstracta" para simular la secuencia (Enero 1, 2024)
      // No mostraremos estas fechas, solo las usamos para dibujar las barras proporcionalmente
      let currentTime = new Date(2024, 0, 1); 

      sortedCwas.forEach(cwa => {
        // Ordenar CWPs por Secuencia Constructiva dentro del Área
        const sortedCwps = (cwa.cwps || []).sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0));

        // Si el área no tiene CWPs, avanzamos un poco el tiempo pero no graficamos nada (o un bloque vacío)
        if (sortedCwps.length === 0) return;

        sortedCwps.forEach(cwp => {
            // Duración estándar abstracta: 5 días por CWP
            // (Podrías usar cwp.duracion_dias si quisieras que el ancho varíe)
            const durationDays = cwp.duracion_dias || 5; 
            
            const startTime = new Date(currentTime);
            const endTime = new Date(currentTime.setDate(currentTime.getDate() + durationDays));

            // Construir Tooltip Personalizado (HTML like text)
            const tooltip = `
              PAQUETE DE CONSTRUCCIÓN (CWP)\n
              --------------------------------\n
              Cód: ${cwp.codigo}\n
              Nom: ${cwp.nombre}\n
              Secuencia: #${cwp.secuencia}\n
              Área: ${cwa.codigo} (Prio ${cwa.prioridad})\n
              Estado: ${cwp.estado}
            `;

            chartData.push([
                `[Prio ${cwa.prioridad || '-'}] ${cwa.codigo}`, // Carril (Row Label)
                `#${cwp.secuencia} - ${cwp.codigo}`,           // Barra (Bar Label)
                tooltip,                                       // Tooltip
                startTime,                                     // Inicio
                endTime                                        // Fin
            ]);
        });

        // Espacio muerto entre áreas (opcional, para separar visualmente)
        // currentTime.setDate(currentTime.getDate() + 2); 
      });

      if (chartData.length === 1) {
          // Datos dummy si está vacío
          chartData.push(["Sin Datos", "Cree CWAs y CWPs", "Vacio", new Date(2024,0,1), new Date(2024,0,2)]);
      }

      setData(chartData);

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const element = chartRef.current;
    
    // Ajuste temporal para captura de alta resolución
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = "#ffffff"; 
    element.style.padding = "20px";

    try {
        const dataUrl = await toPng(element, { backgroundColor: '#fff', quality: 0.95, pixelRatio: 2 });
        // PDF Horizontal (Landscape)
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] });
        
        pdf.setFontSize(18);
        pdf.text(`Path of Construction (Secuencia AWP) - ${proyecto.nombre}`, 40, 40);
        pdf.setFontSize(10);
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 40, 55);
        
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = 1120; // 1200 - márgenes
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, 'PNG', 40, 70, pdfWidth, pdfHeight);
        pdf.save(`POC_${proyecto.nombre}.pdf`);
    } catch (err) {
        console.error("Error exportando:", err);
    } finally {
        element.style.backgroundColor = originalBg; // Restaurar
        element.style.padding = "0px";
    }
  };

  if (loading) return <div className="p-10 text-center text-hatch-blue font-medium">Generando Secuencia Constructiva...</div>;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
        <div>
            <h2 className="text-xl font-bold text-hatch-blue flex items-center gap-2">
                <span className="text-2xl">🏗️</span> Path of Construction (PoC)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
                Visualización secuencial basada en <strong>Prioridad de Área</strong> y <strong>Secuencia de CWP</strong>.
            </p>
        </div>
        <button 
            onClick={handleExportPDF} 
            className="bg-hatch-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2"
        >
            <span>📄</span> Exportar PDF
        </button>
      </div>
      
      {/* Gráfico */}
      <div className="flex-1 overflow-auto p-6 bg-white" ref={chartRef}>
        {data.length > 1 ? (
            <div className="min-h-[500px]">
                <Chart
                    chartType="Timeline"
                    width="100%"
                    height={Math.max(500, (data.length * 45))} // Altura dinámica
                    data={data}
                    options={{
                        timeline: { 
                            showRowLabels: true,
                            groupByRowLabel: true, // Agrupa CWPs en el mismo carril del CWA
                            barLabelStyle: { fontSize: 11 },
                            rowLabelStyle: { fontName: 'Arial', fontSize: 12, color: '#333', bold: true }
                        },
                        backgroundColor: '#ffffff',
                        avoidOverlappingGridLines: false,
                        colors: ['#2980B9', '#27AE60', '#F39C12', '#8E44AD'] // Paleta rotativa
                    }}
                />
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl m-4">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <p className="text-lg font-medium">No hay datos de secuencia definidos.</p>
                <p className="text-sm">Asigna 'Prioridad' a las Áreas y 'Secuencia' a los CWPs en la tabla para ver el gráfico.</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default CronogramaTab;