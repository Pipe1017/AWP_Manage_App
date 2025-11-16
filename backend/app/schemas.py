from pydantic import BaseModel
from typing import List, Optional

# --- Nivel 1 (Sin dependencias) ---
class TipoEntregableBase(BaseModel):
    nombre: str
    codigo: str
    categoria_awp: str 

class TipoEntregableCreate(TipoEntregableBase): pass
class TipoEntregable(TipoEntregableBase):
    id: int
    disciplina_id: int
    class Config: from_attributes = True

class DisciplinaBase(BaseModel):
    nombre: str
    codigo: str
class DisciplinaCreate(DisciplinaBase): pass

class CWPBase(BaseModel):
    nombre: str
    codigo: str
class CWPCreate(CWPBase): pass
class CWP(CWPBase):
    id: int
    cwa_id: int
    class Config: from_attributes = True

class PlotPlanBase(BaseModel):
    nombre: str
class PlotPlanCreate(PlotPlanBase): pass

class ProyectoBase(BaseModel):
    nombre: str
class ProyectoCreate(ProyectoBase): pass

# --- Nivel 2 (Con dependencias) ---
class Disciplina(DisciplinaBase):
    id: int
    proyecto_id: int
    tipos_entregables: List[TipoEntregable] = []
    class Config: from_attributes = True

class CWABase(BaseModel):
    nombre: str
    codigo: str
class CWACreate(CWABase): pass
class CWA(CWABase):
    id: int
    plot_plan_id: int # <-- Actualizado
    cwps: List[CWP] = []
    class Config: from_attributes = True

class PlotPlan(PlotPlanBase):
    id: int
    proyecto_id: int
    image_url: Optional[str] = None
    cwas: List[CWA] = [] # <-- Nuevo
    class Config: from_attributes = True

# --- Nivel 3 (El Nivel Superior) ---
class Proyecto(ProyectoBase):
    id: int
    disciplinas: List[Disciplina] = []
    plot_plans: List[PlotPlan] = [] # <-- Actualizado
    class Config: from_attributes = True