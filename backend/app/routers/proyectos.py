from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/proyectos",
    tags=["Proyectos y Configuración"] # Tag actualizado
)

# --- Endpoints de Proyectos ---
@router.post("/", response_model=schemas.Proyecto)
def create_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto_por_nombre(db, nombre=proyecto.nombre)
    if db_proyecto:
        raise HTTPException(status_code=400, detail="El nombre del proyecto ya existe")
    return crud.create_proyecto(db=db, proyecto=proyecto)

@router.get("/", response_model=List[schemas.Proyecto])
def read_proyectos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_proyectos(db, skip=skip, limit=limit)

@router.get("/{proyecto_id}", response_model=schemas.Proyecto)
def read_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db_proyecto

# --- Endpoints de Configuración (Disciplinas) ---
@router.post("/{proyecto_id}/disciplinas/", response_model=schemas.Disciplina)
def create_disciplina_para_proyecto(
    proyecto_id: int,
    disciplina: schemas.DisciplinaCreate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return crud.create_disciplina(db=db, disciplina=disciplina, proyecto_id=proyecto_id)

# --- Endpoints de Configuración (Tipos de Entregables) ---
# (Movimos la ruta para que sea más limpia)
@router.post("/disciplinas/{disciplina_id}/tipos_entregables/", response_model=schemas.TipoEntregable)
def create_tipo_entregable_para_disciplina(
    disciplina_id: int,
    tipo: schemas.TipoEntregableCreate,
    db: Session = Depends(get_db)
):
    db_disciplina = crud.get_disciplina(db, disciplina_id=disciplina_id)
    if db_disciplina is None:
        raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    return crud.create_tipo_entregable(db=db, tipo=tipo, disciplina_id=disciplina_id)