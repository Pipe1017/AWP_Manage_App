from sqlalchemy.orm import Session
from . import models, schemas

# --- Proyectos ---
def get_proyecto(db: Session, proyecto_id: int):
    return db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()
def get_proyecto_por_nombre(db: Session, nombre: str):
    return db.query(models.Proyecto).filter(models.Proyecto.nombre == nombre).first()
def get_proyectos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Proyecto).offset(skip).limit(limit).all()
def create_proyecto(db: Session, proyecto: schemas.ProyectoCreate):
    db_proyecto = models.Proyecto(**proyecto.model_dump())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

# --- Disciplinas / Configuración ---
def get_disciplina(db: Session, disciplina_id: int):
    return db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()
def create_disciplina(db: Session, disciplina: schemas.DisciplinaCreate, proyecto_id: int):
    db_disciplina = models.Disciplina(**disciplina.model_dump(), proyecto_id=proyecto_id)
    db.add(db_disciplina)
    db.commit()
    db.refresh(db_disciplina)
    return db_disciplina
def create_tipo_entregable(db: Session, tipo: schemas.TipoEntregableCreate, disciplina_id: int):
    db_tipo = models.TipoEntregable(**tipo.model_dump(), disciplina_id=disciplina_id)
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo

# --- Plot Plans y AWP ---
def get_plot_plan(db: Session, plot_plan_id: int):
    return db.query(models.PlotPlan).filter(models.PlotPlan.id == plot_plan_id).first()

def create_plot_plan(db: Session, plot_plan: schemas.PlotPlanCreate, proyecto_id: int):
    db_plot_plan = models.PlotPlan(**plot_plan.model_dump(), proyecto_id=proyecto_id)
    db.add(db_plot_plan)
    db.commit()
    db.refresh(db_plot_plan)
    return db_plot_plan

def get_cwa(db: Session, cwa_id: int):
    return db.query(models.CWA).filter(models.CWA.id == cwa_id).first()

def create_cwa(db: Session, cwa: schemas.CWACreate, plot_plan_id: int): # <-- Actualizado
    db_cwa = models.CWA(**cwa.model_dump(), plot_plan_id=plot_plan_id) # <-- Actualizado
    db.add(db_cwa)
    db.commit()
    db.refresh(db_cwa)
    return db_cwa

def create_cwp(db: Session, cwp: schemas.CWPCreate, cwa_id: int):
    db_cwp = models.CWP(**cwp.model_dump(), cwa_id=cwa_id)
    db.add(db_cwp)
    db.commit()
    db.refresh(db_cwp)
    return db_cwp