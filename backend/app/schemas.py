# backend/app/schemas.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# --- 1. BASES SIMPLES ---

class DisciplinaBase(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None

class DisciplinaCreate(DisciplinaBase):
    pass

class DisciplinaResponse(DisciplinaBase):
    id: int
    proyecto_id: int
    class Config:
        from_attributes = True

# --- 2. ESTRUCTURA AWP ---

class CWACreate(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None
    es_transversal: Optional[bool] = False
    shape_type: Optional[str] = None
    shape_data: Optional[Dict[str, Any]] = None

class CWAUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    codigo: Optional[str] = None
    es_transversal: Optional[bool] = None

class CWPResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    porcentaje_completitud: float
    estado: str
    metadata_json: Optional[Dict[str, Any]] = None
    class Config:
        from_attributes = True

class CWAResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    es_transversal: bool
    plot_plan_id: int
    shape_type: Optional[str]
    shape_data: Optional[Dict[str, Any]]
    cwps: List[CWPResponse] = []
    class Config:
        from_attributes = True

# --- 3. PLOT PLAN ---

class PlotPlanCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    image_url: Optional[str] = None

class PlotPlanResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    image_url: Optional[str]
    proyecto_id: int
    cwas: List[CWAResponse] = []
    class Config:
        from_attributes = True

# --- 4. TIPOS ENTREGABLES ---

class TipoEntregableCreate(BaseModel):
    nombre: str
    codigo: str
    categoria_awp: str
    descripcion: Optional[str] = None
    disciplina_id: Optional[int] = None
    es_generico: Optional[bool] = False

class TipoEntregableResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    categoria_awp: str
    descripcion: Optional[str]
    disciplina_id: Optional[int]
    es_generico: bool
    class Config:
        from_attributes = True

# ==========================================
# 5. METADATOS CUSTOM (CORREGIDO)
# ==========================================

class ColumnaCreate(BaseModel):
    nombre: str
    tipo_dato: str # TEXTO, SELECCION
    opciones: Optional[List[str]] = [] # Frontend envía "opciones"

class ColumnaResponse(BaseModel):
    id: int
    nombre: str
    tipo_dato: str
    proyecto_id: int
    # ✅ CORRECCIÓN: Mapeamos explícitamente el campo de la BD
    opciones_json: Optional[List[str]] = [] 
    
    class Config:
        from_attributes = True

# --- 6. PROYECTO ---

class ProyectoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

class ProyectoCreate(ProyectoBase):
    pass

class ProyectoResponse(ProyectoBase):
    id: int
    disciplinas: List[DisciplinaResponse] = []
    plot_plans: List[PlotPlanResponse] = []
    
    class Config:
        from_attributes = True

# --- OTROS ---

class CWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    area_id: int
    disciplina_id: int
    duracion_dias: Optional[int] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    secuencia: Optional[int] = 0
    prioridad: Optional[str] = "MEDIA"
    metadata_json: Optional[Dict[str, Any]] = None

class PaqueteCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo: str
    responsable: str
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    metadata_json: Optional[dict] = None

class PaqueteUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    responsable: Optional[str] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    estado: Optional[str] = None
    porcentaje_completitud: Optional[float] = None
    metadata_json: Optional[dict] = None

class PaqueteResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    tipo: str
    responsable: str
    cwp_id: int
    porcentaje_completitud: float
    estado: str
    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    # ✅ CAMBIO: Ahora es opcional
    tipo_entregable_id: Optional[int] = None 
    es_entregable_cliente: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True
    metadata_json: Optional[dict] = None

class ItemUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    # ✅ CAMBIO: Permitimos actualizar el tipo
    tipo_entregable_id: Optional[int] = None
    version: Optional[int] = None
    estado: Optional[str] = None
    porcentaje_completitud: Optional[float] = None
    es_entregable_cliente: Optional[bool] = None
    requiere_aprobacion: Optional[bool] = None
    metadata_json: Optional[dict] = None

class ItemResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    tipo_entregable_id: Optional[int] # Ahora es Optional
    paquete_id: int
    version: int
    estado: str
    porcentaje_completitud: float
    archivo_url: Optional[str]
    es_entregable_cliente: bool
    requiere_aprobacion: bool
    source_item_id: Optional[int] # Nuevo campo
    
    class Config:
        from_attributes = True

class ItemLinkRequest(BaseModel):
    source_item_ids: List[int] # Lista de IDs de los items transversales a traer

class ItemImportRow(BaseModel):
    id_item: Optional[int] = None
    nombre_item: str
    tipo_codigo: str
    codigo_paquete: str
    descripcion: Optional[str] = None
    es_entregable_cliente: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True