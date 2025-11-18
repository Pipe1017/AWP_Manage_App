# backend/app/models.py

from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Date, Float, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# ============================================================================
# 1. PROYECTO Y CONFIGURACIÓN (sin cambios)
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
    
    # ✨ Permitir NULL para tipos genéricos (GEN)
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
    
    # GEOMETRÍA
    shape_type = Column(String(15), nullable=True)
    shape_data = Column(JSON, nullable=True)


class CWP(Base):
    """Construction Work Package - Nivel 1 de la jerarquía AWP"""
    __tablename__ = "cwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(50), unique=True, index=True)  # Auto: CWP-005-01-CIV-0001
    descripcion = Column(Text, nullable=True)
    
    # Relaciones principales
    cwa_id = Column(Integer, ForeignKey("cwa.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))  # ✨ NUEVO: Relación directa
    
    cwa = relationship("CWA", back_populates="cwps")
    disciplina = relationship("Disciplina")  # ✨ NUEVO
    
    # ✨ NUEVO: Relación con Paquetes unificados
    paquetes = relationship("Paquete", back_populates="cwp", cascade="all, delete-orphan")
    
    # CAMPOS DE GESTIÓN
    secuencia = Column(Integer, default=0)
    prioridad = Column(String(10), default="MEDIA")
    
    # CRONOGRAMA
    duracion_dias = Column(Integer, nullable=True)
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    fecha_inicio_real = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    
    # RESTRICCIONES
    restricciones_levantadas = Column(Boolean, default=False)
    restricciones_json = Column(JSON, nullable=True)
    
    # DEPENDENCIAS
    dependencias_origen = relationship("Dependencia", foreign_keys="Dependencia.origen_id", back_populates="origen", cascade="all, delete-orphan")
    dependencias_destino = relationship("Dependencia", foreign_keys="Dependencia.destino_id", back_populates="destino")


# ============================================================================
# ✨ NUEVO: PAQUETE UNIFICADO (reemplaza EWP/IWP/PWP/DWP)
# ============================================================================

class Paquete(Base):
    """
    Paquete de Trabajo Unificado - Nivel 2 de la jerarquía AWP
    Tipos: EWP, IWP, PWP, DWP
    """
    __tablename__ = "paquetes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(100), unique=True, index=True)  # Auto: CWP-005-01-CIV-0001-DWP-001
    descripcion = Column(Text, nullable=True)
    
    # Tipo de paquete
    tipo = Column(String(10), nullable=False)  # 'EWP', 'IWP', 'PWP', 'DWP'
    responsable = Column(String(20), nullable=False)  # 'Firma' o 'Cliente'
    
    # Relaciones
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="paquetes")
    
    items = relationship("Item", back_populates="paquete", cascade="all, delete-orphan")
    
    # CRONOGRAMA Y ESTADO
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    fecha_inicio_real = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    
    # Campos específicos según tipo (JSON flexible)
    metadata = Column(JSON, nullable=True)  # Para datos específicos de cada tipo
    
    # DEPENDENCIAS
    dependencias_origen = relationship("Dependencia", foreign_keys="Dependencia.origen_id", back_populates="origen", cascade="all, delete-orphan")
    dependencias_destino = relationship("Dependencia", foreign_keys="Dependencia.destino_id", back_populates="destino")
    
    # Auditoría
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# ✨ NUEVO: ITEM UNIFICADO (reemplaza EntregableEWP)
# ============================================================================

class Item(Base):
    """
    Item de Trabajo - Nivel 3 de la jerarquía AWP
    Puede ser: Entregable, Tarea, Documento, etc.
    """
    __tablename__ = "items"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(150), unique=True, index=True)  # Auto: CWP-005-01-CIV-0001-DWP-001-PLN-001
    descripcion = Column(Text, nullable=True)
    
    # Tipo de item (viene del catálogo TipoEntregable)
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"))
    tipo_entregable = relationship("TipoEntregable", back_populates="items")
    
    # Responsable
    responsable = Column(String(20), nullable=False)  # 'Firma' o 'Cliente'
    
    # Relaciones
    paquete_id = Column(Integer, ForeignKey("paquetes.id"))
    paquete = relationship("Paquete", back_populates="items")
    
    # ESTADO Y CONTROL
    version = Column(Integer, default=1)
    estado = Column(String(20), default="NO_INICIADO")
    porcentaje_completitud = Column(Float, default=0.0)
    
    # ARCHIVOS Y DOCUMENTOS
    archivo_url = Column(String, nullable=True)
    
    # FLAGS
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)
    
    # Metadata flexible (JSON)
    metadata = Column(JSON, nullable=True)
    
    # DEPENDENCIAS
    dependencias_origen = relationship("Dependencia", foreign_keys="Dependencia.origen_id", back_populates="origen", cascade="all, delete-orphan")
    dependencias_destino = relationship("Dependencia", foreign_keys="Dependencia.destino_id", back_populates="destino")
    
    # Auditoría
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============================================================================
# ✨ NUEVO: SISTEMA UNIFICADO DE DEPENDENCIAS
# ============================================================================

class Dependencia(Base):
    """
    Sistema unificado de dependencias entre:
    - CWP ↔ CWP
    - Paquete ↔ Paquete
    - Item ↔ Item
    - Y mezclas entre niveles si se requiere
    """
    __tablename__ = "dependencias"
    id = Column(Integer, primary_key=True, index=True)
    
    # Tipo de entidades relacionadas
    tipo_origen = Column(String(20), nullable=False)  # 'CWP', 'PAQUETE', 'ITEM'
    origen_id = Column(Integer, nullable=False)
    
    tipo_destino = Column(String(20), nullable=False)
    destino_id = Column(Integer, nullable=False)
    
    # Tipo de dependencia
    tipo_dependencia = Column(String(20), default="FIN-INICIO")  # FIN-INICIO, FIN-FIN, INICIO-INICIO
    lag_dias = Column(Integer, default=0)
    descripcion = Column(Text, nullable=True)
    
    # Relaciones polimórficas (solo para queries, no FK real)
    origen = relationship("CWP", foreign_keys=[origen_id], primaryjoin="Dependencia.origen_id==CWP.id", overlaps="dependencias_origen,dependencias_destino")
    destino = relationship("CWP", foreign_keys=[destino_id], primaryjoin="Dependencia.destino_id==CWP.id", overlaps="dependencias_origen,dependencias_destino")
    
    # Auditoría
    fecha_creacion = Column(DateTime, default=datetime.utcnow)


# ============================================================================
# MANTENER COMPATIBILIDAD (Deprecated - marcar para migración futura)
# ============================================================================
# Mantener temporalmente EWP, PWP, IWP para no romper código existente
# Estos modelos se deprecarán gradualmente

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