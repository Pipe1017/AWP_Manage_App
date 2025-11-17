from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
import os
import shutil
import json
from datetime import datetime
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
    """Obtener todos los proyectos con sus relaciones"""
    proyectos = crud.get_proyectos(db, skip=skip, limit=limit)
    
    # Para cada proyecto, cargar disciplinas y plot_plans
    resultado = []
    for proyecto in proyectos:
        # Cargar disciplinas
        proyecto.disciplinas = crud.get_disciplinas_por_proyecto(db, proyecto.id)
        
        # Cargar plot plans
        proyecto.plot_plans = crud.get_plot_plans_por_proyecto(db, proyecto.id)
        
        # Para cada plot plan, cargar sus CWAs
        for plot_plan in proyecto.plot_plans:
            plot_plan.cwas = crud.get_cwas_por_plot_plan(db, plot_plan.id)
            
            # Para cada CWA, cargar sus CWPs
            for cwa in plot_plan.cwas:
                cwa.cwps = crud.get_cwps_por_cwa(db, cwa.id)
        
        resultado.append(proyecto)
    
    return resultado


@router.get("/{proyecto_id}", response_model=schemas.ProyectoResponse)
def read_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener proyecto por ID con todas sus relaciones"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Cargar disciplinas
    db_proyecto.disciplinas = crud.get_disciplinas_por_proyecto(db, proyecto_id)
    
    # Cargar plot plans
    db_proyecto.plot_plans = crud.get_plot_plans_por_proyecto(db, proyecto_id)
    
    # Para cada plot plan, cargar sus CWAs
    for plot_plan in db_proyecto.plot_plans:
        plot_plan.cwas = crud.get_cwas_por_plot_plan(db, plot_plan.id)
        
        # Para cada CWA, cargar sus CWPs
        for cwa in plot_plan.cwas:
            cwa.cwps = crud.get_cwps_por_cwa(db, cwa.id)
    
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
    nombre: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Crear plot plan en proyecto con archivo de imagen"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Guardar archivo
    os.makedirs("uploads", exist_ok=True)
    
    # Generar nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"{timestamp}_{file.filename}"
    file_path = f"uploads/{file_name}"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando archivo: {str(e)}")
    
    # Crear plot plan en BD
    plot_plan_data = schemas.PlotPlanCreate(
        nombre=nombre,
        image_url=f"/{file_path}"
    )
    
    return crud.create_plot_plan(db=db, plot_plan=plot_plan_data, proyecto_id=proyecto_id)


@router.get("/{proyecto_id}/plot_plans/", response_model=List[schemas.PlotPlanResponse])
def read_plot_plans(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener plot plans de proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    return db.query(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).all()


@router.get("/{proyecto_id}/plot_plans/{plot_plan_id}", response_model=dict)
def get_plot_plan_with_cwas(proyecto_id: int, plot_plan_id: int, db: Session = Depends(get_db)):
    """Obtener Plot Plan con CWAs y sus CWPs"""
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = crud.get_plot_plan(db, plot_plan_id)
    if not db_plot_plan or db_plot_plan.proyecto_id != proyecto_id:
        raise HTTPException(status_code=404, detail="Plot Plan no encontrado")
    
    cwas = crud.get_cwas_por_plot_plan(db, plot_plan_id)
    
    return {
        "id": db_plot_plan.id,
        "nombre": db_plot_plan.nombre,
        "descripcion": db_plot_plan.descripcion,
        "image_url": db_plot_plan.image_url,
        "proyecto_id": db_plot_plan.proyecto_id,
        "cwas": [
            {
                "id": cwa.id,
                "nombre": cwa.nombre,
                "codigo": cwa.codigo,
                "es_transversal": cwa.es_transversal,
                "shape_type": cwa.shape_type,
                "shape_data": cwa.shape_data,
                "cwps": [
                    {
                        "id": cwp.id,
                        "nombre": cwp.nombre,
                        "codigo": cwp.codigo
                    }
                    for cwp in crud.get_cwps_por_cwa(db, cwa.id)
                ]
            }
            for cwa in cwas
        ]
    }


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


@router.put("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/{cwa_id}/geometry")
def update_cwa_geometry(
    proyecto_id: int,
    plot_plan_id: int,
    cwa_id: int,
    shape_type: str = Form(...),
    shape_data: str = Form(...),
    db: Session = Depends(get_db)
):
    """Actualizar geometría de un CWA"""
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_cwa = crud.get_cwa(db, cwa_id)
    if not db_cwa or db_cwa.plot_plan_id != plot_plan_id:
        raise HTTPException(status_code=404, detail="CWA no encontrado")
    
    try:
        shape_data_dict = json.loads(shape_data)
        updated_cwa = crud.update_cwa_geometry(db, cwa_id, shape_type, shape_data_dict)
        return updated_cwa
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))