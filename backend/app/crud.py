from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime

# ============================================================================
# PROYECTOS (CRUD COMPLETO)
# ============================================================================

def get_proyecto(db: Session, proyecto_id: int):
    return db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()

def get_proyecto_por_nombre(db: Session, nombre: str):
    return db.query(models.Proyecto).filter(models.Proyecto.nombre == nombre).first()

def get_proyectos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Proyecto).offset(skip).limit(limit).all()

def create_proyecto(db: Session, proyecto: schemas.ProyectoCreate):
    db_proyecto = models.Proyecto(**proyecto.model_dump())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

def update_proyecto(db: Session, proyecto_id: int, proyecto_update: schemas.ProyectoCreate):
    db_proyecto = get_proyecto(db, proyecto_id)
    if not db_proyecto:
        return None
    
    if proyecto_update.nombre:
        db_proyecto.nombre = proyecto_update.nombre
    if proyecto_update.descripcion:
        db_proyecto.descripcion = proyecto_update.descripcion
    
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto

def delete_proyecto(db: Session, proyecto_id: int):
    db_proyecto = get_proyecto(db, proyecto_id)
    if not db_proyecto:
        return False
    
    db.delete(db_proyecto)
    db.commit()
    return True

# ============================================================================
# DISCIPLINAS (CRUD COMPLETO)
# ============================================================================

def create_disciplina(db: Session, disciplina: schemas.DisciplinaCreate, proyecto_id: int):
    db_disciplina = models.Disciplina(**disciplina.model_dump(), proyecto_id=proyecto_id)
    db.add(db_disciplina)
    db.commit()
    db.refresh(db_disciplina)
    return db_disciplina

def get_disciplina(db: Session, disciplina_id: int):
    return db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()

def get_disciplinas_por_proyecto(db: Session, proyecto_id: int):
    return db.query(models.Disciplina).filter(models.Disciplina.proyecto_id == proyecto_id).all()

def update_disciplina(db: Session, disciplina_id: int, disciplina_update: schemas.DisciplinaCreate):
    db_disc = db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()
    if not db_disc: return None
    
    db_disc.nombre = disciplina_update.nombre
    db_disc.codigo = disciplina_update.codigo
    # Si tuvieras descripción en el schema:
    # if disciplina_update.descripcion: db_disc.descripcion = disciplina_update.descripcion
    
    db.commit()
    db.refresh(db_disc)
    return db_disc

def delete_disciplina(db: Session, disciplina_id: int):
    db_disc = db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()
    if not db_disc: return False
    db.delete(db_disc)
    db.commit()
    return True

# ============================================================================
# TIPOS DE ENTREGABLE
# ============================================================================

def create_tipo_entregable(db: Session, tipo: schemas.TipoEntregableCreate, disciplina_id: int = None):
    db_tipo = models.TipoEntregable(
        nombre=tipo.nombre, codigo=tipo.codigo, categoria_awp=tipo.categoria_awp,
        descripcion=tipo.descripcion, disciplina_id=disciplina_id,
        es_generico=tipo.es_generico if hasattr(tipo, 'es_generico') else False
    )
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo

def get_tipo_entregable(db: Session, tipo_id: int):
    return db.query(models.TipoEntregable).filter(models.TipoEntregable.id == tipo_id).first()

# ============================================================================
# PLOT PLAN Y CWA
# ============================================================================

def create_plot_plan(db: Session, plot_plan: schemas.PlotPlanCreate, proyecto_id: int):
    db_plot_plan = models.PlotPlan(**plot_plan.model_dump(), proyecto_id=proyecto_id)
    db.add(db_plot_plan)
    db.commit()
    db.refresh(db_plot_plan)
    return db_plot_plan

def get_plot_plan(db: Session, plot_plan_id: int):
    return db.query(models.PlotPlan).filter(models.PlotPlan.id == plot_plan_id).first()

def get_plot_plans_por_proyecto(db: Session, proyecto_id: int):
    return db.query(models.PlotPlan).filter(models.PlotPlan.proyecto_id == proyecto_id).all()

def create_cwa(db: Session, cwa: schemas.CWACreate, plot_plan_id: int):
    db_cwa = models.CWA(**cwa.model_dump(), plot_plan_id=plot_plan_id)
    db.add(db_cwa)
    db.commit()
    db.refresh(db_cwa)
    return db_cwa

def get_cwa(db: Session, cwa_id: int):
    return db.query(models.CWA).filter(models.CWA.id == cwa_id).first()

def get_cwas_por_plot_plan(db: Session, plot_plan_id: int):
    return db.query(models.CWA).filter(models.CWA.plot_plan_id == plot_plan_id).all()

def update_cwa(db: Session, cwa_id: int, cwa_update: schemas.CWAUpdate):
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa: raise ValueError("CWA no encontrado")
    update_data = cwa_update.model_dump(exclude_unset=True)
    for key, value in update_data.items(): setattr(db_cwa, key, value)
    db.commit()
    db.refresh(db_cwa)
    return db_cwa

def update_cwa_geometry(db: Session, cwa_id: int, shape_type: str, shape_data: dict):
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa: raise ValueError(f"CWA con id {cwa_id} no encontrado")
    db_cwa.shape_type = shape_type
    db_cwa.shape_data = shape_data
    db.commit()
    db.refresh(db_cwa)
    return db_cwa

def delete_cwa(db: Session, cwa_id: int):
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa: raise ValueError("CWA no encontrado")
    db.delete(db_cwa)
    db.commit()
    return True

def get_cwp(db: Session, cwp_id: int):
    return db.query(models.CWP).filter(models.CWP.id == cwp_id).first()

def get_cwps_por_cwa(db: Session, cwa_id: int):
    return db.query(models.CWP).filter(models.CWP.cwa_id == cwa_id).all()

# ============================================================================
# METADATOS (CRUD EXTRA)
# ============================================================================

# ✅ NUEVO: Update Metadata con Migración de Datos
def update_columna_metadata(db: Session, columna_id: int, columna_update: schemas.ColumnaCreate):
    db_col = db.query(models.CWPColumnaMetadata).filter(models.CWPColumnaMetadata.id == columna_id).first()
    if not db_col:
        return None
    
    old_name = db_col.nombre
    new_name = columna_update.nombre
    
    # 1. Actualizar la definición de la columna
    db_col.nombre = new_name
    db_col.tipo_dato = columna_update.tipo_dato
    db_col.opciones_json = columna_update.opciones
    
    # 2. MIGRACIÓN INTELIGENTE: Si el nombre cambió, actualizar los datos en los CWPs
    if old_name != new_name:
        cwps = db.query(models.CWP).join(models.CWA).join(models.PlotPlan).filter(
            models.PlotPlan.proyecto_id == db_col.proyecto_id
        ).all()
        
        for cwp in cwps:
            if cwp.metadata_json and old_name in cwp.metadata_json:
                # Crear copia mutable del dict
                new_meta = dict(cwp.metadata_json)
                # Mover el valor a la nueva llave
                new_meta[new_name] = new_meta.pop(old_name)
                # Guardar
                cwp.metadata_json = new_meta
                
    db.commit()
    db.refresh(db_col)
    return db_col

def delete_columna_metadata(db: Session, columna_id: int):
    col = db.query(models.CWPColumnaMetadata).filter(models.CWPColumnaMetadata.id == columna_id).first()
    if not col: return False
    db.delete(col)
    db.commit()
    return True

# ============================================================================
# JERARQUÍA COMPLETA (CORREGIDA - SIN BUG DE PRIORIDAD)
# ============================================================================

def obtener_jerarquia_completa(db: Session, plot_plan_id: int):
    db_plot_plan = get_plot_plan(db, plot_plan_id)
    if not db_plot_plan: raise ValueError("Plot plan no encontrado")
    
    jerarquia = {
        "plot_plan": { "id": db_plot_plan.id, "nombre": db_plot_plan.nombre, "codigo": db_plot_plan.nombre },
        "cwas": []
    }
    
    cwas = get_cwas_por_plot_plan(db, plot_plan_id)
    
    for cwa in cwas:
        cwa_data = {
            "id": cwa.id,
            "nombre": cwa.nombre,
            "codigo": cwa.codigo,
            "es_transversal": cwa.es_transversal,
            "prioridad": cwa.prioridad, # ✅ Correcto: Prioridad es del CWA
            "cwps": []
        }
        
        cwps = get_cwps_por_cwa(db, cwa.id)
        
        for cwp in cwps:
            cwp_data = {
                "id": cwp.id,
                "nombre": cwp.nombre,
                "codigo": cwp.codigo,
                "descripcion": cwp.descripcion,
                "duracion_dias": cwp.duracion_dias,
                "estado": cwp.estado,
                "porcentaje_completitud": cwp.porcentaje_completitud,
                # 🔴 ELIMINADO: "prioridad": cwp.prioridad (Esto causaba el crash)
                "secuencia": cwp.secuencia,
                "fecha_inicio_prevista": str(cwp.fecha_inicio_prevista) if cwp.fecha_inicio_prevista else None,
                "fecha_fin_prevista": str(cwp.fecha_fin_prevista) if cwp.fecha_fin_prevista else None,
                "metadata_json": cwp.metadata_json,
                "disciplina_id": cwp.disciplina_id,
                "paquetes": []
            }
            
            paquetes = db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp.id).all()
            
            for paquete in paquetes:
                paquete_data = {
                    "id": paquete.id,
                    "codigo": paquete.codigo,
                    "nombre": paquete.nombre,
                    "tipo": paquete.tipo,
                    "items": []
                }
                
                items = db.query(models.Item).filter(models.Item.paquete_id == paquete.id).all()
                
                for item in items:
                    tipo = db.query(models.TipoEntregable).filter(models.TipoEntregable.id == item.tipo_entregable_id).first()
                    item_data = {
                        "id": item.id,
                        "nombre": item.nombre,
                        "descripcion": item.descripcion,
                        "estado": item.estado,
                        "porcentaje_completitud": item.porcentaje_completitud,
                        "version": item.version,
                        "tipo_entregable_codigo": tipo.codigo if tipo else None,
                        "tipo_entregable_nombre": tipo.nombre if tipo else None,
                        "es_entregable_cliente": item.es_entregable_cliente,
                        "archivo_url": item.archivo_url,
                        "metadata_json": item.metadata_json
                    }
                    paquete_data["items"].append(item_data)
                cwp_data["paquetes"].append(paquete_data)
            cwa_data["cwps"].append(cwp_data)
        jerarquia["cwas"].append(cwa_data)
    
    return jerarquia