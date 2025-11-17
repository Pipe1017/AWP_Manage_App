from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text, Date, Float, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# ============================================================================
# PROYECTO Y CONFIGURACIÓN
# ============================================================================

class Proyecto(Base):
    __tablename__ = "proyectos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)
    
    # RELACIONES
    plot_plans = relationship("PlotPlan", back_populates="proyecto", cascade="all, delete-orphan")
    disciplinas = relationship("Disciplina", back_populates="proyecto", cascade="all, delete-orphan")
    

class Disciplina(Base):
    """Catálogo maestro de disciplinas del proyecto"""
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)  # ej: "INS", "CIV", "MEC", "ELE"
    descripcion = Column(Text, nullable=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    
    proyecto = relationship("Proyecto", back_populates="disciplinas")
    tipos_entregables = relationship("TipoEntregable", back_populates="disciplina", cascade="all, delete-orphan")
    asignaciones_cwp = relationship("AsignacionDisciplinaCWP", back_populates="disciplina", cascade="all, delete-orphan")
    asignaciones_ewp = relationship("AsignacionDisciplinaEWP", back_populates="disciplina", cascade="all, delete-orphan")


class TipoEntregable(Base):
    """Tipos de entregables por disciplina (P&ID, CALC, PLANO, etc)"""
    __tablename__ = "tipos_entregables"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)  # ej: "P&ID", "CALC", "PLANO"
    categoria_awp = Column(String(10), nullable=False)  # CWE, CWI, etc
    descripcion = Column(Text, nullable=True)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    
    disciplina = relationship("Disciplina", back_populates="tipos_entregables")
    entregables_ewp = relationship("EntregableEWP", back_populates="tipo_entregable")


# ============================================================================
# PLANTILLAS DE CODIFICACIÓN
# ============================================================================

class PlantillasCodificacion(Base):
    """Define patrones de codificación por proyecto"""
    __tablename__ = "plantillas_codificacion"
    id = Column(Integer, primary_key=True, index=True)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"), nullable=False)
    
    patron_cwa = Column(String(100), default="{prefijo}-{numero}-{seccion}")
    patron_cwp = Column(String(100), default="CWP-{cwa_codigo}-{disciplina}-{consecutivo}")
    patron_ewp = Column(String(100), default="EWP-{cwp_codigo}-{consecutivo}")
    patron_pwp = Column(String(100), default="PWP-{cwp_codigo}-{consecutivo}")
    patron_iwp = Column(String(100), default="IWP-{cwp_codigo}-{consecutivo}")
    patron_entregable = Column(String(100), default="{tipo_codigo}-{ewp_codigo}-{consecutivo}")


# ============================================================================
# ESTRUCTURA AWP: PLOT PLAN -> CWA -> CWP -> EWP/PWP/IWP
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
    """Construction Work Area - Área geográfica (o CWA-0000 para transversales)"""
    __tablename__ = "cwa"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(20), unique=True, index=True)  # ej: "CWA(Fijo)-037-01" o "CWA-0000"
    descripcion = Column(Text, nullable=True)
    es_transversal = Column(Boolean, default=False)  # True si es CWA-0000
    
    plot_plan_id = Column(Integer, ForeignKey("plot_plans.id"))
    plot_plan = relationship("PlotPlan", back_populates="cwas")
    cwps = relationship("CWP", back_populates="cwa", cascade="all, delete-orphan")
    
    # GEOMETRÍA (para CWAs geográficas)
    shape_type = Column(String(15), nullable=True)  # 'rect', 'circle', 'polygon'
    shape_data = Column(JSON, nullable=True)


class CWP(Base):
    """Construction Work Package - Paquete de trabajo por disciplina"""
    __tablename__ = "cwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)  # Auto: CWP-037-01-INS-0001
    descripcion = Column(Text, nullable=True)
    
    cwa_id = Column(Integer, ForeignKey("cwa.id"))
    cwa = relationship("CWA", back_populates="cwps")
    
    # Relaciones con paquetes de trabajo
    ewps = relationship("EWP", back_populates="cwp", cascade="all, delete-orphan")
    pwps = relationship("PWP", back_populates="cwp", cascade="all, delete-orphan")
    iwps = relationship("IWP", back_populates="cwp", cascade="all, delete-orphan")
    
    # Referencias a transversales
    referencias_transversales = relationship("ReferenciaTransversal", back_populates="cwp_geografico", cascade="all, delete-orphan")
    
    # Asignaciones de disciplinas
    asignaciones_disciplina = relationship("AsignacionDisciplinaCWP", back_populates="cwp", cascade="all, delete-orphan")
    
    # Dependencias
    dependencias = relationship("DependenciaCWP", foreign_keys="DependenciaCWP.cwp_origen_id", back_populates="cwp_origen")
    
    # CRONOGRAMA Y ESTADO
    duracion_dias = Column(Integer, nullable=True)
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)
    fecha_inicio_real = Column(Date, nullable=True)
    fecha_fin_real = Column(Date, nullable=True)
    porcentaje_completitud = Column(Float, default=0.0)  # 0-100
    estado = Column(String(20), default="NO_INICIADO")  # NO_INICIADO, EN_PROGRESO, COMPLETADO, PAUSADO
    
    # RESTRICCIONES
    restricciones_levantadas = Column(Boolean, default=False)
    restricciones_json = Column(JSON, nullable=True)  # {"restriccion": "descripción"}


class EWP(Base):
    """Engineering Work Package - Paquete de trabajo de ingeniería (relación 1:1 o N:1 con CWP)"""
    __tablename__ = "ewp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)  # Auto: EWP-037-01-INS-0001
    descripcion = Column(Text, nullable=True)
    
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="ewps")
    
    # Disciplina del EWP
    asignaciones_disciplina = relationship("AsignacionDisciplinaEWP", back_populates="ewp", cascade="all, delete-orphan")
    
    # Entregables del EWP
    entregables = relationship("EntregableEWP", back_populates="ewp", cascade="all, delete-orphan")
    
    # ESTADO
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    fecha_publicacion_prevista = Column(Date, nullable=True)
    fecha_publicacion_real = Column(Date, nullable=True)


class PWP(Base):
    """Procurement Work Package - Paquete de trabajo de adquisición (relación N:1 con CWP)"""
    __tablename__ = "pwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)  # Auto: PWP-037-01-0001
    descripcion = Column(Text, nullable=True)
    
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="pwps")
    
    # Items de adquisición
    items_adquisicion = relationship("ItemAdquisicion", back_populates="pwp", cascade="all, delete-orphan")
    
    # ESTADO Y CRONOGRAMA
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    fecha_ros_prevista = Column(Date, nullable=True)  # Release Order Submission
    fecha_ros_real = Column(Date, nullable=True)
    
    # PoC (Proof of Concept) alignment
    alineado_poc = Column(Boolean, default=False)


class ItemAdquisicion(Base):
    """Items en un PWP (equipos, materiales, suministros)"""
    __tablename__ = "items_adquisicion"
    id = Column(Integer, primary_key=True, index=True)
    
    pwp_id = Column(Integer, ForeignKey("pwp.id"))
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    especificacion = Column(Text, nullable=True)
    cantidad = Column(Float, nullable=True)
    unidad = Column(String(20), nullable=True)
    
    pwp = relationship("PWP", back_populates="items_adquisicion")


class IWP(Base):
    """Installation Work Package - Paquete de trabajo de instalación (relación N:1 con CWP)"""
    __tablename__ = "iwp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(30), unique=True, index=True)  # Auto: IWP-037-01-0001
    descripcion = Column(Text, nullable=True)
    
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    cwp = relationship("CWP", back_populates="iwps")
    
    # Items de instalación
    items_instalacion = relationship("ItemInstalacion", back_populates="iwp", cascade="all, delete-orphan")
    
    # ESTADO Y CRONOGRAMA
    porcentaje_completitud = Column(Float, default=0.0)
    estado = Column(String(20), default="NO_INICIADO")
    cuadrilla_construccion = Column(String, nullable=True)  # Disciplina de terreno
    fecha_inicio_prevista = Column(Date, nullable=True)
    fecha_fin_prevista = Column(Date, nullable=True)


class ItemInstalacion(Base):
    """Items en un IWP (trabajos de instalación)"""
    __tablename__ = "items_instalacion"
    id = Column(Integer, primary_key=True, index=True)
    
    iwp_id = Column(Integer, ForeignKey("iwp.id"))
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    horas_estimadas = Column(Float, nullable=True)
    estado = Column(String(20), default="NO_INICIADO")
    
    iwp = relationship("IWP", back_populates="items_instalacion")


class EntregableEWP(Base):
    """Entregables dentro de un EWP (documentos, planos, especificaciones)"""
    __tablename__ = "entregables_ewp"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(50), unique=True, index=True)  # Auto: P&ID-037-01-INS-0001-001
    descripcion = Column(Text, nullable=True)
    
    ewp_id = Column(Integer, ForeignKey("ewp.id"))
    tipo_entregable_id = Column(Integer, ForeignKey("tipos_entregables.id"))
    
    ewp = relationship("EWP", back_populates="entregables")
    tipo_entregable = relationship("TipoEntregable", back_populates="entregables_ewp")
    
    # CONTROL DE DOCUMENTO
    version = Column(Integer, default=1)
    estado_documento = Column(String(20), default="BORRADOR")  # BORRADOR, REVISIÓN, APROBADO, ARCHIVADO
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_ultima_modificacion = Column(DateTime, default=datetime.utcnow)
    responsable = Column(String, nullable=True)
    archivo_url = Column(String, nullable=True)
    
    # TRAZABILIDAD
    es_entregable_cliente = Column(Boolean, default=False)
    requiere_aprobacion = Column(Boolean, default=True)


# ============================================================================
# REFERENCIAS A TRANSVERSALES
# ============================================================================

class ReferenciaTransversal(Base):
    """Vincula CWP geográficos a EWP/PWP/IWP transversales (de CWA-0000)"""
    __tablename__ = "referencias_transversales"
    id = Column(Integer, primary_key=True, index=True)
    
    cwp_geografico_id = Column(Integer, ForeignKey("cwp.id"))  # CWP del área geográfica
    
    # Referencias (una por tipo)
    ewp_transversal_id = Column(Integer, ForeignKey("ewp.id"), nullable=True)
    pwp_transversal_id = Column(Integer, ForeignKey("pwp.id"), nullable=True)
    iwp_transversal_id = Column(Integer, ForeignKey("iwp.id"), nullable=True)
    
    # Para el cálculo de completitud
    debe_completarse = Column(Boolean, default=True)
    completado = Column(Boolean, default=False)
    observaciones = Column(Text, nullable=True)
    
    cwp_geografico = relationship("CWP", back_populates="referencias_transversales")


# ============================================================================
# ASIGNACIONES DE DISCIPLINAS
# ============================================================================

class AsignacionDisciplinaCWP(Base):
    """Vincula disciplinas a CWP"""
    __tablename__ = "asignaciones_disciplina_cwp"
    id = Column(Integer, primary_key=True, index=True)
    
    cwp_id = Column(Integer, ForeignKey("cwp.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    
    porcentaje_responsabilidad = Column(Float, default=100.0)
    persona_responsable = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)
    
    cwp = relationship("CWP", back_populates="asignaciones_disciplina")
    disciplina = relationship("Disciplina", back_populates="asignaciones_cwp")


class AsignacionDisciplinaEWP(Base):
    """Asigna disciplina a EWP (un EWP tiene una disciplina)"""
    __tablename__ = "asignaciones_disciplina_ewp"
    id = Column(Integer, primary_key=True, index=True)
    
    ewp_id = Column(Integer, ForeignKey("ewp.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    
    persona_responsable = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)
    
    ewp = relationship("EWP", back_populates="asignaciones_disciplina")
    disciplina = relationship("Disciplina", back_populates="asignaciones_ewp")


# ============================================================================
# DEPENDENCIAS Y RELACIONES
# ============================================================================

class DependenciaCWP(Base):
    """Define dependencias entre CWP para el cronograma"""
    __tablename__ = "dependencias_cwp"
    id = Column(Integer, primary_key=True, index=True)
    
    cwp_origen_id = Column(Integer, ForeignKey("cwp.id"))
    cwp_destino_id = Column(Integer, ForeignKey("cwp.id"))
    
    tipo_dependencia = Column(String(15), default="FIN-INICIO")  # FIN-INICIO, FIN-FIN, INICIO-INICIO
    duracion_lag_dias = Column(Integer, default=0)
    descripcion = Column(Text, nullable=True)
    
    cwp_origen = relationship("CWP", foreign_keys=[cwp_origen_id], back_populates="dependencias")