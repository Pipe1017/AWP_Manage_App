# backend/app/crud_nuevo.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from typing import List, Optional, Dict, Any

# ============================================================================
# CWP (Construction Work Package)
# ============================================================================

def create_cwp_auto(db: Session, cwp: schemas.CWPCreate):
    """
    Crear CWP con código auto-generado y metadata
    """
    db_area = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == cwp.disciplina_id).first()
    
    if not db_area or not db_disciplina:
        raise ValueError("Área o Disciplina no encontrada")
    
    # Generar consecutivo
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
        prioridad=cwp.prioridad,
        metadata_json=cwp.metadata_json
    )
    
    db.add(db_cwp)
    db.commit()
    db.refresh(db_cwp)
    
    return db_cwp

def update_cwp(db: Session, cwp_id: int, cwp_update: schemas.CWPCreate):
    """
    Actualizar un CWP existente
    """
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    if cwp_update.nombre:
        db_cwp.nombre = cwp_update.nombre
    
    if cwp_update.metadata_json is not None:
        current_meta = dict(db_cwp.metadata_json) if db_cwp.metadata_json else {}
        new_meta = cwp_update.metadata_json
        current_meta.update(new_meta)
        db_cwp.metadata_json = current_meta

    db.commit()
    db.refresh(db_cwp)
    return db_cwp

# ============================================================================
# PAQUETE (EWP, IWP, PWP)
# ============================================================================

def create_paquete_auto(db: Session, paquete: schemas.PaqueteCreate, cwp_id: int):
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    if paquete.tipo not in ['EWP', 'IWP', 'PWP', 'DWP']:
        raise ValueError("Tipo debe ser: EWP, IWP, PWP o DWP")
    
    db_area = db_cwp.cwa
    db_disciplina = db_cwp.disciplina
    
    contador = db.query(func.count(models.Paquete.id)).join(models.CWP).filter(
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
# ITEM (ENTREGABLE)
# ============================================================================

def create_item_simple(db: Session, item: schemas.ItemCreate, paquete_id: int):
    db_paquete = db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()
    if not db_paquete:
        raise ValueError("Paquete no encontrado")
    
    # Si viene un tipo, lo validamos. Si no (None), lo permitimos.
    if item.tipo_entregable_id:
        db_tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == item.tipo_entregable_id).first()
        if not db_tipo:
            raise ValueError("Tipo de entregable no encontrado")
    
    db_item = models.Item(
        nombre=item.nombre,
        descripcion=item.descripcion,
        tipo_entregable_id=item.tipo_entregable_id, # Puede ser None
        paquete_id=paquete_id,
        es_entregable_cliente=item.es_entregable_cliente,
        requiere_aprobacion=item.requiere_aprobacion,
        metadata_json=item.metadata_json
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

def link_items_from_source(db: Session, target_paquete_id: int, source_item_ids: List[int]):
    """
    Crea 'Shadow Items' en el paquete destino que apuntan a los items originales (Transversales).
    """
    created_items = []
    
    target_pkg = db.query(models.Paquete).filter(models.Paquete.id == target_paquete_id).first()
    if not target_pkg: raise ValueError("Paquete destino no encontrado")

    for src_id in source_item_ids:
        source_item = db.query(models.Item).filter(models.Item.id == src_id).first()
        if not source_item: continue
        
        # Verificar duplicados en el destino
        exists = db.query(models.Item).filter(
            models.Item.paquete_id == target_paquete_id,
            models.Item.source_item_id == src_id
        ).first()
        
        if exists: continue

        # Crear el vínculo
        new_link = models.Item(
            nombre=f"{source_item.nombre}", # Mismo nombre (o con prefijo si quieres)
            descripcion=source_item.descripcion,
            tipo_entregable_id=source_item.tipo_entregable_id,
            paquete_id=target_paquete_id,
            source_item_id=src_id, # 🔗 Enlace al original
            estado="VINCULADO",
            es_entregable_cliente=source_item.es_entregable_cliente
        )
        db.add(new_link)
        created_items.append(new_link)
    
    db.commit()
    return len(created_items)

# ============================================================================
# IMPORTACIÓN MASIVA INTELIGENTE
# ============================================================================

def import_items_masivo(db: Session, items_data: List[schemas.ItemImportRow]):
    """Versión simple heredada (no usada por smart_import, pero se mantiene por compatibilidad)"""
    pass

def smart_import_awp(db: Session, project_id: int, df_data):
    """
    Importa datos desde un DataFrame (Excel/CSV) con lógica de Upsert Jerárquico.
    Crea CWP -> Paquete -> Item si no existen.
    """
    stats = {"cwp_creados": 0, "paquetes_creados": 0, "items_creados": 0, "errores": []}
    
    cache_cwa = {}
    
    # 1. Precargar cache
    cwas = db.query(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == project_id).all()
    for c in cwas:
        cache_cwa[c.codigo.upper()] = c.id
        
    disciplinas = db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == project_id).all()
    disciplina_default = disciplinas[0].id if disciplinas else None

    for index, row in df_data.iterrows():
        try:
            # A. CWA (Debe existir)
            cwa_code = str(row.get('CWA', '')).strip().upper()
            if cwa_code not in cache_cwa:
                # Si no hay CWA, es un error crítico para la fila
                if cwa_code: # Solo reportar si no está vacío
                    stats["errores"].append(f"Fila {index+2}: CWA '{cwa_code}' no existe.")
                continue
            cwa_id = cache_cwa[cwa_code]

            # B. CWP (Upsert)
            cwp_code = str(row.get('CWP', '')).strip().upper()
            if not cwp_code or cwp_code == 'NAN': continue

            db_cwp = db.query(models.CWP).filter(models.CWP.codigo == cwp_code, models.CWP.cwa_id == cwa_id).first()
            
            if not db_cwp:
                if not disciplina_default:
                    stats["errores"].append(f"Fila {index+2}: No hay disciplinas configuradas para crear CWP.")
                    continue
                
                db_cwp = models.CWP(
                    nombre=f"Paquete {cwp_code}",
                    codigo=cwp_code,
                    cwa_id=cwa_id,
                    disciplina_id=disciplina_default,
                    estado="NO_INICIADO"
                )
                db.add(db_cwp)
                db.flush()
                stats["cwp_creados"] += 1

            # C. PAQUETE (Upsert)
            pkg_code = str(row.get('Codigo_Paquete', '')).strip().upper()
            pkg_type = str(row.get('Tipo_Paquete', 'EWP')).strip().upper()
            
            if not pkg_code or pkg_code == 'NAN': continue

            db_pkg = db.query(models.Paquete).filter(models.Paquete.codigo == pkg_code).first()
            
            if not db_pkg:
                db_pkg = models.Paquete(
                    nombre=f"Paquete {pkg_code}",
                    codigo=pkg_code,
                    tipo=pkg_type,
                    responsable="Importado",
                    cwp_id=db_cwp.id
                )
                db.add(db_pkg)
                db.flush()
                stats["paquetes_creados"] += 1

            # D. ITEM (Insertar si no existe)
            item_name = str(row.get('Nombre_Item', '')).strip()
            item_type_code = str(row.get('Tipo_Item_Codigo', '')).strip().upper()
            
            if not item_name or item_name == 'nan': continue

            # Tipo Entregable (Opcional o búsqueda)
            tipo_id = None
            if item_type_code and item_type_code != 'NAN':
                db_tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.codigo == item_type_code).first()
                if db_tipo:
                    tipo_id = db_tipo.id

            # Verificar existencia
            existing_item = db.query(models.Item).filter(
                models.Item.paquete_id == db_pkg.id,
                models.Item.nombre == item_name
            ).first()

            if not existing_item:
                new_item = models.Item(
                    nombre=item_name,
                    descripcion=str(row.get('Descripcion', '')),
                    tipo_entregable_id=tipo_id,
                    paquete_id=db_pkg.id,
                    estado="NO_INICIADO"
                )
                db.add(new_item)
                stats["items_creados"] += 1

        except Exception as e:
            stats["errores"].append(f"Fila {index+2}: {str(e)}")
            continue

    db.commit()
    return stats

# ============================================================================
# HELPERS
# ============================================================================

def get_tipos_entregables_disponibles(db: Session, cwp_id: int):
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp: return []
    return db.query(models.TipoEntregable).filter(
        (models.TipoEntregable.disciplina_id == db_cwp.disciplina_id) |
        (models.TipoEntregable.es_generico == True)
    ).all()

def get_paquete(db: Session, paquete_id: int):
    return db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()

def get_paquetes_por_cwp(db: Session, cwp_id: int):
    return db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp_id).all()

def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()

def get_items_por_paquete(db: Session, paquete_id: int):
    return db.query(models.Item).filter(models.Item.paquete_id == paquete_id).all()