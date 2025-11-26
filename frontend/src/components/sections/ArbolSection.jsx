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
// Usamos "import * as dagre" para mayor compatibilidad con ciertos bundlers ESM
import * as dagre from 'dagre';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
// Agregamos la extensión .js explícita para evitar problemas de resolución
import client from '../../api/axios.js';

// Verificar si dagre se importó como módulo o default
const dagreGraph = new (dagre.graphlib ? dagre.graphlib.Graph : dagre.Graph)();
dagreGraph.setDefaultEdgeLabel(() => ({}));

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

  // Ejecutar layout solo si dagre cargó correctamente
  if (dagre.layout) {
      dagre.layout(dagreGraph);
  }

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Protección por si dagre falla en calcular
    if (!nodeWithPosition) return node;

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
    case 'ITEM': return { ...baseStyle, background: '#ECF0F1', color: '#333', borderColor: '#BDC3C7', width: 200, fontSize: '10px' }; 
    default: return { ...baseStyle, background: '#95A5A6', color: '#000' };
  }
};

function ArbolFlow({ proyecto }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [rfInstance, setRfInstance] = useState(null);
  
  // ✅ NUEVO ESTADO: Controlar visibilidad de items
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        if (!proyecto?.id) return;
        setLoading(true);
        try {
            const res = await client.get(`/awp-nuevo/proyectos/${proyecto.id}/jerarquia-global`);
            const data = res.data;
            
            const initialNodes = [];
            const initialEdges = [];
            
            const rootId = `PROY-${proyecto.id}`;
            initialNodes.push({
                id: rootId,
                data: { label: `🏗️ PROYECTO\n${proyecto.nombre}` },
                position: { x: 0, y: 0 },
                style: getNodeStyle('PROYECTO'),
            });

            data.cwas?.forEach((cwa) => {
                const cwaId = `CWA-${cwa.id}`;
                initialNodes.push({
                    id: cwaId,
                    data: { label: `📍 CWA: ${cwa.codigo}\n${cwa.nombre}` },
                    position: { x: 0, y: 0 },
                    style: getNodeStyle('CWA'),
                });
                initialEdges.push({ id: `e-${rootId}-${cwaId}`, source: rootId, target: cwaId, type: 'smoothstep', animated: true, style: { stroke: '#2980B9', strokeWidth: 2 } });

                cwa.cwps?.forEach((cwp) => {
                    const cwpId = `CWP-${cwp.id}`;
                    initialNodes.push({
                        id: cwpId,
                        data: { label: `📦 CWP: ${cwp.codigo}\n${cwp.nombre}` },
                        position: { x: 0, y: 0 },
                        style: getNodeStyle('CWP'),
                    });
                    initialEdges.push({ id: `e-${cwaId}-${cwpId}`, source: cwaId, target: cwpId, type: 'smoothstep', style: { stroke: '#27AE60' } });

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
                        
                        // ✅ LÓGICA CONDICIONAL PARA ITEMS
                        if (showItems) {
                            pkg.items?.forEach(item => {
                                const itemId = `ITEM-${item.id}`;
                                initialNodes.push({
                                    id: itemId,
                                    data: { label: `📝 ${item.nombre}` },
                                    position: { x: 0, y: 0 },
                                    style: getNodeStyle('ITEM'),
                                });
                                initialEdges.push({ 
                                    id: `e-${pkgId}-${itemId}`, 
                                    source: pkgId, 
                                    target: itemId, 
                                    type: 'smoothstep', 
                                    style: { stroke: '#BDC3C7', strokeDasharray: '5 5' } 
                                });
                            });
                        }
                    });
                });
            });

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    fetchData();
  }, [proyecto.id, showItems, setNodes, setEdges]); // Dependencia en showItems para recargar

  const downloadImage = useCallback((format = 'png') => {
    // Verificación de seguridad por si la librería no cargó
    if (typeof getNodesBounds !== 'function') {
        console.error("Librería reactflow no cargada correctamente.");
        return;
    }

    const viewportElement = document.querySelector('.react-flow__viewport');
    if (!viewportElement) return;
    
    // Usamos la función importada directamente
    const nodesBounds = getNodesBounds(nodes);
    if (!nodesBounds || nodesBounds.width === 0) return;

    const imageWidth = nodesBounds.width + 100; 
    const imageHeight = nodesBounds.height + 100;
    const transform = `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px) scale(1)`;
    const options = { backgroundColor: '#ffffff', width: imageWidth, height: imageHeight, style: { width: imageWidth, height: imageHeight, transform: transform } };

    if (format === 'png') {
      toPng(viewportElement, options).then((dataUrl) => {
        const link = document.createElement('a'); link.download = `AWP_Diagrama_${proyecto.nombre}.png`; link.href = dataUrl; link.click();
      }).catch(e => console.error(e));
    } else if (format === 'pdf') {
      toPng(viewportElement, options).then((dataUrl) => {
        const pdf = new jsPDF({ orientation: imageWidth > imageHeight ? 'l' : 'p', unit: 'px', format: [imageWidth, imageHeight] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, imageWidth, imageHeight);
        pdf.save(`AWP_Reporte_${proyecto.nombre}.pdf`);
      }).catch(e => console.error(e));
    }
  }, [nodes, proyecto.nombre]);

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="h-full w-full bg-gray-50 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg border border-gray-200">
            
            {/* ✅ BOTÓN TOGGLE */}
            <button 
                onClick={() => setShowItems(!showItems)} 
                className={`px-3 py-1.5 text-xs font-bold rounded shadow transition-all mr-2 border ${
                    showItems 
                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
                {showItems ? 'Ocultar Entregables' : 'Mostrar Entregables'}
            </button>

            <span className="text-gray-300 self-center">|</span>

            <button onClick={() => downloadImage('png')} className="px-3 py-1.5 bg-hatch-blue hover:bg-hatch-blue-light text-white text-xs font-bold rounded shadow">📷 PNG</button>
            <button onClick={() => downloadImage('pdf')} className="px-3 py-1.5 bg-hatch-orange hover:bg-hatch-orange-dark text-white text-xs font-bold rounded shadow">📄 PDF</button>
        </div>

        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onInit={setRfInstance} connectionLineType={ConnectionLineType.SmoothStep} fitView minZoom={0.1} className="bg-gray-50">
            <Background color="#BDC3C7" gap={24} size={1} />
            <Controls />
            <MiniMap nodeColor={(n) => n.style?.background || '#fff'} style={{ height: 150 }} />
            <Panel position="bottom-left" className="bg-white/90 p-3 rounded shadow-lg border border-gray-200 text-xs w-48">
                <div className="font-bold mb-2 text-hatch-blue border-b pb-1">Leyenda</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#2980B9] rounded"></div> CWA (Área)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#27AE60] rounded"></div> CWP (Construcción)</div>
                    {showItems && <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#ECF0F1] border border-gray-400 rounded"></div> Item (Entregable)</div>}
                </div>
            </Panel>
        </ReactFlow>
    </div>
  );
}

function ArbolTab(props) { return <ReactFlowProvider><ArbolFlow {...props} /></ReactFlowProvider>; }
export default ArbolTab;