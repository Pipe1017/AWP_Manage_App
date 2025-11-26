import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Image, Rect, Circle, Line } from 'react-konva'; 
import client from '../../../api/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SERVER_URL = API_BASE.replace('/api/v1', '');

// 🎨 PALETA DE COLORES EXTENDIDA
const HATCH_COLORS = {
  primary: [ '#E67E22', '#2E86C1', '#27AE60', '#C0392B', '#8E44AD' ], // Naranja, Azul, Verde, Rojo, Morado
  secondary: [ '#F39C12', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6' ], // Variaciones brillantes
  dark: [ '#D35400', '#21618C', '#1E8449', '#922B21', '#6C3483' ],    // Variaciones oscuras
  earth: [ '#95A5A6', '#7F8C8D', '#34495E', '#2C3E50', '#BDC3C7' ],   // Grises/Metálicos
  warn: [ '#F1C40F', '#1ABC9C', '#E84393', '#2C2C54', '#474787' ]     // Amarillos/Teal/Rosas
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

function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom, onReset, onClearAll, onDeleteSelected, hasSelection, onUndo, canUndo }) { 
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
      
      {/* HERRAMIENTAS */}
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

      {/* ACCIONES */}
      <div className="flex items-center gap-3">
        
        {/* Color Picker */}
        <div className="relative">
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded border border-gray-500 transition-colors"
            title="Color de relleno"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-200 hidden sm:inline">Color</span>
            <span className="text-gray-400 text-[10px]">▼</span>
          </button>
          
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 animate-in fade-in zoom-in duration-200">
              <div className="grid grid-cols-5 gap-2">
                {allColors.map((c, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => { setColor(c); setShowColorPicker(false); }} 
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`} 
                    style={{ backgroundColor: c }} 
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-500"></div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
            <button onClick={() => onZoom(1.2)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Acercar">➕</button>
            <button onClick={() => onZoom(0.8)} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Alejar">➖</button>
            <button onClick={onReset} className="p-2 bg-gray-600 text-gray-300 hover:text-white hover:bg-gray-500 rounded" title="Resetear Vista">⟲</button>
        </div>

        <div className="h-6 w-px bg-gray-500"></div>

        {/* Edición */}
        <div className="flex items-center gap-1">
            <button 
                onClick={onUndo} 
                disabled={!canUndo}
                className={`p-2 rounded transition-colors ${canUndo ? 'text-white hover:bg-gray-600' : 'text-gray-600 cursor-not-allowed'}`} 
                title="Deshacer (Ctrl+Z)"
            >
                ↶
            </button>
            
            {/* Botón Borrar Selección */}
            <button 
                onClick={onDeleteSelected} 
                disabled={!hasSelection}
                className={`p-2 rounded transition-colors flex items-center gap-1 ${hasSelection ? 'bg-red-600 text-white hover:bg-red-500 shadow-sm' : 'text-gray-600 cursor-not-allowed'}`} 
                title="Borrar Área Seleccionada (Supr)"
            >
                <span>🗑️</span>
                <span className="text-xs font-bold hidden lg:inline">Borrar</span>
            </button>

            {/* Botón Borrar Todo */}
            <button 
                onClick={onClearAll} 
                className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded border border-transparent hover:border-red-900/50" 
                title="Limpiar Todo el Plano"
            >
                ☠️
            </button>
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
  
  // Estado principal de formas
  const [shapes, setShapes] = useState([]);
  
  // Historial para Undo
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

  // Sincronización selección externa
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

  // Hotkeys (Undo / Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
        // Ctrl+Z
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            handleUndo();
        }
        // Delete / Backspace
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeKey) {
            e.preventDefault();
            handleDeleteSelected();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeKey, shapes, history]); // Dependencias importantes para que funcione

  // --- ACCIONES DE EDICIÓN ---

  const handleZoom = (scaleFactor) => setStageState(s => ({ ...s, scale: s.scale * scaleFactor }));
  const handleResetZoom = () => setStageState({ scale: 1, x: 0, y: 0 });

  // ✅ UNDO REAL: Restaurar estado anterior
  const handleUndo = () => {
    if(history.length > 0) { 
        const previousShapes = history[history.length-1];
        setShapes(previousShapes); 
        setHistory(prev => prev.slice(0, -1));
        // Nota: El Undo visual no revierte la DB automáticamente en este esquema simple, 
        // pero permite corregir errores antes de cambiar de plano.
        // Para revertir DB se requeriría un endpoint específico de rollback o volver a guardar el estado anterior.
        // Por ahora, asumo que el usuario quiere deshacer la última acción visual.
    }
  };

  const saveToHistory = () => {
    setHistory(prev => [...prev, shapes]);
  };

  // ✅ BORRAR SELECCIONADO (API + LOCAL)
  const handleDeleteSelected = async () => {
    if (!selectedShapeKey) return;
    const shape = shapes.find(s => s.key === selectedShapeKey);
    if (!shape) return;

    if (!confirm(`¿Eliminar el dibujo del área ${shape.codigo}?`)) return;

    try {
        saveToHistory(); // Guardar antes de borrar

        // Enviar geometría vacía al backend para "borrarla"
        const formData = new FormData();
        formData.append('shape_type', ''); 
        formData.append('shape_data', '{}');

        await client.put(
            `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${shape.cwaId}/geometry`,
            formData
        );
        
        // Actualizar local
        setShapes(prev => prev.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
        
        // Notificar padre (para que aparezca la X roja)
        if (onShapeSaved) onShapeSaved(shape.cwaId, null);

    } catch (err) {
        alert("Error al eliminar: " + err.message);
    }
  };

  // ✅ BORRAR TODO (API LOOP + LOCAL)
  const handleClearAll = async () => {
    if (shapes.length === 0) return;
    if(!confirm('⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los dibujos de este plano.')) return;
    
    saveToHistory();
    
    try {
        // Borrar uno por uno en el backend (idealmente habría un endpoint bulk, pero esto funciona)
        for (const shape of shapes) {
            const formData = new FormData();
            formData.append('shape_type', ''); 
            formData.append('shape_data', '{}');
            await client.put(
                `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${shape.cwaId}/geometry`,
                formData
            );
        }

        setShapes([]);
        setSelectedShapeKey(null);
        // Notificar recarga completa
        if (onShapeSaved) onShapeSaved(null, null); 

    } catch (err) {
        alert("Error limpiando: " + err.message);
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
      saveToHistory(); // ✅ GUARDAR ESTADO ANTES DE CAMBIAR

      const formData = new FormData();
      const typeToSend = (finalShape.type === 'ortho' || finalShape.type === 'polygon') ? 'polygon' : finalShape.type;
      
      formData.append('shape_type', typeToSend);
      formData.append('shape_data', JSON.stringify(shapeData));

      await client.put(
        `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`,
        formData
      );
      
      if (onShapeSaved) onShapeSaved(cwaToAssociate.id, null);
      
      const newShapeVisual = { ...finalShape, type: typeToSend, key: Date.now(), ...shapeData, codigo: cwaToAssociate.codigo, nombre: cwaToAssociate.nombre, cwaId: cwaToAssociate.id };
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
      />
      
      <div ref={containerRef} className="w-full relative flex-1 overflow-hidden cursor-crosshair" style={{ backgroundColor: '#262626' }}>
        {!image && <div className="flex items-center justify-center h-full text-white">⏳ Cargando plano...</div>}
        
        {/* Tooltip */}
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
                    strokeWidth: isSel ? (dynamicStroke * 2) : dynamicStroke, 
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