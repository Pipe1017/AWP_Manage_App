from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..crud_nuevo import (
    create_cwp_auto, update_cwp, delete_cwp,
    create_paquete_auto, create_item_simple,
    smart_import_awp, link_items_from_source,
    get_tipos_entregables_disponibles, get_paquete, get_paquetes_por_cwp, get_item, get_items_por_paquete
)
import pandas as pd
import io
from sqlalchemy import text

router = APIRouter(prefix="/awp-nuevo", tags=["AWP Nuevo"])

# ============================================================================
# 1. CRUD ENDPOINTS (CWA, CWP, PAQUETE, ITEM)
# ============================================================================

# --- CWA ---
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

# --- VÍNCULOS Y SELECTORES ---
@router.post("/paquete/{paquete_id}/vincular-items")
def vincular_items(paquete_id: int, req: schemas.ItemLinkRequest, db: Session = Depends(get_db)):
    try: return {"mensaje": f"Vinculados {link_items_from_source(db, paquete_id, req.source_item_ids)}"}
    except ValueError as e: raise HTTPException(400, str(e))

@router.get("/proyectos/{proyecto_id}/items-disponibles")
def get_available_items(proyecto_id: int, filter_type: str = "ALL", db: Session = Depends(get_db)):
    query = db.query(models.Item).join(models.Paquete).join(models.CWP).join(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id)
    if filter_type == "TRANSVERSAL": query = query.filter(models.CWA.es_transversal == True)
    return [{"id": i.id, "nombre": i.nombre, "paquete": i.paquete.codigo, "cwa": i.paquete.cwp.cwa.nombre, "es_transversal": i.paquete.cwp.cwa.es_transversal} for i in query.all()]

# ============================================================================
# 2. JERARQUÍA GLOBAL (OPTIMIZADA)
# ============================================================================

@router.get("/proyectos/{proyecto_id}/jerarquia-global")
def get_jerarquia_global(proyecto_id: int, db: Session = Depends(get_db)):
    jerarquia = {"proyecto_id": proyecto_id, "cwas": []}
    
    # Ordenar CWA por Prioridad (Numérica)
    cwas = db.query(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).order_by(models.CWA.prioridad, models.CWA.codigo).all()
    
    for cwa in cwas:
        cwa_data = {
            "id": cwa.id, "nombre": cwa.nombre, "codigo": cwa.codigo,
            "plot_plan_nombre": cwa.plot_plan.nombre,
            "prioridad": cwa.prioridad, 
            "es_transversal": cwa.es_transversal,
            "cwps": []
        }
        
        # Ordenar CWP por Secuencia (Numérica)
        cwps = db.query(models.CWP).filter(models.CWP.cwa_id == cwa.id).order_by(models.CWP.secuencia).all()
        
        for cwp in cwps:
            cwp_data = {
                "id": cwp.id, "nombre": cwp.nombre, "codigo": cwp.codigo,
                "secuencia": cwp.secuencia, "porcentaje_completitud": cwp.porcentaje_completitud,
                "metadata_json": cwp.metadata_json, "disciplina_id": cwp.disciplina_id, "paquetes": []
            }
            
            pkgs = db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp.id).all()
            for p in pkgs:
                p_data = { 
                    "id": p.id, 
                    "codigo": p.codigo, 
                    "nombre": p.nombre, 
                    "tipo": p.tipo,
                    "forecast_inicio": str(p.forecast_inicio) if p.forecast_inicio else None,
                    "forecast_fin": str(p.forecast_fin) if p.forecast_fin else None,
                    "items": [] 
                }
                
                items = db.query(models.Item).filter(models.Item.paquete_id == p.id).all()
                for i in items:
                    tipo = None
                    if i.tipo_entregable_id:
                        tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == i.tipo_entregable_id).first()
                    
                    org = None
                    if i.source_item_id:
                        src = db.query(models.Item).filter(models.Item.id == i.source_item_id).first()
                        if src: org = f"{src.paquete.cwp.cwa.nombre} / {src.paquete.codigo}"
                    
                    p_data["items"].append({
                        "id": i.id, "nombre": i.nombre, "archivo_url": i.archivo_url,
                        "tipo_entregable_codigo": tipo.codigo if tipo else None,
                        "source_item_id": i.source_item_id, "origen_info": org
                    })
                cwp_data["paquetes"].append(p_data)
            cwa_data["cwps"].append(cwp_data)
        jerarquia["cwas"].append(cwa_data)
    
    return jerarquia

# ============================================================================
# 3. HERRAMIENTAS DE DATOS (RESET & EXPORT)
# ============================================================================

# ✅ ENDPOINT DE LIMPIEZA TOTAL DE ITEMS
@router.delete("/proyectos/{proyecto_id}/items-reset")
def delete_all_items_project(proyecto_id: int, db: Session = Depends(get_db)):
    try:
        # Borra todos los items pertenecientes a paquetes de CWPs de CWAs de Planos de ESTE proyecto
        sql = text("""
            DELETE FROM items 
            WHERE paquete_id IN (
                SELECT p.id FROM paquetes p
                JOIN cwp c ON c.id = p.cwp_id
                JOIN cwa a ON a.id = c.cwa_id
                JOIN plot_plans pp ON pp.id = a.plot_plan_id
                WHERE pp.proyecto_id = :pid
            )
        """)
        db.execute(sql, {"pid": proyecto_id})
        db.commit()
        return {"message": "Todos los items eliminados exitosamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error borrando items: {str(e)}")

# ✅ EXPORTACIÓN CSV FINAL (CON DESC, SIN N/A METADATA, SORTED, IDS REALES)
@router.get("/exportar-csv/{proyecto_id}")
def exportar_csv_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    proyecto = crud.get_proyecto(db, proyecto_id)
    if not proyecto: raise HTTPException(404)
    
    meta_cols = db.query(models.CWPColumnaMetadata).filter(models.CWPColumnaMetadata.proyecto_id == proyecto_id).all()
    meta_names = [col.nombre for col in meta_cols]

    data_rows = []
    
    for pp in proyecto.plot_plans:
        for cwa in pp.cwas:
            prefijo = "DWP" if cwa.es_transversal else "CWA"
            codigo_area_formateado = f"{prefijo}-{cwa.codigo}"
            
            # Valores numéricos para ordenamiento
            sort_prio = cwa.prioridad if cwa.prioridad is not None else 99999

            cwa_data = {
                "CWA": codigo_area_formateado,
                "Descripcion_Area": cwa.nombre, 
                "Prioridad_Area": cwa.prioridad
            }
            
            if not cwa.cwps:
                data_rows.append({**cwa_data, "_sort_prio": sort_prio, "_sort_seq": -1})
                continue

            for cwp in cwa.cwps:
                is_dwp = cwa.es_transversal
                sort_seq = cwp.secuencia if cwp.secuencia is not None else 0
                
                cwp_data = {
                    **cwa_data,
                    "CWP": "N/A" if is_dwp else cwp.codigo,
                    "Descripcion_CWP": "N/A" if is_dwp else cwp.nombre,
                    "Secuencia_CWP": "N/A" if is_dwp else cwp.secuencia,
                    "_sort_prio": sort_prio,
                    "_sort_seq": sort_seq
                }
                
                # ✅ Metadata visible siempre
                for meta_name in meta_names:
                    cwp_data[meta_name] = cwp.metadata_json.get(meta_name, "") if cwp.metadata_json else ""

                if not cwp.paquetes:
                    data_rows.append(cwp_data)
                    continue

                for pkg in cwp.paquetes:
                    pkg_data = {
                        **cwp_data,
                        "Tipo_Paquete": pkg.tipo,
                        "Codigo_Paquete": pkg.codigo,
                        "Descripcion_Paquete": pkg.nombre,
                        "Forecast_Inicio": str(pkg.forecast_inicio) if pkg.forecast_inicio else "",
                        "Forecast_Fin": str(pkg.forecast_fin) if pkg.forecast_fin else ""
                    }

                    if not pkg.items:
                        data_rows.append(pkg_data)
                        continue

                    for item in pkg.items:
                        row = {
                            **pkg_data,
                            # ✅ ID REAL DE LA BASE DE DATOS (5 DÍGITOS VISUALES)
                            "ID_Item": str(item.id).zfill(5), 
                            "Nombre_Item": item.nombre
                        }
                        data_rows.append(row)

    df = pd.DataFrame(data_rows)
    
    # ✅ ORDENAMIENTO
    if not df.empty:
        df.sort_values(by=["_sort_prio", "_sort_seq"], ascending=[True, True], inplace=True)
    
    fixed_cols = ["CWA", "Descripcion_Area", "Prioridad_Area", "CWP", "Descripcion_CWP", "Secuencia_CWP"]
    fixed_cols += meta_names
    fixed_cols += ["Tipo_Paquete", "Codigo_Paquete", "Descripcion_Paquete", "Forecast_Inicio", "Forecast_Fin", "ID_Item", "Nombre_Item"]
    
    for col in fixed_cols:
        if col not in df.columns:
            df[col] = ""
            
    df = df[fixed_cols]

    stream = io.StringIO()
    df.to_csv(stream, index=False)
    csv_content = stream.getvalue().encode("utf-8-sig")

    return StreamingResponse(
        iter([csv_content]), 
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=awp_export_{proyecto.nombre}.csv"}
    )

@router.post("/importar-csv/{proyecto_id}")
async def importar_csv_proyecto(proyecto_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
        except:
             df = pd.read_csv(io.BytesIO(contents), encoding='latin-1') if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
             
        df.columns = [c.strip() for c in df.columns]
        if 'CWA' not in df.columns: raise HTTPException(400, "Falta columna CWA")
        stats = smart_import_awp(db, proyecto_id, df)
        return {"mensaje": "Proceso finalizado", "detalles": stats}
    except Exception as e: raise HTTPException(400, str(e))