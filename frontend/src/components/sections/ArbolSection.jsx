import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  Panel,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  getNodesBounds
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import client from '../../api/axios';

// --- CONFIGURACIÓN DE TAMAÑOS ---
const NODE_WIDTH = 280;
const GAP_X = 40;   // Espacio horizontal entre columnas (Áreas)
const GAP_Y = 60;   // Espacio vertical entre niveles

// --- ICONOS SVG (PROFESIONALES) ---
const Icons = {
  Project: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  CWA: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CWP: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  EWP: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  PWP: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  IWP: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Item: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
};

// --- ESTILOS DE TARJETAS (NODOS) ---
const getNodeStyle = (type) => {
  const baseStyle = {
    padding: 0, // Control total del padding interno
    borderRadius: '6px',
    width: NODE_WIDTH,
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    textAlign: 'left',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    background: '#fff',
    color: '#333',
  };

  // Bordes de color según tipo
  switch (type) {
    case 'PROYECTO': return { ...baseStyle, borderTop: '4px solid #1A252F' }; 
    case 'CWA': return { ...baseStyle, borderTop: '4px solid #2980B9' }; 
    case 'CWP': return { ...baseStyle, borderTop: '4px solid #27AE60' }; 
    case 'EWP': return { ...baseStyle, borderLeft: '4px solid #8E44AD' }; 
    case 'PWP': return { ...baseStyle, borderLeft: '4px solid #16A085' }; 
    case 'IWP': return { ...baseStyle, borderLeft: '4px solid #E67E22' }; 
    case 'ITEM': return { ...baseStyle, width: NODE_WIDTH - 20, fontSize: '11px', border: '1px dashed #BDC3C7' }; 
    default: return baseStyle;
  }
};

// --- COMPONENTE DE CONTENIDO DE NODO (JSX) ---
// Esto es lo que va dentro de data.label
const NodeContent = ({ type, code, name, meta }) => {
  let Icon = Icons.Project;
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';
  
  if(type === 'CWA') { Icon = Icons.CWA; bgColor = 'bg-blue-50'; textColor = 'text-blue-800'; }
  if(type === 'CWP') { Icon = Icons.CWP; bgColor = 'bg-green-50'; textColor = 'text-green-800'; }
  if(type === 'EWP') { Icon = Icons.EWP; bgColor = 'bg-purple-50'; textColor = 'text-purple-800'; }
  if(type === 'PWP') { Icon = Icons.PWP; bgColor = 'bg-teal-50'; textColor = 'text-teal-800'; }
  if(type === 'IWP') { Icon = Icons.IWP; bgColor = 'bg-orange-50'; textColor = 'text-orange-800'; }
  if(type === 'ITEM') { Icon = Icons.Item; }

  return (
    <div className="flex flex-col h-full">
        {/* Header del Nodo */}
        <div className={`flex items-center gap-2 p-2 ${type === 'ITEM' ? '' : 'border-b border-gray-100'} ${bgColor}`}>
            <div className={`p-1 rounded bg-white ${textColor}`}>
                <Icon />
            </div>
            <div className="flex-1 min-w-0">
                <div className={`font-bold text-xs truncate ${textColor}`}>{code}</div>
                {type === 'ITEM' && <div className="text-[10px] text-gray-500 truncate">{name}</div>}
            </div>
            {/* Metadatos en esquina (Prio/Seq) */}
            {meta && (
                <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white/60 rounded border border-black/5 text-gray-600 whitespace-nowrap">
                    {meta}
                </div>
            )}
        </div>
        
        {/* Cuerpo del Nodo (Nombre) */}
        {type !== 'ITEM' && (
            <div className="p-2 text-xs text-gray-600 leading-snug break-words">
                {name}
            </div>
        )}
    </div>
  );
};


function ArbolFlow({ proyecto }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [showItems, setShowItems] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        if (!proyecto?.id) return;
        setLoading(true);
        try {
            const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`);
            const data = res.data;
            
            const nodesList = [];
            const edgesList = [];
            
            // --- 1. NODO PROYECTO ---
            const rootId = `PROY-${proyecto.id}`;
            
            // --- 2. ALGORITMO DE LAYOUT HÍBRIDO ---
            // Horizontal para Áreas, Vertical para hijos
            
            const columnWidth = NODE_WIDTH + GAP_X;

            // Ordenar CWAs por prioridad numérica para el gráfico
            const sortedCwas = (data.cwas || []).sort((a, b) => (a.prioridad || 9999) - (b.prioridad || 9999));

            sortedCwas.forEach((cwa, index) => {
                // Coordenada X fija para esta columna (Área)
                const cwaX = index * columnWidth;
                let currentY = GAP_Y * 2; 

                // NODO CWA
                const cwaId = `CWA-${cwa.id}`;
                nodesList.push({
                    id: cwaId,
                    // ✅ USAMOS JSX EN LA ETIQUETA
                    data: { label: <NodeContent type="CWA" code={cwa.codigo} name={cwa.nombre} meta={`Prio: ${cwa.prioridad ?? '-'}`} /> },
                    position: { x: cwaX, y: currentY },
                    style: getNodeStyle('CWA'),
                    sourcePosition: 'bottom',
                    targetPosition: 'top'
                });

                // Conexión Root -> CWA
                edgesList.push({ 
                    id: `e-${rootId}-${cwaId}`, 
                    source: rootId, 
                    target: cwaId, 
                    type: 'smoothstep', 
                    style: { stroke: '#2980B9', strokeWidth: 2 } 
                });

                currentY += 100; // Altura nodo + gap

                // CWPS (Vertical debajo de su CWA)
                const sortedCwps = (cwa.cwps || []).sort((a, b) => (a.secuencia || 0) - (b.secuencia || 0));
                
                sortedCwps.forEach((cwp) => {
                    const cwpId = `CWP-${cwp.id}`;
                    nodesList.push({
                        id: cwpId,
                        data: { label: <NodeContent type="CWP" code={cwp.codigo} name={cwp.nombre} meta={`Seq: ${cwp.secuencia ?? '-'}`} /> },
                        position: { x: cwaX, y: currentY }, // Misma X
                        style: getNodeStyle('CWP'),
                        sourcePosition: 'bottom',
                        targetPosition: 'top'
                    });

                    edgesList.push({ 
                        id: `e-${cwaId}-${cwpId}`, 
                        source: cwaId, 
                        target: cwpId, 
                        type: 'smoothstep', 
                        style: { stroke: '#27AE60', strokeWidth: 1.5 } 
                    });

                    currentY += 100;

                    // PAQUETES (Vertical debajo de su CWP)
                    cwp.paquetes?.forEach((pkg) => {
                        const pkgId = `PKG-${pkg.id}`;
                        nodesList.push({
                            id: pkgId,
                            data: { label: <NodeContent type={pkg.tipo} code={pkg.codigo} name={pkg.nombre} /> },
                            position: { x: cwaX + 20, y: currentY }, // Indentado
                            style: getNodeStyle(pkg.tipo),
                            sourcePosition: 'bottom',
                            targetPosition: 'top'
                        });

                        edgesList.push({ 
                            id: `e-${cwpId}-${pkgId}`, 
                            source: cwpId, 
                            target: pkgId, 
                            type: 'smoothstep', 
                            style: { stroke: '#BDC3C7' } 
                        });

                        currentY += 90; // Altura nodo + gap

                        // ITEMS
                        if (showItems) {
                            pkg.items?.forEach(item => {
                                const itemId = `ITEM-${item.id}`;
                                nodesList.push({
                                    id: itemId,
                                    data: { label: <NodeContent type="ITEM" code={`ID:${item.id}`} name={item.nombre} /> },
                                    position: { x: cwaX + 40, y: currentY },
                                    style: getNodeStyle('ITEM'),
                                    sourcePosition: 'top', 
                                    targetPosition: 'top' // Truco para listas
                                });
                                edgesList.push({ 
                                    id: `e-${pkgId}-${itemId}`, 
                                    source: pkgId, 
                                    target: itemId, 
                                    type: 'smoothstep', 
                                    style: { stroke: '#BDC3C7', strokeDasharray: '4 4' } 
                                });
                                currentY += 50;
                            });
                        }
                    });
                    
                    // Espacio extra entre CWPs
                    currentY += 20;
                });
            });

            // --- 3. CENTRAR EL PROYECTO ---
            const totalWidth = (sortedCwas.length - 1) * columnWidth;
            // Si no hay CWAs, centrar en 0
            const projectX = sortedCwas.length > 0 ? totalWidth / 2 : 0;

            nodesList.unshift({
                id: rootId,
                data: { label: <NodeContent type="PROYECTO" code="PROYECTO" name={proyecto.nombre} /> },
                position: { x: projectX, y: 0 },
                style: getNodeStyle('PROYECTO'),
                sourcePosition: 'bottom',
                targetPosition: 'bottom'
            });

            setNodes(nodesList);
            setEdges(edgesList);

        } catch (err) { console.error("Error construyendo árbol:", err); } finally { setLoading(false); }
    };

    fetchData();
  }, [proyecto.id, showItems, setNodes, setEdges]);

  const downloadImage = useCallback((format = 'png') => {
    if (typeof getNodesBounds !== 'function') return;
    const viewportElement = document.querySelector('.react-flow__viewport');
    if (!viewportElement) return;

    const nodesBounds = getNodesBounds(nodes);
    if (!nodesBounds || nodesBounds.width === 0) return;

    const imageWidth = nodesBounds.width + 100; 
    const imageHeight = nodesBounds.height + 100;
    const transform = `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px) scale(1)`;
    const options = { backgroundColor: '#f9fafb', width: imageWidth, height: imageHeight, style: { width: imageWidth, height: imageHeight, transform: transform } };

    if (format === 'png') {
      toPng(viewportElement, options).then((dataUrl) => {
        const link = document.createElement('a'); link.download = `AWP_Diagrama_${proyecto.nombre}.png`; link.href = dataUrl; link.click();
      }).catch(e => console.error("Error PNG:", e));
    } else if (format === 'pdf') {
      toPng(viewportElement, options).then((dataUrl) => {
        const pdf = new jsPDF({ orientation: imageWidth > imageHeight ? 'l' : 'p', unit: 'px', format: [imageWidth, imageHeight] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save(`AWP_Reporte_${proyecto.nombre}.pdf`);
      }).catch(e => console.error("Error PDF:", e));
    }
  }, [nodes, proyecto.nombre]);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="h-full w-full bg-gray-50 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg border border-gray-200 items-center">
            <button onClick={() => setShowItems(!showItems)} className={`px-3 py-1.5 text-xs font-bold rounded shadow transition-all mr-2 border ${showItems ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-600 border-gray-300'}`}>
                {showItems ? 'Ocultar Items' : 'Mostrar Items'}
            </button>
            <span className="text-gray-300 mx-1">|</span>
            <button onClick={() => downloadImage('png')} className="px-3 py-1.5 bg-hatch-blue hover:bg-hatch-blue-light text-white text-xs font-bold rounded shadow">📷</button>
            <button onClick={() => downloadImage('pdf')} className="px-3 py-1.5 bg-hatch-orange hover:bg-hatch-orange-dark text-white text-xs font-bold rounded shadow">📄</button>
        </div>

        <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onInit={setRfInstance} 
            connectionLineType={ConnectionLineType.SmoothStep} // Líneas ortogonales elegantes
            fitView 
            minZoom={0.1} 
            className="bg-gray-50"
        >
            <Background color="#E5E7EB" gap={40} size={1} />
            <Controls />
            <MiniMap nodeColor={(n) => n.style?.background || '#fff'} style={{ height: 150 }} />
        </ReactFlow>
    </div>
  );
}

function ArbolTab(props) { return <ReactFlowProvider><ArbolFlow {...props} /></ReactFlowProvider>; }
export default ArbolTab;