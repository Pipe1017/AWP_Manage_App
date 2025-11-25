import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Image, Rect, Circle, Line } from 'react-konva'; 
import client from '../../../api/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SERVER_URL = API_BASE.replace('/api/v1', '');

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

function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom, onReset, onClear, onUndo }) { 
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
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded border border-gray-500 transition-colors"
            title="Cambiar Color"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-200">Color</span>
            <span className="text-gray-400 text-[10px]">▼</span>
          </button>
          
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-48 animate-in fade-in zoom-in duration-200">
              <div className="grid grid-cols-4 gap-2">
                {allColors.map((c, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setColor(c); setShowColorPicker(false); }} 
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`} 
                    style={{ backgroundColor: c }} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-500"></div>

        <div className="flex items-center gap-1">
            <button onClick={() => onZoom(1.2)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Acercar">➕</button>
            <button onClick={() => onZoom(0.8)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Alejar">➖</button>
            <button onClick={onReset} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Resetear Vista">⟲</button>
        </div>

        <div className="flex items-center gap-1 ml-2">
            {onUndo && <button onClick={onUndo} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded" title="Deshacer">↶</button>}
            {onClear && <button onClick={onClear} className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded" title="Limpiar Todo">🗑️</button>}
        </div>
      </div>
    </div>
  );
}

function PlotPlan({ plotPlan, cwaToAssociate, activeCWAId, onShapeSaved, onShapeClick }) {
  const { image, error } = useImageLoader(plotPlan?.image_url);
  const containerRef = useRef(null);
  
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

  // ✅ EFECTO NUEVO: Sincronizar selección externa (dropdown/tabla)
  useEffect(() => {
    if (activeCWAId) {
        const shapeToSelect = shapes.find(s => s.cwaId === activeCWAId);
        if (shapeToSelect) {
            setSelectedShapeKey(shapeToSelect.key);
        } else {
            setSelectedShapeKey(null);
        }
    } else {
        setSelectedShapeKey(null);
    }
  }, [activeCWAId, shapes]);

  // Helpers
  const handleZoom = (scaleFactor) => setStageState(s => ({ ...s, scale: s.scale * scaleFactor }));
  const handleResetZoom = () => setStageState({ scale: 1, x: 0, y: 0 });
  const handleClear = () => { if(confirm('¿Limpiar?')) { setHistory([...history, shapes]); setShapes([]); }};
  const handleUndo = () => { if(history.length > 0) { setShapes(history[history.length-1]); setHistory(history.slice(0,-1)); }};

  const getRelativePointerPosition = (node) => {
    const stage = node.getStage();
    const pointerPosition = stage.getPointerPosition();
    const stageX = (pointerPosition.x - stage.x()) / stage.scaleX();
    const stageY = (pointerPosition.y - stage.y()) / stage.scaleY();
    const relativeX = (stageX - groupX) / scaleRatio;
    const relativeY = (stageY - groupY) / scaleRatio;
    return { x: relativeX, y: relativeY };
  };

  // Eventos Mouse
  const handleMouseDown = (e) => {
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
      let newX = pos.x;
      let newY = pos.y;

      if (activeTool === 'ortho' && polygonPoints.length >= 2) {
        const lastX = polygonPoints[polygonPoints.length - 2];
        const lastY = polygonPoints[polygonPoints.length - 1];
        if (Math.abs(newX - lastX) > Math.abs(newY - lastY)) newY = lastY; else newX = lastX;
      }

      const newPoints = [...polygonPoints, newX, newY];
      setPolygonPoints(newPoints);

      if (newPoints.length > 4) {
        const startX = newPoints[0];
        const startY = newPoints[1];
        const tolerance = 10 / (scaleRatio * stageState.scale);
        
        if (Math.hypot(startX - newX, startY - newY) < tolerance) {
          setIsDrawingPolygon(false);
          setCursorPos(null);
          handleSaveShape({ type: 'polygon', color: currentColor, points: newPoints.slice(0, -2) });
          setPolygonPoints([]);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!image) return;
    
    const pos = getRelativePointerPosition(e.target);

    if (isDrawingPolygon) {
        let guideX = pos.x;
        let guideY = pos.y;

        if (activeTool === 'ortho' && polygonPoints.length >= 2) {
            const lastX = polygonPoints[polygonPoints.length - 2];
            const lastY = polygonPoints[polygonPoints.length - 1];
            if (Math.abs(guideX - lastX) > Math.abs(guideY - lastY)) guideY = lastY; else guideX = lastX;
        }
        setCursorPos({ x: guideX, y: guideY });
    }
    
    if (isDrawing && activeTool !== 'pan') {
        if (activeTool === 'rect') {
            setNewShape({ ...newShape, width: pos.x - startPoint.current.x, height: pos.y - startPoint.current.y });
        }
        if (activeTool === 'circle') {
            const radius = Math.hypot(pos.x - startPoint.current.x, pos.y - startPoint.current.y);
            setNewShape({ ...newShape, radius });
        }
    }
  };

  const handleMouseUp = () => {
    if (!image || activeTool === 'pan') return;
    
    if (activeTool === 'rect' || activeTool === 'circle') {
        setIsDrawing(false);
        if (newShape && (Math.abs(newShape.width) > 5 || newShape.radius > 5)) {
            handleSaveShape(newShape);
            setNewShape(null);
        }
    }
  };

  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) { 
        alert("⚠️ Selecciona un CWA arriba para asignar esta área."); 
        setPolygonPoints([]);
        setIsDrawingPolygon(false);
        return; 
    }

    let shapeData = {};
    if (finalShape.type === 'polygon') shapeData = { points: finalShape.points, color: finalShape.color };
    else if (finalShape.type === 'rect') shapeData = { x: finalShape.x, y: finalShape.y, width: finalShape.width, height: finalShape.height, color: finalShape.color };
    else if (finalShape.type === 'circle') shapeData = { x: finalShape.x, y: finalShape.y, radius: finalShape.radius, color: finalShape.color };

    try {
      const formData = new FormData();
      const typeToSend = (finalShape.type === 'ortho' || finalShape.type === 'polygon') ? 'polygon' : finalShape.type;
      
      formData.append('shape_type', typeToSend);
      formData.append('shape_data', JSON.stringify(shapeData));

      await client.put(
        `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`,
        formData
      );
      
      if (onShapeSaved) onShapeSaved(cwaToAssociate.id, null);
      
      const newShapeVisual = { ...finalShape, type: typeToSend, key: Date.now(), ...shapeData, codigo: cwaToAssociate.codigo, nombre: cwaToAssociate.nombre };
      setShapes(prev => [...prev, newShapeVisual]);

    } catch (error) {
      alert(`Error al guardar geometría: ${error.message}`);
    }
  };

  const handleShapeMouseEnter = (e, shape) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    setTooltip({
        visible: true,
        x: pointerPos.x, 
        y: pointerPos.y - 10, 
        content: { codigo: shape.codigo, nombre: shape.nombre }
    });
  };

  const handleShapeMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleStageMouseMove = (e) => {
    if(tooltip.visible) {
        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();
        setTooltip(prev => ({ ...prev, x: pointerPos.x, y: pointerPos.y - 10 }));
    }
    handleMouseMove(e);
  };

  const dynamicStroke = 2 / (scaleRatio * stageState.scale);

  return (
    <div className="bg-white border-r-2 border-hatch-gray rounded-lg border border-gray-700 overflow-hidden flex flex-col h-full min-h-[600px]">
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} color={currentColor} setColor={setCurrentColor} onZoom={handleZoom} onReset={handleResetZoom} onClear={handleClear} onUndo={handleUndo} />
      
      <div ref={containerRef} className="w-full relative flex-1 overflow-hidden cursor-crosshair" style={{ backgroundColor: '#262626' }}>
        {!image && <div className="flex items-center justify-center h-full text-white">⏳ Cargando plano...</div>}
        
        {tooltip.visible && (
            <div 
                className="absolute z-50 bg-black/90 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-600 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{ top: tooltip.y, left: tooltip.x }}
            >
                <p className="text-xs font-bold text-hatch-orange">{tooltip.content.codigo}</p>
                <p className="text-sm font-medium whitespace-nowrap">{tooltip.content.nombre}</p>
            </div>
        )}

        {image && (
          <Stage 
            width={containerSize.width} 
            height={containerSize.height}
            draggable={activeTool === 'pan'}
            scaleX={stageState.scale} 
            scaleY={stageState.scale}
            x={stageState.x} 
            y={stageState.y}
            onDragEnd={(e) => setStageState(prev => ({ ...prev, x: e.target.x(), y: e.target.y() }))}
            onMouseDown={handleMouseDown} 
            onMouseMove={handleStageMouseMove} 
            onMouseUp={handleMouseUp}
            style={{ cursor: activeTool === 'pan' ? 'grab' : 'crosshair' }}
          >
            <Layer>
              <Group
                x={groupX}
                y={groupY}
                scaleX={scaleRatio}
                scaleY={scaleRatio}
              >
                <Image 
                  image={image} 
                  x={0} y={0}
                  width={image.width} height={image.height}
                  listening={false} 
                />
                
                {shapes.map(shape => {
                  const isSel = shape.key === selectedShapeKey;
                  const props = {
                    fill: `${shape.color}60`, 
                    stroke: isSel ? '#00FFFF' : shape.color, 
                    strokeWidth: isSel ? (dynamicStroke * 2) : dynamicStroke, // 🔥 STROKE FINO
                    onClick: () => { setSelectedShapeKey(shape.key); if(onShapeClick) onShapeClick(shape.cwaId); },
                    onMouseEnter: (e) => handleShapeMouseEnter(e, shape),
                    onMouseLeave: handleShapeMouseLeave,
                  };
                  
                  if(shape.type==='rect') return <Rect key={shape.key} {...props} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                  if(shape.type==='circle') return <Circle key={shape.key} {...props} x={shape.x} y={shape.y} radius={shape.radius} />;
                  if(shape.type==='polygon' || shape.type==='ortho') return <Line key={shape.key} {...props} points={shape.points} closed />;
                  return null;
                })}

                {newShape && activeTool === 'rect' && <Rect {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={dynamicStroke} />}
                {newShape && activeTool === 'circle' && <Circle {...newShape} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={dynamicStroke} />}
                
                {isDrawingPolygon && polygonPoints.length > 0 && (
                    <>
                        <Line points={polygonPoints} stroke={currentColor} strokeWidth={dynamicStroke} />
                        {cursorPos && (
                            <Line 
                                points={[
                                    polygonPoints[polygonPoints.length - 2], 
                                    polygonPoints[polygonPoints.length - 1], 
                                    cursorPos.x, 
                                    cursorPos.y
                                ]} 
                                stroke={currentColor} 
                                strokeWidth={dynamicStroke} 
                                dash={[dynamicStroke * 2, dynamicStroke * 2]} 
                                opacity={0.7}
                            />
                        )}
                        {polygonPoints.map((_, i) => {
                            if(i % 2 !== 0) return null; 
                            return <Circle key={i} x={polygonPoints[i]} y={polygonPoints[i+1]} radius={dynamicStroke * 1.5} fill="white" stroke={currentColor} strokeWidth={1} />
                        })}
                    </>
                )}
              </Group>
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

export default PlotPlan;