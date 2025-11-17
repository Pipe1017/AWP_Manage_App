import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect, Circle, Line, Text, Tag, Label } from 'react-konva'; 
import axios from 'axios';

const API_URL = 'http://192.168.1.4:8000/api/v1';

// Paleta de colores HATCH
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
    if (!src) { 
      setImage(null); 
      setError(null); 
      return; 
    }
    
    const img = new window.Image();
    const fullSrc = `http://192.168.1.4:8000${src}`;
    img.src = fullSrc;
    img.crossOrigin = "Anonymous";
    
    img.onload = () => { 
      console.log("🖼️ Imagen cargada:", { width: img.width, height: img.height });
      setImage(img); 
      setError(null); 
    };
    
    img.onerror = (err) => { 
      console.error("❌ Error cargando imagen:", fullSrc); 
      setError(err); 
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return { image, error };
};

// Toolbar
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
              activeTool === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className="mr-1">{tool.icon}</span>
            {tool.name}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div className="flex items-center bg-gray-700 rounded overflow-hidden">
          <button 
            onClick={() => onZoom(1.2)} 
            className="px-2 py-1 text-white hover:bg-gray-600 text-sm font-bold"
          >
            +
          </button>
          <span className="px-2 text-xs text-gray-400">Zoom</span>
          <button 
            onClick={() => onZoom(0.8)} 
            className="px-2 py-1 text-white hover:bg-gray-600 text-sm font-bold"
          >
            -
          </button>
        </div>
        
        {onUndo && (
          <button 
            onClick={onUndo} 
            className="px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-xs"
          >
            ↶
          </button>
        )}
        
        {onClear && (
          <button 
            onClick={onClear} 
            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
          >
            🗑️
          </button>
        )}
        
        {/* Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          >
            <div className="w-4 h-4 rounded border border-white" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-300">Color</span>
          </button>
          
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 p-2 rounded shadow-xl border border-gray-700 z-50">
              <div className="grid grid-cols-4 gap-1 mb-2">
                {allColors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setColor(c); setShowColorPicker(false); }}
                    className={`w-6 h-6 rounded border ${color === c ? 'border-white ring-1 ring-blue-400' : 'border-gray-600'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-full h-6 rounded cursor-pointer" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente Principal
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
  const [stageState, setStageState] = useState({ scale: 1, x: 0, y: 0 });
  const [selectedShapeKey, setSelectedShapeKey] = useState(null);
  const [hoveredShape, setHoveredShape] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Actualizar tamaño del contenedor
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      setContainerSize({ width, height });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calcular dimensiones de imagen
  const getImageDimensions = () => {
    if (!image || containerSize.width === 0 || containerSize.height === 0) {
      return { x: 0, y: 0, width: containerSize.width, height: containerSize.height };
    }
    
    const imageRatio = image.width / image.height;
    const containerRatio = containerSize.width / containerSize.height;
    
    let width, height, x = 0, y = 0;
    
    if (imageRatio > containerRatio) {
      width = containerSize.width;
      height = containerSize.width / imageRatio;
      y = (containerSize.height - height) / 2;
    } else {
      height = containerSize.height;
      width = containerSize.height * imageRatio;
      x = (containerSize.width - width) / 2;
    }
    
    return { x, y, width, height };
  };

  // Cargar formas desde BD
  useEffect(() => {
    if (!plotPlan || !plotPlan.cwas || plotPlan.cwas.length === 0) {
      console.log("⚠️ [PlotPlan] No hay CWAs");
      setShapes([]);
      return;
    }
    
    console.log("🔵 [PlotPlan] Cargando formas...");
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
          descripcion: cwa.descripcion || '',
          ...cwa.shape_data
        });
      }
    });
    
    console.log(`✅ ${loadedShapes.length} formas cargadas`);
    setShapes(loadedShapes);
  }, [plotPlan?.id, plotPlan?.cwas]);

  // Manejo de teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeKey) {
        setHistory([...history, shapes]);
        setShapes(shapes.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeKey, shapes, history]);

  const handleZoom = (scaleFactor) => {
    setStageState({ ...stageState, scale: stageState.scale * scaleFactor });
  };
  
  const handleClear = () => {
    if (shapes.length === 0) return;
    if (window.confirm('¿Limpiar todas las formas?')) {
      setHistory([...history, shapes]);
      setShapes([]);
      setSelectedShapeKey(null);
    }
  };
  
  const handleUndo = () => {
    if (history.length === 0) return;
    setShapes(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setSelectedShapeKey(null);
  };

  const getCanvasPosition = (e, stage) => {
    const pointer = stage.getPointerPosition();
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY(),
    };
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'pan' || !image || e.evt.button !== 0) {
      const didClickOnShape = e.target.findAncestor('Shape');
      if (activeTool === 'pan' && !didClickOnShape) setSelectedShapeKey(null);
      return;
    }
    
    setSelectedShapeKey(null);
    const pos = getCanvasPosition(e, e.target.getStage());
    startPoint.current = pos;
    
    if (activeTool === 'rect' || activeTool === 'circle') {
      setHistory([...history, shapes]);
      setIsDrawing(true);
      setNewShape({ 
        type: activeTool, 
        color: currentColor, 
        x: pos.x, 
        y: pos.y, 
        width: 0, 
        height: 0, 
        radius: 0 
      });
    }
    
    if (activeTool === 'polygon') {
      setIsDrawingPolygon(true);
      if (polygonPoints.length === 0) {
        setHistory([...history, shapes]);
        setPolygonPoints([pos.x, pos.y]);
      } else {
        const newPoints = [...polygonPoints, pos.x, pos.y];
        setPolygonPoints(newPoints);
        
        if (polygonPoints.length > 4) {
          const firstPoint = { x: polygonPoints[0], y: polygonPoints[1] };
          const dist = Math.sqrt(Math.pow(firstPoint.x - pos.x, 2) + Math.pow(firstPoint.y - pos.y, 2));
          if (dist < 15) {
            setIsDrawingPolygon(false);
            handleSaveShape({ type: 'polygon', color: currentColor, points: [...polygonPoints] });
            setPolygonPoints([]);
          }
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!image || !isDrawing || isDrawingPolygon || activeTool === 'pan') return;
    
    const pos = getCanvasPosition(e, e.target.getStage());
    
    if (activeTool === 'rect') {
      setNewShape({ 
        ...newShape, 
        x: Math.min(startPoint.current.x, pos.x), 
        y: Math.min(startPoint.current.y, pos.y), 
        width: Math.abs(pos.x - startPoint.current.x), 
        height: Math.abs(pos.y - startPoint.current.y) 
      });
    }
    
    if (activeTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPoint.current.x, 2) + 
        Math.pow(pos.y - startPoint.current.y, 2)
      );
      setNewShape({ ...newShape, x: startPoint.current.x, y: startPoint.current.y, radius });
    }
  };

  const handleMouseUp = () => {
    if (!image || activeTool === 'pan') return;
    setIsDrawing(false);
    
    if ((activeTool === 'rect' || activeTool === 'circle') && newShape) {
      if (newShape.width > 5 || newShape.radius > 5) {
        handleSaveShape(newShape);
      }
      setNewShape(null);
    }
  };

  const handleShapeClickInternal = (shape) => {
    if (activeTool === 'pan') {
      setSelectedShapeKey(shape.key);
      // Notificar al padre para filtrar la tabla
      if (onShapeClick) {
        onShapeClick(shape.cwaId);
      }
    }
  };

  const handleShapeHover = (shape, e) => {
    setHoveredShape(shape);
    if (e && e.target && e.target.getStage()) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      setTooltipPos({ x: pointerPos.x, y: pointerPos.y });
    }
  };

  const handleShapeLeave = () => {
    setHoveredShape(null);
  };
  
  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) {
      alert("⚠️ Selecciona un CWA primero");
      return;
    }

    let shapeData = {};
    if (finalShape.type === 'polygon') {
      shapeData = { points: finalShape.points, color: finalShape.color };
    } else if (finalShape.type === 'rect') {
      shapeData = { 
        x: finalShape.x, 
        y: finalShape.y, 
        width: finalShape.width, 
        height: finalShape.height, 
        color: finalShape.color 
      };
    } else if (finalShape.type === 'circle') {
      shapeData = { 
        x: finalShape.x, 
        y: finalShape.y, 
        radius: finalShape.radius, 
        color: finalShape.color 
      };
    }

    try {
      console.log("🔵 Guardando geometría...");
      
      const formData = new FormData();
      formData.append('shape_type', finalShape.type);
      formData.append('shape_data', JSON.stringify(shapeData));
      
      await axios.put(
        `${API_URL}/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`,
        formData
      );
      
      console.log("✅ Geometría guardada");
      
      const newShape = {
        ...finalShape,
        key: `cwa-${plotPlan.id}-${cwaToAssociate.id}`,
        cwaId: cwaToAssociate.id,
        codigo: cwaToAssociate.codigo,
        nombre: cwaToAssociate.nombre,
        descripcion: cwaToAssociate.descripcion || ''
      };
      
      setShapes(prev => [...prev, newShape]);
      
      if (onShapeSaved) {
        onShapeSaved(cwaToAssociate.id, null);
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Error guardando forma");
    }
  };

  const imageDim = getImageDimensions();
  
  let cursor = 'default';
  if (activeTool === 'rect' || activeTool === 'circle') cursor = 'crosshair';
  else if (activeTool === 'polygon') cursor = 'pointer';
  else if (activeTool === 'pan') cursor = 'grab';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool}
        color={currentColor}
        setColor={setCurrentColor}
        onZoom={handleZoom}
        onClear={shapes.length > 0 ? handleClear : null}
        onUndo={history.length > 0 ? handleUndo : null}
      />
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="bg-gray-900 w-full relative"
        style={{ 
          height: '600px',
          cursor: cursor,
          overflow: 'hidden'
        }}
      >
        {error && (
          <div className="flex items-center justify-center h-full text-red-400">
            ❌ Error cargando imagen
          </div>
        )}
        
        {!image && !error && (
          <div className="flex items-center justify-center h-full text-gray-400">
            ⏳ Cargando imagen...
          </div>
        )}
        
        {image && (
          <>
            <Stage 
              ref={stageRef} 
              width={containerSize.width} 
              height={containerSize.height}
              onMouseDown={handleMouseDown} 
              onMouseMove={handleMouseMove} 
              onMouseUp={handleMouseUp}
              draggable={activeTool === 'pan'} 
              scaleX={stageState.scale} 
              scaleY={stageState.scale} 
              x={stageState.x} 
              y={stageState.y}
            >
              <Layer>
                {/* Imagen de fondo */}
                <Image 
                  image={image} 
                  x={imageDim.x}
                  y={imageDim.y}
                  width={imageDim.width}
                  height={imageDim.height}
                  listening={false} 
                />
                
                {/* Formas guardadas */}
                {shapes.map(shape => {
                  const isSelected = shape.key === selectedShapeKey;
                  const isHovered = hoveredShape?.key === shape.key;
                  
                  const props = {
                    fill: `${shape.color}60`,
                    stroke: isSelected ? '#00FFFF' : isHovered ? '#FFD700' : shape.color,
                    strokeWidth: isSelected ? 4 : isHovered ? 3 : 2,
                    onClick: () => handleShapeClickInternal(shape),
                    onTap: () => handleShapeClickInternal(shape),
                    onMouseEnter: (e) => handleShapeHover(shape, e),
                    onMouseLeave: handleShapeLeave,
                    cursor: 'pointer',
                    shadowColor: 'black',
                    shadowBlur: isSelected ? 8 : isHovered ? 6 : 3,
                    shadowOpacity: 0.5,
                  };
                  
                  if (shape.type === 'rect') {
                    return <Rect key={shape.key} {...props} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                  }
                  if (shape.type === 'circle') {
                    return <Circle key={shape.key} {...props} x={shape.x} y={shape.y} radius={shape.radius} />;
                  }
                  if (shape.type === 'polygon') {
                    return <Line key={shape.key} {...props} points={shape.points} closed />;
                  }
                  return null;
                })}
                
                {/* Tooltip en canvas */}
                {hoveredShape && (
                  <Label x={tooltipPos.x + 10} y={tooltipPos.y + 10}>
                    <Tag fill="#1F2937" stroke="#4B5563" strokeWidth={1} cornerRadius={4} />
                    <Text
                      text={`${hoveredShape.codigo}\n${hoveredShape.nombre}`}
                      fontSize={12}
                      fill="white"
                      padding={6}
                    />
                  </Label>
                )}
                
                {/* Forma temporal */}
                {newShape && activeTool === 'rect' && (
                  <Rect 
                    x={newShape.x} 
                    y={newShape.y} 
                    width={newShape.width} 
                    height={newShape.height} 
                    fill={`${newShape.color}40`} 
                    stroke={newShape.color} 
                    strokeWidth={2} 
                    dash={[10, 5]} 
                  />
                )}
                
                {newShape && activeTool === 'circle' && (
                  <Circle 
                    x={newShape.x} 
                    y={newShape.y} 
                    radius={newShape.radius} 
                    fill={`${newShape.color}40`} 
                    stroke={newShape.color} 
                    strokeWidth={2} 
                    dash={[10, 5]} 
                  />
                )}
                
                {isDrawingPolygon && polygonPoints.length > 0 && (
                  <Line 
                    points={polygonPoints} 
                    stroke={currentColor} 
                    strokeWidth={2} 
                    dash={[10, 5]} 
                  />
                )}
              </Layer>
            </Stage>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-1.5 bg-gray-800 border-t border-gray-700 flex justify-between text-xs text-gray-400">
        <span>Formas: {shapes.length}</span>
        <span>Zoom: {Math.round(stageState.scale * 100)}%</span>
        <span className="text-gray-500">
          {isDrawingPolygon && 'Click cerca del inicio para cerrar'}
        </span>
      </div>
    </div>
  );
}

export default PlotPlan;