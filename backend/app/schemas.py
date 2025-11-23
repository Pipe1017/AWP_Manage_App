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

# --- CWP ---

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
    forecast_inicio: Optional[date] = None
    forecast_fin: Optional[date] = None
    metadata_json: Optional[Dict[str, Any]] = None

# ✅ NUEVO SCHEMA PARA ACTUALIZACIÓN PARCIAL (PATCH)
class CWPUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    # area_id y disciplina_id no se suelen cambiar, pero los ponemos opcionales por si acaso
    area_id: Optional[int] = None 
    disciplina_id: Optional[int] = None
    duracion_dias: Optional[int] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    secuencia: Optional[int] = None
    prioridad: Optional[str] = None
    forecast_inicio: Optional[date] = None
    forecast_fin: Optional[date] = None
    metadata_json: Optional[Dict[str, Any]] = None

class CWPResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    duracion_dias: Optional[int]
    fecha_inicio_prevista: Optional[date]
    fecha_fin_prevista: Optional[date]
    porcentaje_completitud: float
    estado: str
    secuencia: Optional[int]
    prioridad: Optional[str]
    forecast_inicio: Optional[date]
    forecast_fin: Optional[date]
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

# --- 5. METADATOS CUSTOM ---

class ColumnaCreate(BaseModel):
    nombre: str
    tipo_dato: str 
    opciones: Optional[List[str]] = [] 

class ColumnaResponse(BaseModel):
    id: int
    nombre: str
    tipo_dato: str
    proyecto_id: int
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

# --- PAQUETE & ITEM ---

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
    tipo_entregable_id: Optional[int] = None
    es_entregable_cliente: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True
    metadata_json: Optional[dict] = None
    forecast_fin: Optional[date] = None

class ItemUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tipo_entregable_id: Optional[int] = None
    version: Optional[int] = None
    estado: Optional[str] = None
    porcentaje_completitud: Optional[float] = None
    es_entregable_cliente: Optional[bool] = None
    requiere_aprobacion: Optional[bool] = None
    metadata_json: Optional[dict] = None
    forecast_fin: Optional[date] = None

class ItemResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    tipo_entregable_id: Optional[int]
    paquete_id: int
    version: int
    estado: str
    porcentaje_completitud: float
    archivo_url: Optional[str]
    es_entregable_cliente: bool
    requiere_aprobacion: bool
    source_item_id: Optional[int]
    forecast_fin: Optional[date]
    class Config:
        from_attributes = True

class ItemLinkRequest(BaseModel):
    source_item_ids: List[int]

class ItemImportRow(BaseModel):
    id_item: Optional[int] = None
    nombre_item: str
    tipo_codigo: str
    codigo_paquete: str
    descripcion: Optional[str] = None
    es_entregable_cliente: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True
    forecast_fin: Optional[date] = None