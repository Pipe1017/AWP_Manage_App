# backend/app/routers/awp_nuevo.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, crud
from ..database import get_db
from ..crud_nuevo import (
    update_cwp, delete_cwp,
    create_item_simple,
    smart_import_awp, link_items_from_source, obtener_jerarquia_global,
    get_tipos_entregables_disponibles, get_paquete, get_paquetes_por_cwp, 
    get_item, get_items_por_paquete
)
import pandas as pd
import io

router = APIRouter(prefix="/awp-nuevo", tags=["AWP Nuevo"])

# ============================================================================
# CWA (Update Prioridad)
# ============================================================================
@router.put("/cwa/{cwa_id}", response_model=schemas.CWAResponse)
def update_cwa_endpoint(cwa_id: int, cwa_update: schemas.CWAUpdate, db: Session = Depends(get_db)):
    try: 
        return crud.update_cwa(db, cwa_id, cwa_update)
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))

# ============================================================================
# CWP - CON GENERACIÓN AUTOMÁTICA DE CÓDIGOS ÚNICOS POR PROYECTO
# ============================================================================
@router.post("/cwp", response_model=schemas.CWPResponse)
def create_cwp(cwp: schemas.CWPCreate, db: Session = Depends(get_db)):
    """Crear un nuevo CWP con código generado automáticamente único por proyecto"""
    
    # Obtener el CWA
    cwa = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    if not cwa:
        raise HTTPException(status_code=404, detail="Área (CWA) no encontrada")
    
    # Obtener proyecto_id del CWA
    plot_plan = db.query(models.PlotPlan).filter(models.PlotPlan.id == cwa.plot_plan_id).first()
    if not plot_plan:
        raise HTTPException(status_code=404, detail="Plot Plan no encontrado")
    
    proyecto_id = plot_plan.proyecto_id
    
    # ✅ GENERAR CÓDIGO AUTOMÁTICO único por proyecto
    # Formato: {CWA_CODIGO}-CWP-{NUM}
    cwps_existentes = db.query(models.CWP).join(
        models.CWA
    ).join(
        models.PlotPlan
    ).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.CWP.codigo.like(f"{cwa.codigo}-CWP-%")
    ).order_by(models.CWP.codigo.desc()).all()
    
    # Generar código secuencial
    if not cwps_existentes:
        nuevo_codigo = f"{cwa.codigo}-CWP-001"
    else:
        ultimo_codigo = cwps_existentes[0].codigo
        try:
            # Extraer número del formato CWA-CWP-XXX
            ultimo_num = int(ultimo_codigo.split('-CWP-')[-1])
            nuevo_codigo = f"{cwa.codigo}-CWP-{(ultimo_num + 1):03d}"
        except:
            nuevo_codigo = f"{cwa.codigo}-CWP-{len(cwps_existentes) + 1:03d}"
    
    # Verificar unicidad (por si acaso)
    codigo_existente = db.query(models.CWP).join(
        models.CWA
    ).join(
        models.PlotPlan
    ).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.CWP.codigo == nuevo_codigo
    ).first()
    
    if codigo_existente:
        # Agregar sufijo si hay colisión
        contador = 1
        while True:
            codigo_alternativo = f"{nuevo_codigo}-{contador}"
            existe = db.query(models.CWP).join(models.CWA).join(models.PlotPlan).filter(
                models.PlotPlan.proyecto_id == proyecto_id,
                models.CWP.codigo == codigo_alternativo
            ).first()
            if not existe:
                nuevo_codigo = codigo_alternativo
                break
            contador += 1
    
    # Crear CWP
    db_cwp = models.CWP(
        codigo=nuevo_codigo,
        nombre=cwp.nombre,
        descripcion=cwp.descripcion,
        disciplina_id=cwp.disciplina_id,
        area_id=cwp.area_id,
        secuencia=cwp.secuencia,
        metadata_json=cwp.metadata_json
    )
    
    db.add(db_cwp)
    db.commit()
    db.refresh(db_cwp)
    return db_cwp


@router.put("/cwp/{cwp_id}", response_model=schemas.CWPResponse)
def update_cwp_endpoint(cwp_id: int, cwp_update: schemas.CWPUpdate, db: Session = Depends(get_db)):
    """Actualizar un CWP (el código NO se puede cambiar)"""
    try: 
        return update_cwp(db, cwp_id, cwp_update)
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/cwp/{cwp_id}")
def delete_cwp_endpoint(cwp_id: int, db: Session = Depends(get_db)):
    try: 
        delete_cwp(db, cwp_id)
        return {"message": "CWP eliminado"}
    except ValueError as e: 
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/cwp/{cwp_id}/tipos-entregables-disponibles")
def get_tipos_disponibles(cwp_id: int, db: Session = Depends(get_db)):
    tipos = get_tipos_entregables_disponibles(db, cwp_id)
    return [{"id": t.id, "nombre": t.nombre, "codigo": t.codigo} for t in tipos]

# ============================================================================
# PAQUETE - CON GENERACIÓN AUTOMÁTICA DE CÓDIGOS ÚNICOS POR PROYECTO
# ============================================================================
@router.post("/cwp/{cwp_id}/paquete", response_model=schemas.PaqueteResponse)
def create_paquete(cwp_id: int, paquete: schemas.PaqueteCreate, db: Session = Depends(get_db)):
    """Crear un nuevo paquete con código generado automáticamente único por proyecto"""
    
    cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not cwp:
        raise HTTPException(status_code=404, detail="CWP no encontrado")
    
    # Obtener proyecto_id
    cwa = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    plot_plan = db.query(models.PlotPlan).filter(models.PlotPlan.id == cwa.plot_plan_id).first()
    proyecto_id = plot_plan.proyecto_id
    
    # ✅ GENERAR CÓDIGO AUTOMÁTICO único por proyecto
    # Formato: {TIPO}-{CWA_CODIGO}-{NUM}
    paquetes_existentes = db.query(models.Paquete).join(
        models.CWP
    ).join(
        models.CWA
    ).join(
        models.PlotPlan
    ).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.Paquete.tipo == paquete.tipo,
        models.Paquete.codigo.like(f"{paquete.tipo}-{cwa.codigo}-%")
    ).order_by(models.Paquete.codigo.desc()).all()
    
    if not paquetes_existentes:
        nuevo_codigo = f"{paquete.tipo}-{cwa.codigo}-001"
    else:
        ultimo_codigo = paquetes_existentes[0].codigo
        try:
            # Formato esperado: TIPO-CWA-NUM
            ultimo_num = int(ultimo_codigo.split('-')[-1])
            nuevo_codigo = f"{paquete.tipo}-{cwa.codigo}-{(ultimo_num + 1):03d}"
        except:
            nuevo_codigo = f"{paquete.tipo}-{cwa.codigo}-{len(paquetes_existentes) + 1:03d}"
    
    # Verificar unicidad
    codigo_existente = db.query(models.Paquete).join(
        models.CWP
    ).join(
        models.CWA
    ).join(
        models.PlotPlan
    ).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.Paquete.codigo == nuevo_codigo
    ).first()
    
    if codigo_existente:
        contador = 1
        while True:
            codigo_alternativo = f"{nuevo_codigo}-{contador}"
            existe = db.query(models.Paquete).join(models.CWP).join(models.CWA).join(models.PlotPlan).filter(
                models.PlotPlan.proyecto_id == proyecto_id,
                models.Paquete.codigo == codigo_alternativo
            ).first()
            if not existe:
                nuevo_codigo = codigo_alternativo
                break
            contador += 1
    
    # Crear paquete
    db_paquete = models.Paquete(
        codigo=nuevo_codigo,
        nombre=paquete.nombre,
        tipo=paquete.tipo,
        responsable=paquete.responsable,
        cwp_id=cwp_id
    )
    
    db.add(db_paquete)
    db.commit()
    db.refresh(db_paquete)
    return db_paquete


@router.get("/cwp/{cwp_id}/paquetes", response_model=List[schemas.PaqueteResponse])
def read_paquetes(cwp_id: int, db: Session = Depends(get_db)): 
    return get_paquetes_por_cwp(db, cwp_id)


@router.get("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def read_paquete(paquete_id: int, db: Session = Depends(get_db)):
    p = get_paquete(db, paquete_id)
    if not p: 
        raise HTTPException(404, "Paquete no encontrado")
    return p


@router.put("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def update_paquete(paquete_id: int, p: schemas.PaqueteUpdate, db: Session = Depends(get_db)):
    db_p = get_paquete(db, paquete_id)
    if not db_p: 
        raise HTTPException(404)
    
    # Actualizar campos (el código NO se cambia)
    for k, v in p.model_dump(exclude_unset=True, exclude={'codigo', 'tipo'}).items(): 
        setattr(db_p, k, v)
    
    db.commit()
    db.refresh(db_p)
    return db_p


@router.delete("/paquete/{paquete_id}")
def delete_paquete_endpoint(paquete_id: int, db: Session = Depends(get_db)):
    p = get_paquete(db, paquete_id)
    if not p: 
        raise HTTPException(404)
    db.delete(p)
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
        raise HTTPException(400, str(e))


@router.get("/paquete/{paquete_id}/items", response_model=List[schemas.ItemResponse])
def read_items(paquete_id: int, db: Session = Depends(get_db)): 
    return get_items_por_paquete(db, paquete_id)


@router.get("/item/{item_id}", response_model=schemas.ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    i = get_item(db, item_id)
    if not i: 
        raise HTTPException(404)
    return i


@router.put("/item/{item_id}", response_model=schemas.ItemResponse)
def update_item(item_id: int, i: schemas.ItemUpdate, db: Session = Depends(get_db)):
    db_i = get_item(db, item_id)
    if not db_i: 
        raise HTTPException(404)
    
    for k, v in i.model_dump(exclude_unset=True).items(): 
        setattr(db_i, k, v)
    
    db.commit()
    db.refresh(db_i)
    return db_i


@router.delete("/item/{item_id}")
def delete_item_endpoint(item_id: int, db: Session = Depends(get_db)):
    i = get_item(db, item_id)
    if not i: 
        raise HTTPException(404)
    db.delete(i)
    db.commit()
    return {"message": "Item eliminado"}

# ============================================================================
# VINCULACIÓN DE ITEMS
# ============================================================================
@router.post("/paquete/{paquete_id}/vincular-items")
def vincular_items(paquete_id: int, req: schemas.ItemLinkRequest, db: Session = Depends(get_db)):
    try: 
        cantidad = link_items_from_source(db, paquete_id, req.source_item_ids)
        return {"mensaje": f"Vinculados {cantidad} items exitosamente"}
    except ValueError as e: 
        raise HTTPException(400, str(e))


@router.get("/proyectos/{proyecto_id}/items-disponibles")
def get_available_items(proyecto_id: int, filter_type: str = "ALL", db: Session = Depends(get_db)):
    """Obtener items disponibles para vinculación"""
    query = db.query(models.Item).join(
        models.Paquete
    ).join(
        models.CWP
    ).join(
        models.CWA
    ).join(
        models.PlotPlan
    ).filter(
        models.PlotPlan.proyecto_id == proyecto_id
    )
    
    if filter_type == "TRANSVERSAL": 
        query = query.filter(models.CWA.es_transversal == True)
    
    items = query.all()
    
    return [{
        "id": i.id, 
        "nombre": i.nombre, 
        "paquete": i.paquete.codigo, 
        "cwa": i.paquete.cwp.cwa.nombre,
        "origen_info": f"{i.paquete.cwp.cwa.codigo} > {i.paquete.cwp.codigo} > {i.paquete.codigo}",
        "es_transversal": i.paquete.cwp.cwa.es_transversal,
        "tipo": "ENTREGABLE"
    } for i in items]


@router.get("/proyectos/{proyecto_id}/jerarquia-global")
def get_jerarquia_global(proyecto_id: int, db: Session = Depends(get_db)):
    """Obtener toda la jerarquía AWP del proyecto"""
    return obtener_jerarquia_global(db, proyecto_id)

# ============================================================================
# IMPORT/EXPORT
# ============================================================================
@router.get("/exportar-csv/{proyecto_id}")
def exportar_csv_proyecto(proyecto_id: int, db: Session = Depends(get_db)):
    """Exportar estructura AWP a CSV con columnas optimizadas"""
    proyecto = crud.get_proyecto(db, proyecto_id)
    if not proyecto: 
        raise HTTPException(404, detail="Proyecto no encontrado")
    
    # Obtener columnas personalizadas (restricciones)
    columnas_custom = db.query(models.CWPColumnaMetadata).filter(
        models.CWPColumnaMetadata.proyecto_id == proyecto_id
    ).order_by(models.CWPColumnaMetadata.orden).all()
    
    data_rows = []
    
    for pp in proyecto.plot_plans:
        for cwa in pp.cwas:
            if not cwa.cwps:
                row = {
                    "ID_Item": "",
                    "CWA": cwa.codigo,
                    "Prioridad_Area": cwa.prioridad or "MEDIA",
                    "CWP": "",
                    "Secuencia_CWP": "",
                    "Forecast_Inicio_CWP": "",
                    "Forecast_Fin_CWP": "",
                    "Tipo_Paquete": "",
                    "Codigo_Paquete": "",
                    "Nombre_Item": "",
                    "Forecast_Fin_Item": ""
                }
                for col in columnas_custom:
                    row[col.nombre] = ""
                data_rows.append(row)
                
            for cwp in cwa.cwps:
                if not cwp.paquetes:
                    row = {
                        "ID_Item": "",
                        "CWA": cwa.codigo,
                        "Prioridad_Area": cwa.prioridad or "MEDIA",
                        "CWP": cwp.codigo,
                        "Secuencia_CWP": cwp.secuencia or 0,
                        "Forecast_Inicio_CWP": str(cwp.forecast_inicio) if cwp.forecast_inicio else "",
                        "Forecast_Fin_CWP": str(cwp.forecast_fin) if cwp.forecast_fin else "",
                        "Tipo_Paquete": "",
                        "Codigo_Paquete": "",
                        "Nombre_Item": "",
                        "Forecast_Fin_Item": ""
                    }
                    for col in columnas_custom:
                        row[col.nombre] = cwp.metadata_json.get(col.nombre, "") if cwp.metadata_json else ""
                    data_rows.append(row)
                    
                for pkg in cwp.paquetes:
                    if not pkg.items:
                        row = {
                            "ID_Item": "",
                            "CWA": cwa.codigo,
                            "Prioridad_Area": cwa.prioridad or "MEDIA",
                            "CWP": cwp.codigo,
                            "Secuencia_CWP": cwp.secuencia or 0,
                            "Forecast_Inicio_CWP": str(cwp.forecast_inicio) if cwp.forecast_inicio else "",
                            "Forecast_Fin_CWP": str(cwp.forecast_fin) if cwp.forecast_fin else "",
                            "Tipo_Paquete": pkg.tipo,
                            "Codigo_Paquete": pkg.codigo,
                            "Nombre_Item": "",
                            "Forecast_Fin_Item": ""
                        }
                        for col in columnas_custom:
                            row[col.nombre] = cwp.metadata_json.get(col.nombre, "") if cwp.metadata_json else ""
                        data_rows.append(row)
                        
                    for item in pkg.items:
                        row = {
                            "ID_Item": item.id,
                            "CWA": cwa.codigo,
                            "Prioridad_Area": cwa.prioridad or "MEDIA",
                            "CWP": cwp.codigo,
                            "Secuencia_CWP": cwp.secuencia or 0,
                            "Forecast_Inicio_CWP": str(cwp.forecast_inicio) if cwp.forecast_inicio else "",
                            "Forecast_Fin_CWP": str(cwp.forecast_fin) if cwp.forecast_fin else "",
                            "Tipo_Paquete": pkg.tipo,
                            "Codigo_Paquete": pkg.codigo,
                            "Nombre_Item": item.nombre,
                            "Forecast_Fin_Item": str(item.forecast_fin) if item.forecast_fin else ""
                        }
                        for col in columnas_custom:
                            row[col.nombre] = cwp.metadata_json.get(col.nombre, "") if cwp.metadata_json else ""
                        data_rows.append(row)
    
    df = pd.DataFrame(data_rows)
    
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=awp_export_{proyecto.nombre}.csv"
    return response


@router.post("/importar-csv/{proyecto_id}")
async def importar_csv_proyecto(proyecto_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Importar estructura AWP desde archivo CSV/Excel"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        df.columns = [c.strip() for c in df.columns]
        
        if 'CWA' not in df.columns: 
            raise HTTPException(400, "Falta columna obligatoria 'CWA'")
        
        stats = smart_import_awp(db, proyecto_id, df)
        return {"mensaje": "Importación completada", "detalles": stats}
        
    except Exception as e: 
        raise HTTPException(400, detail=str(e))