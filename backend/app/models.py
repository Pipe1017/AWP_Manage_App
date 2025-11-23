# backend/app/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Date, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# ============================================================================
# 1. PROYECTO Y CONFIGURACIÓN
# ============================================================================

class Proyecto(Base):
    __tablename__ = "proyectos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    
    # Relaciones principales
    plot_plans = relationship("PlotPlan", back_populates="proyecto", cascade="all, delete-orphan")
    disciplinas = relationship("Disciplina", back_populates="proyecto", cascade="all, delete-orphan")
    
    # ✨ NUEVO: Relación para metadatos personalizados
    columnas_metadata = relationship("CWPColumnaMetadata", backref="proyecto", cascade="all, delete-orphan")


class Disciplina(Base):
    """Catálogo maestro de disciplinas del proyecto"""
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)
    descripcion = Column(Text, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    
    proyecto = relationship("Proyecto", back_populates="disciplinas")
    tipos_entregables = relationship("TipoEntregable", back_populates="disciplina", cascade="all, delete-orphan")


class TipoEntregable(Base):
    """Tipos de entregables por disciplina (P&ID, CALC, PLANO, etc)"""
    __tablename__ = "tipos_entregables"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)
    categoria_awp = Column(String(10), nullable=False)
    descripcion = Column(Text, nullable=True)
    
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"), nullable=True)
    es_generico = Column(Boolean, default=False)
    
    disciplina = relationship("Disciplina", back_populates="tipos_entregables")
    items = relationship("Item", back_populates="tipo_entregable")


# ============================================================================
# 2. ESTRUCTURA AWP: PLOT PLAN -> CWA -> CWP -> PAQUETE -> ITEM
# ============================================================================

class PlotPlan(Base):
    """Nivel del proyecto (Ej: Nivel 1, Área Norte)"""
    __tablename__ = "plot_plans"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    
    proyecto = relationship("Proyecto", back_populates="plot_plans")
    cwas = relationship("CWA", back_populates="plot_plan", cascade="all, delete-orphan")


class CWA(Base):
    """Construction Work Area - Área geográfica"""
    __tablename__ = "cwa"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(20), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    es_transversal = Column(Boolean, default=False)
    
    plot_plan_id = Column(Integer, ForeignKey("plot_plans.id"))
    plot_plan = relationship("PlotPlan", back_populates="cwas")
    cwps = relationship("CWP", back_populates="cwa", cascade="all, delete-orphan")
    
    shape_type = Column(String(15), nullable=True)
    shape_data = Column(JSON, nullable=True)


class CWP(Base):
    """Construction Work Package - Nivel 1 de la jerarquía AWP"""
    __tablename__ = "cwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(50), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    
    cwa_id = Column(Integer, ForeignKey("cwa.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    
    cwa = relationship("CWA", back_populates="cwps")
    disciplina = relationship("Disciplina")
    paquetes = relationship("Paquete", back_populates="cwp", cascade="all, delete-orphan")
    
    secuencia = Column(Integer, default=0)
    prioridad = Column(String(10), default="MEDIA")
    
    duracion_dias = Column(Integer, nullable=True)
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    fecha_inicio_real = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    
    restricciones_levantadas = Column(Boolean, default=False)
    restricciones_json = Column(JSON, nullable=True)
    
    # ✨ Aquí se guardarán los valores de las columnas personalizadas (Ej: {"Fase": "Parada"})
    metadata_json = Column(JSON, nullable=True)


class Paquete(Base):
    """
    Paquete de Trabajo Unificado - Nivel 2 de la jerarquía AWP
    Tipos: EWP, IWP, PWP, DWP
    """
    __tablename__ = "paquetes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(100), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    
    tipo = Column(String(10), nullable=False)  # 'EWP', 'IWP', 'PWP', 'DWP'
    responsable = Column(String(20), nullable=False)  # 'Firma' o 'Cliente'
    
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="paquetes")
    
    items = relationship("Item", back_populates="paquete", cascade="all, delete-orphan")
    
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    fecha_inicio_real = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    
    metadata_json = Column(JSON, nullable=True)
    
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# ✨ ITEM ACTUALIZADO (Opcionalidad y Vínculos)
# ============================================================================

class Item(Base):
    """
    Item de Trabajo - Nivel 3 de la jerarquía AWP
    """
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    
    # ✅ CAMBIO: Ahora es nullable (Opcional al inicio)
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"), nullable=True)
    tipo_entregable = relationship("TipoEntregable", back_populates="items")
    
    paquete_id = Column(Integer, ForeignKey("paquetes.id"))
    paquete = relationship("Paquete", back_populates="items")
    
    # ✅ CAMBIO: Referencia a otro item (para Transversales)
    # Si esto tiene valor, este item es un "vínculo" o "call-off" del original
    source_item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    source_item = relationship("Item", remote_side=[id], backref="linked_items")
    
    version = Column(Integer, default=1)
    estado = Column(String(20), default="NO_INICIADO")
    porcentaje_completitud = Column(Float, default=0.0)
    archivo_url = Column(String, nullable=True)
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)
    
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# ✨ NUEVO: CONFIGURACIÓN DE METADATOS (Columnas Dinámicas)
# ============================================================================

class CWPColumnaMetadata(Base):
    __tablename__ = "cwp_columnas_metadata"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo_dato = Column(String, default="TEXTO")
    opciones_json = Column(JSON, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    orden = Column(Integer, default=0)