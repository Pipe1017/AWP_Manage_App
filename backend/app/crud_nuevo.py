# backend/app/crud_nuevo.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime
from typing import List

# ============================================================================
# CWP
# ============================================================================

def create_cwp_auto(db: Session, cwp: schemas.CWPCreate):
    """
    Crear CWP con código auto-generado
    Formato: CWP-{area.codigo}-{disciplina.codigo}-{consecutivo}
    Ejemplo: CWP-005-01-CIV-0001
    """
    db_area = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == cwp.disciplina_id).first()
    
    if not db_area or not db_disciplina:
        raise ValueError("Área o Disciplina no encontrada")
    
    contador = db.query(func.count(models.CWP.id)).filter(
        models.CWP.cwa_id == cwp.area_id,
        models.CWP.disciplina_id == cwp.disciplina_id
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(4)
    codigo_cwp = f"CWP-{db_area.codigo}-{db_disciplina.codigo}-{consecutivo}"
    
    db_cwp = models.CWP(
        nombre=cwp.nombre,
        codigo=codigo_cwp,
        descripcion=cwp.descripcion,
        cwa_id=cwp.area_id,
        disciplina_id=cwp.disciplina_id,
        duracion_dias=cwp.duracion_dias,
        fecha_inicio_prevista=cwp.fecha_inicio_prevista,
        fecha_fin_prevista=cwp.fecha_fin_prevista,
        secuencia=cwp.secuencia,
        prioridad=cwp.prioridad
    )
    
    db.add(db_cwp)
    db.commit()
    db.refresh(db_cwp)
    
    return db_cwp


# ============================================================================
# ✨ PAQUETE - CODIFICACIÓN CORREGIDA
# ============================================================================

def create_paquete_auto(db: Session, paquete: schemas.PaqueteCreate, cwp_id: int):
    """
    Crear Paquete con código auto-generado
    Formato: {tipo}-{area}-{disciplina}-{consecutivo}
    Ejemplo: EWP-005-01-CIV-0001
    
    ✨ Consecutivo independiente POR TIPO de paquete
    """
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    if paquete.tipo not in ['EWP', 'IWP', 'PWP', 'DWP']:
        raise ValueError("Tipo debe ser: EWP, IWP, PWP o DWP")
    
    db_area = db_cwp.cwa
    db_disciplina = db_cwp.disciplina
    
    # Contar paquetes del mismo tipo en la misma área+disciplina
    contador = db.query(func.count(models.Paquete.id)).join(
        models.CWP
    ).filter(
        models.CWP.cwa_id == db_cwp.cwa_id,
        models.CWP.disciplina_id == db_cwp.disciplina_id,
        models.Paquete.tipo == paquete.tipo
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(4)
    codigo_paquete = f"{paquete.tipo}-{db_area.codigo}-{db_disciplina.codigo}-{consecutivo}"
    
    db_paquete = models.Paquete(
        nombre=paquete.nombre,
        codigo=codigo_paquete,
        descripcion=paquete.descripcion,
        tipo=paquete.tipo,
        responsable=paquete.responsable,
        cwp_id=cwp_id,
        fecha_inicio_prevista=paquete.fecha_inicio_prevista,
        fecha_fin_prevista=paquete.fecha_fin_prevista,
        metadata_json=paquete.metadata_json
    )
    
    db.add(db_paquete)
    db.commit()
    db.refresh(db_paquete)
    
    return db_paquete


# ============================================================================
# ✨ ITEM - SIN CODIFICACIÓN AUTOMÁTICA
# ============================================================================

def create_item_simple(db: Session, item: schemas.ItemCreate, paquete_id: int):
    """
    Crear Item SIN código automático
    Solo usa ID único de base de datos
    """
    db_paquete = db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()
    if not db_paquete:
        raise ValueError("Paquete no encontrado")
    
    db_tipo = db.query(models.TipoEntregable).filter(
        models.TipoEntregable.id == item.tipo_entregable_id
    ).first()
    if not db_tipo:
        raise ValueError("Tipo de entregable no encontrado")
    
    db_item = models.Item(
        nombre=item.nombre,
        descripcion=item.descripcion,
        tipo_entregable_id=item.tipo_entregable_id,
        paquete_id=paquete_id,
        es_entregable_cliente=item.es_entregable_cliente,
        requiere_aprobacion=item.requiere_aprobacion,
        metadata_json=item.metadata_json
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item


# ============================================================================
# ✨ IMPORTACIÓN MASIVA DE ITEMS
# ============================================================================

def import_items_masivo(db: Session, items_data: List[schemas.ItemImportRow]):
    """
    Importar múltiples items desde Excel/CSV
    """
    items_creados = []
    errores = []
    
    for idx, item_row in enumerate(items_data, start=1):
        try:
            db_paquete = db.query(models.Paquete).filter(
                models.Paquete.codigo == item_row.codigo_paquete
            ).first()
            
            if not db_paquete:
                errores.append(f"Fila {idx}: Paquete '{item_row.codigo_paquete}' no encontrado")
                continue
            
            db_tipo = db.query(models.TipoEntregable).filter(
                models.TipoEntregable.codigo == item_row.tipo_codigo
            ).first()
            
            if not db_tipo:
                errores.append(f"Fila {idx}: Tipo '{item_row.tipo_codigo}' no encontrado")
                continue
            
            db_item = models.Item(
                nombre=item_row.nombre_item,
                descripcion=item_row.descripcion,
                tipo_entregable_id=db_tipo.id,
                paquete_id=db_paquete.id,
                es_entregable_cliente=item_row.es_entregable_cliente,
                requiere_aprobacion=item_row.requiere_aprobacion
            )
            
            db.add(db_item)
            items_creados.append({
                "id_ref": item_row.id_item,
                "nombre": item_row.nombre_item,
                "paquete": item_row.codigo_paquete
            })
            
        except Exception as e:
            errores.append(f"Fila {idx}: {str(e)}")
            continue
    
    if items_creados:
        db.commit()
    
    return {
        "items_creados": len(items_creados),
        "items_con_error": len(errores),
        "detalles_items": items_creados,
        "errores": errores
    }


# ============================================================================
# HELPERS
# ============================================================================

def get_tipos_entregables_disponibles(db: Session, cwp_id: int):
    """
    Obtiene tipos de entregable disponibles para un CWP
    """
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        return []
    
    tipos = db.query(models.TipoEntregable).filter(
        (models.TipoEntregable.disciplina_id == db_cwp.disciplina_id) |
        (models.TipoEntregable.es_generico == True)
    ).all()
    
    return tipos


def get_paquete(db: Session, paquete_id: int):
    return db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()


def get_paquetes_por_cwp(db: Session, cwp_id: int):
    return db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp_id).all()


def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_items_por_paquete(db: Session, paquete_id: int):
    return db.query(models.Item).filter(models.Item.paquete_id == paquete_id).all() 