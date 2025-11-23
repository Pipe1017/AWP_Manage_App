# backend/app/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Date, Float, Boolean, DateTime, Table
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
    
    plot_plans = relationship("PlotPlan", back_populates="proyecto", cascade="all, delete-orphan")
    disciplinas = relationship("Disciplina", back_populates="proyecto", cascade="all, delete-orphan")


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


# ============================================================================
# ✨ PAQUETE UNIFICADO - CORREGIDO
# ============================================================================

class Paquete(Base):
    """
    Paquete de Trabajo Unificado - Nivel 2 de la jerarquía AWP
    Tipos: EWP, IWP, PWP, DWP
    Código: {TIPO}-{area}-{disciplina}-{consecutivo}
    Ejemplo: EWP-005-01-CIV-0001
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
    
    # ✅ CORREGIDO: metadata -> metadata_json
    metadata_json = Column(JSON, nullable=True)
    
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# ✨ ITEM UNIFICADO - CORREGIDO (SIN CÓDIGO, SIN RESPONSABLE)
# ============================================================================

class Item(Base):
    """
    Item de Trabajo - Nivel 3 de la jerarquía AWP
    NO tiene código automático - usa ID único
    NO tiene responsable - hereda del Paquete padre
    """
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"))
    tipo_entregable = relationship("TipoEntregable", back_populates="items")
    
    paquete_id = Column(Integer, ForeignKey("paquetes.id"))
    paquete = relationship("Paquete", back_populates="items")
    
    version = Column(Integer, default=1)
    estado = Column(String(20), default="NO_INICIADO")
    porcentaje_completitud = Column(Float, default=0.0)
    
    archivo_url = Column(String, nullable=True)
    
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)
    
    # ✅ CORREGIDO: metadata -> metadata_json
    metadata_json = Column(JSON, nullable=True)
    
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# MODELOS DEPRECATED (mantener temporalmente para compatibilidad)
# ============================================================================

class EWP(Base):
    """DEPRECATED: Usar Paquete con tipo='EWP'"""
    __tablename__ = "ewp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    fecha_publicacion_prevista = Column(Date, nullable=True)
    fecha_publicacion_real = Column(Date, nullable=True)


class PWP(Base):
    """DEPRECATED: Usar Paquete con tipo='PWP'"""
    __tablename__ = "pwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    fecha_ros_prevista = Column(Date, nullable=True)
    fecha_ros_real = Column(Date, nullable=True)
    alineado_poc = Column(Boolean, default=False)


class IWP(Base):
    """DEPRECATED: Usar Paquete con tipo='IWP'"""
    __tablename__ = "iwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    cuadrilla_construccion = Column(String, nullable=True)
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)


class EntregableEWP(Base):
    """DEPRECATED: Usar Item"""
    __tablename__ = "entregables_ewp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(50), unique=True, index=True)
    descripcion = Column(Text, nullable=True)
    ewp_id = Column(Integer, ForeignKey("ewp.id"))
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"))
    version = Column(Integer, default=1)
    estado_documento = Column(String(20), default="BORRADOR")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultima_modificacion = Column(DateTime, default=datetime.utcnow)
    responsable = Column(String, nullable=True)
    archivo_url = Column(String, nullable=True)
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)