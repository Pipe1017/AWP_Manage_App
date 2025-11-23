# backend/app/crud_nuevo.py

from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from . import models, schemas
from typing import List, Optional, Dict, Any
import pandas as pd

# ============================================================================
# CWP (CONSTRUCTION WORK PACKAGE)
# ============================================================================

def create_cwp_auto(db: Session, cwp: schemas.CWPCreate):
    """
    Crea un CWP calculando el código automáticamente.
    """
    db_area = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == cwp.disciplina_id).first()
    
    if not db_area or not db_disciplina:
        raise ValueError("Área o Disciplina no encontrada")
    
    # Generar consecutivo (0001, 0002...)
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
        # Campos nuevos
        secuencia=cwp.secuencia,
        forecast_inicio=cwp.forecast_inicio,
        forecast_fin=cwp.forecast_fin,
        metadata_json=cwp.metadata_json
    )
    
    db.add(db_cwp)
    db.commit()
    db.refresh(db_cwp)
    return db_cwp

def update_cwp(db: Session, cwp_id: int, cwp_update: schemas.CWPUpdate):
    """
    Actualiza campos del CWP (incluyendo metadatos dinámicos)
    """
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    # Actualización de campos opcionales
    if cwp_update.nombre is not None: db_cwp.nombre = cwp_update.nombre
    if cwp_update.descripcion is not None: db_cwp.descripcion = cwp_update.descripcion
    if cwp_update.secuencia is not None: db_cwp.secuencia = cwp_update.secuencia
    if cwp_update.forecast_inicio is not None: db_cwp.forecast_inicio = cwp_update.forecast_inicio
    if cwp_update.forecast_fin is not None: db_cwp.forecast_fin = cwp_update.forecast_fin
    
    # Fusión de metadatos JSON
    if cwp_update.metadata_json is not None:
        current_meta = dict(db_cwp.metadata_json) if db_cwp.metadata_json else {}
        current_meta.update(cwp_update.metadata_json)
        db_cwp.metadata_json = current_meta

    db.commit()
    db.refresh(db_cwp)
    return db_cwp

def delete_cwp(db: Session, cwp_id: int):
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    db.delete(db_cwp)
    db.commit()
    return True

# ============================================================================
# PAQUETE (EWP, IWP, PWP)
# ============================================================================

def create_paquete_auto(db: Session, paquete: schemas.PaqueteCreate, cwp_id: int):
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    # Contar paquetes similares para el consecutivo
    contador = db.query(func.count(models.Paquete.id)).join(models.CWP).filter(
        models.CWP.cwa_id == db_cwp.cwa_id,
        models.CWP.disciplina_id == db_cwp.disciplina_id,
        models.Paquete.tipo == paquete.tipo
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(4)
    codigo_paquete = f"{paquete.tipo}-{db_cwp.cwa.codigo}-{db_cwp.disciplina.codigo}-{consecutivo}"
    
    db_paquete = models.Paquete(
        nombre=paquete.nombre,
        codigo=codigo_paquete,
        descripcion=paquete.descripcion,
        tipo=paquete.tipo,
        responsable=paquete.responsable,
        cwp_id=cwp_id,
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
    
    # Validar tipo si se envía
    if item.tipo_entregable_id:
        db_tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == item.tipo_entregable_id).first()
        if not db_tipo:
            raise ValueError("Tipo de entregable no encontrado")
    
    db_item = models.Item(
        nombre=item.nombre,
        descripcion=item.descripcion,
        tipo_entregable_id=item.tipo_entregable_id,
        paquete_id=paquete_id,
        forecast_fin=item.forecast_fin,
        metadata_json=item.metadata_json
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# ============================================================================
# VINCULACIÓN (LINKING)
# ============================================================================

def link_items_from_source(db: Session, target_paquete_id: int, source_item_ids: List[int]):
    """Crea copias vinculadas de items existentes en otro paquete"""
    count = 0
    for src_id in source_item_ids:
        source_item = db.query(models.Item).filter(models.Item.id == src_id).first()
        if not source_item: continue
        
        # Evitar duplicados
        exists = db.query(models.Item).filter(
            models.Item.paquete_id == target_paquete_id,
            models.Item.source_item_id == src_id
        ).first()
        if exists: continue

        new_link = models.Item(
            nombre=source_item.nombre,
            descripcion=source_item.descripcion,
            tipo_entregable_id=source_item.tipo_entregable_id,
            paquete_id=target_paquete_id,
            source_item_id=src_id, # ID del padre
            estado="VINCULADO",
            es_entregable_cliente=source_item.es_entregable_cliente
        )
        db.add(new_link)
        count += 1
    
    db.commit()
    return count

# ============================================================================
# IMPORTACIÓN INTELIGENTE (UPSERT)
# ============================================================================

def smart_import_awp(db: Session, project_id: int, df_data):
    stats = {"cwp_creados": 0, "paquetes_creados": 0, "items_creados": 0, "items_actualizados": 0, "errores": []}
    
    # Caches
    cache_cwa = {c.codigo.upper(): c.id for c in db.query(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == project_id).all()}
    disciplinas = db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == project_id).all()
    disciplina_default = disciplinas[0].id if disciplinas else None

    for index, row in df_data.iterrows():
        try:
            # 1. UPDATE POR ID
            item_id_raw = row.get('ID_Item')
            if pd.notna(item_id_raw) and str(item_id_raw).strip() != '':
                try:
                    item_id = int(float(item_id_raw))
                    db_item = db.query(models.Item).filter(models.Item.id == item_id).first()
                    if db_item:
                        if pd.notna(row.get('Nombre_Item')): db_item.nombre = str(row.get('Nombre_Item'))
                        if pd.notna(row.get('Descripcion')): db_item.descripcion = str(row.get('Descripcion'))
                        # TODO: Actualizar fechas si vienen en el excel
                        stats["items_actualizados"] += 1
                        continue
                except: pass

            # 2. CREACIÓN JERÁRQUICA
            cwa_code = str(row.get('CWA', '')).strip().upper()
            if cwa_code not in cache_cwa:
                if cwa_code: stats["errores"].append(f"Fila {index+2}: CWA '{cwa_code}' no existe.")
                continue
            
            cwp_code = str(row.get('CWP', '')).strip().upper()
            if not cwp_code or cwp_code == 'NAN': continue

            # Buscar/Crear CWP
            db_cwp = db.query(models.CWP).filter(models.CWP.codigo == cwp_code, models.CWP.cwa_id == cache_cwa[cwa_code]).first()
            if not db_cwp:
                if not disciplina_default: continue
                db_cwp = models.CWP(
                    nombre=f"Paquete {cwp_code}", codigo=cwp_code, cwa_id=cache_cwa[cwa_code],
                    disciplina_id=disciplina_default, estado="NO_INICIADO"
                )
                db.add(db_cwp); db.flush(); stats["cwp_creados"] += 1

            # Buscar/Crear Paquete
            pkg_code = str(row.get('Codigo_Paquete', '')).strip().upper()
            pkg_type = str(row.get('Tipo_Paquete', 'EWP')).strip().upper()
            if not pkg_code or pkg_code == 'NAN': continue

            db_pkg = db.query(models.Paquete).filter(models.Paquete.codigo == pkg_code).first()
            if not db_pkg:
                db_pkg = models.Paquete(
                    nombre=f"Paquete {pkg_code}", codigo=pkg_code, tipo=pkg_type,
                    responsable="Importado", cwp_id=db_cwp.id
                )
                db.add(db_pkg); db.flush(); stats["paquetes_creados"] += 1

            # Crear Item
            item_name = str(row.get('Nombre_Item', '')).strip()
            if not item_name or item_name == 'nan': continue
            
            # Buscar Tipo
            tipo_code = str(row.get('Tipo_Item_Codigo', '')).strip().upper()
            tipo_id = None
            if tipo_code and tipo_code != 'NAN':
                t = db.query(models.TipoEntregable).filter(models.TipoEntregable.codigo == tipo_code).first()
                if t: tipo_id = t.id

            # Insertar si no existe
            if not db.query(models.Item).filter(models.Item.paquete_id == db_pkg.id, models.Item.nombre == item_name).first():
                new_item = models.Item(
                    nombre=item_name, descripcion=str(row.get('Descripcion', '')),
                    tipo_entregable_id=tipo_id, paquete_id=db_pkg.id, estado="NO_INICIADO"
                )
                db.add(new_item); stats["items_creados"] += 1

        except Exception as e:
            stats["errores"].append(f"Fila {index+2}: {str(e)}")
            continue

    db.commit()
    return stats

# ============================================================================
# VISTA GLOBAL (ARBOL COMPLETO)
# ============================================================================

def obtener_jerarquia_global(db: Session, project_id: int):
    """
    Devuelve todo el árbol del proyecto: CWA -> CWP -> Paquete -> Item
    """
    jerarquia = {"proyecto_id": project_id, "cwas": []}
    
    # Obtener todos los CWAs del proyecto
    cwas = db.query(models.CWA).join(models.PlotPlan).filter(models.PlotPlan.proyecto_id == project_id).order_by(models.CWA.codigo).all()
    
    for cwa in cwas:
        cwa_data = {
            "id": cwa.id, "nombre": cwa.nombre, "codigo": cwa.codigo,
            "plot_plan_nombre": cwa.plot_plan.nombre,
            "prioridad": cwa.prioridad, # ✅ Prioridad está aquí (Área)
            "es_transversal": cwa.es_transversal,
            "cwps": []
        }
        
        cwps = db.query(models.CWP).filter(models.CWP.cwa_id == cwa.id).order_by(models.CWP.secuencia).all()
        
        for cwp in cwps:
            cwp_data = {
                "id": cwp.id, "nombre": cwp.nombre, "codigo": cwp.codigo,
                "secuencia": cwp.secuencia,
                "forecast_inicio": str(cwp.forecast_inicio) if cwp.forecast_inicio else None,
                "forecast_fin": str(cwp.forecast_fin) if cwp.forecast_fin else None,
                "porcentaje_completitud": cwp.porcentaje_completitud,
                "metadata_json": cwp.metadata_json,
                "disciplina_id": cwp.disciplina_id,
                "paquetes": []
            }
            
            pkgs = db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp.id).all()
            for p in pkgs:
                p_data = { "id": p.id, "codigo": p.codigo, "nombre": p.nombre, "tipo": p.tipo, "items": [] }
                
                items = db.query(models.Item).filter(models.Item.paquete_id == p.id).all()
                for i in items:
                    tipo = None
                    if i.tipo_entregable_id:
                        tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == i.tipo_entregable_id).first()
                    
                    # Info de Origen
                    org = None
                    if i.source_item_id:
                        src = db.query(models.Item).filter(models.Item.id == i.source_item_id).first()
                        if src: org = f"{src.paquete.cwp.cwa.nombre} / {src.paquete.codigo}"
                    
                    p_data["items"].append({
                        "id": i.id, "nombre": i.nombre, "archivo_url": i.archivo_url,
                        "tipo_entregable_codigo": tipo.codigo if tipo else None,
                        "forecast_fin": str(i.forecast_fin) if i.forecast_fin else None,
                        "source_item_id": i.source_item_id, "origen_info": org
                    })
                cwp_data["paquetes"].append(p_data)
            cwa_data["cwps"].append(cwp_data)
        jerarquia["cwas"].append(cwa_data)
    
    return jerarquia

# Helpers
def get_tipos_entregables_disponibles(db, cid):
    c = db.query(models.CWP).filter(models.CWP.id == cid).first()
    if not c: return []
    return db.query(models.TipoEntregable).filter((models.TipoEntregable.disciplina_id == c.disciplina_id) | (models.TipoEntregable.es_generico == True)).all()

def get_paquete(db, pid): return db.query(models.Paquete).filter(models.Paquete.id == pid).first()
def get_paquetes_por_cwp(db, cid): return db.query(models.Paquete).filter(models.Paquete.cwp_id == cid).all()
def get_item(db, iid): return db.query(models.Item).filter(models.Item.id == iid).first()
def get_items_por_paquete(db, pid): return db.query(models.Item).filter(models.Item.paquete_id == pid).all()
def import_items_masivo(db, items): pass