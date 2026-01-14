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
      
      // 1. Ordenar por Prioridad (1, 2, 3...)
      const sortedCwas = cwas.sort((a, b) => {
        const pA = a.prioridad !== null ? a.prioridad : 9999;
        const pB = b.prioridad !== null ? b.prioridad : 9999;
        return pA - pB;
      });

      // Configurar columnas
      const chartData = [
        [
          { type: "string", id: "Area" },
          { type: "string", id: "Task" },
          { type: 'string', role: 'tooltip', p: { html: true } }, // HTML Tooltip
          { type: "date", id: "Start" },
          { type: "date", id: "End" },
        ],
      ];

      // Fecha base simulada
      let currentBaseDate = new Date(2024, 0, 1); 
      
      // Mapa para agrupar por prioridad
      const groups = {};
      sortedCwas.forEach(cwa => {
        const p = cwa.prioridad ?? 9999;
        if(!groups[p]) groups[p] = [];
        groups[p].push(cwa);
      });
      
      const priorities = Object.keys(groups).sort((a, b) => Number(a) - Number(b));

      // PROCESAMIENTO
      priorities.forEach(prio => {
        const cwasInGroup = groups[prio];
        let maxDuration = 0;

        cwasInGroup.forEach(cwa => {
            const typePrefix = cwa.es_transversal ? "DWP" : "CWA";
            // ✅ ETIQUETA: Prioridad + Código + Nombre
            // Nota: Google Charts no hace wrap automático en eje Y, pero ajustamos el font size abajo.
            const areaLabel = `[P.${cwa.prioridad ?? '-'}] ${cwa.codigo}: ${cwa.nombre}`;

            const sortedCwps = (cwa.cwps || []).sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0));

            if (sortedCwps.length === 0) {
                chartData.push([
                    areaLabel,
                    "", // Barra vacía
                    `<div style="padding:5px;"><strong>${areaLabel}</strong><br/>Sin paquetes definidos</div>`,
                    currentBaseDate,
                    new Date(new Date(currentBaseDate).getTime() + (5 * 86400000))
                ]);
                if (5 > maxDuration) maxDuration = 5;
                return;
            }

            let cursor = new Date(currentBaseDate);

            sortedCwps.forEach(cwp => {
                const duration = cwp.duracion_dias || 15; // Duración base visual
                
                const start = new Date(cursor);
                const end = new Date(cursor.getTime() + (duration * 86400000));
                cursor = new Date(end);

                // Tooltip Personalizado (HTML)
                const tooltip = `
                  <div style="padding:10px; font-family:Arial, sans-serif; width: 220px; background: white; border: 1px solid #ccc;">
                    <div style="font-weight:bold; font-size:13px; margin-bottom:4px; color:#2C3E50;">${cwp.codigo}</div>
                    <div style="font-size:12px; color:#555; margin-bottom:6px;">${cwp.nombre}</div>
                    <hr style="margin:6px 0; border:0; border-top:1px solid #eee;"/>
                    <div style="font-size:11px; line-height:1.4; color:#444;">
                      <strong>Secuencia:</strong> #${cwp.secuencia}<br/>
                      <strong>Área:</strong> ${cwa.nombre}<br/>
                      <strong>Estado:</strong> ${cwp.estado}
                    </div>
                  </div>
                `;

                chartData.push([
                    areaLabel,
                    "", // ✅ BARRA VACÍA: Sin texto encima para limpieza visual
                    tooltip,
                    start,
                    end
                ]);
            });

            const days = (cursor - currentBaseDate) / 86400000;
            if (days > maxDuration) maxDuration = days;
        });

        // Avanzar tiempo para el siguiente grupo
        currentBaseDate = new Date(currentBaseDate.getTime() + ((maxDuration + 2) * 86400000));
      });

      if (chartData.length === 1) {
          chartData.push(["Sin Datos", "", "", new Date(2024,0,1), new Date(2024,0,2)]);
      }

      setData(chartData);

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    const element = chartRef.current;
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = "#ffffff"; 
    element.style.padding = "20px";

    try {
        const dataUrl = await toPng(element, { backgroundColor: '#fff', quality: 1, pixelRatio: 2 });
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1400, 900] });
        pdf.setFontSize(16);
        pdf.text(`Path of Construction (PoC) - ${proyecto.nombre}`, 40, 40);
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = 1320;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 40, 60, pdfWidth, pdfHeight);
        pdf.save(`POC_${proyecto.nombre}.pdf`);
    } catch (err) { console.error(err); } finally { element.style.backgroundColor = originalBg; element.style.padding = "0px"; }
  };

  if (loading) return <div className="p-10 text-center text-hatch-blue">Generando PoC...</div>;

  // ✅ CÁLCULO DE ALTURA MÁS GENEROSO
  const uniqueRows = new Set(data.slice(1).map(r => r[0])).size;
  const chartHeight = Math.max(500, uniqueRows * 60 + 100);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0 bg-gray-50">
        <div>
            <h2 className="text-xl font-bold text-hatch-blue flex items-center gap-2">
                <span className="text-2xl">🏗️</span> Path of Construction (PoC)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
                Secuencia Lógica por Prioridad de Área
            </p>
        </div>
        <button onClick={handleExportPDF} className="bg-hatch-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all">
            <span>📄</span> Exportar PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-6 bg-white" ref={chartRef}>
        {data.length > 1 ? (
            <div style={{ minHeight: '100%' }}>
                <Chart
                    chartType="Timeline"
                    width="100%"
                    height={`${chartHeight}px`}
                    data={data}
                    options={{
                        timeline: { 
                            showRowLabels: true,
                            groupByRowLabel: true,
                            // ✅ ESTILO ETIQUETAS: Fuente legible y color oscuro
                            rowLabelStyle: { fontName: 'Arial', fontSize: 12, color: '#333' },
                            // ✅ ESTILO BARRAS: Texto oculto (fontSize 0)
                            barLabelStyle: { fontSize: 0 } 
                        },
                        backgroundColor: '#ffffff',
                        // ✅ OCULTAR EJE DE TIEMPO AGRESIVO
                        hAxis: { 
                            textPosition: 'none',         // Intento estándar
                            format: ' ',                  // Formato vacío
                            textStyle: { color: 'transparent', fontSize: 0 }, // Invisible si se renderiza
                            gridlines: { color: 'transparent', count: 0 },
                            baselineColor: 'transparent',
                            minorGridlines: { count: 0 }
                        },
                        tooltip: { isHtml: true }, 
                        // Paleta HATCH y construcción
                        colors: ['#27AE60', '#2980B9', '#E67E22', '#8E44AD', '#16A085', '#F39C12', '#2C3E50', '#C0392B'],
                    }}
                />
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl m-4">
                <p className="text-lg font-medium">Sin datos de secuencia</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default CronogramaTab;