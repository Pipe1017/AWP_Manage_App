import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect, Circle, Line, Text, Tag, Label } from 'react-konva'; 
import client from '../../../api/axios';

// === LÓGICA DE URL DINÁMICA ===
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SERVER_URL = API_BASE.replace('/api/v1', '');

// Paleta de colores
const HATCH_COLORS = {
  primary: [ '#E67E22', '#2E86C1', '#27AE60', '#C0392B' ],
  secondary: [ '#F39C12', '#8E44AD', '#16A085', '#D35400' ],
  earth: [ '#95A5A6', '#7F8C8D', '#BDC3C7', '#34495E' ]
};
const allColors = [...HATCH_COLORS.primary, ...HATCH_COLORS.secondary, ...HATCH_COLORS.earth];

// Hook para cargar imagen
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

// Toolbar Component
function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom, onClear, onUndo }) { 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const tools = [
    { id: 'pan', name: 'Mover', icon: '✋' },
    { id: 'rect', name: 'Rectángulo', icon: '▭' },
    { id: 'circle', name: 'Círculo', icon: '●' },
    { id: 'polygon', name: 'Polígono', icon: '▲' },
  ];
  return (
    <div className="p-2 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 flex justify-between items-center">
      <div className="flex items-center gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTool === tool.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="mr-1">{tool.icon}</span>{tool.name}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onZoom(1.2)} className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">+</button>
        <button onClick={() => onZoom(0.8)} className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">-</button>
        {onUndo && <button onClick={onUndo} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">↶</button>}
        {onClear && <button onClick={onClear} className="px-2 py-1 bg-red-600 text-white rounded text-xs">🗑️</button>}
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded">
            <div className="w-4 h-4 rounded border border-white" style={{ backgroundColor: color }} />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 p-2 rounded shadow-xl border border-gray-700 z-50 grid grid-cols-4 gap-1">
              {allColors.map((c, idx) => (
                <button key={idx} onClick={() => { setColor(c); setShowColorPicker(false); }} className="w-6 h-6 rounded border border-gray-600" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// === COMPONENTE PRINCIPAL ===
function PlotPlan({ plotPlan, cwaToAssociate, onShapeSaved, onShapeClick }) {
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
  const startPoint = useRef({ x: 0, y: 0 });
  
  // [FIX KONVA]: Estado para la posición y escala del Stage
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });
  
  const [selectedShapeKey, setSelectedShapeKey] = useState(null);
  const [hoveredShape, setHoveredShape] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Cargar formas
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

  // ... Manejo de teclas (Undo/Delete) ...
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeKey) {
        setHistory([...history, shapes]);
        setShapes(shapes.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeKey, shapes, history]);

  // Funciones auxiliares
  const handleZoom = (scaleFactor) => setStageState(s => ({ ...s, scale: s.scale * scaleFactor }));
  const handleClear = () => { if(confirm('¿Limpiar?')) { setHistory([...history, shapes]); setShapes([]); }};
  const handleUndo = () => { if(history.length > 0) { setShapes(history[history.length-1]); setHistory(history.slice(0,-1)); }};

  const getCanvasPosition = (e, stage) => {
    const pointer = stage.getPointerPosition();
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  };

  // Eventos Mouse
  const handleMouseDown = (e) => {
    if (activeTool === 'pan' || !image || e.evt.button !== 0) {
      if (activeTool === 'pan' && !e.target.findAncestor('Shape')) setSelectedShapeKey(null);
      return;
    }
    setSelectedShapeKey(null);
    const pos = getCanvasPosition(e, e.target.getStage());
    startPoint.current = pos;
    
    if (activeTool === 'rect' || activeTool === 'circle') {
      setIsDrawing(true);
      setNewShape({ type: activeTool, color: currentColor, x: pos.x, y: pos.y, width: 0, height: 0, radius: 0 });
    }
    if (activeTool === 'polygon') {
      setIsDrawingPolygon(true);
      if (polygonPoints.length === 0) setPolygonPoints([pos.x, pos.y]);
      else {
        const newPoints = [...polygonPoints, pos.x, pos.y];
        setPolygonPoints(newPoints);
        const first = { x: polygonPoints[0], y: polygonPoints[1] };
        if (polygonPoints.length > 4 && Math.hypot(first.x - pos.x, first.y - pos.y) < 15) {
          setIsDrawingPolygon(false);
          handleSaveShape({ type: 'polygon', color: currentColor, points: newPoints });
          setPolygonPoints([]);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!image || !isDrawing || activeTool === 'pan') return;
    const pos = getCanvasPosition(e, e.target.getStage());
    if (activeTool === 'rect') setNewShape({ ...newShape, width: pos.x - startPoint.current.x, height: pos.y - startPoint.current.y });
    if (activeTool === 'circle') setNewShape({ ...newShape, radius: Math.hypot(pos.x - startPoint.current.x, pos.y - startPoint.current.y) });
  };

  const handleMouseUp = () => {
    if (!image || activeTool === 'pan') return;
    setIsDrawing(false);
    if (newShape && (Math.abs(newShape.width) > 5 || newShape.radius > 5)) {
      handleSaveShape(newShape);
      setNewShape(null);
    }
  };

  // Guardar Geometría
  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) { alert("⚠️ Selecciona un CWA primero"); return; }

    let shapeData = {};
    if (finalShape.type === 'polygon') shapeData = { points: finalShape.points, color: finalShape.color };
    else if (finalShape.type === 'rect') shapeData = { x: finalShape.x, y: finalShape.y, width: finalShape.width, height: finalShape.height, color: finalShape.color };
    else if (finalShape.type === 'circle') shapeData = { x: finalShape.x, y: finalShape.y, radius: finalShape.radius, color: finalShape.color };

    try {
      console.log("🔵 Guardando geometría...");
      const formData = new FormData();
      formData.append('shape_type', finalShape.type);
      formData.append('shape_data', JSON.stringify(shapeData)); // JSON como string

      // Axios (client) detectará FormData y pondrá el Content-Type correcto
      await client.put(
        `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`,
        formData
      );
      
      console.log("✅ Geometría guardada");
      if (onShapeSaved) onShapeSaved(cwaToAssociate.id, null);
      
      // Actualización optimista local
      const newShapeVisual = { ...finalShape, key: Date.now(), ...shapeData, codigo: cwaToAssociate.codigo, nombre: cwaToAssociate.nombre };
      setShapes(prev => [...prev, newShapeVisual]);

    } catch (error) {
      console.error("❌ Error guardando forma:", error);
      // Si hay detalle del error, mostrarlo
      const msg = error.response?.data?.detail || "Error al guardar";
      alert(`Error: ${msg}`);
    }
  };

  // Render
  const imageDim = image ? { width: image.width, height: image.height } : { width: 0, height: 0 };
  const scaleRatio = Math.min(containerSize.width / (imageDim.width || 1), containerSize.height / (imageDim.height || 1));
  const finalW = imageDim.width * scaleRatio;
  const finalH = imageDim.height * scaleRatio;
  const finalX = (containerSize.width - finalW) / 2;
  const finalY = (containerSize.height - finalH) / 2;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} color={currentColor} setColor={setCurrentColor} onZoom={handleZoom} onClear={handleClear} onUndo={handleUndo} />
      
      <div ref={containerRef} className="bg-gray-900 w-full relative" style={{ height: '600px', cursor: activeTool === 'pan' ? 'grab' : 'crosshair' }}>
        {!image && <div className="flex items-center justify-center h-full text-gray-400">⏳ Cargando imagen...</div>}
        {image && (
          <Stage 
            width={containerSize.width} 
            height={containerSize.height}
            draggable={activeTool === 'pan'}
            scaleX={stageState.scale} 
            scaleY={stageState.scale}
            x={stageState.x} 
            y={stageState.y}
            // [FIX KONVA] Actualizar estado al terminar de arrastrar
            onDragEnd={(e) => setStageState(prev => ({ ...prev, x: e.target.x(), y: e.target.y() }))}
            onMouseDown={handleMouseDown} 
            onMouseMove={handleMouseMove} 
            onMouseUp={handleMouseUp}
          >
            <Layer>
              <Image image={image} x={finalX} y={finalY} width={finalW} height={finalH} listening={false} />
              
              {shapes.map(shape => {
                const isSel = shape.key === selectedShapeKey;
                const props = {
                  fill: `${shape.color}60`, stroke: isSel ? '#00FFFF' : shape.color, strokeWidth: isSel?4:2,
                  onClick: () => { setSelectedShapeKey(shape.key); if(onShapeClick) onShapeClick(shape.cwaId); },
                  onMouseEnter: (e) => { setHoveredShape(shape); setTooltipPos(e.target.getStage().getPointerPosition()); },
                  onMouseLeave: () => setHoveredShape(null),
                };
                if(shape.type==='rect') return <Rect key={shape.key} {...props} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                if(shape.type==='circle') return <Circle key={shape.key} {...props} x={shape.x} y={shape.y} radius={shape.radius} />;
                if(shape.type==='polygon') return <Line key={shape.key} {...props} points={shape.points} closed />;
                return null;
              })}

              {/* Tooltip */}
              {hoveredShape && (
                <Label x={(tooltipPos.x - stageState.x)/stageState.scale} y={(tooltipPos.y - stageState.y)/stageState.scale - 20}>
                  <Tag fill="#1F2937" stroke="#4B5563" strokeWidth={1} />
                  <Text text={`${hoveredShape.codigo}`} fontSize={12} fill="white" padding={5} />
                </Label>
              )}

              {/* Dibujo temporal */}
              {newShape && activeTool === 'rect' && <Rect {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} dash={[5,5]} />}
              {newShape && activeTool === 'circle' && <Circle {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} dash={[5,5]} />}
              {isDrawingPolygon && polygonPoints.length > 0 && <Line points={polygonPoints} stroke={currentColor} dash={[5,5]} />}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

export default PlotPlan;