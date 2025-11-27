// ... (IMPORTS Y CONSTANTES IGUALES) ...
import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Image, Rect, Circle, Line } from 'react-konva'; 
import client from '../../../api/axios';
import { jsPDF } from 'jspdf';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SERVER_URL = API_BASE.replace('/api/v1', '');

const HATCH_COLORS = {
  primary: [ '#E67E22', '#2E86C1', '#27AE60', '#C0392B', '#8E44AD' ],
  secondary: [ '#F39C12', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6' ],
  dark: [ '#D35400', '#21618C', '#1E8449', '#922B21', '#6C3483' ],
  earth: [ '#95A5A6', '#7F8C8D', '#34495E', '#2C3E50', '#BDC3C7' ],
  warn: [ '#F1C40F', '#1ABC9C', '#E84393', '#2C2C54', '#474787' ]
};
const allColors = [...HATCH_COLORS.primary, ...HATCH_COLORS.secondary, ...HATCH_COLORS.dark, ...HATCH_COLORS.earth, ...HATCH_COLORS.warn];

const useImageLoader = (src) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!src) { setImage(null); return; }
    const img = new window.Image();
    const fullSrc = src.startsWith('http') ? src : `${SERVER_URL}${src}`;
    img.src = fullSrc;
    img.crossOrigin = "Anonymous";
    img.onload = () => { setImage(img); setError(null); };
    img.onerror = (err) => { console.error("❌ Error imagen:", fullSrc); setError(err); };
  }, [src]);
  return { image, error };
};

function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom, onReset, onClearAll, onDeleteSelected, hasSelection, onUndo, canUndo, onExportPNG, onExportPDF }) { 
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const tools = [
    { id: 'pan', name: 'Mover', icon: '✋' },
    { id: 'rect', name: 'Rectángulo', icon: '▭' },
    { id: 'circle', name: 'Círculo', icon: '●' },
    { id: 'polygon', name: 'Libre', icon: '⚡' },     
    { id: 'ortho', name: 'Ortogonal', icon: '📐' },   
  ];

  return (
    <div className="p-2 border-b border-gray-600 flex flex-wrap justify-between items-center gap-2" style={{ backgroundColor: '#333333' }}>
      <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-gray-600">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.name}
            className={`px-3 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 ${
              activeTool === tool.id 
                ? 'bg-hatch-orange text-white shadow-md' 
                : 'text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <span>{tool.icon}</span>
            <span className="hidden md:inline">{tool.name}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded border border-gray-500 transition-colors" title="Color">
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-gray-400 text-[10px]">▼</span>
          </button>
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 animate-in fade-in zoom-in duration-200">
              <div className="grid grid-cols-5 gap-2">
                {allColors.map((c, idx) => (<button key={idx} onClick={() => { setColor(c); setShowColorPicker(false); }} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-500"></div>

        <div className="flex bg-gray-700 rounded border border-gray-600">
            <button onClick={onExportPNG} className="px-3 py-1.5 hover:bg-gray-600 text-gray-200 text-xs font-bold border-r border-gray-600 flex gap-1 items-center" title="Imagen PNG">
               <span>📷</span> PNG
            </button>
            <button onClick={onExportPDF} className="px-3 py-1.5 hover:bg-gray-600 text-hatch-orange text-xs font-bold flex gap-1 items-center" title="Documento PDF">
               <span>📄</span> PDF
            </button>
        </div>

        <div className="h-6 w-px bg-gray-500"></div>

        <div className="flex items-center gap-1">
            <button onClick={() => onZoom(1.2)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Acercar">➕</button>
            <button onClick={() => onZoom(0.8)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Alejar">➖</button>
            <button onClick={onReset} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Resetear">⟲</button>
        </div>

        <div className="flex items-center gap-1 ml-2">
            {onUndo && <button onClick={onUndo} className={`p-2 rounded ${canUndo ? 'text-white hover:bg-gray-600' : 'text-gray-600 cursor-not-allowed'}`} title="Deshacer">↶</button>}
            {onDeleteSelected && <button onClick={onDeleteSelected} disabled={!hasSelection} className={`p-2 rounded ${hasSelection ? 'text-red-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`} title="Borrar">🗑️</button>}
            {onClearAll && <button onClick={onClearAll} className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded" title="Limpiar Todo">☠️</button>}
        </div>
      </div>
    </div>
  );
}

function PlotPlan({ plotPlan, cwaToAssociate, activeCWAId, onShapeSaved, onShapeClick }) {
  const { image, error } = useImageLoader(plotPlan?.image_url);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [activeTool, setActiveTool] = useState('pan');
  const [currentColor, setCurrentColor] = useState(HATCH_COLORS.primary[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [shapes, setShapes] = useState([]);
  const [history, setHistory] = useState([]); 
  
  const [newShape, setNewShape] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const startPoint = useRef({ x: 0, y: 0 });
  
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });
  const [selectedShapeKey, setSelectedShapeKey] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  const imageDim = image ? { width: image.width, height: image.height } : { width: 0, height: 0 };
  const scaleRatio = image ? Math.min(containerSize.width / imageDim.width, containerSize.height / imageDim.height) : 1;
  const groupX = (containerSize.width - imageDim.width * scaleRatio) / 2;
  const groupY = (containerSize.height - imageDim.height * scaleRatio) / 2;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!plotPlan?.cwas) { setShapes([]); return; }
    const loadedShapes = [];
    plotPlan.cwas.forEach(cwa => {
      if (cwa.shape_type && cwa.shape_data) {
        loadedShapes.push({
          type: cwa.shape_type,
          color: cwa.shape_data.color || '#E67E22',
          key: `cwa-${plotPlan.id}-${cwa.id}`,
          cwaId: cwa.id,
          codigo: cwa.codigo,
          nombre: cwa.nombre,
          ...cwa.shape_data
        });
      }
    });
    setShapes(loadedShapes);
  }, [plotPlan?.id, plotPlan?.cwas]);

  useEffect(() => {
    if (activeCWAId) {
        const shapeToSelect = shapes.find(s => s.cwaId === activeCWAId);
        setSelectedShapeKey(shapeToSelect ? shapeToSelect.key : null);
    } else {
        setSelectedShapeKey(null);
    }
  }, [activeCWAId, shapes]);

  // Handlers
  const handleZoom = (scaleFactor) => setStageState(s => ({ ...s, scale: s.scale * scaleFactor }));
  const handleResetZoom = () => setStageState({ scale: 1, x: 0, y: 0 });
  const handleClear = () => { if(confirm('¿Limpiar todas las áreas locales?')) { setHistory([...history, shapes]); setShapes([]); }};
  const handleUndo = () => { if(history.length > 0) { setShapes(history[history.length-1]); setHistory(history.slice(0,-1)); }};

  const handleExportImage = () => {
    if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `PlotPlan_${plotPlan.nombre}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const pdf = new jsPDF('l', 'px', [imageDim.width, imageDim.height]);
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(uri, 'PNG', 0, 0, width, height);
        pdf.save(`PlotPlan_${plotPlan.nombre}.pdf`);
    }
  };

  const getRelativePointerPosition = (node) => {
    const stage = node.getStage();
    const pointerPosition = stage.getPointerPosition();
    const stageX = (pointerPosition.x - stage.x()) / stage.scaleX();
    const stageY = (pointerPosition.y - stage.y()) / stage.scaleY();
    const relativeX = (stageX - groupX) / scaleRatio;
    const relativeY = (stageY - groupY) / scaleRatio;
    return { x: relativeX, y: relativeY };
  };

  const handleMouseDown = (e) => {
    // ✅ PREVENIR COMPORTAMIENTO DE SCROLL POR DEFAULT
    if (e.evt) e.evt.preventDefault();

    if (activeTool === 'pan' || !image || e.evt.button !== 0) {
      if (activeTool === 'pan' && !e.target.findAncestor('Shape')) setSelectedShapeKey(null);
      return;
    }
    setSelectedShapeKey(null);
    const pos = getRelativePointerPosition(e.target);
    
    if (activeTool === 'rect' || activeTool === 'circle') {
      startPoint.current = pos;
      setIsDrawing(true);
      setNewShape({ type: activeTool, color: currentColor, x: pos.x, y: pos.y, width: 0, height: 0, radius: 0 });
    }
    
    if (activeTool === 'polygon' || activeTool === 'ortho') {
      setIsDrawingPolygon(true);
      let newX = pos.x; let newY = pos.y;
      if (activeTool === 'ortho' && polygonPoints.length >= 2) {
        const lastX = polygonPoints[polygonPoints.length - 2];
        const lastY = polygonPoints[polygonPoints.length - 1];
        if (Math.abs(newX - lastX) > Math.abs(newY - lastY)) newY = lastY; else newX = lastX;
      }
      const newPoints = [...polygonPoints, newX, newY];
      setPolygonPoints(newPoints);
      if (newPoints.length > 4) {
        const startX = newPoints[0]; const startY = newPoints[1];
        const tolerance = 10 / (scaleRatio * stageState.scale);
        if (Math.hypot(startX - newX, startY - newY) < tolerance) {
          setIsDrawingPolygon(false); setCursorPos(null);
          handleSaveShape({ type: 'polygon', color: currentColor, points: newPoints.slice(0, -2) });
          setPolygonPoints([]);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    // ✅ PREVENIR COMPORTAMIENTO DE SCROLL POR DEFAULT
    if (e.evt) e.evt.preventDefault();

    if (!image) return;
    const pos = getRelativePointerPosition(e.target);
    if (isDrawingPolygon) {
        let guideX = pos.x; let guideY = pos.y;
        if (activeTool === 'ortho' && polygonPoints.length >= 2) {
            const lastX = polygonPoints[polygonPoints.length - 2];
            const lastY = polygonPoints[polygonPoints.length - 1];
            if (Math.abs(guideX - lastX) > Math.abs(guideY - lastY)) guideY = lastY; else guideX = lastX;
        }
        setCursorPos({ x: guideX, y: guideY });
    }
    if (isDrawing && activeTool !== 'pan') {
        if (activeTool === 'rect') setNewShape({ ...newShape, width: pos.x - startPoint.current.x, height: pos.y - startPoint.current.y });
        if (activeTool === 'circle') setNewShape({ ...newShape, radius: Math.hypot(pos.x - startPoint.current.x, pos.y - startPoint.current.y) });
    }
  };

  const handleMouseUp = () => {
    if (!image || activeTool === 'pan') return;
    if (activeTool === 'rect' || activeTool === 'circle') {
        setIsDrawing(false);
        if (newShape && (Math.abs(newShape.width) > 5 || newShape.radius > 5)) { handleSaveShape(newShape); setNewShape(null); }
    }
  };

  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) { alert("⚠️ Selecciona un CWA arriba para asignar esta área."); setPolygonPoints([]); setIsDrawingPolygon(false); return; }
    let shapeData = {};
    if (finalShape.type === 'polygon') shapeData = { points: finalShape.points, color: finalShape.color };
    else if (finalShape.type === 'rect') shapeData = { x: finalShape.x, y: finalShape.y, width: finalShape.width, height: finalShape.height, color: finalShape.color };
    else if (finalShape.type === 'circle') shapeData = { x: finalShape.x, y: finalShape.y, radius: finalShape.radius, color: finalShape.color };
    try {
      saveToHistory(); 
      const formData = new FormData();
      const typeToSend = (finalShape.type === 'ortho' || finalShape.type === 'polygon') ? 'polygon' : finalShape.type;
      formData.append('shape_type', typeToSend); formData.append('shape_data', JSON.stringify(shapeData));
      await client.put(`/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`, formData);
      if (onShapeSaved) onShapeSaved(cwaToAssociate.id, null);
      const newShapeVisual = { ...finalShape, type: typeToSend, key: Date.now(), ...shapeData, codigo: cwaToAssociate.codigo, nombre: cwaToAssociate.nombre, cwaId: cwaToAssociate.id };
      setShapes(prev => [...prev, newShapeVisual]);
    } catch (error) { alert(`Error al guardar geometría: ${error.message}`); }
  };

  const handleDeleteSelected = async () => {
    if (!selectedShapeKey) return;
    const shape = shapes.find(s => s.key === selectedShapeKey);
    if (!shape) return;
    if (!confirm(`¿Eliminar el dibujo del área ${shape.codigo}?`)) return;
    try {
        saveToHistory();
        const formData = new FormData();
        formData.append('shape_type', ''); formData.append('shape_data', '{}');
        await client.put(`/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${shape.cwaId}/geometry`, formData);
        setShapes(prev => prev.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
        if (onShapeSaved) onShapeSaved(shape.cwaId, null);
    } catch (err) { alert("Error al eliminar: " + err.message); }
  };

  const handleClearAll = async () => { 
      if (shapes.length === 0) return;
      if(!confirm('⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los dibujos de este plano.')) return;
      saveToHistory();
      try {
        for (const shape of shapes) {
            const formData = new FormData();
            formData.append('shape_type', ''); formData.append('shape_data', '{}');
            await client.put(`/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${shape.cwaId}/geometry`, formData);
        }
        setShapes([]); setSelectedShapeKey(null);
        if (onShapeSaved) onShapeSaved(null, null); 
      } catch (err) { alert("Error limpiando: " + err.message); }
  };
  
  const handleShapeMouseEnter = (e, shape) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setTooltip({ visible: true, x: pointerPos.x, y: pointerPos.y - 10, content: { codigo: shape.codigo, nombre: shape.nombre } });
  };

  const handleShapeMouseLeave = () => setTooltip({ ...tooltip, visible: false });

  const handleStageMouseMove = (e) => {
    if(tooltip.visible) {
        const stage = e.target.getStage(); const pointerPos = stage.getPointerPosition();
        setTooltip(prev => ({ ...prev, x: pointerPos.x, y: pointerPos.y - 10 }));
    }
    handleMouseMove(e);
  };

  const dynamicStroke = 2 / (scaleRatio * stageState.scale);

  return (
    <div className="bg-white border-r-2 border-hatch-gray rounded-lg border border-gray-700 overflow-hidden flex flex-col h-full min-h-[600px]">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        color={currentColor} 
        setColor={setCurrentColor} 
        onZoom={handleZoom} 
        onReset={handleResetZoom} 
        onClearAll={handleClearAll} 
        onDeleteSelected={handleDeleteSelected} 
        hasSelection={!!selectedShapeKey} 
        onUndo={handleUndo} 
        canUndo={history.length > 0} 
        onExportPNG={handleExportImage}
        onExportPDF={handleExportPDF}
      />
      
      <div ref={containerRef} className="w-full relative flex-1 overflow-hidden cursor-crosshair" style={{ backgroundColor: '#262626' }}>
        {!image && <div className="flex items-center justify-center h-full text-white">⏳ Cargando plano...</div>}
        
        {/* Tooltip */}
        {tooltip.visible && (
            <div className="absolute z-50 bg-black/90 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600 pointer-events-none transform -translate-x-1/2 -translate-y-full" style={{ top: tooltip.y, left: tooltip.x }}>
                <p className="text-xs font-bold text-hatch-orange">{tooltip.content.codigo}</p>
                <p className="text-sm font-medium whitespace-nowrap">{tooltip.content.nombre}</p>
            </div>
        )}

        {image && (
          <Stage ref={stageRef} width={containerSize.width} height={containerSize.height} draggable={activeTool === 'pan'} scaleX={stageState.scale} scaleY={stageState.scale} x={stageState.x} y={stageState.y} onDragEnd={(e) => setStageState(prev => ({ ...prev, x: e.target.x(), y: e.target.y() }))} onMouseDown={handleMouseDown} onMouseMove={handleStageMouseMove} onMouseUp={handleMouseUp} style={{ cursor: activeTool === 'pan' ? 'grab' : 'crosshair' }}>
            <Layer>
              <Group x={groupX} y={groupY} scaleX={scaleRatio} scaleY={scaleRatio}>
                <Image image={image} x={0} y={0} width={image.width} height={image.height} listening={false} />
                
                {/* FORMAS */}
                {shapes.map(shape => {
                  const isSel = shape.key === selectedShapeKey;
                  const props = { 
                    fill: `${shape.color}60`, 
                    stroke: isSel ? '#00FFFF' : shape.color, 
                    strokeWidth: isSel ? (dynamicStroke * 2) : dynamicStroke, 
                    // ✅ Eventos Click Corregidos
                    onClick: (e) => { 
                        if(e.evt) e.evt.preventDefault(); // Evita scroll
                        setSelectedShapeKey(shape.key); 
                        if(onShapeClick) onShapeClick(shape.cwaId); 
                    }, 
                    onMouseEnter: (e) => handleShapeMouseEnter(e, shape), 
                    onMouseLeave: handleShapeMouseLeave 
                  };
                  
                  if(shape.type==='rect') return <Rect key={shape.key} {...props} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                  if(shape.type==='circle') return <Circle key={shape.key} {...props} x={shape.x} y={shape.y} radius={shape.radius} />;
                  if(shape.type==='polygon' || shape.type==='ortho') return <Line key={shape.key} {...props} points={shape.points} closed />;
                  return null;
                })}

                {/* DIBUJOS TEMPORALES */}
                {newShape && activeTool === 'rect' && <Rect {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={dynamicStroke} />}
                {newShape && activeTool === 'circle' && <Circle {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={dynamicStroke} />}
                {isDrawingPolygon && polygonPoints.length > 0 && (<><Line points={polygonPoints} stroke={currentColor} strokeWidth={dynamicStroke} />{cursorPos && <Line points={[polygonPoints[polygonPoints.length - 2], polygonPoints[polygonPoints.length - 1], cursorPos.x, cursorPos.y]} stroke={currentColor} strokeWidth={dynamicStroke} dash={[dynamicStroke * 2, dynamicStroke * 2]} opacity={0.7} />}{polygonPoints.map((_, i) => { if(i % 2 !== 0) return null; return <Circle key={i} x={polygonPoints[i]} y={polygonPoints[i+1]} radius={dynamicStroke * 1.5} fill="white" stroke={currentColor} strokeWidth={1} /> })}</>)}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

export default PlotPlan;