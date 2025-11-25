from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..crud_nuevo import (
    create_cwp_auto, update_cwp, delete_cwp,
    create_paquete_auto, create_item_simple,
    smart_import_awp, link_items_from_source, obtener_jerarquia_global,
    get_tipos_entregables_disponibles, get_paquete, get_paquetes_por_cwp, get_item, get_items_por_paquete
)
import pandas as pd
import io

router = APIRouter(prefix="/awp-nuevo", tags=["AWP Nuevo"])

# --- CWA (Update Prioridad) ---
@router.put("/cwa/{cwa_id}", response_model=schemas.CWAResponse)
def update_cwa_endpoint(cwa_id: int, cwa_update: schemas.CWAUpdate, db: Session = Depends(get_db)):
    try: return crud.update_cwa(db, cwa_id, cwa_update)
    except ValueError as e: raise HTTPException(status_code=404, detail=str(e))

# --- CWP ---
@router.post("/cwp", response_model=schemas.CWPResponse)
def create_cwp(cwp: schemas.CWPCreate, db: Session = Depends(get_db)):
    try: return create_cwp_auto(db, cwp)
    except ValueError as e: raise HTTPException(status_code=400, detail=str(e))

@router.put("/cwp/{cwp_id}", response_model=schemas.CWPResponse)
def update_cwp_endpoint(cwp_id: int, cwp_update: schemas.CWPUpdate, db: Session = Depends(get_db)):
    try: return update_cwp(db, cwp_id, cwp_update)
    except ValueError as e: raise HTTPException(status_code=404, detail=str(e))

@router.delete("/cwp/{cwp_id}")
def delete_cwp_endpoint(cwp_id: int, db: Session = Depends(get_db)):
    try: delete_cwp(db, cwp_id); return {"message": "Eliminado"}
    except ValueError as e: raise HTTPException(status_code=404, detail=str(e))

@router.get("/cwp/{cwp_id}/tipos-entregables-disponibles")
def get_tipos_disponibles(cwp_id: int, db: Session = Depends(get_db)):
    tipos = get_tipos_entregables_disponibles(db, cwp_id)
    return [{"id": t.id, "nombre": t.nombre, "codigo": t.codigo} for t in tipos]

# --- PAQUETE ---
@router.post("/cwp/{cwp_id}/paquete", response_model=schemas.PaqueteResponse)
def create_paquete(cwp_id: int, paquete: schemas.PaqueteCreate, db: Session = Depends(get_db)):
    try: return create_paquete_auto(db, paquete, cwp_id)
    except ValueError as e: raise HTTPException(400, str(e))

@router.get("/cwp/{cwp_id}/paquetes", response_model=List[schemas.PaqueteResponse])
def read_paquetes(cwp_id: int, db: Session = Depends(get_db)): return get_paquetes_por_cwp(db, cwp_id)

@router.get("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def read_paquete(paquete_id: int, db: Session = Depends(get_db)):
    p = get_paquete(db, paquete_id)
    if not p: raise HTTPException(404)
    return p

@router.put("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def update_paquete(paquete_id: int, p: schemas.PaqueteUpdate, db: Session = Depends(get_db)):
    db_p = get_paquete(db, paquete_id)
    if not db_p: raise HTTPException(404)
    for k, v in p.model_dump(exclude_unset=True).items(): setattr(db_p, k, v)
    db.commit(); db.refresh(db_p); return db_p

@router.delete("/paquete/{paquete_id}")
def delete_paquete_endpoint(paquete_id: int, db: Session = Depends(get_db)):
    p = get_paquete(db, paquete_id)
    if not p: raise HTTPException(404)
    db.delete(p); db.commit(); return {"msg": "Deleted"}

# --- ITEM ---
@router.post("/paquete/{paquete_id}/item", response_model=schemas.ItemResponse)
def create_item(paquete_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    try: return create_item_simple(db, item, paquete_id)
    except ValueError as e: raise HTTPException(400, str(e))

@router.get("/paquete/{paquete_id}/items", response_model=List[schemas.ItemResponse])
def read_items(pid: int, db: Session = Depends(get_db)): return get_items_por_paquete(db, pid)

@router.get("/item/{item_id}", response_model=schemas.ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    i = get_item(db, item_id)
    if not i: raise HTTPException(404)
    return i

@router.put("/item/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, i: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_i = get_item(db, item_id)
    if not db_i: raise HTTPException(404)
    for k, v in i.model_dump(exclude_unset=True).items(): setattr(db_i, k, v)
    db.commit(); db.refresh(db_i); return db_i

@router.delete("/item/{item_id}")
def delete_item_endpoint(item_id: int, db: Session = Depends(get_db)):
    i = get_item(db, item_id)
    if not i: raise HTTPException(404)
    db.delete(i); db.commit(); return {"msg": "Deleted"}

# --- LINKS ---
@router.post("/paquete/{paquete_id}/vincular-items")
def vincular_items(paquete_id: int, req: schemas.ItemLinkRequest, db: Session = Depends(get_db)):
    try: return {"mensaje": f"Vinculados {link_items_from_source(db, paquete_id, req.source_item_ids)}"}
    except ValueError as e: raise HTTPException(400, str(e))

@router.get("/proyectos/{proyecto_id}/items-disponibles")
def get_available_items(proyecto_id: int, filter_type: str = "ALL", db: Session = Depends(get_db)):
    query = db.query(models.Item).join(models.Paquete).join(models.CWP).join(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id)
    if filter_type == "TRANSVERSAL": query = query.filter(models.CWA.es_transversal == True)
    return [{"id": i.id, "nombre": i.nombre, "paquete": i.paquete.codigo, "cwa": i.paquete.cwp.cwa.nombre, "es_transversal": i.paquete.cwp.cwa.es_transversal} for i in query.all()]

@router.get("/proyectos/{proyecto_id}/jerarquia-global")
def get_jerarquia_global(proyecto_id: int, db: Session = Depends(get_db)):
    return obtener_jerarquia_global(db, proyecto_id)

# --- IMPORT/EXPORT MEJORADO ---
@router.get("/exportar-csv/{proyecto_id}")
def exportar_csv_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = crud.get_proyecto(db, proyecto_id)
    if not proyecto: raise HTTPException(404)
    
    # 1. Obtener columnas personalizadas (Restricciones)
    meta_cols = db.query(models.CWPColumnaMetadata).filter(models.CWPColumnaMetadata.proyecto_id == proyecto_id).all()
    meta_names = [col.nombre for col in meta_cols]

    data_rows = []
    
    for pp in proyecto.plot_plans:
        for cwa in pp.cwas:
            # Base data para CWA
            cwa_data = {
                "CWA": cwa.codigo,
                "Prioridad_Area": cwa.prioridad
            }
            
            if not cwa.cwps:
                data_rows.append({**cwa_data})
                continue

            for cwp in cwa.cwps:
                # Base data para CWP
                cwp_data = {
                    **cwa_data,
                    "CWP": cwp.codigo,
                    "Secuencia_CWP": cwp.secuencia,
                    "Forecast_Inicio_CWP": str(cwp.forecast_inicio) if cwp.forecast_inicio else "",
                    "Forecast_Fin_CWP": str(cwp.forecast_fin) if cwp.forecast_fin else "",
                }
                
                # Agregar columnas dinámicas (Restricciones)
                for meta_name in meta_names:
                    cwp_data[meta_name] = cwp.metadata_json.get(meta_name, "") if cwp.metadata_json else ""

                if not cwp.paquetes:
                    data_rows.append(cwp_data)
                    continue

                for pkg in cwp.paquetes:
                    pkg_data = {
                        **cwp_data,
                        "Tipo_Paquete": pkg.tipo,
                        "Codigo_Paquete": pkg.codigo
                    }

                    if not pkg.items:
                        data_rows.append(pkg_data)
                        continue

                    for item in pkg.items:
                        # Row completo con Item
                        row = {
                            **pkg_data,
                            "ID_Item": item.source_item_id if item.source_item_id else item.id, # Usar Source ID si es vínculo
                            "Nombre_Item": item.nombre,
                            "Forecast_Fin_Item": str(item.forecast_fin) if item.forecast_fin else ""
                        }
                        data_rows.append(row)

    df = pd.DataFrame(data_rows)
    
    # Ordenar columnas para que las fijas salgan primero
    fixed_cols = ["CWA", "Prioridad_Area", "CWP", "Secuencia_CWP", "Forecast_Inicio_CWP", "Forecast_Fin_CWP"]
    fixed_cols += meta_names # Restricciones del usuario
    fixed_cols += ["Tipo_Paquete", "Codigo_Paquete", "ID_Item", "Nombre_Item", "Forecast_Fin_Item"]
    
    # Asegurar que todas las columnas existan en el DF (por si hay filas vacías)
    for col in fixed_cols:
        if col not in df.columns:
            df[col] = ""
            
    # Reordenar
    df = df[fixed_cols]

    stream = io.StringIO(); df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=awp_export_{proyecto.nombre}.csv"
    return response

@router.post("/importar-csv/{proyecto_id}")
async def importar_csv_proyecto(proyecto_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
        df.columns = [c.strip() for c in df.columns]
        if 'CWA' not in df.columns: raise HTTPException(400, "Falta columna CWA")
        stats = smart_import_awp(db, proyecto_id, df)
        return {"mensaje": "Proceso finalizado", "detalles": stats}
    except Exception as e: raise HTTPException(400, str(e))