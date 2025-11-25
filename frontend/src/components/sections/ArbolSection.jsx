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
  getNodesBounds // 1. IMPORTAMOS LA UTILIDAD DIRECTAMENTE
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import client from '../../api/axios';

// --- CONFIGURACIÓN DE LAYOUT AUTOMÁTICO (DAGRE) ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Tamaño base de los nodos
const nodeWidth = 280;
const nodeHeight = 100;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

// --- ESTILOS DE NODOS ---
const getNodeStyle = (type) => {
  const baseStyle = {
    border: '1px solid #555',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    width: 260,
    color: '#fff',
    fontWeight: 'normal',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.4',
  };

  switch (type) {
    case 'PROYECTO': return { ...baseStyle, background: '#1A252F', borderColor: '#000', borderBottom: '4px solid #E67E22', fontSize: '14px', fontWeight: 'bold' }; 
    case 'CWA': return { ...baseStyle, background: '#2980B9', borderColor: '#1F618D' }; 
    case 'CWP': return { ...baseStyle, background: '#27AE60', borderColor: '#196F3D' }; 
    case 'EWP': return { ...baseStyle, background: '#8E44AD', borderColor: '#6C3483' }; 
    case 'PWP': return { ...baseStyle, background: '#16A085', borderColor: '#117A65' }; 
    case 'IWP': return { ...baseStyle, background: '#E67E22', borderColor: '#BA4A00', color: '#fff' }; 
    default: return { ...baseStyle, background: '#95A5A6', color: '#000' };
  }
};

function ArbolFlow({ proyecto }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  
  // Capturamos la instancia solo para cosas internas si hace falta, 
  // pero ya no dependemos de ella para el cálculo de bordes.
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        if (!proyecto?.id) return;
        setLoading(true);
        try {
            const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`);
            const data = res.data;
            
            const initialNodes = [];
            const initialEdges = [];
            
            // 1. PROYECTO
            const rootId = `PROY-${proyecto.id}`;
            initialNodes.push({
                id: rootId,
                data: { label: `🏗️ PROYECTO\n${proyecto.nombre}` },
                position: { x: 0, y: 0 },
                style: getNodeStyle('PROYECTO'),
            });

            // 2. CWA
            data.cwas?.forEach((cwa) => {
                const cwaId = `CWA-${cwa.id}`;
                initialNodes.push({
                    id: cwaId,
                    data: { label: `📍 CWA: ${cwa.codigo}\n${cwa.nombre}` },
                    position: { x: 0, y: 0 },
                    style: getNodeStyle('CWA'),
                });
                initialEdges.push({ id: `e-${rootId}-${cwaId}`, source: rootId, target: cwaId, type: 'smoothstep', animated: true, style: { stroke: '#2980B9', strokeWidth: 2 } });

                // 3. CWP
                cwa.cwps?.forEach((cwp) => {
                    const cwpId = `CWP-${cwp.id}`;
                    initialNodes.push({
                        id: cwpId,
                        data: { label: `📦 CWP: ${cwp.codigo}\n${cwp.nombre}` },
                        position: { x: 0, y: 0 },
                        style: getNodeStyle('CWP'),
                    });
                    initialEdges.push({ id: `e-${cwaId}-${cwpId}`, source: cwaId, target: cwpId, type: 'smoothstep', style: { stroke: '#27AE60' } });

                    // 4. PAQUETES
                    cwp.paquetes?.forEach((pkg) => {
                        const pkgId = `PKG-${pkg.id}`;
                        let icon = '📄';
                        if (pkg.tipo === 'EWP') icon = '📐';
                        if (pkg.tipo === 'PWP') icon = '🛒';
                        if (pkg.tipo === 'IWP') icon = '🔧';

                        initialNodes.push({
                            id: pkgId,
                            data: { label: `${icon} ${pkg.tipo}: ${pkg.codigo}\n${pkg.nombre}` },
                            position: { x: 0, y: 0 },
                            style: getNodeStyle(pkg.tipo),
                        });
                        initialEdges.push({ id: `e-${cwpId}-${pkgId}`, source: cwpId, target: pkgId, type: 'smoothstep', style: { stroke: '#BDC3C7' } });
                    });
                });
            });

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

        } catch (err) {
            console.error("Error construyendo árbol:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [proyecto.id, setNodes, setEdges]);

  // --- EXPORTACIÓN CORREGIDA ---
  const downloadImage = useCallback((format = 'png') => {
    // Obtenemos el viewport del DOM
    const viewportElement = document.querySelector('.react-flow__viewport');
    if (!viewportElement) return;

    // 2. CORRECCIÓN: Usamos la utilidad importada directamente pasando los 'nodes' del estado
    const nodesBounds = getNodesBounds(nodes);
    
    if (!nodesBounds || nodesBounds.width === 0) {
        console.error("No se pudieron calcular los límites de los nodos");
        return;
    }

    const imageWidth = nodesBounds.width + 100; // Margen
    const imageHeight = nodesBounds.height + 100;
    
    const transform = `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px) scale(1)`;

    const options = {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: transform,
      },
    };

    if (format === 'png') {
      toPng(viewportElement, options).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `AWP_Diagrama_${proyecto.nombre}.png`;
        link.href = dataUrl;
        link.click();
      }).catch(err => console.error("Error exportando PNG:", err));
    } else if (format === 'pdf') {
      toPng(viewportElement, options).then((dataUrl) => {
        const pdf = new jsPDF({
            orientation: imageWidth > imageHeight ? 'l' : 'p',
            unit: 'px',
            format: [imageWidth, imageHeight] 
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save(`AWP_Reporte_${proyecto.nombre}.pdf`);
      }).catch(err => console.error("Error exportando PDF:", err));
    }
  }, [nodes, proyecto.nombre]); // Dependemos de 'nodes', no de la instancia

  if (loading) {
    return (
        <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-hatch-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-hatch-blue font-semibold">Calculando Jerarquía AWP...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-50 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-500 self-center mr-2 uppercase">Exportar:</span>
            <button onClick={() => downloadImage('png')} className="px-3 py-1.5 bg-hatch-blue hover:bg-hatch-blue-light text-white text-xs font-bold rounded shadow transition-all flex items-center gap-2">
                📷 PNG
            </button>
            <button onClick={() => downloadImage('pdf')} className="px-3 py-1.5 bg-hatch-orange hover:bg-hatch-orange-dark text-white text-xs font-bold rounded shadow transition-all flex items-center gap-2">
                📄 PDF
            </button>
        </div>

        {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-4">
                <p className="text-lg">📭 El diagrama está vacío.</p>
                <p className="text-sm">Asegúrate de crear CWAs y Paquetes en la pestaña "Resumen".</p>
            </div>
        ) : (
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={setRfInstance}
                connectionLineType={ConnectionLineType.SmoothStep}
                fitView
                minZoom={0.1}
                className="bg-gray-50"
            >
                <Background color="#BDC3C7" gap={24} size={1} />
                <Controls />
                <MiniMap 
                    nodeStrokeColor={(n) => {
                        if (n.style?.background) return n.style.background;
                        return '#eee';
                    }}
                    nodeColor={(n) => {
                        if (n.style?.background) return n.style.background;
                        return '#fff';
                    }}
                    maskColor="rgba(240, 240, 240, 0.6)"
                    style={{ border: '1px solid #ccc', borderRadius: '8px', height: 150, width: 200 }}
                />
                <Panel position="bottom-left" className="bg-white/90 p-3 rounded shadow-lg border border-gray-200 text-xs w-48">
                    <div className="font-bold mb-2 text-hatch-blue border-b pb-1">Leyenda de Nodos</div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#1A252F] rounded border border-gray-600"></div> Proyecto</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#2980B9] rounded border border-blue-800"></div> CWA (Área)</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#27AE60] rounded border border-green-800"></div> CWP (Construcción)</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8E44AD] rounded border border-purple-800"></div> EWP (Ingeniería)</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#16A085] rounded border border-teal-800"></div> PWP (Compras)</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#E67E22] rounded border border-orange-800"></div> IWP (Instalación)</div>
                    </div>
                </Panel>
            </ReactFlow>
        )}
    </div>
  );
}

// Wrapper para proveer contexto (sin cambios)
function ArbolTab(props) {
    return (
        <ReactFlowProvider>
            <ArbolFlow {...props} />
        </ReactFlowProvider>
    );
}

export default ArbolTab;