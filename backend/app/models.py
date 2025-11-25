from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Date, Float, Boolean, DateTime, UniqueConstraint
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
    
    # Cascade delete asegura que si borras proyecto, se borra TODO lo de abajo
    plot_plans = relationship("PlotPlan", back_populates="proyecto", cascade="all, delete-orphan")
    disciplinas = relationship("Disciplina", back_populates="proyecto", cascade="all, delete-orphan")
    columnas_metadata = relationship("CWPColumnaMetadata", backref="proyecto", cascade="all, delete-orphan")

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)
    descripcion = Column(Text, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    
    proyecto = relationship("Proyecto", back_populates="disciplinas")
    tipos_entregables = relationship("TipoEntregable", back_populates="disciplina", cascade="all, delete-orphan")

class TipoEntregable(Base):
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
# 2. ESTRUCTURA AWP
# ============================================================================

class PlotPlan(Base):
    __tablename__ = "plot_plans"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    
    proyecto = relationship("Proyecto", back_populates="plot_plans")
    cwas = relationship("CWA", back_populates="plot_plan", cascade="all, delete-orphan")

class CWA(Base):
    __tablename__ = "cwa"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    # ⚠️ CORRECCIÓN IMPORTANTE: Quitamos unique=True global
    codigo = Column(String(20), index=True) 
    descripcion = Column(Text, nullable=True)
    es_transversal = Column(Boolean, default=False)
    prioridad = Column(String(20), default="MEDIA") 
    
    plot_plan_id = Column(Integer, ForeignKey("plot_plans.id"))
    plot_plan = relationship("PlotPlan", back_populates="cwas")
    cwps = relationship("CWP", back_populates="cwa", cascade="all, delete-orphan")
    shape_type = Column(String(15), nullable=True)
    shape_data = Column(JSON, nullable=True)

    # ✅ SOLUCIÓN: El código debe ser único SOLO dentro del mismo Plot Plan
    __table_args__ = (
        UniqueConstraint('codigo', 'plot_plan_id', name='_cwa_codigo_plot_uc'),
    )

class CWP(Base):
    __tablename__ = "cwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(50), index=True) # Quitamos unique global por seguridad
    descripcion = Column(Text, nullable=True)
    cwa_id = Column(Integer, ForeignKey("cwa.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    cwa = relationship("CWA", back_populates="cwps")
    disciplina = relationship("Disciplina")
    paquetes = relationship("Paquete", back_populates="cwp", cascade="all, delete-orphan")
    
    secuencia = Column(Integer, default=0)
    duracion_dias = Column(Integer, nullable=True)
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    forecast_inicio = Column(Date, nullable=True)
    forecast_fin = Column(Date, nullable=True)
    
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    restricciones_levantadas = Column(Boolean, default=False)
    restricciones_json = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)

    # Un CWP debe ser único dentro de un CWA y Disciplina (opcional, pero buena práctica)
    __table_args__ = (
        UniqueConstraint('codigo', 'cwa_id', name='_cwp_codigo_cwa_uc'),
    )

class Paquete(Base):
    __tablename__ = "paquetes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(100), index=True)
    descripcion = Column(Text, nullable=True)
    tipo = Column(String(10), nullable=False)
    responsable = Column(String(20), nullable=False)
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="paquetes")
    items = relationship("Item", back_populates="paquete", cascade="all, delete-orphan")
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    metadata_json = Column(JSON, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"), nullable=True)
    tipo_entregable = relationship("TipoEntregable", back_populates="items")
    paquete_id = Column(Integer, ForeignKey("paquetes.id"))
    paquete = relationship("Paquete", back_populates="items")
    source_item_id = Column(Integer, ForeignKey("items.id"), nullable=True)
    source_item = relationship("Item", remote_side=[id], backref="linked_items")
    forecast_fin = Column(Date, nullable=True)
    version = Column(Integer, default=1)
    estado = Column(String(20), default="NO_INICIADO")
    porcentaje_completitud = Column(Float, default=0.0)
    archivo_url = Column(String, nullable=True)
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CWPColumnaMetadata(Base):
    __tablename__ = "cwp_columnas_metadata"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    tipo_dato = Column(String, default="TEXTO")
    opciones_json = Column(JSON, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    orden = Column(Integer, default=0)