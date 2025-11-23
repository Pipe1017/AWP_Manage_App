# backend/app/routers/awp.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/awp",
    tags=["AWP (Advanced Work Packaging)"]
)

# ============================================================================
# PLOT PLANS
# ============================================================================

@router.get("/plot_plans/{plot_plan_id}/jerarquia")
def obtener_jerarquia_completa(plot_plan_id: int, db: Session = Depends(get_db)):
    """
    Obtiene la jerarquía completa de un Plot Plan:
    PlotPlan -> CWA -> CWP -> Paquete -> Item
    
    ✨ ACTUALIZADO para usar nueva estructura unificada
    """
    try:
        jerarquia = crud.obtener_jerarquia_completa(db, plot_plan_id)
        return jerarquia
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ============================================================================
# CWP
# ============================================================================

@router.get("/cwp/{cwp_id}")
def get_cwp(cwp_id: int, db: Session = Depends(get_db)):
    """Obtener CWP por ID"""
    db_cwp = crud.get_cwp(db, cwp_id)
    if not db_cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    return db_cwp


@router.get("/cwa/{cwa_id}/cwps")
def get_cwps_por_cwa(cwa_id: int, db: Session = Depends(get_db)):
    """Obtener todos los CWPs de un CWA"""
    cwps = crud.get_cwps_por_cwa(db, cwa_id)
    return cwps


# ============================================================================
# NOTA: Los endpoints antiguos de EWP/PWP/IWP están deprecados.
# Usar los nuevos endpoints en /awp-nuevo para crear Paquetes e Items
# ============================================================================