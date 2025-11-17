from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# ============================================================================
# DISCIPLINAS (debe ir ANTES de ProyectoResponse)
# ============================================================================

class DisciplinaCreate(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None


class DisciplinaResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# TIPOS DE ENTREGABLES
# ============================================================================

class TipoEntregableCreate(BaseModel):
    nombre: str
    codigo: str
    categoria_awp: str  # CWE, CWI, etc
    descripcion: Optional[str] = None


class TipoEntregableResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    categoria_awp: str
    descripcion: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# CWP (Construction Work Package)
# ============================================================================

class CWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    duracion_dias: Optional[int] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None


class CWPUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    duracion_dias: Optional[int] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    porcentaje_completitud: Optional[float] = None
    estado: Optional[str] = None
    restricciones_levantadas: Optional[bool] = None


class CWPResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    cwa_id: int
    duracion_dias: Optional[int]
    fecha_inicio_prevista: Optional[date]
    fecha_fin_prevista: Optional[date]
    porcentaje_completitud: float
    estado: str
    restricciones_levantadas: bool
    shape_type: Optional[str] = None
    shape_data: Optional[dict] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# CWA (Construction Work Area)
# ============================================================================

class CWACreate(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None
    es_transversal: Optional[bool] = False


class CWAResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    es_transversal: bool
    plot_plan_id: int
    
    class Config:
        from_attributes = True


class CWADetailResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    es_transversal: bool
    cwps: List[CWPResponse] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# PLOT PLAN
# ============================================================================

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
    
    class Config:
        from_attributes = True


class PlotPlanDetailResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    image_url: Optional[str]
    proyecto_id: int
    cwas: List[CWADetailResponse] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# PROYECTO (debe ir DESPUÉS de DisciplinaResponse y PlotPlanDetailResponse)
# ============================================================================

class ProyectoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None


class ProyectoResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    fecha_inicio: Optional[date]
    fecha_fin: Optional[date]
    disciplinas: List[DisciplinaResponse] = []
    plot_plans: List[PlotPlanDetailResponse] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# EWP (Engineering Work Package)
# ============================================================================

class EWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_publicacion_prevista: Optional[date] = None


class EWPResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    cwp_id: int
    porcentaje_completitud: float
    estado: str
    fecha_publicacion_prevista: Optional[date]
    
    class Config:
        from_attributes = True


# ============================================================================
# PWP (Procurement Work Package)
# ============================================================================

class ItemAdquisicionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    especificacion: Optional[str] = None
    cantidad: Optional[float] = None
    unidad: Optional[str] = None


class ItemAdquisicionResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    especificacion: Optional[str]
    cantidad: Optional[float]
    unidad: Optional[str]
    
    class Config:
        from_attributes = True


class PWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_ros_prevista: Optional[date] = None
    items_adquisicion: Optional[List[ItemAdquisicionCreate]] = None


class PWPResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    cwp_id: int
    porcentaje_completitud: float
    estado: str
    fecha_ros_prevista: Optional[date]
    items_adquisicion: List[ItemAdquisicionResponse] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# IWP (Installation Work Package)
# ============================================================================

class ItemInstalacionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    horas_estimadas: Optional[float] = None


class ItemInstalacionResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    horas_estimadas: Optional[float]
    estado: str
    
    class Config:
        from_attributes = True


class IWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cuadrilla_construccion: Optional[str] = None
    fecha_inicio_prevista: Optional[date] = None
    fecha_fin_prevista: Optional[date] = None
    items_instalacion: Optional[List[ItemInstalacionCreate]] = None


class IWPResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    cwp_id: int
    porcentaje_completitud: float
    estado: str
    cuadrilla_construccion: Optional[str]
    fecha_inicio_prevista: Optional[date]
    fecha_fin_prevista: Optional[date]
    items_instalacion: List[ItemInstalacionResponse] = []
    
    class Config:
        from_attributes = True


# ============================================================================
# ENTREGABLES
# ============================================================================

class EntregableEWPCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    tipo_entregable_id: int
    responsable: Optional[str] = None
    es_entregable_cliente: Optional[bool] = False


class EntregableEWPUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    version: Optional[int] = None
    estado_documento: Optional[str] = None
    responsable: Optional[str] = None


class EntregableEWPResponse(BaseModel):
    id: int
    codigo: str
    nombre: str
    descripcion: Optional[str]
    ewp_id: int
    tipo_entregable_id: int
    version: int
    estado_documento: str
    fecha_creacion: datetime
    fecha_ultima_modificacion: datetime
    responsable: Optional[str]
    es_entregable_cliente: bool
    requiere_aprobacion: bool
    
    class Config:
        from_attributes = True


# ============================================================================
# ASIGNACIONES DE DISCIPLINAS
# ============================================================================

class AsignacionDisciplinaCWPCreate(BaseModel):
    disciplina_id: int
    porcentaje_responsabilidad: Optional[float] = 100.0
    persona_responsable: Optional[str] = None
    observaciones: Optional[str] = None


class AsignacionDisciplinaEWPCreate(BaseModel):
    disciplina_id: int
    persona_responsable: Optional[str] = None
    observaciones: Optional[str] = None


class AsignacionDisciplinaResponse(BaseModel):
    id: int
    disciplina_id: int
    persona_responsable: Optional[str]
    observaciones: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# REFERENCIAS A TRANSVERSALES
# ============================================================================

class ReferenciaTransversalCreate(BaseModel):
    ewp_transversal_id: Optional[int] = None
    pwp_transversal_id: Optional[int] = None
    iwp_transversal_id: Optional[int] = None
    debe_completarse: Optional[bool] = True


class ReferenciaTransversalResponse(BaseModel):
    id: int
    cwp_geografico_id: int
    ewp_transversal_id: Optional[int]
    pwp_transversal_id: Optional[int]
    iwp_transversal_id: Optional[int]
    debe_completarse: bool
    completado: bool
    observaciones: Optional[str]
    
    class Config:
        from_attributes = True


# ============================================================================
# DEPENDENCIAS
# ============================================================================

class DependenciaCWPCreate(BaseModel):
    cwp_destino_id: int
    tipo_dependencia: str = "FIN-INICIO"
    duracion_lag_dias: Optional[int] = 0
    descripcion: Optional[str] = None


class DependenciaCWPResponse(BaseModel):
    id: int
    cwp_origen_id: int
    cwp_destino_id: int
    tipo_dependencia: str
    duracion_lag_dias: int
    descripcion: Optional[str]
    
    class Config:
        from_attributes = True