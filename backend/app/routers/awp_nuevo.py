# backend/app/routers/awp_nuevo.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..crud_nuevo import (
    create_cwp_auto,
    create_paquete_auto,
    create_item_auto,
    get_tipos_entregables_disponibles,
    get_paquete,
    get_paquetes_por_cwp,
    get_item,
    get_items_por_paquete
)

router = APIRouter(
    prefix="/awp-nuevo",
    tags=["AWP Nuevo (Jerarquía Simplificada)"]
)

# ============================================================================
# CWP
# ============================================================================

@router.post("/cwp", response_model=schemas.CWPResponse)
def create_cwp(
    cwp: schemas.CWPCreate,
    db: Session = Depends(get_db)
):
    """
    Crear CWP con código auto-generado
    Body: { nombre, area_id, disciplina_id, ... }
    Código generado: CWP-{area.codigo}-{disciplina.codigo}-{consecutivo}
    """
    try:
        db_cwp = create_cwp_auto(db, cwp)
        return db_cwp
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# PAQUETE
# ============================================================================

@router.post("/cwp/{cwp_id}/paquete", response_model=schemas.PaqueteResponse)
def create_paquete(
    cwp_id: int,
    paquete: schemas.PaqueteCreate,
    db: Session = Depends(get_db)
):
    """
    Crear Paquete con código auto-generado
    Body: { nombre, tipo, responsable, ... }
    Código generado: {cwp.codigo}-{tipo}-{consecutivo}
    """
    try:
        db_paquete = create_paquete_auto(db, paquete, cwp_id)
        return db_paquete
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/cwp/{cwp_id}/paquetes", response_model=List[schemas.PaqueteResponse])
def read_paquetes(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener todos los paquetes de un CWP"""
    return get_paquetes_por_cwp(db, cwp_id)


# ============================================================================
# ITEM
# ============================================================================

@router.post("/paquete/{paquete_id}/item", response_model=schemas.ItemResponse)
def create_item(
    paquete_id: int,
    item: schemas.ItemCreate,
    db: Session = Depends(get_db)
):
    """
    Crear Item con código auto-generado
    Body: { nombre, tipo_entregable_id, responsable, ... }
    Código generado: {paquete.codigo}-{tipo.codigo}-{consecutivo}
    """
    try:
        db_item = create_item_auto(db, item, paquete_id)
        return db_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/paquete/{paquete_id}/items", response_model=List[schemas.ItemResponse])
def read_items(paquete_id: int, db: Session = Depends(get_db)):
    """Obtener todos los items de un paquete"""
    return get_items_por_paquete(db, paquete_id)


# ============================================================================
# HELPERS
# ============================================================================

@router.get("/cwp/{cwp_id}/tipos-entregables-disponibles")
def get_tipos_disponibles(cwp_id: int, db: Session = Depends(get_db)):
    """
    Obtener tipos de entregable disponibles para un CWP
    (de su disciplina + genéricos)
    """
    tipos = get_tipos_entregables_disponibles(db, cwp_id)
    return [
        {
            "id": t.id,
            "nombre": t.nombre,
            "codigo": t.codigo,
            "disciplina_codigo": t.disciplina.codigo if t.disciplina else "GEN",
            "es_generico": t.es_generico
        }
        for t in tipos
    ]