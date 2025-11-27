import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Image, Rect, Circle, Line, Star, RegularPolygon } from 'react-konva'; 
import client from '../../../api/axios';
import { jsPDF } from 'jspdf';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const SERVER_URL = API_BASE.replace('/api/v1', '');

// 🎨 PALETA DE COLORES
const HATCH_COLORS = {
  primary: [ '#E67E22', '#2E86C1', '#27AE60', '#C0392B', '#8E44AD' ],
  secondary: [ '#F39C12', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6' ],
  dark: [ '#D35400', '#21618C', '#1E8449', '#922B21', '#6C3483' ],
  earth: [ '#95A5A6', '#7F8C8D', '#34495E', '#2C3E50', '#BDC3C7' ],
  warn: [ '#F1C40F', '#1ABC9C', '#E84393', '#2C2C54', '#474787' ]
};
const allColors = [...HATCH_COLORS.primary, ...HATCH_COLORS.secondary, ...HATCH_COLORS.dark, ...HATCH_COLORS.earth, ...HATCH_COLORS.warn];

// 🛠️ ICONOS SVG PROFESIONALES
const Icons = {
  Pan: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, // Usando icono de mover genérico o mano
  Hand: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>,
  Rect: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} /></svg>,
  Circle: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>,
  Poly: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z" /></svg>, // Hexágono rep
  Ortho: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>, // Líneas rectas
  Ruler: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  ZoomIn: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
  ZoomOut: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>,
  Reset: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Undo: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Clear: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Image: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  PDF: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Star: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Diamond: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l-8 8 8 8 8-8-8-8z" /></svg>,
  Triangle: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l10 18H2L12 3z" /></svg>,
  ChevronDown: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>,
  Marker: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
};

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
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  const drawTools = [
    { id: 'pan', name: 'Mover', icon: <Icons.Hand /> },
    { id: 'rect', name: 'Rectángulo', icon: <Icons.Rect /> },
    { id: 'circle', name: 'Círculo', icon: <Icons.Circle /> },
    { id: 'polygon', name: 'Libre', icon: <Icons.Poly /> },     
    { id: 'ortho', name: 'Ortogonal', icon: <Icons.Ruler /> },   
  ];

  const iconTools = [
    { id: 'star', name: 'Estrella', icon: <Icons.Star /> },
    { id: 'diamond', name: 'Rombo', icon: <Icons.Diamond /> },
    { id: 'triangle', name: 'Triángulo', icon: <Icons.Triangle /> },
  ];

  return (
    <div className="p-2 border-b border-gray-600 flex flex-wrap justify-between items-center gap-2" style={{ backgroundColor: '#333333' }}>
      
      <div className="flex items-center gap-3">
        {/* GRUPO 1: DIBUJO */}
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-gray-600">
            {drawTools.map(tool => (
            <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.name}
                className={`px-3 py-2 rounded text-xs font-bold transition-all flex items-center gap-2 ${
                activeTool === tool.id 
                    ? 'bg-hatch-orange text-white shadow-md' 
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
            >
                <span>{tool.icon}</span>
                <span className="hidden xl:inline">{tool.name}</span>
            </button>
            ))}
        </div>

        {/* GRUPO 2: MARCADORES */}
        <div className="relative">
             <button 
                onClick={() => setShowIconPicker(!showIconPicker)} 
                className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors text-xs font-bold ${
                    ['star', 'diamond', 'triangle'].includes(activeTool) 
                    ? 'bg-blue-600 text-white border-blue-400' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                }`}
                title="Marcadores para DWP/Transversales"
            >
                <Icons.Marker />
                <span className="hidden sm:inline">Marcadores</span>
                <Icons.ChevronDown />
            </button>
            
            {showIconPicker && (
                <div className="absolute left-0 top-full mt-2 p-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-36 animate-in fade-in zoom-in duration-200 flex flex-col gap-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase mb-1 px-1">Insertar:</p>
                    {iconTools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => { setActiveTool(tool.id); setShowIconPicker(false); }}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-gray-100 w-full text-left ${activeTool === tool.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'}`}
                        >
                            <span className="text-gray-600">{tool.icon}</span> {tool.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex items-center gap-3">
        
        {/* Color Picker */}
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded border border-gray-500 transition-colors" title="Color">
            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-200 font-medium hidden sm:inline">Color</span>
            <Icons.ChevronDown />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 animate-in fade-in zoom-in duration-200">
              <div className="grid grid-cols-5 gap-2">
                {allColors.map((c, idx) => (<button key={idx} onClick={() => { setColor(c); setShowColorPicker(false); }} className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c }} />))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-600"></div>

        <div className="flex bg-gray-700 rounded border border-gray-600 overflow-hidden">
            <button onClick={onExportPNG} className="px-3 py-1.5 hover:bg-gray-600 text-gray-200 text-xs font-bold border-r border-gray-600 flex gap-1 items-center" title="Imagen PNG">
               <Icons.Image /> PNG
            </button>
            <button onClick={onExportPDF} className="px-3 py-1.5 hover:bg-gray-600 text-hatch-orange text-xs font-bold flex gap-1 items-center" title="Documento PDF">
               <Icons.PDF /> PDF
            </button>
        </div>

        <div className="h-6 w-px bg-gray-600"></div>

        <div className="flex items-center gap-1">
            <button onClick={() => onZoom(1.2)} className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded" title="Acercar"><Icons.ZoomIn /></button>
            <button onClick={() => onZoom(0.8)} className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded" title="Alejar"><Icons.ZoomOut /></button>
            <button onClick={onReset} className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded" title="Resetear"><Icons.Reset /></button>
        </div>

        <div className="flex items-center gap-1 ml-2">
            {onUndo && <button onClick={onUndo} className={`p-2 rounded ${canUndo ? 'text-white hover:bg-gray-600' : 'text-gray-600 cursor-not-allowed'}`} title="Deshacer"><Icons.Undo /></button>}
            {onDeleteSelected && <button onClick={onDeleteSelected} disabled={!hasSelection} className={`p-2 rounded ${hasSelection ? 'text-red-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`} title="Borrar"><Icons.Trash /></button>}
            {onClearAll && <button onClick={onClearAll} className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded" title="Limpiar Todo"><Icons.Clear /></button>}
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
      if (cwa.shape_data) {
          let geometries = [];
          if (Array.isArray(cwa.shape_data)) {
              geometries = cwa.shape_data;
          } else if (typeof cwa.shape_data === 'object' && Object.keys(cwa.shape_data).length > 0) {
              const singleShape = { ...cwa.shape_data, type: cwa.shape_type || 'rect' };
              geometries = [singleShape];
          }
          geometries.forEach((geo, idx) => {
             loadedShapes.push({
                ...geo,
                key: `cwa-${cwa.id}-${idx}-${Date.now()}`, 
                cwaId: cwa.id,
                codigo: cwa.codigo,
                nombre: cwa.nombre,
                type: geo.type || 'rect'
             });
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

  const handleZoom = (scaleFactor) => setStageState(s => ({ ...s, scale: s.scale * scaleFactor }));
  const handleResetZoom = () => setStageState({ scale: 1, x: 0, y: 0 });
  const handleClear = () => { if(confirm('¿Limpiar todas las áreas locales?')) { setHistory([...history, shapes]); setShapes([]); }};
  const handleUndo = () => { if(history.length > 0) { setShapes(history[history.length-1]); setHistory(history.slice(0,-1)); }};
  const saveToHistory = () => { setHistory(prev => [...prev, shapes]); };

  const handleExportImage = () => {
    if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a'); link.download = `PlotPlan_${plotPlan.nombre}.png`; link.href = uri; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    }
  };

  const handleExportPDF = () => {
    if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const pdf = new jsPDF('l', 'px', [imageDim.width, imageDim.height]);
        const width = pdf.internal.pageSize.getWidth(); const height = pdf.internal.pageSize.getHeight();
        pdf.addImage(uri, 'PNG', 0, 0, width, height);
        pdf.save(`PlotPlan_${plotPlan.nombre}.pdf`);
    }
  };

  const getRelativePointerPosition = (node) => {
    const stage = node.getStage(); const pointerPosition = stage.getPointerPosition();
    const stageX = (pointerPosition.x - stage.x()) / stage.scaleX(); const stageY = (pointerPosition.y - stage.y()) / stage.scaleY();
    const relativeX = (stageX - groupX) / scaleRatio; const relativeY = (stageY - groupY) / scaleRatio;
    return { x: relativeX, y: relativeY };
  };

  const handleMouseDown = (e) => {
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

    if (['star', 'diamond', 'triangle'].includes(activeTool)) {
        const defaultSize = 40 / scaleRatio; 
        handleSaveShape({ 
            type: activeTool, 
            color: currentColor, 
            x: pos.x, 
            y: pos.y, 
            width: defaultSize, 
            height: defaultSize,
            radius: defaultSize / 2 
        });
    }
  };

  const handleMouseMove = (e) => {
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
        if (newShape && (Math.abs(newShape.width) > 5 || newShape.radius > 5)) { handleSaveShape(newShape); setNewShape(null); }
    }
  };

  const handleSaveShape = async (finalShape) => {
    if (!cwaToAssociate) { alert("⚠️ Selecciona un CWA arriba para asignar esta área."); setPolygonPoints([]); setIsDrawingPolygon(false); return; }
    
    let shapeData = { ...finalShape };
    delete shapeData.key;

    if (finalShape.type === 'polygon') {
        shapeData = { points: finalShape.points, color: finalShape.color, type: 'polygon' };
    } else if (finalShape.type === 'rect') {
        shapeData = { x: finalShape.x, y: finalShape.y, width: finalShape.width, height: finalShape.height, color: finalShape.color, type: 'rect' };
    } else if (finalShape.type === 'circle') {
        shapeData = { x: finalShape.x, y: finalShape.y, radius: finalShape.radius, color: finalShape.color, type: 'circle' };
    } else {
        shapeData = { x: finalShape.x, y: finalShape.y, radius: finalShape.radius, color: finalShape.color, type: finalShape.type };
    }
    
    const existingShapes = shapes.filter(s => s.cwaId === cwaToAssociate.id).map(s => {
        const { key, cwaId, codigo, nombre, ...rest } = s;
        return rest;
    });

    const newShapeList = [...existingShapes, shapeData];

    try {
      saveToHistory(); 
      const formData = new FormData();
      formData.append('shape_type', 'multi'); 
      formData.append('shape_data', JSON.stringify(newShapeList));

      await client.put(
        `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaToAssociate.id}/geometry`,
        formData
      );
      
      if (onShapeSaved) onShapeSaved(cwaToAssociate.id, null);
      
      const newShapeVisual = { ...shapeData, key: Date.now(), codigo: cwaToAssociate.codigo, nombre: cwaToAssociate.nombre, cwaId: cwaToAssociate.id };
      setShapes(prev => [...prev, newShapeVisual]);

    } catch (error) { alert(`Error al guardar geometría: ${error.message}`); }
  };

  const handleDeleteSelected = async () => {
    if (!selectedShapeKey) return;
    const shapeToDelete = shapes.find(s => s.key === selectedShapeKey);
    if (!shapeToDelete) return;

    if (!confirm(`¿Eliminar esta figura del área ${shapeToDelete.codigo}?`)) return;

    try {
        saveToHistory();
        
        const remainingShapesForCWA = shapes
            .filter(s => s.cwaId === shapeToDelete.cwaId && s.key !== selectedShapeKey)
            .map(s => {
                const { key, cwaId, codigo, nombre, ...rest } = s;
                return rest;
            });

        const formData = new FormData();
        const newType = remainingShapesForCWA.length > 0 ? 'multi' : ''; // 🔥 CLAVE PARA EL CHECK/X
        formData.append('shape_type', newType); 
        formData.append('shape_data', JSON.stringify(remainingShapesForCWA));

        await client.put(
            `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${shapeToDelete.cwaId}/geometry`,
            formData
        );
        
        setShapes(prev => prev.filter(s => s.key !== selectedShapeKey));
        setSelectedShapeKey(null);
        
        if (onShapeSaved) onShapeSaved(shapeToDelete.cwaId, null);

    } catch (err) { alert("Error al eliminar: " + err.message); }
  };

  const handleClearAll = async () => { 
      if (shapes.length === 0) return;
      if(!confirm('⚠️ ¿ESTÁS SEGURO? Esto borrará TODOS los dibujos de este plano.')) return;
      saveToHistory();
      try {
        const uniqueCWAIds = [...new Set(shapes.map(s => s.cwaId))];
        for (const cwaId of uniqueCWAIds) {
             const formData = new FormData();
             formData.append('shape_type', ''); 
             formData.append('shape_data', '[]');
             await client.put(
                `/proyectos/${plotPlan.proyecto_id}/plot_plans/${plotPlan.id}/cwa/${cwaId}/geometry`,
                formData
            );
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
                
                {shapes.map(shape => {
                  const isActivated = activeCWAId === shape.cwaId;
                  const isSel = shape.key === selectedShapeKey;
                  const isHighlighted = isSel || isActivated;

                  const props = { 
                    fill: `${shape.color}60`, 
                    stroke: isSel ? '#00FFFF' : (isActivated ? '#FFFF00' : shape.color), 
                    strokeWidth: isHighlighted ? (dynamicStroke * 2.5) : dynamicStroke, 
                    shadowColor: isHighlighted ? 'black' : null,
                    shadowBlur: isHighlighted ? 10 : 0,
                    onClick: (e) => { 
                        if(e.evt) e.evt.preventDefault();
                        setSelectedShapeKey(shape.key); 
                        if(onShapeClick) onShapeClick(shape.cwaId); 
                    }, 
                    onMouseEnter: (e) => handleShapeMouseEnter(e, shape), 
                    onMouseLeave: handleShapeMouseLeave, 
                  };
                  
                  if(shape.type==='rect') return <Rect key={shape.key} {...props} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                  if(shape.type==='circle') return <Circle key={shape.key} {...props} x={shape.x} y={shape.y} radius={shape.radius} />;
                  if(shape.type==='polygon' || shape.type==='ortho') return <Line key={shape.key} {...props} points={shape.points} closed />;
                  
                  if(shape.type==='star') return <Star key={shape.key} {...props} x={shape.x} y={shape.y} numPoints={5} innerRadius={shape.radius/2} outerRadius={shape.radius} />;
                  if(shape.type==='diamond') return <RegularPolygon key={shape.key} {...props} x={shape.x} y={shape.y} sides={4} radius={shape.radius} />;
                  if(shape.type==='triangle') return <RegularPolygon key={shape.key} {...props} x={shape.x} y={shape.y} sides={3} radius={shape.radius} />;

                  return null;
                })}

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