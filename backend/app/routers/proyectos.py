# backend/app/routers/proyectos.py

from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
import os
import shutil
import json
import time
from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/proyectos",
    tags=["Proyectos y Configuración"]
)

# ============================================================================
# 1. ENDPOINTS DE PROYECTOS
# ============================================================================

@router.post("/", response_model=schemas.ProyectoResponse)
def create_proyecto(proyecto: schemas.ProyectoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo proyecto"""
    db_proyecto = crud.get_proyecto_por_nombre(db, nombre=proyecto.nombre)
    if db_proyecto:
        raise HTTPException(status_code=400, detail="El nombre del proyecto ya existe")
    return crud.create_proyecto(db=db, proyecto=proyecto)

@router.get("/", response_model=List[schemas.ProyectoResponse])
def read_proyectos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de proyectos"""
    return crud.get_proyectos(db, skip=skip, limit=limit)

@router.get("/{proyecto_id}", response_model=schemas.ProyectoResponse)
def read_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener un proyecto por ID"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db_proyecto

@router.put("/{proyecto_id}", response_model=schemas.ProyectoResponse)
def update_proyecto(
    proyecto_id: int,
    proyecto_update: schemas.ProyectoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un proyecto existente"""
    print(f"\n{'='*60}")
    print(f"📝 ACTUALIZAR PROYECTO")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Datos: {proyecto_update.model_dump(exclude_unset=True)}")
    
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Actualizar solo los campos proporcionados
    update_data = proyecto_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_proyecto, field, value)
    
    db.commit()
    db.refresh(db_proyecto)
    
    print(f"✅ Proyecto actualizado: {db_proyecto.nombre}")
    print(f"{'='*60}\n")
    
    return db_proyecto

@router.delete("/{proyecto_id}")
def delete_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Eliminar un proyecto"""
    print(f"\n{'='*60}")
    print(f"🗑️ ELIMINAR PROYECTO")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Verificar si tiene datos relacionados
    plot_plans_count = len(db_proyecto.plot_plans)
    disciplinas_count = len(db_proyecto.disciplinas)
    
    if plot_plans_count > 0 or disciplinas_count > 0:
        print(f"⚠️ Proyecto tiene datos relacionados:")
        print(f"   - Plot Plans: {plot_plans_count}")
        print(f"   - Disciplinas: {disciplinas_count}")
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar. El proyecto tiene {plot_plans_count} plot plan(s) y {disciplinas_count} disciplina(s) asociados."
        )
    
    db.delete(db_proyecto)
    db.commit()
    
    print(f"✅ Proyecto eliminado exitosamente")
    print(f"{'='*60}\n")
    
    return {"message": "Proyecto eliminado exitosamente", "id": proyecto_id}

# ============================================================================
# 2. ENDPOINTS DE DISCIPLINAS
# ============================================================================

@router.post("/{proyecto_id}/disciplinas/", response_model=schemas.DisciplinaResponse)
def create_disciplina(
    proyecto_id: int,
    disciplina: schemas.DisciplinaCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva disciplina"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return crud.create_disciplina(db=db, disciplina=disciplina, proyecto_id=proyecto_id)

@router.get("/{proyecto_id}/disciplinas/", response_model=List[schemas.DisciplinaResponse])
def read_disciplinas(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener disciplinas de un proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == proyecto_id).all()

@router.put("/{proyecto_id}/disciplinas/{disciplina_id}", response_model=schemas.DisciplinaResponse)
def update_disciplina(
    proyecto_id: int,
    disciplina_id: int,
    disciplina_update: schemas.DisciplinaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una disciplina"""
    print(f"\n{'='*60}")
    print(f"📝 ACTUALIZAR DISCIPLINA")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Disciplina ID: {disciplina_id}")
    print(f"Datos: {disciplina_update.model_dump(exclude_unset=True)}")
    
    # Verificar proyecto
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Buscar disciplina
    db_disciplina = db.query(models.Disciplina).filter(
        models.Disciplina.id == disciplina_id,
        models.Disciplina.proyecto_id == proyecto_id
    ).first()
    
    if not db_disciplina:
        raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    
    # Actualizar campos
    update_data = disciplina_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_disciplina, field, value)
    
    db.commit()
    db.refresh(db_disciplina)
    
    print(f"✅ Disciplina actualizada: {db_disciplina.nombre}")
    print(f"{'='*60}\n")
    
    return db_disciplina

@router.delete("/{proyecto_id}/disciplinas/{disciplina_id}")
def delete_disciplina(
    proyecto_id: int,
    disciplina_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una disciplina"""
    print(f"\n{'='*60}")
    print(f"🗑️ ELIMINAR DISCIPLINA")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Disciplina ID: {disciplina_id}")
    
    # Verificar proyecto
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Buscar disciplina
    db_disciplina = db.query(models.Disciplina).filter(
        models.Disciplina.id == disciplina_id,
        models.Disciplina.proyecto_id == proyecto_id
    ).first()
    
    if not db_disciplina:
        raise HTTPException(status_code=404, detail="Disciplina no encontrada")
    
    # Verificar si tiene tipos de entregables asociados
    tipos_count = len(db_disciplina.tipos_entregables)
    if tipos_count > 0:
        print(f"⚠️ Disciplina tiene {tipos_count} tipo(s) de entregable asociados")
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar. La disciplina tiene {tipos_count} tipo(s) de entregable asociados."
        )
    
    db.delete(db_disciplina)
    db.commit()
    
    print(f"✅ Disciplina eliminada exitosamente")
    print(f"{'='*60}\n")
    
    return {"message": "Disciplina eliminada exitosamente", "id": disciplina_id}

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
    """Crear un tipo de entregable"""
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
    """Crear un tipo de entregable genérico"""
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
    """Obtener tipos de entregables de un proyecto"""
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
# 4. ENDPOINTS DE PLOT PLANS
# ============================================================================

@router.post("/{proyecto_id}/plot_plans/")
async def create_plot_plan(
    proyecto_id: int,
    nombre: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Crear un nuevo Plot Plan con imagen"""
    print(f"\n{'='*60}")
    print(f"📥 CREATE PLOT PLAN")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Nombre: {nombre}")
    print(f"Archivo: {file.filename}")
    print(f"Content-Type: {file.content_type}")
    print(f"{'='*60}\n")
    
    # Validar proyecto
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    # Validar tipo de archivo
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']
    if file.content_type not in allowed_types:
        print(f"❌ Tipo de archivo rechazado: {file.content_type}")
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido: {file.content_type}"
        )
    
    # Leer contenido del archivo
    file_content = await file.read()
    
    # Validar tamaño (10MB max)
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo muy grande (máx 10MB)")
    
    # Configuración de rutas
    upload_dir = "/app/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generar nombre único
    timestamp = int(time.time())
    safe_filename = file.filename.replace(" ", "_")
    unique_filename = f"{timestamp}_{safe_filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    try:
        # Guardar archivo
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        file_size = os.path.getsize(file_path)
        print(f"✅ Archivo guardado: {file_path} ({file_size} bytes)")
        
        # URL relativa para la BD
        file_url = f"/uploads/{unique_filename}"
        
        # Crear Plot Plan en BD
        db_plot_plan = models.PlotPlan(
            nombre=nombre,
            image_url=file_url,
            proyecto_id=proyecto_id
        )
        db.add(db_plot_plan)
        db.commit()
        db.refresh(db_plot_plan)
        
        print(f"✅ Plot Plan creado: ID={db_plot_plan.id}")
        print(f"   - Nombre: {db_plot_plan.nombre}")
        print(f"   - image_url (BD): {db_plot_plan.image_url}")
        
        # MAPEO: backend (image_url) → frontend (imagen_url)
        result = {
            "id": db_plot_plan.id,
            "nombre": db_plot_plan.nombre,
            "descripcion": db_plot_plan.descripcion,
            "imagen_url": db_plot_plan.image_url,
            "proyecto_id": db_plot_plan.proyecto_id,
            "cwas": []
        }
        
        print(f"📤 Retornando al frontend:")
        print(f"   imagen_url: {result['imagen_url']}")
        print(f"{'='*60}\n")
        
        return result
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Limpiar archivo si hubo error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=500, detail=f"Error creando Plot Plan: {str(e)}")
    
    finally:
        await file.close()

@router.get("/{proyecto_id}/plot_plans/", response_model=List[schemas.PlotPlanResponse])
def read_plot_plans(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener plot plans de un proyecto"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if db_proyecto is None:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return db.query(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).all()

@router.get("/{proyecto_id}/plot_plans/{plot_plan_id}", response_model=dict)
def get_plot_plan_with_cwas(proyecto_id: int, plot_plan_id: int, db: Session = Depends(get_db)):
    """Obtener un plot plan con sus CWAs"""
    print(f"\n{'='*60}")
    print(f"📥 GET PLOT PLAN CON CWAS")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Plot Plan ID: {plot_plan_id}")
    
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_plot_plan = crud.get_plot_plan(db, plot_plan_id)
    if not db_plot_plan or db_plot_plan.proyecto_id != proyecto_id:
        raise HTTPException(status_code=404, detail="Plot Plan no encontrado")
    
    print(f"✅ Plot Plan encontrado:")
    print(f"   - Nombre: {db_plot_plan.nombre}")
    print(f"   - image_url (BD): {db_plot_plan.image_url}")
    
    cwas = crud.get_cwas_por_plot_plan(db, plot_plan_id)
    print(f"   - CWAs: {len(cwas)}")
    
    # MAPEO: backend (image_url) → frontend (imagen_url)
    result = {
        "id": db_plot_plan.id,
        "nombre": db_plot_plan.nombre,
        "descripcion": db_plot_plan.descripcion,
        "imagen_url": db_plot_plan.image_url,
        "proyecto_id": db_plot_plan.proyecto_id,
        "cwas": [
            {
                "id": cwa.id,
                "nombre": cwa.nombre,
                "codigo": cwa.codigo,
                "es_transversal": cwa.es_transversal,
                "prioridad": cwa.prioridad,
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
    
    print(f"📤 Retornando imagen_url: {result['imagen_url']}")
    print(f"{'='*60}\n")
    
    return result

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
    """Crear un CWA"""
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
    """Actualizar un CWA"""
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
    """Eliminar un CWA"""
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
    """Obtener CWAs de un plot plan"""
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
async def update_cwa_geometry(
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
        # Parsear el JSON
        shape_data_dict = json.loads(shape_data)
        
        # Actualizar en BD
        updated_cwa = crud.update_cwa_geometry(db, cwa_id, shape_type, shape_data_dict)
        
        # Devolver respuesta serializada
        return {
            "id": updated_cwa.id,
            "nombre": updated_cwa.nombre,
            "codigo": updated_cwa.codigo,
            "shape_type": updated_cwa.shape_type,
            "shape_data": updated_cwa.shape_data,
            "plot_plan_id": updated_cwa.plot_plan_id,
            "prioridad": updated_cwa.prioridad,
            "es_transversal": updated_cwa.es_transversal
        }
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"JSON inválido en shape_data: {str(e)}")
    except Exception as e:
        print(f"❌ Error en update_cwa_geometry: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# 6. METADATOS CUSTOM
# ============================================================================

@router.post("/{proyecto_id}/config/columnas", response_model=dict)
def crear_columna_personalizada(
    proyecto_id: int,
    columna: schemas.ColumnaCreate,
    db: Session = Depends(get_db)
):
    """Crear una columna personalizada"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    nueva_col = models.CWPColumnaMetadata(
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
    """Obtener columnas personalizadas"""
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    return db.query(models.CWPColumnaMetadata).filter(
        models.CWPColumnaMetadata.proyecto_id == proyecto_id
    ).all()

@router.put("/{proyecto_id}/config/columnas/{columna_id}", response_model=schemas.ColumnaResponse)
def actualizar_columna_personalizada(
    proyecto_id: int,
    columna_id: int,
    columna_update: schemas.ColumnaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una columna personalizada"""
    print(f"\n{'='*60}")
    print(f"📝 ACTUALIZAR COLUMNA")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Columna ID: {columna_id}")
    
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_columna = db.query(models.CWPColumnaMetadata).filter(
        models.CWPColumnaMetadata.id == columna_id,
        models.CWPColumnaMetadata.proyecto_id == proyecto_id
    ).first()
    
    if not db_columna:
        raise HTTPException(status_code=404, detail="Columna no encontrada")
    
    # Actualizar campos
    update_data = columna_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "opciones":
            setattr(db_columna, "opciones_json", value)
        else:
            setattr(db_columna, field, value)
    
    db.commit()
    db.refresh(db_columna)
    
    print(f"✅ Columna actualizada: {db_columna.nombre}")
    print(f"{'='*60}\n")
    
    return db_columna

@router.delete("/{proyecto_id}/config/columnas/{columna_id}")
def eliminar_columna_personalizada(
    proyecto_id: int,
    columna_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una columna personalizada"""
    print(f"\n{'='*60}")
    print(f"🗑️ ELIMINAR COLUMNA")
    print(f"{'='*60}")
    print(f"Proyecto ID: {proyecto_id}")
    print(f"Columna ID: {columna_id}")
    
    db_proyecto = crud.get_proyecto(db, proyecto_id=proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    db_columna = db.query(models.CWPColumnaMetadata).filter(
        models.CWPColumnaMetadata.id == columna_id,
        models.CWPColumnaMetadata.proyecto_id == proyecto_id
    ).first()
    
    if not db_columna:
        raise HTTPException(status_code=404, detail="Columna no encontrada")
    
    db.delete(db_columna)
    db.commit()
    
    print(f"✅ Columna eliminada exitosamente")
    print(f"{'='*60}\n")
    
    return {"message": "Columna eliminada exitosamente", "id": columna_id}