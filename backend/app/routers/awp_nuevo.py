# backend/app/routers/awp_nuevo.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..crud_nuevo import (
    create_cwp_auto, update_cwp, create_paquete_auto, create_item_simple,
    smart_import_awp, link_items_from_source,
    get_tipos_entregables_disponibles, get_paquete, get_paquetes_por_cwp, get_item, get_items_por_paquete
)
import pandas as pd
import io

router = APIRouter(
    prefix="/awp-nuevo",
    tags=["AWP Nuevo (Jerarquía Simplificada)"]
)

# ============================================================================
# CWP
# ============================================================================

@router.post("/cwp", response_model=schemas.CWPResponse)
def create_cwp(cwp: schemas.CWPCreate, db: Session = Depends(get_db)):
    try:
        return create_cwp_auto(db, cwp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/cwp/{cwp_id}", response_model=schemas.CWPResponse)
def update_cwp_endpoint(cwp_id: int, cwp_update: schemas.CWPCreate, db: Session = Depends(get_db)):
    try:
        return update_cwp(db, cwp_id, cwp_update)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/cwp/{cwp_id}/tipos-entregables-disponibles")
def get_tipos_disponibles(cwp_id: int, db: Session = Depends(get_db)):
    tipos = get_tipos_entregables_disponibles(db, cwp_id)
    return [{"id": t.id, "nombre": t.nombre, "codigo": t.codigo} for t in tipos]

# ============================================================================
# PAQUETE
# ============================================================================

@router.post("/cwp/{cwp_id}/paquete", response_model=schemas.PaqueteResponse)
def create_paquete(cwp_id: int, paquete: schemas.PaqueteCreate, db: Session = Depends(get_db)):
    try:
        return create_paquete_auto(db, paquete, cwp_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/cwp/{cwp_id}/paquetes", response_model=List[schemas.PaqueteResponse])
def read_paquetes(cwp_id: int, db: Session = Depends(get_db)):
    return get_paquetes_por_cwp(db, cwp_id)

@router.get("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def read_paquete(paquete_id: int, db: Session = Depends(get_db)):
    paquete = get_paquete(db, paquete_id)
    if not paquete: raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return paquete

@router.put("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def update_paquete(paquete_id: int, paquete_update: schemas.PaqueteUpdate, db: Session = Depends(get_db)):
    db_paquete = get_paquete(db, paquete_id)
    if not db_paquete: raise HTTPException(status_code=404, detail="Paquete no encontrado")
    update_data = paquete_update.model_dump(exclude_unset=True)
    for key, value in update_data.items(): setattr(db_paquete, key, value)
    db.commit()
    db.refresh(db_paquete)
    return db_paquete

@router.delete("/paquete/{paquete_id}")
def delete_paquete(paquete_id: int, db: Session = Depends(get_db)):
    db_paquete = get_paquete(db, paquete_id)
    if not db_paquete: raise HTTPException(status_code=404, detail="Paquete no encontrado")
    # Validación opcional: impedir borrar si tiene items
    # if len(get_items_por_paquete(db, paquete_id)) > 0:
    #     raise HTTPException(status_code=400, detail="No se puede eliminar. Tiene items asociados")
    db.delete(db_paquete)
    db.commit()
    return {"message": "Paquete eliminado"}

# ============================================================================
# ITEM
# ============================================================================

@router.post("/paquete/{paquete_id}/item", response_model=schemas.ItemResponse)
def create_item(paquete_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    try:
        return create_item_simple(db, item, paquete_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/paquete/{paquete_id}/items", response_model=List[schemas.ItemResponse])
def read_items(paquete_id: int, db: Session = Depends(get_db)):
    return get_items_por_paquete(db, paquete_id)

@router.get("/item/{item_id}", response_model=schemas.ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    item = get_item(db, item_id)
    if not item: raise HTTPException(status_code=404, detail="Item no encontrado")
    return item

@router.put("/item/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, item_update: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_item = get_item(db, item_id)
    if not db_item: raise HTTPException(status_code=404, detail="Item no encontrado")
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items(): setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/item/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = get_item(db, item_id)
    if not db_item: raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(db_item)
    db.commit()
    return {"message": "Item eliminado"}

# --- VINCULACIÓN DE ITEMS (TRANSVERSALES) ---

@router.post("/paquete/{paquete_id}/vincular-items")
def vincular_items(paquete_id: int, link_req: schemas.ItemLinkRequest, db: Session = Depends(get_db)):
    try:
        count = link_items_from_source(db, paquete_id, link_req.source_item_ids)
        return {"mensaje": f"Se vincularon {count} items exitosamente"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/proyectos/{proyecto_id}/items-transversales")
def get_transversal_items(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtiene todos los items que viven en áreas transversales (DWP)"""
    # Buscar CWAs transversales
    transversal_cwas = db.query(models.CWA).join(models.PlotPlan).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.CWA.es_transversal == True
    ).all()
    cwa_ids = [c.id for c in transversal_cwas]
    
    # Buscar Paquetes en esas CWAs
    paquetes = db.query(models.Paquete).join(models.CWP).filter(
        models.CWP.cwa_id.in_(cwa_ids)
    ).all()
    pkg_ids = [p.id for p in paquetes]
    
    # Buscar Items
    items = db.query(models.Item).filter(models.Item.paquete_id.in_(pkg_ids)).all()
    
    return [
        {
            "id": i.id, 
            "nombre": i.nombre, 
            "paquete": i.paquete.codigo, 
            "cwa": i.paquete.cwp.cwa.nombre
        } 
        for i in items
    ]

# ============================================================================
# IMPORTACIÓN / EXPORTACIÓN CSV
# ============================================================================

@router.get("/exportar-csv/{proyecto_id}")
def exportar_csv_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = crud.get_proyecto(db, proyecto_id)
    if not proyecto: raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    data_rows = []
    for pp in proyecto.plot_plans:
        for cwa in pp.cwas:
            if not cwa.cwps:
                data_rows.append({"CWA": cwa.codigo, "CWP": "", "Tipo_Paquete": "", "Codigo_Paquete": "", "Tipo_Item_Codigo": "", "Nombre_Item": "", "Descripcion": ""})
                continue
            for cwp in cwa.cwps:
                if not cwp.paquetes:
                    data_rows.append({"CWA": cwa.codigo, "CWP": cwp.codigo, "Tipo_Paquete": "", "Codigo_Paquete": "", "Tipo_Item_Codigo": "", "Nombre_Item": "", "Descripcion": ""})
                    continue
                for pkg in cwp.paquetes:
                    if not pkg.items:
                        data_rows.append({"CWA": cwa.codigo, "CWP": cwp.codigo, "Tipo_Paquete": pkg.tipo, "Codigo_Paquete": pkg.codigo, "Tipo_Item_Codigo": "", "Nombre_Item": "", "Descripcion": ""})
                        continue
                    for item in pkg.items:
                        # Si el item es un vínculo, mostrarlo especial
                        tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == item.tipo_entregable_id).first() if item.tipo_entregable_id else None
                        data_rows.append({
                            "CWA": cwa.codigo, 
                            "CWP": cwp.codigo, 
                            "Tipo_Paquete": pkg.tipo, 
                            "Codigo_Paquete": pkg.codigo,
                            "Tipo_Item_Codigo": tipo.codigo if tipo else "", 
                            "Nombre_Item": item.nombre,
                            "Descripcion": item.descripcion or ""
                        })

    df = pd.DataFrame(data_rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=awp_export_{proyecto.nombre}.csv"
    return response

@router.post("/importar-csv/{proyecto_id}")
async def importar_csv_proyecto(
    proyecto_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        df.columns = [c.strip() for c in df.columns]
        if 'CWA' not in df.columns:
            raise HTTPException(status_code=400, detail="El archivo debe tener al menos la columna 'CWA'")

        stats = smart_import_awp(db, proyecto_id, df)
        return {"mensaje": "Proceso finalizado", "detalles": stats}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando archivo: {str(e)}")