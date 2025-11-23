# backend/app/routers/proyectos.py

from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
import os
import shutil
import json
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List
# ✅ Importamos todo lo necesario
from .. import models, schemas, crud
from ..database import get_db
from ..models import CWPColumnaMetadata

router = APIRouter(
    prefix="/proyectos",
    tags=["Proyectos y Configuración"]
)

# ============================================================================
# 1. ENDPOINTS DE PROYECTOS
# ============================================================================

@router.post("/", response_model=schemas.ProyectoResponse)
def create_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto_por_nombre(db, nombre=proyecto.nombre)
    if db_proyecto:
        raise HTTPException(status_code=400, detail="El nombre del proyecto ya existe")
    return crud.create_proyecto(db=db, proyecto=proyecto)

@router.get("/", response_model=List[schemas.ProyectoResponse])
def read_proyectos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # ✅ CORRECCIÓN: Simplificación radical.
    # Al devolver los objetos de SQLAlchemy directamente, Pydantic se encarga 
    # de leer las relaciones (disciplinas, plot_plans) automáticamente 
    # gracias a "from_attributes = True" en los schemas.
    return crud.get_proyectos(db, skip=skip, limit=limit)

@router.get("/{proyecto_id}", response_model=schemas.ProyectoResponse)
def read_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    # Igual aquí: No necesitamos rellenar manualmente las listas.
    return db_proyecto

# ============================================================================
# 2. ENDPOINTS DE DISCIPLINAS
# ============================================================================

@router.post("/{proyecto_id}/disciplinas/", response_model=schemas.DisciplinaResponse)
def create_disciplina(
    proyecto_id: int,
    disciplina: schemas.DisciplinaCreate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return crud.create_disciplina(db=db, disciplina=disciplina, proyecto_id=proyecto_id)

@router.get("/{proyecto_id}/disciplinas/", response_model=List[schemas.DisciplinaResponse])
def read_disciplinas(proyecto_id: int, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == proyecto_id).all()

# ============================================================================
# 3. ENDPOINTS DE TIPOS DE ENTREGABLES
# ============================================================================

@router.post("/{proyecto_id}/disciplinas/{disciplina_id}/tipos_entregables/", response_model=schemas.TipoEntregableResponse)
def create_tipo_entregable(
    proyecto_id: int,
    disciplina_id: int,
    tipo: schemas.TipoEntregableCreate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    if not tipo.es_generico:
        db_disciplina = db.query(models.Disciplina).filter(
            models.Disciplina.id == disciplina_id,
            models.Disciplina.proyecto_id == proyecto_id
        ).first()
        if db_disciplina is None:
            raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    
    return crud.create_tipo_entregable(db=db, tipo=tipo, disciplina_id=disciplina_id if not tipo.es_generico else None)

@router.post("/{proyecto_id}/tipos_entregables_genericos/", response_model=schemas.TipoEntregableResponse)
def create_tipo_entregable_generico(
    proyecto_id: int,
    tipo: schemas.TipoEntregableCreate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    tipo.es_generico = True
    tipo.disciplina_id = None
    
    db_tipo = models.TipoEntregable(
        **tipo.model_dump(exclude={'disciplina_id'}),
        disciplina_id=None
    )
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo

@router.get("/{proyecto_id}/tipos_entregables/", response_model=List[schemas.TipoEntregableResponse])
def read_tipos_entregables_proyecto(
    proyecto_id: int,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    tipos_disciplinas = db.query(models.TipoEntregable).join(models.Disciplina).filter(
        models.Disciplina.proyecto_id == proyecto_id
    ).all()
    
    tipos_genericos = db.query(models.TipoEntregable).filter(
        models.TipoEntregable.es_generico == True
    ).all()
    
    return tipos_disciplinas + tipos_genericos

# ============================================================================
# 4. ENDPOINTS DE PLOT PLANS (Rutas Absolutas)
# ============================================================================

@router.post("/{proyecto_id}/plot_plans/", response_model=schemas.PlotPlanResponse)
def create_plot_plan(
    proyecto_id: int,
    nombre: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Configuración de rutas absolutas para evitar errores en Docker
    BASE_DIR = os.getcwd()
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = file.filename.replace(" ", "_")
    file_name = f"{timestamp}_{safe_filename}"
    file_path_absolute = os.path.join(UPLOAD_DIR, file_name)
    file_url_db = f"/uploads/{file_name}"
    
    try:
        print(f"💾 Guardando archivo en: {file_path_absolute}")
        with open(file_path_absolute, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        print(f"❌ Error guardando archivo: {e}")
        raise HTTPException(status_code=500, detail=f"Error guardando archivo: {str(e)}")
    
    plot_plan_data = schemas.PlotPlanCreate(
        nombre=nombre,
        image_url=file_url_db
    )
    
    return crud.create_plot_plan(db=db, plot_plan=plot_plan_data, proyecto_id=proyecto_id)

@router.get("/{proyecto_id}/plot_plans/", response_model=List[schemas.PlotPlanResponse])
def read_plot_plans(proyecto_id: int, db: Session = Depends(get_db)):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db.query(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).all()

@router.get("/{proyecto_id}/plot_plans/{plot_plan_id}", response_model=dict)
def get_plot_plan_with_cwas(proyecto_id: int, plot_plan_id: int, db: Session = Depends(get_db)):
    # Este endpoint devuelve un dict específico con jerarquía, no usamos schema directo
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = crud.get_plot_plan(db, plot_plan_id)
    if not db_plot_plan or db_plot_plan.proyecto_id != proyecto_id:
        raise HTTPException(status_code=404, detail="Plot Plan no encontrado")
    
    # Usamos la función optimizada que ya tiene toda la jerarquía
    cwas = crud.get_cwas_por_plot_plan(db, plot_plan_id)
    
    # Construimos respuesta manual para incluir todo el árbol de dependencias si es necesario
    # o usamos el helper de jerarquía
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

# ============================================================================
# 5. ENDPOINTS DE CWA
# ============================================================================

@router.post("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/", response_model=schemas.CWAResponse)
def create_cwa(
    proyecto_id: int,
    plot_plan_id: int,
    cwa: schemas.CWACreate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = db.query(models.PlotPlan).filter(
        models.PlotPlan.id == plot_plan_id,
        models.PlotPlan.proyecto_id == proyecto_id
    ).first()
    if db_plot_plan is None:
        raise HTTPException(status_code=404, detail="Plot plan no encontrado")
    
    db_cwa_existing = db.query(models.CWA).filter(models.CWA.codigo == cwa.codigo).first()
    if db_cwa_existing:
        raise HTTPException(status_code=400, detail="El código del CWA ya existe")
    
    return crud.create_cwa(db=db, cwa=cwa, plot_plan_id=plot_plan_id)

@router.put("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/{cwa_id}", response_model=schemas.CWAResponse)
def update_cwa(
    proyecto_id: int,
    plot_plan_id: int,
    cwa_id: int,
    cwa_update: schemas.CWAUpdate,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_cwa = crud.get_cwa(db, cwa_id)
    if not db_cwa or db_cwa.plot_plan_id != plot_plan_id:
        raise HTTPException(status_code=404, detail="CWA no encontrado en este plot plan")
    
    try:
        updated_cwa = crud.update_cwa(db, cwa_id, cwa_update)
        return updated_cwa
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/{cwa_id}")
def delete_cwa(
    proyecto_id: int,
    plot_plan_id: int,
    cwa_id: int,
    db: Session = Depends(get_db)
):
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_cwa = crud.get_cwa(db, cwa_id)
    if not db_cwa or db_cwa.plot_plan_id != plot_plan_id:
        raise HTTPException(status_code=404, detail="CWA no encontrado en este plot plan")
    
    cwps_count = len(crud.get_cwps_por_cwa(db, cwa_id))
    if cwps_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar. El CWA tiene {cwps_count} CWP(s) asociado(s)"
        )
    
    try:
        crud.delete_cwa(db, cwa_id)
        return {"message": "CWA eliminado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{proyecto_id}/plot_plans/{plot_plan_id}/cwa/", response_model=List[schemas.CWAResponse])
def read_cwas(
    proyecto_id: int,
    plot_plan_id: int,
    db: Session = Depends(get_db)
):
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

# ============================================================================
# ✨ NUEVO: ENDPOINTS PARA METADATOS DINÁMICOS
# ============================================================================

@router.post("/{proyecto_id}/config/columnas", response_model=dict)
def crear_columna_personalizada(
    proyecto_id: int,
    columna: schemas.ColumnaCreate, # Schema correcto importado de schemas.py
    db: Session = Depends(get_db)
):
    """Crea una nueva definición de metadato para los CWPs del proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    nueva_col = CWPColumnaMetadata(
        nombre=columna.nombre,
        tipo_dato=columna.tipo_dato,
        opciones_json=columna.opciones,
        proyecto_id=proyecto_id
    )
    db.add(nueva_col)
    db.commit()
    db.refresh(nueva_col)
    return {"mensaje": "Columna creada", "id": nueva_col.id, "nombre": nueva_col.nombre}

@router.get("/{proyecto_id}/config/columnas", response_model=List[schemas.ColumnaResponse])
def obtener_columnas_personalizadas(
    proyecto_id: int,
    db: Session = Depends(get_db)
):
    """Obtiene la lista de columnas configuradas"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    return db.query(CWPColumnaMetadata).filter(
        CWPColumnaMetadata.proyecto_id == proyecto_id
    ).all()