from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Proyecto(Base):
    __tablename__ = "proyectos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    
    # RELACIONES
    disciplinas = relationship("Disciplina", back_populates="proyecto")
    # 'plot_plan_url' se ha ido, ahora tenemos una relación:
    plot_plans = relationship("PlotPlan", back_populates="proyecto")

# --- ¡NUEVA TABLA! ---
class PlotPlan(Base):
    __tablename__ = "plot_plans"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False) # ej. "Nivel 1", "Sótano"
    image_url = Column(String, nullable=True) # Aquí guardamos la URL de la imagen
    
    # Vínculo a Proyecto
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    proyecto = relationship("Proyecto", back_populates="plot_plans")

    # Vínculo a CWAs
    cwas = relationship("CWA", back_populates="plot_plan")

class CWA(Base):
    __tablename__ = "cwa"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(20), unique=True, index=True)
    
    # 'proyecto_id' se ha ido, ahora pertenece a un PlotPlan:
    plot_plan_id = Column(Integer, ForeignKey("plot_plans.id"))
    plot_plan = relationship("PlotPlan", back_populates="cwas")
    
    cwps = relationship("CWP", back_populates="cwa")
    
class CWP(Base):
    __tablename__ = "cwp"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(20), unique=True, index=True)
    
    cwa_id = Column(Integer, ForeignKey("cwa.id"))
    cwa = relationship("CWA", back_populates="cwps")

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)
    proyecto_id = Column(Integer, ForeignKey("proyectos.id"))
    proyecto = relationship("Proyecto", back_populates="disciplinas")
    tipos_entregables = relationship("TipoEntregable", back_populates="disciplina")

class TipoEntregable(Base):
    __tablename__ = "tipos_entregables"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(10), nullable=False)
    categoria_awp = Column(String(10), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    disciplina = relationship("Disciplina", back_populates="tipos_entregables")