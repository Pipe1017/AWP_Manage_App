# backend/app/routers/awp_nuevo.py

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..crud_nuevo import (
    create_cwp_auto,
    create_paquete_auto,
    create_item_simple,
    import_items_masivo,
    get_tipos_entregables_disponibles,
    get_paquete,
    get_paquetes_por_cwp,
    get_item,
    get_items_por_paquete
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
def create_cwp(
    cwp: schemas.CWPCreate,
    db: Session = Depends(get_db)
):
    """
    Crear CWP con código auto-generado
    Código: CWP-{area}-{disciplina}-{consecutivo}
    Ejemplo: CWP-005-01-CIV-0001
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
    Código: {tipo}-{area}-{disciplina}-{consecutivo}
    Ejemplo: EWP-005-01-CIV-0001
    
    ✨ Consecutivo independiente por TIPO de paquete
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


@router.get("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def read_paquete(paquete_id: int, db: Session = Depends(get_db)):
    """Obtener un paquete por ID"""
    paquete = get_paquete(db, paquete_id)
    if not paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    return paquete


@router.put("/paquete/{paquete_id}", response_model=schemas.PaqueteResponse)
def update_paquete(
    paquete_id: int,
    paquete_update: schemas.PaqueteUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un paquete"""
    db_paquete = get_paquete(db, paquete_id)
    if not db_paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    update_data = paquete_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_paquete, key, value)
    
    db.commit()
    db.refresh(db_paquete)
    return db_paquete


@router.delete("/paquete/{paquete_id}")
def delete_paquete(paquete_id: int, db: Session = Depends(get_db)):
    """Eliminar un paquete"""
    db_paquete = get_paquete(db, paquete_id)
    if not db_paquete:
        raise HTTPException(status_code=404, detail="Paquete no encontrado")
    
    # Verificar si tiene items asociados
    items_count = len(get_items_por_paquete(db, paquete_id))
    if items_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar. El paquete tiene {items_count} item(s) asociado(s)"
        )
    
    db.delete(db_paquete)
    db.commit()
    return {"message": "Paquete eliminado exitosamente"}


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
    Crear Item SIN código automático
    Solo usa ID único de base de datos
    """
    try:
        db_item = create_item_simple(db, item, paquete_id)
        return db_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/paquete/{paquete_id}/items", response_model=List[schemas.ItemResponse])
def read_items(paquete_id: int, db: Session = Depends(get_db)):
    """Obtener todos los items de un paquete"""
    return get_items_por_paquete(db, paquete_id)


@router.get("/item/{item_id}", response_model=schemas.ItemResponse)
def read_item(item_id: int, db: Session = Depends(get_db)):
    """Obtener un item por ID"""
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return item


@router.put("/item/{item_id}", response_model=schemas.ItemResponse)
def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un item"""
    db_item = get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/item/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Eliminar un item"""
    db_item = get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item eliminado exitosamente"}


# ============================================================================
# ✨ IMPORTACIÓN MASIVA DE ITEMS
# ============================================================================

@router.post("/items/importar")
async def importar_items_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importar items desde archivo Excel/CSV
    
    Columnas esperadas:
    - id_item (opcional): ID de referencia
    - nombre_item: Nombre del item *
    - tipo_codigo: Código del tipo (PLN, CAL, etc) *
    - codigo_paquete: Código del paquete (EWP-005-01-CIV-0001) *
    - descripcion (opcional)
    - es_entregable_cliente (opcional): true/false
    - requiere_aprobacion (opcional): true/false
    """
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        required_columns = ['nombre_item', 'tipo_codigo', 'codigo_paquete']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Faltan columnas requeridas: {', '.join(missing_columns)}"
            )
        
        items_data = []
        for _, row in df.iterrows():
            item_row = schemas.ItemImportRow(
                id_item=row.get('id_item'),
                nombre_item=str(row['nombre_item']),
                tipo_codigo=str(row['tipo_codigo']).upper(),
                codigo_paquete=str(row['codigo_paquete']).upper(),
                descripcion=str(row.get('descripcion')) if pd.notna(row.get('descripcion')) else None,
                es_entregable_cliente=bool(row.get('es_entregable_cliente', False)),
                requiere_aprobacion=bool(row.get('requiere_aprobacion', True))
            )
            items_data.append(item_row)
        
        resultado = import_items_masivo(db, items_data)
        
        return {
            "success": True,
            "mensaje": f"✅ Importados {resultado['items_creados']} items",
            **resultado
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# ✨ EXPORTACIÓN DE JERARQUÍA COMPLETA
# ============================================================================

@router.get("/exportar/{proyecto_id}")
def exportar_jerarquia_completa(proyecto_id: int, db: Session = Depends(get_db)):
    """
    Exportar toda la jerarquía AWP en formato tabular para Excel
    
    Retorna estructura plana: CWA | CWP | Paquete | Item | ...
    """
    from .. import crud
    
    try:
        proyecto = crud.get_proyecto(db, proyecto_id)
        if not proyecto:
            raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
        filas = []
        
        for plot_plan in proyecto.plot_plans:
            for cwa in plot_plan.cwas:
                for cwp in cwa.cwps:
                    for paquete in cwp.paquetes:
                        for item in paquete.items:
                            # Obtener tipo de entregable
                            tipo = db.query(models.TipoEntregable).filter(
                                models.TipoEntregable.id == item.tipo_entregable_id
                            ).first()
                            
                            fila = {
                                "proyecto": proyecto.nombre,
                                "plot_plan": plot_plan.nombre,
                                "cwa_codigo": cwa.codigo,
                                "cwa_nombre": cwa.nombre,
                                "cwa_transversal": cwa.es_transversal,
                                "cwp_codigo": cwp.codigo,
                                "cwp_nombre": cwp.nombre,
                                "disciplina": cwp.disciplina.codigo if cwp.disciplina else "",
                                "paquete_codigo": paquete.codigo,
                                "paquete_nombre": paquete.nombre,
                                "paquete_tipo": paquete.tipo,
                                "paquete_responsable": paquete.responsable,
                                "item_id": item.id,
                                "item_nombre": item.nombre,
                                "item_tipo_codigo": tipo.codigo if tipo else "",
                                "item_tipo_nombre": tipo.nombre if tipo else "",
                                "item_descripcion": item.descripcion or "",
                                "item_version": item.version,
                                "item_estado": item.estado,
                                "item_progreso": item.porcentaje_completitud,
                                "item_es_entregable_cliente": item.es_entregable_cliente,
                                "item_requiere_aprobacion": item.requiere_aprobacion
                            }
                            filas.append(fila)
        
        return {
            "success": True,
            "total_items": len(filas),
            "data": filas
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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


@router.get("/debug/paquete/{codigo}")
def debug_buscar_paquete(codigo: str, db: Session = Depends(get_db)):
    """Debug: Buscar paquete por código"""
    paquete = db.query(models.Paquete).filter(
        models.Paquete.codigo == codigo.upper()
    ).first()
    
    if not paquete:
        return {"encontrado": False, "codigo_buscado": codigo}
    
    return {
        "encontrado": True,
        "id": paquete.id,
        "codigo": paquete.codigo,
        "nombre": paquete.nombre,
        "tipo": paquete.tipo,
        "cwp_id": paquete.cwp_id
    }