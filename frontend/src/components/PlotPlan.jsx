import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image, Rect, Circle, Line } from 'react-konva'; 
import { GithubPicker } from 'react-color';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Hook para cargar la imagen de Konva (DEFINICIÓN ÚNICA)
const useImageLoader = (src) => {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!src) { setImage(null); setError(null); return; }
    const img = new window.Image();
    const fullSrc = `${API_URL}${src}`;
    img.src = fullSrc;
    img.crossOrigin = "Anonymous";
    img.onload = () => { setImage(img); setError(null); };
    img.onerror = (err) => { console.error("Error al cargar la imagen:", err, fullSrc); setError(err); };
  }, [src]);
  return { image, error };
};

// --- Componente de la Barra de Herramientas ---
function Toolbar({ activeTool, setActiveTool, color, setColor, onZoom }) { 
  const tools = ['rect', 'circle', 'polygon', 'pan']; 
  
  const getToolName = (tool) => {
    switch (tool) {
      case 'rect': return 'Rectángulo';
      case 'circle': return 'Círculo';
      case 'polygon': return 'Polígono';
      case 'pan': return '✋ Seleccionar/Mover';
      default: return '';
    }
  };
  
  return (
    <div className="p-2 bg-gray-700 flex justify-between items-center">
      <div className="flex items-center">
        {tools.map(tool => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`
              px-3 py-1 mr-2 rounded font-medium
              ${activeTool === tool ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}
              ${tool === 'pan' ? (activeTool === 'pan' ? 'bg-green-600' : 'bg-green-800 hover:bg-green-700') : ''}
            `}
          >
            {getToolName(tool)}
          </button>
        ))}
      </div>
      
      {/* Controles de Zoom */}
      <div className="flex items-center mr-4">
        <button onClick={() => onZoom(1.1)} className="px-3 py-1 bg-gray-600 text-white rounded-l hover:bg-gray-500 font-bold">+</button>
        <button onClick={() => onZoom(0.9)} className="px-3 py-1 bg-gray-600 text-white rounded-r border-l border-gray-700 hover:bg-gray-500 font-bold">-</button>
      </div>
      
      {/* Selector de Color */}
      <div>
        <GithubPicker 
          color={color}
          onChangeComplete={(color) => setColor(color.hex)}
          colors={['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#5300EB']}
          triangle="hide"
        />
      </div>
    </div>
  );
}


function PlotPlan({ plotPlan }) {
  const { image, error } = useImageLoader(plotPlan.image_url);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 384 });
  
  const [activeTool, setActiveTool] = useState('rect');
  const [currentColor, setCurrentColor] = useState('#1273DE');
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [newShape, setNewShape] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const [stage, setStage] = useState({ scale: 1, x: 0, y: 0 });
  const [selectedShapeKey, setSelectedShapeKey] = useState(null);

  // useEffect de 'resize'
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => { setSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight }); };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, [containerRef.current]);

  // useEffect para borrar con teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeKey !== null) {
        setShapes(prev => prev.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
        console.log("Forma borrada:", selectedShapeKey);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedShapeKey, shapes]);

  // Lógica de zoom
  const handleZoom = (scaleFactor) => {
    const newScale = stage.scale * scaleFactor;
    setStage({ ...stage, scale: newScale });
  };
  
  // Función de Precisión: Convierte la posición de la pantalla a posición del Canvas
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
    const stageRef = e.target.getStage();
    const pos = getCanvasPosition(e, stageRef);
    
    startPoint.current = pos; 
    
    if (activeTool === 'rect' || activeTool === 'circle') {
      setIsDrawing(true);
      setNewShape({ type: activeTool, color: currentColor, key: 'temp', x: pos.x, y: pos.y, width: 0, height: 0, radius: 0 });
    }
    if (activeTool === 'polygon') {
      setIsDrawingPolygon(true);
      if (polygonPoints.length === 0) setPolygonPoints([pos.x, pos.y]);
      else setPolygonPoints([...polygonPoints, pos.x, pos.y]);
      if (polygonPoints.length > 2) {
        const firstPoint = { x: polygonPoints[0], y: polygonPoints[1] };
        const dist = Math.sqrt(Math.pow(firstPoint.x - pos.x, 2) + Math.pow(firstPoint.y - pos.y, 2));
        if (dist < 10 / stage.scale) {
          setIsDrawingPolygon(false);
          setShapes(prev => [...prev, { type: 'polygon', color: currentColor, key: prev.length, points: [...polygonPoints] }]);
          setPolygonPoints([]);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!image) return;
    const stageRef = e.target.getStage();
    const pos = getCanvasPosition(e, stageRef);
    
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
        setShapes(prev => [ ...prev, { ...newShape, key: prev.length } ]);
        console.log("Nueva forma dibujada:", newShape);
      }
      setNewShape(null);
    }
  };

  const handleShapeClick = (clickedKey) => {
    if (activeTool === 'pan') { 
      setSelectedShapeKey(clickedKey);
      console.log("Forma seleccionada:", clickedKey);
    }
  };
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    if (isDrawing || isDrawingPolygon) return;
    
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    setStage({ scale: newScale, ...newPos });
  };
  const handleDragEnd = (e) => {
    if (activeTool === 'pan') {
      setStage({ ...stage, x: e.target.x(), y: e.target.y() });
    }
  };
  
  // --- RENDERIZADO ---
  const renderCanvas = () => {
    if (error) { return <div className="flex items-center justify-center h-full text-red-400">Error al cargar la imagen del Plot Plan.</div>; }
    if (!image) { return <div className="flex items-center justify-center h-full text-gray-400">Plot Plan seleccionado no tiene imagen.</div>; }
    
    const pos = isDrawingPolygon ? stageRef.current?.getPointerPosition() : null;
    const previewPolyPoints = pos ? [...polygonPoints, pos.x, pos.y] : polygonPoints;
    
    return (
      <Stage ref={stageRef} width={size.width} height={size.height} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel} draggable={activeTool === 'pan'} onDragEnd={handleDragEnd} scaleX={stage.scale} scaleY={stage.scale} x={stage.x} y={stage.y}>
        <Layer>
          <Image image={image} width={size.width} height={size.height} objectFit="contain" />
          
          {shapes.map(shape => {
            const isSelected = shape.key === selectedShapeKey;
            const commonProps = {
              key: shape.key,
              fill: `${shape.color}80`,
              stroke: isSelected ? '#00FFFF' : shape.color,
              strokeWidth: isSelected ? (4 / stage.scale) : (2 / stage.scale),
              onClick: () => handleShapeClick(shape.key),
              onTap: () => handleShapeClick(shape.key),
              cursor: activeTool === 'pan' ? 'pointer' : 'default',
            };
            if (shape.type === 'rect') { return <Rect {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />; }
            if (shape.type === 'circle') { return <Circle {...commonProps} x={shape.x} y={shape.y} radius={shape.radius} />; }
            if (shape.type === 'polygon') { return <Line {...commonProps} points={shape.points} closed={true} />; }
            return null;
          })}
          
          {newShape && activeTool === 'rect' && ( <Rect x={newShape.x} y={newShape.y} width={newShape.width} height={newShape.height} fill={`${newShape.color}30`} stroke={newShape.color} strokeWidth={2 / stage.scale} dash={[4 / stage.scale, 2 / stage.scale]} /> )}
          {newShape && activeTool === 'circle' && ( <Circle x={newShape.x} y={newShape.y} radius={newShape.radius} fill={`${newShape.color}30`} stroke={newShape.color} strokeWidth={2 / stage.scale} dash={[4 / stage.scale, 2 / stage.scale]} /> )}
          {isDrawingPolygon && ( <Line points={previewPolyPoints} stroke={currentColor} strokeWidth={2 / stage.scale} dash={[4 / stage.scale, 2 / stage.scale]} /> )}
        </Layer>
      </Stage>
    );
  };
  
  const stageRef = useRef(null);
  
  let canvasCursor = 'default';
  if (activeTool === 'rect' || activeTool === 'circle') canvasCursor = 'cursor-crosshair';
  else if (activeTool === 'polygon') canvasCursor = 'cursor-pointer';
  else if (activeTool === 'pan') canvasCursor = 'cursor-grab';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <Toolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool}
        color={currentColor}
        setColor={setCurrentColor}
        onZoom={handleZoom} 
      />
      <div 
        ref={containerRef} 
        className={`w-full h-96 ${canvasCursor} focus:outline-none`}
        tabIndex={1}
      >
        {renderCanvas()}
      </div>
    </div>
  );
}

export default PlotPlan;