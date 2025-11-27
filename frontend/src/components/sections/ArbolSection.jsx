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
  getNodesBounds,
  MarkerType // Para flechas si queremos
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import client from '../../api/axios.js';

// --- CONFIGURACIÓN DE TAMAÑOS ---
const NODE_WIDTH = 260;
const NODE_HEIGHT = 80;
const GAP_X = 50;  // Espacio horizontal entre columnas de áreas
const GAP_Y = 60;  // Espacio vertical entre nodos

// --- ESTILOS DE NODOS ---
const getNodeStyle = (type) => {
  const baseStyle = {
    border: '1px solid #555',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    width: NODE_WIDTH,
    color: '#fff',
    fontWeight: 'normal',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.3',
  };

  switch (type) {
    case 'PROYECTO': return { ...baseStyle, background: '#1A252F', borderColor: '#000', borderBottom: '4px solid #E67E22', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }; 
    case 'CWA': return { ...baseStyle, background: '#2980B9', borderColor: '#1F618D', borderLeft: '4px solid white' }; 
    case 'CWP': return { ...baseStyle, background: '#27AE60', borderColor: '#196F3D' }; 
    case 'EWP': return { ...baseStyle, background: '#8E44AD', borderColor: '#6C3483' }; 
    case 'PWP': return { ...baseStyle, background: '#16A085', borderColor: '#117A65' }; 
    case 'IWP': return { ...baseStyle, background: '#E67E22', borderColor: '#BA4A00', color: '#fff' }; 
    case 'ITEM': return { ...baseStyle, background: '#ECF0F1', color: '#333', borderColor: '#BDC3C7', width: NODE_WIDTH - 20, fontSize: '10px' }; 
    default: return { ...baseStyle, background: '#95A5A6', color: '#000' };
  }
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
            
            // --- 1. NODO PROYECTO (RAÍZ) ---
            // Lo creamos temporalmente en 0,0. Luego lo centraremos.
            const rootId = `PROY-${proyecto.id}`;
            
            // --- 2. PROCESAR COLUMNAS (CWA -> Vertical) ---
            // Vamos a calcular la posición X de cada columna basada en su índice
            
            let currentX = 0; // Posición X actual
            const columnWidth = NODE_WIDTH + GAP_X;

            data.cwas?.forEach((cwa, index) => {
                // Coordenada X para esta columna (Área)
                const cwaX = index * columnWidth;
                let currentY = GAP_Y * 2; // Empezamos un poco abajo del proyecto

                // NODO CWA
                const cwaId = `CWA-${cwa.id}`;
                nodesList.push({
                    id: cwaId,
                    data: { label: `📍 CWA: ${cwa.codigo}\n${cwa.nombre}` },
                    position: { x: cwaX, y: currentY },
                    style: getNodeStyle('CWA'),
                    sourcePosition: 'bottom',
                    targetPosition: 'top'
                });

                // Conexión Proyecto -> CWA
                edgesList.push({ 
                    id: `e-${rootId}-${cwaId}`, 
                    source: rootId, 
                    target: cwaId, 
                    type: 'smoothstep', 
                    style: { stroke: '#2980B9', strokeWidth: 2 } 
                });

                currentY += NODE_HEIGHT + GAP_Y; // Bajar Y

                // NODOS CWP (Apilados verticalmente bajo el CWA)
                cwa.cwps?.forEach((cwp) => {
                    const cwpId = `CWP-${cwp.id}`;
                    nodesList.push({
                        id: cwpId,
                        data: { label: `📦 CWP: ${cwp.codigo}\n${cwp.nombre}` },
                        position: { x: cwaX, y: currentY }, // Misma X que el CWA
                        style: getNodeStyle('CWP'),
                        sourcePosition: 'bottom',
                        targetPosition: 'top'
                    });

                    // Conexión CWA -> CWP (O CWP anterior -> CWP actual si quisiéramos cadena, pero mejor jerárquico)
                    // Para jerarquía visual limpia: CWA -> CWP
                    edgesList.push({ 
                        id: `e-${cwaId}-${cwpId}`, 
                        source: cwaId, 
                        target: cwpId, 
                        type: 'smoothstep', 
                        style: { stroke: '#27AE60', strokeWidth: 1.5 } 
                    });

                    currentY += NODE_HEIGHT + GAP_Y; // Bajar Y

                    // NODOS PAQUETES (Apilados bajo el CWP)
                    cwp.paquetes?.forEach((pkg) => {
                        const pkgId = `PKG-${pkg.id}`;
                        let icon = '📄';
                        if (pkg.tipo === 'EWP') icon = '📐';
                        if (pkg.tipo === 'PWP') icon = '🛒';
                        if (pkg.tipo === 'IWP') icon = '🔧';

                        nodesList.push({
                            id: pkgId,
                            data: { label: `${icon} ${pkg.tipo}: ${pkg.codigo}\n${pkg.nombre}` },
                            position: { x: cwaX + 20, y: currentY }, // Un poco indentado
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

                        currentY += NODE_HEIGHT + GAP_Y; // Bajar Y

                        // NODOS ITEMS (Opcional)
                        if (showItems) {
                            pkg.items?.forEach(item => {
                                const itemId = `ITEM-${item.id}`;
                                nodesList.push({
                                    id: itemId,
                                    data: { label: `📝 ${item.nombre}` },
                                    position: { x: cwaX + 40, y: currentY }, // Más indentado
                                    style: getNodeStyle('ITEM'),
                                    sourcePosition: 'bottom',
                                    targetPosition: 'top'
                                });
                                edgesList.push({ 
                                    id: `e-${pkgId}-${itemId}`, 
                                    source: pkgId, 
                                    target: itemId, 
                                    type: 'smoothstep', 
                                    style: { stroke: '#BDC3C7', strokeDasharray: '5 5' } 
                                });
                                currentY += (NODE_HEIGHT * 0.6) + (GAP_Y * 0.5); // Items más compactos
                            });
                        }
                    });
                });
                
                // Guardamos el ancho máximo alcanzado
                currentX = cwaX;
            });

            // --- 3. CENTRAR EL PROYECTO ---
            // El proyecto va en el centro geométrico de todas las columnas de CWA
            // Ancho total ocupado = (N-1) * Spacing
            const totalWidth = (data.cwas.length - 1) * columnWidth;
            const projectX = totalWidth / 2;

            nodesList.unshift({
                id: rootId,
                data: { label: `🏗️ PROYECTO\n${proyecto.nombre}` },
                position: { x: projectX, y: 0 }, // Centrado arriba
                style: getNodeStyle('PROYECTO'),
                sourcePosition: 'bottom',
                targetPosition: 'bottom' // Para que las líneas salgan hacia abajo
            });

            setNodes(nodesList);
            setEdges(edgesList);

        } catch (err) { console.error("Error construyendo árbol:", err); } finally { setLoading(false); }
    };

    fetchData();
  }, [proyecto.id, showItems, setNodes, setEdges]); // Reacciona a showItems

  const downloadImage = useCallback((format = 'png') => {
    if (typeof getNodesBounds !== 'function') return;
    const viewportElement = document.querySelector('.react-flow__viewport');
    if (!viewportElement) return;

    const nodesBounds = getNodesBounds(nodes);
    if (!nodesBounds || nodesBounds.width === 0) return;

    const imageWidth = nodesBounds.width + 100; 
    const imageHeight = nodesBounds.height + 100;
    const transform = `translate(${-nodesBounds.x + 50}px, ${-nodesBounds.y + 50}px) scale(1)`;
    const options = { backgroundColor: '#ffffff', width: imageWidth, height: imageHeight, style: { width: imageWidth, height: imageHeight, transform: transform } };

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

  if (loading) return <div className="p-10 text-center text-hatch-blue">Generando diagrama...</div>;

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
            connectionLineType={ConnectionLineType.SmoothStep} // Líneas ortogonales suaves
            fitView 
            minZoom={0.1} 
            className="bg-gray-50"
        >
            <Background color="#BDC3C7" gap={30} size={1} />
            <Controls />
            <MiniMap nodeColor={(n) => n.style?.background || '#fff'} style={{ height: 150 }} />
            <Panel position="bottom-left" className="bg-white/90 p-3 rounded shadow-lg border border-gray-200 text-xs w-48">
                <div className="font-bold mb-2 text-hatch-blue border-b pb-1">Leyenda</div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#1A252F] rounded border border-gray-600"></div> Proyecto</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#2980B9] rounded border border-blue-800"></div> CWA</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#27AE60] rounded border border-green-800"></div> CWP</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8E44AD] rounded border border-purple-800"></div> EWP</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#16A085] rounded border border-teal-800"></div> PWP</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#E67E22] rounded border border-orange-800"></div> IWP</div>
                </div>
            </Panel>
        </ReactFlow>
    </div>
  );
}

function ArbolTab(props) { return <ReactFlowProvider><ArbolFlow {...props} /></ReactFlowProvider>; }
export default ArbolTab;