from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/proyectos",
    tags=["Proyectos y Configuración"]
)

# --- Endpoints de Proyectos ---

@router.post("/", response_model=schemas.ProyectoResponse)
def create_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    """Crear nuevo proyecto"""
    db_proyecto = crud.get_proyecto_por_nombre(db, nombre=proyecto.nombre)
    if db_proyecto:
        raise HTTPException(status_code=400, detail="El nombre del proyecto ya existe")
    return crud.create_proyecto(db=db, proyecto=proyecto)


@router.get("/", response_model=List[schemas.ProyectoResponse])
def read_proyectos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todos los proyectos"""
    return crud.get_proyectos(db, skip=skip, limit=limit)


@router.get("/{proyecto_id}", response_model=schemas.ProyectoResponse)
def read_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener proyecto por ID"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db_proyecto


# --- Endpoints de Disciplinas ---

@router.post("/{proyecto_id}/disciplinas/", response_model=schemas.DisciplinaResponse)
def create_disciplina(
    proyecto_id: int,
    disciplina: schemas.DisciplinaCreate,
    db: Session = Depends(get_db)
):
    """Crear disciplina en proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return crud.create_disciplina(db=db, disciplina=disciplina, proyecto_id=proyecto_id)


@router.get("/{proyecto_id}/disciplinas/", response_model=List[schemas.DisciplinaResponse])
def read_disciplinas(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener disciplinas de proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == proyecto_id).all()


# --- Endpoints de Tipos de Entregables ---

@router.post("/{proyecto_id}/disciplinas/{disciplina_id}/tipos_entregables/", response_model=schemas.TipoEntregableResponse)
def create_tipo_entregable(
    proyecto_id: int,
    disciplina_id: int,
    tipo: schemas.TipoEntregableCreate,
    db: Session = Depends(get_db)
):
    """Crear tipo de entregable en disciplina"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_disciplina = db.query(models.Disciplina).filter(
        models.Disciplina.id == disciplina_id,
        models.Disciplina.proyecto_id == proyecto_id
    ).first()
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    
    return crud.create_tipo_entregable(db=db, tipo=tipo, disciplina_id=disciplina_id)


@router.get("/{proyecto_id}/disciplinas/{disciplina_id}/tipos_entregables/", response_model=List[schemas.TipoEntregableResponse])
def read_tipos_entregables(
    proyecto_id: int,
    disciplina_id: int,
    db: Session = Depends(get_db)
):
    """Obtener tipos de entregables de disciplina"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_disciplina = db.query(models.Disciplina).filter(
        models.Disciplina.id == disciplina_id,
        models.Disciplina.proyecto_id == proyecto_id
    ).first()
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    
    return db.query(models.TipoEntregable).filter(
        models.TipoEntregable.disciplina_id == disciplina_id
    ).all()


# --- Endpoints de Plot Plans ---

@router.post("/{proyecto_id}/plot_plans/", response_model=schemas.PlotPlanResponse)
def create_plot_plan(
    proyecto_id: int,
    plot_plan: schemas.PlotPlanCreate,
    db: Session = Depends(get_db)
):
    """Crear plot plan en proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    return crud.create_plot_plan(db=db, plot_plan=plot_plan, proyecto_id=proyecto_id)


@router.get("/{proyecto_id}/plot_plans/", response_model=List[schemas.PlotPlanResponse])
def read_plot_plans(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener plot plans de proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    return db.query(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).all()


# --- Endpoints de CWA ---

@router.post("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/", response_model=schemas.CWAResponse)
def create_cwa(
    proyecto_id: int,
    plot_plan_id: int,
    cwa: schemas.CWACreate,
    db: Session = Depends(get_db)
):
    """Crear CWA en plot plan"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = db.query(models.PlotPlan).filter(
        models.PlotPlan.id == plot_plan_id,
        models.PlotPlan.proyecto_id == proyecto_id
    ).first()
    if db_plot_plan is None:
        raise HTTPException(status_code=404, detail="Plot plan no encontrado")
    
    # Validar que el código no exista
    db_cwa_existing = db.query(models.CWA).filter(models.CWA.codigo == cwa.codigo).first()
    if db_cwa_existing:
        raise HTTPException(status_code=400, detail="El código del CWA ya existe")
    
    return crud.create_cwa(db=db, cwa=cwa, plot_plan_id=plot_plan_id)


@router.get("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/", response_model=List[schemas.CWAResponse])
def read_cwas(
    proyecto_id: int,
    plot_plan_id: int,
    db: Session = Depends(get_db)
):
    """Obtener CWAs de plot plan"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = db.query(models.PlotPlan).filter(
        models.PlotPlan.id == plot_plan_id,
        models.PlotPlan.proyecto_id == proyecto_id
    ).first()
    if db_plot_plan is None:
        raise HTTPException(status_code=404, detail="Plot plan no encontrado")
    
    return db.query(models.CWA).filter(models.CWA.plot_plan_id == plot_plan_id).all()