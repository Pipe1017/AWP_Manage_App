# backend/app/crud.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime


# ============================================================================
# PROYECTOS
# ============================================================================

def get_proyecto(db: Session, proyecto_id: int):
    """Obtener proyecto por ID"""
    return db.query(models.Proyecto).filter(models.Proyecto.id == proyecto_id).first()


def get_proyecto_por_nombre(db: Session, nombre: str):
    """Obtener proyecto por nombre"""
    return db.query(models.Proyecto).filter(models.Proyecto.nombre == nombre).first()


def get_proyectos(db: Session, skip: int = 0, limit: int = 100):
    """Obtener todos los proyectos"""
    return db.query(models.Proyecto).offset(skip).limit(limit).all()


def create_proyecto(db: Session, proyecto: schemas.ProyectoCreate):
    """Crear nuevo proyecto"""
    db_proyecto = models.Proyecto(**proyecto.model_dump())
    db.add(db_proyecto)
    db.commit()
    db.refresh(db_proyecto)
    return db_proyecto


# ============================================================================
# DISCIPLINAS
# ============================================================================

def create_disciplina(db: Session, disciplina: schemas.DisciplinaCreate, proyecto_id: int):
    """Crear disciplina en proyecto"""
    db_disciplina = models.Disciplina(
        **disciplina.model_dump(),
        proyecto_id=proyecto_id
    )
    db.add(db_disciplina)
    db.commit()
    db.refresh(db_disciplina)
    return db_disciplina


def get_disciplina(db: Session, disciplina_id: int):
    """Obtener disciplina por ID"""
    return db.query(models.Disciplina).filter(models.Disciplina.id == disciplina_id).first()


def get_disciplinas_por_proyecto(db: Session, proyecto_id: int):
    """Obtener todas las disciplinas de un proyecto"""
    return db.query(models.Disciplina).filter(
        models.Disciplina.proyecto_id == proyecto_id
    ).all()


# ============================================================================
# TIPOS DE ENTREGABLES
# ============================================================================

def create_tipo_entregable(db: Session, tipo: schemas.TipoEntregableCreate, disciplina_id: int = None):
    """Crear tipo de entregable"""
    db_tipo = models.TipoEntregable(
        nombre=tipo.nombre,
        codigo=tipo.codigo,
        categoria_awp=tipo.categoria_awp,
        descripcion=tipo.descripcion,
        disciplina_id=disciplina_id,
        es_generico=tipo.es_generico if hasattr(tipo, 'es_generico') else False
    )
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo


def get_tipo_entregable(db: Session, tipo_id: int):
    """Obtener tipo de entregable por ID"""
    return db.query(models.TipoEntregable).filter(models.TipoEntregable.id == tipo_id).first()


# ============================================================================
# PLOT PLANS
# ============================================================================

def create_plot_plan(db: Session, plot_plan: schemas.PlotPlanCreate, proyecto_id: int):
    """Crear plot plan"""
    db_plot_plan = models.PlotPlan(
        **plot_plan.model_dump(),
        proyecto_id=proyecto_id
    )
    db.add(db_plot_plan)
    db.commit()
    db.refresh(db_plot_plan)
    return db_plot_plan


def get_plot_plan(db: Session, plot_plan_id: int):
    """Obtener plot plan por ID"""
    return db.query(models.PlotPlan).filter(models.PlotPlan.id == plot_plan_id).first()


def get_plot_plans_por_proyecto(db: Session, proyecto_id: int):
    """Obtener todos los plot plans de un proyecto"""
    return db.query(models.PlotPlan).filter(
        models.PlotPlan.proyecto_id == proyecto_id
    ).all()


# ============================================================================
# CWA (Construction Work Area)
# ============================================================================

def create_cwa(db: Session, cwa: schemas.CWACreate, plot_plan_id: int):
    """Crear CWA"""
    db_cwa = models.CWA(
        **cwa.model_dump(),
        plot_plan_id=plot_plan_id
    )
    db.add(db_cwa)
    db.commit()
    db.refresh(db_cwa)
    return db_cwa


def get_cwa(db: Session, cwa_id: int):
    """Obtener CWA por ID"""
    return db.query(models.CWA).filter(models.CWA.id == cwa_id).first()


def get_cwas_por_plot_plan(db: Session, plot_plan_id: int):
    """Obtener todos los CWAs de un plot plan"""
    return db.query(models.CWA).filter(
        models.CWA.plot_plan_id == plot_plan_id
    ).all()


def update_cwa(db: Session, cwa_id: int, cwa_update: schemas.CWAUpdate):
    """Actualizar datos básicos de CWA"""
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa:
        raise ValueError("CWA no encontrado")
    
    update_data = cwa_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cwa, key, value)
    
    db.commit()
    db.refresh(db_cwa)
    return db_cwa


# ✨ ESTA ES LA FUNCIÓN QUE FALTABA ✨
def update_cwa_geometry(db: Session, cwa_id: int, shape_type: str, shape_data: dict):
    """Actualizar solo la geometría (dibujo) de un CWA"""
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa:
        raise ValueError(f"CWA con id {cwa_id} no encontrado")
    
    # Actualizamos los campos de geometría
    db_cwa.shape_type = shape_type
    db_cwa.shape_data = shape_data
    
    db.commit()
    db.refresh(db_cwa)
    return db_cwa


def delete_cwa(db: Session, cwa_id: int):
    """Eliminar CWA"""
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa:
        raise ValueError("CWA no encontrado")
    
    db.delete(db_cwa)
    db.commit()
    return True


# ============================================================================
# CWP (Construction Work Package)
# ============================================================================

def get_cwp(db: Session, cwp_id: int):
    """Obtener CWP por ID"""
    return db.query(models.CWP).filter(models.CWP.id == cwp_id).first()


def get_cwps_por_cwa(db: Session, cwa_id: int):
    """Obtener todos los CWPs de un CWA"""
    return db.query(models.CWP).filter(models.CWP.cwa_id == cwa_id).all()


# ============================================================================
# JERARQUÍA COMPLETA
# ============================================================================

def obtener_jerarquia_completa(db: Session, plot_plan_id: int):
    """
    Obtiene la jerarquía completa con la NUEVA estructura:
    PlotPlan -> CWA -> CWP -> Paquete -> Item
    """
    db_plot_plan = get_plot_plan(db, plot_plan_id)
    if not db_plot_plan:
        raise ValueError("Plot plan no encontrado")
    
    jerarquia = {
        "plot_plan": {
            "id": db_plot_plan.id,
            "nombre": db_plot_plan.nombre,
            "codigo": db_plot_plan.nombre
        },
        "cwas": []
    }
    
    cwas = get_cwas_por_plot_plan(db, plot_plan_id)
    
    for cwa in cwas:
        cwa_data = {
            "id": cwa.id,
            "nombre": cwa.nombre,
            "codigo": cwa.codigo,
            "es_transversal": cwa.es_transversal,
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
                "prioridad": cwp.prioridad,
                "secuencia": cwp.secuencia,
                "fecha_inicio_prevista": str(cwp.fecha_inicio_prevista) if cwp.fecha_inicio_prevista else None,
                "fecha_fin_prevista": str(cwp.fecha_fin_prevista) if cwp.fecha_fin_prevista else None,
                "restricciones_levantadas": cwp.restricciones_levantadas,
                "restricciones_json": cwp.restricciones_json,
                "disciplina_id": cwp.disciplina_id,
                "paquetes": []
            }
            
            paquetes = db.query(models.Paquete).filter(
                models.Paquete.cwp_id == cwp.id
            ).all()
            
            for paquete in paquetes:
                paquete_data = {
                    "id": paquete.id,
                    "codigo": paquete.codigo,
                    "nombre": paquete.nombre,
                    "descripcion": paquete.descripcion,
                    "tipo": paquete.tipo,
                    "responsable": paquete.responsable,
                    "estado": paquete.estado,
                    "porcentaje_completitud": paquete.porcentaje_completitud,
                    "fecha_inicio_prevista": str(paquete.fecha_inicio_prevista) if paquete.fecha_inicio_prevista else None,
                    "fecha_fin_prevista": str(paquete.fecha_fin_prevista) if paquete.fecha_fin_prevista else None,
                    "metadata_json": paquete.metadata_json,
                    "cwp_id": paquete.cwp_id,
                    "items": []
                }
                
                items = db.query(models.Item).filter(
                    models.Item.paquete_id == paquete.id
                ).all()
                
                for item in items:
                    tipo_entregable = db.query(models.TipoEntregable).filter(
                        models.TipoEntregable.id == item.tipo_entregable_id
                    ).first()
                    
                    item_data = {
                        "id": item.id,
                        "nombre": item.nombre,
                        "descripcion": item.descripcion,
                        "estado": item.estado,
                        "porcentaje_completitud": item.porcentaje_completitud,
                        "version": item.version,
                        "tipo_entregable_id": item.tipo_entregable_id,
                        "tipo_entregable_codigo": tipo_entregable.codigo if tipo_entregable else None,
                        "tipo_entregable_nombre": tipo_entregable.nombre if tipo_entregable else None,
                        "es_entregable_cliente": item.es_entregable_cliente,
                        "requiere_aprobacion": item.requiere_aprobacion,
                        "archivo_url": item.archivo_url,
                        "metadata_json": item.metadata_json
                    }
                    
                    paquete_data["items"].append(item_data)
                
                cwp_data["paquetes"].append(paquete_data)
            
            cwa_data["cwps"].append(cwp_data)
        
        jerarquia["cwas"].append(cwa_data)
    
    return jerarquia