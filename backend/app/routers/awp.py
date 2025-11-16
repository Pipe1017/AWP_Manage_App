from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
import shutil

router = APIRouter(
    prefix="/awp", # Prefijo para todas las rutas de AWP
    tags=["AWP (PlotPlans, CWAs, CWPs)"]
)

# --- Endpoint de Plot Plan (¡NUEVO!) ---
@router.post("/proyectos/{proyecto_id}/plotplans/", response_model=schemas.PlotPlan)
def create_plot_plan_and_upload_image(
    proyecto_id: int,
    nombre: str = Form(...), # <-- ¡AQUÍ ESTÁ LA CORRECCIÓN!
    db: Session = Depends(get_db), 
    file: UploadFile = File(...)
):
    """
    Crea un nuevo PlotPlan, sube su imagen y lo asocia al proyecto.
    """
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # 1. Crea el PlotPlan en la base de datos primero
    plot_plan_schema = schemas.PlotPlanCreate(nombre=nombre)
    db_plot_plan = crud.create_plot_plan(db=db, plot_plan=plot_plan_schema, proyecto_id=proyecto_id)

    # 2. Guarda el archivo en disco usando el NUEVO ID del PlotPlan
    file_path_on_disk = f"uploads/{db_plot_plan.id}_{file.filename}"
    file_url = f"/uploads/{db_plot_plan.id}_{file.filename}"

    try:
        with open(file_path_on_disk, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {e}")
    finally:
        file.file.close()

    # 3. Actualiza el PlotPlan con la URL de la imagen
    db_plot_plan.image_url = file_url
    db.add(db_plot_plan)
    db.commit()
    db.refresh(db_plot_plan)

    return db_plot_plan
    return db_plot_plan

# --- Endpoint de CWA (¡NUEVO!) ---
@router.post("/plotplans/{plot_plan_id}/cwa/", response_model=schemas.CWA)
def create_cwa_para_plot_plan(
    plot_plan_id: int,
    cwa: schemas.CWACreate,
    db: Session = Depends(get_db)
):
    """Crea una nueva CWA (Construction Work Area) para un PlotPlan"""
    db_plot_plan = crud.get_plot_plan(db, plot_plan_id=plot_plan_id)
    if db_plot_plan is None:
        raise HTTPException(status_code=404, detail="PlotPlan no encontrado")
    
    return crud.create_cwa(db=db, cwa=cwa, plot_plan_id=plot_plan_id)

# --- Endpoint de CWP (¡NUEVO!) ---
@router.post("/cwa/{cwa_id}/cwp/", response_model=schemas.CWP)
def create_cwp_para_cwa(
    cwa_id: int,
    cwp: schemas.CWPCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuevo CWP (Construction Work Package) para una CWA"""
    db_cwa = crud.get_cwa(db, cwa_id=cwa_id)
    if db_cwa is None:
        raise HTTPException(status_code=404, detail="CWA no encontrada")
    
    return crud.create_cwp(db=db, cwp=cwp, cwa_id=cwa_id)