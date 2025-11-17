import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect, Circle, Line } from 'react-konva'; 
import { GithubPicker } from 'react-color';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Paleta de colores HATCH para ingeniería
const HATCH_COLORS = {
  primary: [ '#E67E22', '#2E86C1', '#27AE60', '#C0392B' ],
  secondary: [ '#F39C12', '#8E44AD', '#16A085', '#D35400' ],
  earth: [ '#95A5A6', '#7F8C8D', '#BDC3C7', '#34495E' ]
};
const allColors = [...HATCH_COLORS.primary, ...HATCH_COLORS.secondary, ...HATCH_COLORS.earth];

// Hook para cargar la imagen de Konva
const useImageLoader = (src) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!src) { setImage(null); setError(null); return; }
    const img = new window.Image();
    const fullSrc = `http://localhost:8000${src}`;
    img.src = fullSrc;
    img.crossOrigin = "Anonymous";
    img.onload = () => { setImage(img); setError(null); };
    img.onerror = (err) => { console.error("Error al cargar la imagen:", err, fullSrc); setError(err); };
  }, [src]);
  return { image, error };
};

// --- Componente de la Barra de Herramientas (ToolBar) ---
function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom, onClear, onUndo }) { 
  const [showColorPicker, setShowColorPicker] = useState(false);
  const tools = [
    { id: 'pan', name: 'Seleccionar', icon: '✋' },
    { id: 'rect', name: 'Rectángulo', icon: '▭' },
    { id: 'circle', name: 'Círculo', icon: '●' },
    { id: 'polygon', name: 'Polígono', icon: '▲' },
  ];
  
  return (
    <div className="p-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b-2 border-blue-900/50 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-semibold mr-2">HERRAMIENTAS:</span>
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105
              ${activeTool === tool.id ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
              ${tool.id === 'pan' && activeTool === 'pan' ? 'bg-green-600 hover:bg-green-700' : ''}
            `}
            title={tool.name}
          >
            <span className="text-lg mr-1">{tool.icon}</span>
            <span className="text-sm">{tool.name}</span>
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Controles de Zoom */}
        <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
          <button onClick={() => onZoom(1.1)} className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-500 font-bold transition-colors" title="Acercar">+</button>
          <span className="px-3 py-2 text-gray-300 text-sm font-medium">Zoom</span>
          <button onClick={() => onZoom(0.9)} className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-500 font-bold transition-colors" title="Alejar">-</button>
        </div>
        
        {/* Botones de Acción */}
        {onUndo && (
          <button onClick={onUndo} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50" title="Deshacer (Ctrl+Z)" disabled={!onUndo}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Deshacer
          </button>
        )}
        
        {onClear && (
          <button onClick={onClear} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2" title="Limpiar todo">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Limpiar
          </button>
        )}
        
        {/* Selector de Color con paleta HATCH */}
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all">
            <div className="w-6 h-6 rounded border-2 border-white shadow-md" style={{ backgroundColor: color }} />
            <span className="text-sm text-gray-300 font-medium">Color</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-700 z-50">
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-semibold mb-2">PALETA HATCH ENGINEERING</p>
                <div className="grid grid-cols-4 gap-2">
                  {allColors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setColor(c);
                        setShowColorPicker(false);
                      }}
                      className={`
                        w-10 h-10 rounded-md border-2 transition-all transform hover:scale-110
                        ${color === c ? 'border-white ring-2 ring-blue-400' : 'border-gray-600 hover:border-gray-400'}
                      `}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-700">
                <label className="text-xs text-gray-400 font-semibold mb-2 block">COLOR PERSONALIZADO</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function PlotPlan({ plotPlan, cwaToAssociate, onShapeSaved }) {
  const { image, error } = useImageLoader(plotPlan?.image_url);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 500 });
  
  const [activeTool, setActiveTool] = useState('pan');
  const [currentColor, setCurrentColor] = useState(HATCH_COLORS.primary[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [history, setHistory] = useState([]); 
  const [newShape, setNewShape] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const [stage, setStage] = useState({ scale: 1, x: 0, y: 0 });
  const [selectedShapeKey, setSelectedShapeKey] = useState(null);

  // Cargar formas existentes desde la BD
  useEffect(() => {
    const loadShapesFromDB = async () => {
      if (!plotPlan || !plotPlan.cwas) return;
      
      console.log("🔵 [PlotPlan] Cargando formas guardadas desde BD...");
      const loadedShapes = [];
      
      plotPlan.cwas.forEach(cwa => {
        cwa.cwps.forEach(cwp => {
          if (cwp.shape_type && cwp.shape_data) {
            const shape = {
              type: cwp.shape_type,
              color: cwp.shape_data.color || HATCH_COLORS.primary[0],
              key: cwp.id,
              cwpId: cwp.id,
              codigo: cwp.codigo,
              nombre: cwp.nombre,
              ...cwp.shape_data
            };
            loadedShapes.push(shape);
          }
        });
      });
      
      setShapes(loadedShapes);
      console.log(`✅ [PlotPlan] ${loadedShapes.length} formas cargadas desde BD`);
    };
    
    loadShapesFromDB();
  }, [plotPlan]);

  // Manejo de resize
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => { setSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight }); };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [containerRef.current]);

  // Manejo de teclas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeKey !== null) {
        const newShapes = shapes.filter(s => (s.key || s.cwpId) !== selectedShapeKey);
        setHistory([...history, shapes]);
        setShapes(newShapes);
        setSelectedShapeKey(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedShapeKey, shapes, history]);

  const handleZoom = (scaleFactor) => {
    const newScale = stage.scale * scaleFactor;
    setStage({ ...stage, scale: newScale });
  };
  
  const handleClear = () => {
    if (shapes.length === 0) return;
    if (window.confirm('¿Estás seguro de que quieres limpiar todas las formas?')) {
      setHistory([...history, shapes]);
      setShapes([]);
      setSelectedShapeKey(null);
    }
  };
  
  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setShapes(previousState);
    setHistory(history.slice(0, -1));
    setSelectedShapeKey(null);
  };

  const getCanvasPosition = (e, currentStage) => {
    const pointer = currentStage.getPointerPosition();
    return {
      x: (pointer.x - currentStage.x()) / currentStage.scaleX(),
      y: (pointer.y - currentStage.y()) / currentStage.scaleY(),
    };
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'pan' || !image || e.evt.button !== 0) {
      const didClickOnShape = e.target.findAncestor('Shape');
      if (activeTool === 'pan' && !didClickOnShape) { setSelectedShapeKey(null); }
      return;
    }
    
    setSelectedShapeKey(null);
    const stageInstance = e.target.getStage();
    const pos = getCanvasPosition(e, stageInstance);
    startPoint.current = pos; 
    
    if (activeTool === 'rect' || activeTool === 'circle') {
      setHistory([...history, shapes]);
      setIsDrawing(true);
      setNewShape({ type: activeTool, color: currentColor, key: 'temp', x: pos.x, y: pos.y, width: 0, height: 0, radius: 0 });
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
          if (dist < 15 / stage.scale) {
            setIsDrawingPolygon(false);
            handleSaveShape({ type: 'polygon', color: currentColor, key: shapes.length, points: [...polygonPoints] }); 
            setPolygonPoints([]);
          }
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!image) return;
    const stageInstance = e.target.getStage();
    const pos = getCanvasPosition(e, stageInstance);
    
    if (!isDrawing || isDrawingPolygon || activeTool === 'pan') return;

    if (activeTool === 'rect') {
      setNewShape({ ...newShape, x: Math.min(startPoint.current.x, pos.x), y: Math.min(startPoint.current.y, pos.y), width: Math.abs(pos.x - startPoint.current.x), height: Math.abs(pos.y - startPoint.current.y) });
    }
    if (activeTool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPoint.current.x, 2) + Math.pow(pos.y - startPoint.current.y, 2));
      setNewShape({ ...newShape, x: startPoint.current.x, y: startPoint.current.y, radius: radius });
    }
  };

  const handleMouseUp = (e) => {
    if (!image || activeTool === 'pan') return;
    setIsDrawing(false);
    
    if ((activeTool === 'rect' || activeTool === 'circle') && newShape) {
      if ((newShape.width > 5 || newShape.radius > 5)) {
        handleSaveShape({ ...newShape, key: shapes.length });
      }
      setNewShape(null);
    }
  };

  const handleShapeClick = (clickedKey) => {
    if (activeTool === 'pan') { 
      setSelectedShapeKey(clickedKey);
    }
  };
  
  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) {
        alert("¡ADVERTENCIA! Debes seleccionar un CWA (Área de Construcción) para asociar esta forma.");
        return;
    }

    // Validar que el CWA pertenece al Plot Plan actual
    const cwaPertenecePlotPlan = plotPlan.cwas.some(cwa => cwa.id === cwaToAssociate.id);
    if (!cwaPertenecePlotPlan) {
        alert("❌ El CWA seleccionado no pertenece a este Plot Plan. Por favor selecciona otro.");
        return;
    }

    // Preparar datos de geometría según el tipo de forma
    let shapeData = {};
    if (finalShape.type === 'polygon') {
        shapeData = {
            points: finalShape.points,
            color: finalShape.color
        };
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
        console.log("🔵 [PlotPlan] Creando CWP para la forma...");
        
        // Generar código único para el CWP
        const cwpCode = `${cwaToAssociate.codigo}-CWP${Date.now().toString().slice(-4)}`;
        const cwpName = `Area ${finalShape.type} ${shapes.length + 1}`;
        
        // Usar disciplina_id = 1 por defecto
        const disciplina_id = 1;
        
        // Crear el CWP con la geometría
        const cwpResponse = await axios.post(
            `${API_URL}/awp/cwa/${cwaToAssociate.id}/cwp/?disciplina_id=${disciplina_id}`,
            {
                nombre: cwpName,
                codigo: cwpCode,
                shape_type: finalShape.type,
                shape_data: shapeData
            }
        );
        
        console.log("✅ [PlotPlan] CWP creado con geometría:", cwpResponse.data);
        
        // Actualizar la forma local con el ID del CWP
        const shapeWithCwpId = {
            ...finalShape,
            cwpId: cwpResponse.data.id,
            codigo: cwpCode,
            nombre: cwpName
        };
        
        // Guardar en el estado local
        setShapes(prev => [...prev, shapeWithCwpId]);
        
        // Notificar al padre
        if (onShapeSaved) {
            onShapeSaved(cwaToAssociate.id, cwpResponse.data);
        }
        
        alert(`✅ Área "${cwpName}" guardada correctamente en ${cwaToAssociate.nombre}`);
        
    } catch (error) {
        console.error("🔥 [PlotPlan] Error guardando forma:", error);
        alert("Error al guardar la forma: " + (error.response?.data?.detail || error.message));
    }
  };
  
  // RENDERIZADO
  const renderCanvas = () => {
    if (error) { 
      return <div className="flex items-center justify-center h-full text-red-400">Error cargando imagen</div>;
    }
    if (!image) { 
      return <div className="flex items-center justify-center h-full text-gray-400">Cargando imagen...</div>;
    }
    
    const pos = activeTool === 'polygon' && isDrawingPolygon && stageRef.current ? stageRef.current.getPointerPosition() : null;
    let previewPolyPoints = polygonPoints;
    if (pos && polygonPoints.length > 0) {
        const canvasPos = getCanvasPosition({ target: { getStage: () => stageRef.current } }, stageRef.current);
        previewPolyPoints = [...polygonPoints, canvasPos.x, canvasPos.y];
    }
    
    return (
      <Stage ref={stageRef} width={size.width} height={size.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} draggable={activeTool === 'pan'} scaleX={stage.scale} scaleY={stage.scale} x={stage.x} y={stage.y}>
        <Layer>
          <Image image={image} width={size.width} height={size.height} listening={false} />
          
          {shapes.map(shape => {
            const isSelected = shape.key === selectedShapeKey || shape.cwpId === selectedShapeKey;
            
            const commonProps = {
                fill: `${shape.color}60`,
                stroke: isSelected ? '#00FFFF' : shape.color,
                strokeWidth: isSelected ? (5 / stage.scale) : (3 / stage.scale),
                onClick: () => handleShapeClick(shape.key || shape.cwpId),
                onTap: () => handleShapeClick(shape.key || shape.cwpId),
                cursor: activeTool === 'pan' ? 'pointer' : 'default',
                shadowColor: 'black',
                shadowBlur: isSelected ? 10 : 5,
                shadowOpacity: isSelected ? 0.6 : 0.3,
            };
            
            if (shape.type === 'rect') { return <Rect key={shape.cwpId || shape.key} {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />; }
            if (shape.type === 'circle') { return <Circle key={shape.cwpId || shape.key} {...commonProps} x={shape.x} y={shape.y} radius={shape.radius} />; }
            if (shape.type === 'polygon') { return <Line key={shape.cwpId || shape.key} {...commonProps} points={shape.points} closed={true} />; }
            return null;
          })}
          
          {newShape && activeTool === 'rect' && ( <Rect x={newShape.x} y={newShape.y} width={newShape.width} height={newShape.height} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={3 / stage.scale} dash={[10 / stage.scale, 5 / stage.scale]} /> )}
          {newShape && activeTool === 'circle' && ( <Circle x={newShape.x} y={newShape.y} radius={newShape.radius} fill={`${newShape.color}40`} stroke={newShape.color} strokeWidth={3 / stage.scale} dash={[10 / stage.scale, 5 / stage.scale]} /> )}
          {isDrawingPolygon && previewPolyPoints.length > 0 && (
            <Line 
              points={previewPolyPoints} 
              stroke={currentColor} 
              strokeWidth={3 / stage.scale} 
              dash={[10 / stage.scale, 5 / stage.scale]}
            /> 
          )}
        </Layer>
      </Stage>
    );
  };
  
  let canvasCursor = 'default';
  if (activeTool === 'rect' || activeTool === 'circle') canvasCursor = 'crosshair';
  else if (activeTool === 'polygon') canvasCursor = 'pointer';
  else if (activeTool === 'pan') canvasCursor = 'grab';

  return (
    <div className="bg-gray-800 rounded-lg border-2 border-gray-700 overflow-hidden shadow-2xl">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool}
        color={currentColor}
        setColor={setCurrentColor}
        onZoom={handleZoom}
        onClear={shapes.length > 0 ? handleClear : null}
        onUndo={history.length > 0 ? handleUndo : null}
      />
      
      {/* UI DE ASOCIACIÓN */}
      <div className="p-2 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">CWA Asignado:</span>
          {cwaToAssociate ? (
              <span className="px-3 py-1 bg-green-700 text-white rounded-md text-sm font-semibold">
                  {cwaToAssociate.codigo} ({cwaToAssociate.nombre})
              </span>
          ) : (
              <span className="px-3 py-1 bg-yellow-700 text-black rounded-md text-sm font-semibold animate-pulse">
                  Selecciona un CWA de la tabla inferior
              </span>
          )}
      </div>
      
      <div 
        ref={containerRef} 
        className={`w-full bg-gray-900 cursor-${canvasCursor} focus:outline-none`}
        style={{ height: '500px' }}
        tabIndex={1}
      >
        {renderCanvas()}
      </div>
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 flex justify-between text-xs text-gray-400">
        <span>Formas: {shapes.length}</span>
        <span>Zoom: {Math.round(stage.scale * 100)}%</span>
        <span className="text-gray-500">
          {activeTool === 'polygon' && isDrawingPolygon && 'Click cerca del primer punto para cerrar el polígono'}
          {activeTool === 'pan' && 'Presiona Delete/Backspace para borrar la forma seleccionada'}
        </span>
      </div>
    </div>
  );
}

export default PlotPlan;