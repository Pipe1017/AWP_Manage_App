from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..services.codificador import CodificadorAWP
from pydantic import BaseModel as PydanticBaseModel # Importado para las clases de Pydantic

router = APIRouter(
    prefix="/awp",
    tags=["Estructura AWP"]
)

# ============================================================================
# CWP (Construction Work Package)
# ============================================================================

@router.post("/cwa/{cwa_id}/cwp", response_model=schemas.CWPResponse)
def create_cwp(
    cwa_id: int,
    cwp: schemas.CWPCreate,
    disciplina_id: int,
    db: Session = Depends(get_db)
):
    """Crear CWP en CWA. Auto-genera código."""
    try:
        db_cwp = crud.create_cwp(db, cwp, cwa_id, disciplina_id)
        return db_cwp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwa/{cwa_id}/cwp", response_model=List[schemas.CWPResponse])
def read_cwps(cwa_id: int, db: Session = Depends(get_db)):
    """Obtener CWPs de un CWA"""
    db_cwa = crud.get_cwa(db, cwa_id)
    if not db_cwa:
        raise HTTPException(status_code=404, detail="CWA no encontrado")
    
    return crud.get_cwps_por_cwa(db, cwa_id)


@router.put("/cwp/{cwp_id}", response_model=schemas.CWPResponse)
def update_cwp(
    cwp_id: int,
    cwp_update: schemas.CWPUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar CWP (usado por update_cwp y actualizar_metadata_cwp)"""
    try:
        return crud.update_cwp(db, cwp_id, cwp_update)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/cwp/{cwp_id}/completitud")
def get_completitud_cwp(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener completitud de CWP (considerando transversales)"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    completitud = crud.calcular_completitud_cwp(db, cwp_id)
    return {"cwp_id": cwp_id, "completitud": completitud}


# ============================================================================
# EWP (Engineering Work Package)
# ============================================================================

@router.post("/cwp/{cwp_id}/ewp", response_model=schemas.EWPResponse)
def create_ewp(
    cwp_id: int,
    ewp: schemas.EWPCreate,
    disciplina_id: int,
    db: Session = Depends(get_db)
):
    """Crear EWP en CWP. Auto-genera código."""
    try:
        db_ewp = crud.create_ewp(db, ewp, cwp_id, disciplina_id)
        return db_ewp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/ewp", response_model=List[schemas.EWPResponse])
def read_ewps(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener EWPs de un CWP"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_ewps_por_cwp(db, cwp_id)


# ============================================================================
# PWP (Procurement Work Package)
# ============================================================================

@router.post("/cwp/{cwp_id}/pwp", response_model=schemas.PWPResponse)
def create_pwp(
    cwp_id: int,
    pwp: schemas.PWPCreate,
    db: Session = Depends(get_db)
):
    """Crear PWP en CWP. Auto-genera código."""
    try:
        db_pwp = crud.create_pwp(db, pwp, cwp_id)
        return db_pwp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/pwp", response_model=List[schemas.PWPResponse])
def read_pwps(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener PWPs de un CWP"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_pwps_por_cwp(db, cwp_id)


# ============================================================================
# IWP (Installation Work Package)
# ============================================================================

@router.post("/cwp/{cwp_id}/iwp", response_model=schemas.IWPResponse)
def create_iwp(
    cwp_id: int,
    iwp: schemas.IWPCreate,
    db: Session = Depends(get_db)
):
    """Crear IWP en CWP. Auto-genera código."""
    try:
        db_iwp = crud.create_iwp(db, iwp, cwp_id)
        return db_iwp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/iwp", response_model=List[schemas.IWPResponse])
def read_iwps(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener IWPs de un CWP"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_iwps_por_cwp(db, cwp_id)


# ============================================================================
# ENTREGABLES EWP
# ============================================================================

@router.post("/ewp/{ewp_id}/entregables", response_model=schemas.EntregableEWPResponse)
def create_entregable(
    ewp_id: int,
    entregable: schemas.EntregableEWPCreate,
    db: Session = Depends(get_db)
):
    """Crear entregable en EWP. Auto-genera código."""
    try:
        db_entregable = crud.create_entregable_ewp(db, entregable, ewp_id)
        return db_entregable
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/ewp/{ewp_id}/entregables", response_model=List[schemas.EntregableEWPResponse])
def read_entregables(ewp_id: int, db: Session = Depends(get_db)):
    """Obtener entregables de un EWP"""
    db_ewp = crud.get_ewp(db, ewp_id)
    if not db_ewp:
        raise HTTPException(status_code=404, detail="EWP no encontrado")
    
    return crud.get_entregables_por_ewp(db, ewp_id)

# (Aquí irían los endpoints PUT y DELETE para entregables que tenías)
@router.put("/entregables/{entregable_id}", response_model=schemas.EntregableEWPResponse)
def actualizar_entregable(
    entregable_id: int,
    entregable_update: schemas.EntregableEWPUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar entregable"""
    db_entregable = crud.get_entregable_ewp(db, entregable_id)
    if not db_entregable:
        raise HTTPException(status_code=404, detail="Entregable no encontrado")
    
    # (La lógica de actualización estaría en crud.update_entregable)
    return crud.update_entregable(db, db_entregable, entregable_update)


@router.delete("/entregables/{entregable_id}")
def eliminar_entregable(
    entregable_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar entregable"""
    try:
        crud.eliminar_entregable(db, entregable_id)
        return {"message": "Entregable eliminado exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ============================================================================
# REFERENCIAS A TRANSVERSALES
# ============================================================================

@router.get("/proyecto/{proyecto_id}/transversales")
def listar_transversales_disponibles(proyecto_id: int, db: Session = Depends(get_db)):
    """
    Listar EWP, PWP, IWP transversales disponibles para asociar.
    Estos están en CWA-0000 (área transversal).
    """
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    transversales = crud.listar_transversales_disponibles(db, proyecto_id)
    
    return {
        "proyecto_id": proyecto_id,
        "ewps_transversales": [
            {
                "id": ewp.id,
                "codigo": ewp.codigo,
                "nombre": ewp.nombre,
                "cwp_id": ewp.cwp_id
            }
            for ewp in transversales["ewps"]
        ],
        "pwps_transversales": [
            {
                "id": pwp.id,
                "codigo": pwp.codigo,
                "nombre": pwp.nombre,
                "cwp_id": pwp.cwp_id
            }
            for pwp in transversales["pwps"]
        ],
        "iwps_transversales": [
            {
                "id": iwp.id,
                "codigo": iwp.codigo,
                "nombre": iwp.nombre,
                "cwp_id": iwp.cwp_id
            }
            for iwp in transversales["iwps"]
        ]
    }


@router.post("/cwp/{cwp_id}/referencias_transversales", response_model=schemas.ReferenciaTransversalResponse)
def create_referencia_transversal(
    cwp_id: int,
    referencia: schemas.ReferenciaTransversalCreate,
    db: Session = Depends(get_db)
):
    """Asociar transversales a CWP geográfico"""
    try:
        db_referencia = crud.crear_referencia_transversal(db, cwp_id, referencia)
        return db_referencia
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/referencias_transversales", response_model=List[schemas.ReferenciaTransversalResponse])
def read_referencias_transversales(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener referencias transversales de CWP"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_referencias_transversales(db, cwp_id)


@router.post("/cwp/{cwp_id}/referencias_transversales/bulk")
def crear_referencias_bulk(
    cwp_id: int,
    referencias: List[schemas.ReferenciaTransversalCreate],
    db: Session = Depends(get_db)
):
    """
    Asociar múltiples transversales a un CWP de forma masiva.
    Ideal para aplicar transversales a varios CWP sin hacerlo uno por uno.
    """
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    try:
        created_referencias = []
        for ref in referencias:
            db_ref = crud.crear_referencia_transversal(db, cwp_id, ref)
            created_referencias.append(db_ref)
        
        return {
            "cwp_id": cwp_id,
            "referencias_creadas": len(created_referencias),
            "referencias": created_referencias
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# JERARQUÍA COMPLETA
# ============================================================================

@router.get("/plot_plans/{plot_plan_id}/jerarquia")
def obtener_jerarquia_completa(plot_plan_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la jerarquía completa de un Plot Plan:
    PlotPlan -> CWA -> CWP -> EWP/PWP/IWP -> Entregables + Referencias Transversales
    """
    try:
        jerarquia = crud.obtener_jerarquia_completa(db, plot_plan_id)
        return jerarquia
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/cwa/{cwa_id}/resumen")
def obtener_resumen_cwa(cwa_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un resumen rápido de un CWA.
    """
    db_cwa = crud.get_cwa(db, cwa_id)
    if not db_cwa:
        raise HTTPException(status_code=404, detail="CWA no encontrado")
    
    # (La lógica de resumen estaría en crud)
    return crud.obtener_resumen_cwa(db, cwa_id)


@router.get("/proyecto/{proyecto_id}/resumen_awp")
def obtener_resumen_proyecto_awp(proyecto_id: int, db: Session = Depends(get_db)):
    """
    Resumen general del AWP del proyecto.
    """
    db_proyecto = crud.get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    # (La lógica de resumen estaría en crud)
    return crud.obtener_resumen_proyecto_awp(db, proyecto_id)


# ============================================================================
# SECUENCIACIÓN, METADATA, DEPENDENCIAS DE CWPs
# ============================================================================

# (Clases Pydantic locales para datos específicos)
class PrioridadUpdate(PydanticBaseModel):
    prioridad: str  # ALTA, MEDIA, BAJA

class RestriccionUpdate(PydanticBaseModel):
    restricciones_json: dict
    restricciones_levantadas: bool = False

@router.put("/cwp/{cwp_id}/secuencia")
def actualizar_secuencia(
    cwp_id: int,
    secuencia: int,
    db: Session = Depends(get_db)
):
    """Actualizar la secuencia de un CWP"""
    try:
        db_cwp = crud.actualizar_secuencia_cwp(db, cwp_id, secuencia)
        return {"cwp_id": cwp_id, "nueva_secuencia": secuencia, "codigo": db_cwp.codigo}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/cwa/{cwa_id}/reordenar")
def reordenar_cwps(
    cwa_id: int,
    nuevas_secuencias: dict, # Body: {"1": 1, "2": 2} (cwp_id: secuencia)
    db: Session = Depends(get_db)
):
    """Reordenar todos los CWPs de un CWA."""
    try:
        secuencias_int = {int(k): v for k, v in nuevas_secuencias.items()}
        crud.reordenar_cwps_por_cwa(db, cwa_id, secuencias_int)
        return {"cwa_id": cwa_id, "message": "CWPs reordenados exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/cwp/{cwp_id}/metadata", response_model=schemas.CWPResponse)
def actualizar_metadata_cwp(
    cwp_id: int,
    cwp_update: schemas.CWPUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar metadata completa de un CWP (fechas, prioridad, restricciones, etc)"""
    try:
        db_cwp = crud.update_cwp(db, cwp_id, cwp_update)
        return db_cwp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/cwp/{cwp_id}/restricciones", response_model=schemas.CWPResponse)
def actualizar_restricciones(
    cwp_id: int,
    restricciones: RestriccionUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar solo las restricciones de un CWP."""
    try:
        db_cwp = crud.actualizar_restricciones_cwp(
            db, 
            cwp_id, 
            restricciones.restricciones_json, 
            restricciones.restricciones_levantadas
        )
        return db_cwp
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/cwp/{cwp_id}/prioridad")
def actualizar_prioridad(
    cwp_id: int,
    prioridad_update: PrioridadUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar prioridad de un CWP"""
    if prioridad_update.prioridad not in ["ALTA", "MEDIA", "BAJA"]:
        raise HTTPException(status_code=400, detail="Prioridad debe ser ALTA, MEDIA o BAJA")
    
    try:
        db_cwp = crud.actualizar_prioridad_cwp(db, cwp_id, prioridad_update.prioridad)
        return {"cwp_id": cwp_id, "nueva_prioridad": db_cwp.prioridad}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ============================================================================
# DEPENDENCIAS ENTRE CWPs
# ============================================================================

@router.post("/cwp/{cwp_id}/dependencias", response_model=schemas.DependenciaCWPResponse)
def crear_dependencia_cwp(
    cwp_id: int, # cwp_origen_id
    dependencia: schemas.DependenciaCWPCreate,
    db: Session = Depends(get_db)
):
    """Crear dependencia: este CWP (origen) depende de otro CWP (destino)."""
    try:
        db_dependencia = crud.crear_dependencia(db, dependencia, cwp_id)
        return db_dependencia
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/dependencias", response_model=List[schemas.DependenciaCWPResponse])
def obtener_dependencias_cwp(
    cwp_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las dependencias donde este CWP es el origen"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_dependencias_cwp(db, cwp_id)


@router.get("/cwp/{cwp_id}/predecesores", response_model=List[schemas.DependenciaCWPResponse])
def obtener_predecesores_cwp(
    cwp_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todos los CWPs que son predecesores de este CWP"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    return crud.get_predecesores_cwp(db, cwp_id)


@router.delete("/dependencias/{dependencia_id}")
def eliminar_dependencia_cwp(
    dependencia_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una dependencia entre CWPs"""
    try:
        crud.eliminar_dependencia(db, dependencia_id)
        return {"message": "Dependencia eliminada exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))