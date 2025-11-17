from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from .services.codificador import CodificadorAWP
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

def create_tipo_entregable(db: Session, tipo: schemas.TipoEntregableCreate, disciplina_id: int):
    """Crear tipo de entregable"""
    db_tipo = models.TipoEntregable(
        **tipo.model_dump(),
        disciplina_id=disciplina_id
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


def get_cwas_transversales(db: Session, proyecto_id: int):
    """Obtener CWAs transversales (CWA-0000) de un proyecto"""
    return db.query(models.CWA).join(models.PlotPlan).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.CWA.es_transversal == True
    ).all()


def update_cwa_geometry(db: Session, cwa_id: int, shape_type: str, shape_data: dict):
    """Actualizar geometría de un CWA"""
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa:
        raise ValueError("CWA no encontrado")
    
    db_cwa.shape_type = shape_type
    db_cwa.shape_data = shape_data
    
    db.commit()
    db.refresh(db_cwa)
    
    return db_cwa


# ============================================================================
# CWP (Construction Work Package)
# ============================================================================

def create_cwp(db: Session, cwp: schemas.CWPCreate, cwa_id: int, disciplina_id: int):
    """Crear CWP con código auto-generado"""
    db_cwa = get_cwa(db, cwa_id)
    db_disciplina = get_disciplina(db, disciplina_id)
    
    if not db_cwa or not db_disciplina:
        raise ValueError("CWA o Disciplina no encontrado")
    
    # Generar código automáticamente
    codigo_cwp = CodificadorAWP.generar_codigo_cwp(db, db_cwa, db_disciplina)
    
    db_cwp = models.CWP(
        nombre=cwp.nombre,
        codigo=codigo_cwp,
        descripcion=cwp.descripcion,
        cwa_id=cwa_id,
        duracion_dias=cwp.duracion_dias,
        fecha_inicio_prevista=cwp.fecha_inicio_prevista,
        fecha_fin_prevista=cwp.fecha_fin_prevista
    )
    
    db.add(db_cwp)
    db.flush()
    
    # Asignar disciplina al CWP
    db_asignacion = models.AsignacionDisciplinaCWP(
        cwp_id=db_cwp.id,
        disciplina_id=disciplina_id
    )
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_cwp)
    
    return db_cwp


def get_cwp(db: Session, cwp_id: int):
    """Obtener CWP por ID"""
    return db.query(models.CWP).filter(models.CWP.id == cwp_id).first()


def get_cwps_por_cwa(db: Session, cwa_id: int):
    """Obtener todos los CWPs de un CWA"""
    return db.query(models.CWP).filter(models.CWP.cwa_id == cwa_id).all()


def update_cwp(db: Session, cwp_id: int, cwp_update: schemas.CWPUpdate):
    """Actualizar CWP"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    update_data = cwp_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cwp, key, value)
    
    db.commit()
    db.refresh(db_cwp)
    return db_cwp


def calcular_completitud_cwp(db: Session, cwp_id: int) -> float:
    """
    Calcula completitud de CWP considerando:
    - Sus propios EWP, PWP, IWP
    - Sus referencias a transversales
    """
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        return 0.0
    
    # Completitud de elementos propios
    ewps = db.query(models.EWP).filter(models.EWP.cwp_id == cwp_id).all()
    pwps = db.query(models.PWP).filter(models.PWP.cwp_id == cwp_id).all()
    iwps = db.query(models.IWP).filter(models.IWP.cwp_id == cwp_id).all()
    
    total_completitud = 0
    count = 0
    
    for ewp in ewps:
        total_completitud += ewp.porcentaje_completitud
        count += 1
    
    for pwp in pwps:
        total_completitud += pwp.porcentaje_completitud
        count += 1
    
    for iwp in iwps:
        total_completitud += iwp.porcentaje_completitud
        count += 1
    
    # Completitud de referencias transversales
    referencias = db.query(models.ReferenciaTransversal).filter(
        models.ReferenciaTransversal.cwp_geografico_id == cwp_id,
        models.ReferenciaTransversal.debe_completarse == True
    ).all()
    
    for ref in referencias:
        if ref.completado:
            total_completitud += 100
        else:
            total_completitud += 0
        count += 1
    
    if count == 0:
        return 0.0
    
    return round(total_completitud / count, 2)


# ============================================================================
# EWP (Engineering Work Package)
# ============================================================================

def create_ewp(db: Session, ewp: schemas.EWPCreate, cwp_id: int, disciplina_id: int):
    """Crear EWP con código auto-generado"""
    db_cwp = get_cwp(db, cwp_id)
    db_disciplina = get_disciplina(db, disciplina_id)
    
    if not db_cwp or not db_disciplina:
        raise ValueError("CWP o Disciplina no encontrado")
    
    # Generar código: EWP-{cwp_codigo}-{consecutivo}
    contador = db.query(func.count(models.EWP.id)).filter(
        models.EWP.cwp_id == cwp_id
    ).scalar() or 0
    codigo_ewp = f"EWP-{db_cwp.codigo}-{str(contador + 1).zfill(3)}"
    
    db_ewp = models.EWP(
        nombre=ewp.nombre,
        codigo=codigo_ewp,
        descripcion=ewp.descripcion,
        cwp_id=cwp_id,
        fecha_publicacion_prevista=ewp.fecha_publicacion_prevista
    )
    
    db.add(db_ewp)
    db.flush()
    
    # Asignar disciplina al EWP
    db_asignacion = models.AsignacionDisciplinaEWP(
        ewp_id=db_ewp.id,
        disciplina_id=disciplina_id
    )
    db.add(db_asignacion)
    db.commit()
    db.refresh(db_ewp)
    
    return db_ewp


def get_ewp(db: Session, ewp_id: int):
    """Obtener EWP por ID"""
    return db.query(models.EWP).filter(models.EWP.id == ewp_id).first()


def get_ewps_por_cwp(db: Session, cwp_id: int):
    """Obtener todos los EWPs de un CWP"""
    return db.query(models.EWP).filter(models.EWP.cwp_id == cwp_id).all()


# ============================================================================
# PWP (Procurement Work Package)
# ============================================================================

def create_pwp(db: Session, pwp: schemas.PWPCreate, cwp_id: int):
    """Crear PWP con código auto-generado"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    # Generar código: PWP-{cwp_codigo}-{consecutivo}
    contador = db.query(func.count(models.PWP.id)).filter(
        models.PWP.cwp_id == cwp_id
    ).scalar() or 0
    codigo_pwp = f"PWP-{db_cwp.codigo}-{str(contador + 1).zfill(4)}"
    
    db_pwp = models.PWP(
        nombre=pwp.nombre,
        codigo=codigo_pwp,
        descripcion=pwp.descripcion,
        cwp_id=cwp_id,
        fecha_ros_prevista=pwp.fecha_ros_prevista
    )
    
    db.add(db_pwp)
    db.flush()
    
    # Agregar items de adquisición si existen
    if pwp.items_adquisicion:
        for item in pwp.items_adquisicion:
            db_item = models.ItemAdquisicion(
                pwp_id=db_pwp.id,
                nombre=item.nombre,
                descripcion=item.descripcion,
                especificacion=item.especificacion,
                cantidad=item.cantidad,
                unidad=item.unidad
            )
            db.add(db_item)
    
    db.commit()
    db.refresh(db_pwp)
    
    return db_pwp


def get_pwp(db: Session, pwp_id: int):
    """Obtener PWP por ID"""
    return db.query(models.PWP).filter(models.PWP.id == pwp_id).first()


def get_pwps_por_cwp(db: Session, cwp_id: int):
    """Obtener todos los PWPs de un CWP"""
    return db.query(models.PWP).filter(models.PWP.cwp_id == cwp_id).all()


# ============================================================================
# IWP (Installation Work Package)
# ============================================================================

def create_iwp(db: Session, iwp: schemas.IWPCreate, cwp_id: int):
    """Crear IWP con código auto-generado"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    # Generar código: IWP-{cwp_codigo}-{consecutivo}
    contador = db.query(func.count(models.IWP.id)).filter(
        models.IWP.cwp_id == cwp_id
    ).scalar() or 0
    codigo_iwp = f"IWP-{db_cwp.codigo}-{str(contador + 1).zfill(4)}"
    
    db_iwp = models.IWP(
        nombre=iwp.nombre,
        codigo=codigo_iwp,
        descripcion=iwp.descripcion,
        cwp_id=cwp_id,
        cuadrilla_construccion=iwp.cuadrilla_construccion,
        fecha_inicio_prevista=iwp.fecha_inicio_prevista,
        fecha_fin_prevista=iwp.fecha_fin_prevista
    )
    
    db.add(db_iwp)
    db.flush()
    
    # Agregar items de instalación si existen
    if iwp.items_instalacion:
        for item in iwp.items_instalacion:
            db_item = models.ItemInstalacion(
                iwp_id=db_iwp.id,
                nombre=item.nombre,
                descripcion=item.descripcion,
                horas_estimadas=item.horas_estimadas
            )
            db.add(db_item)
    
    db.commit()
    db.refresh(db_iwp)
    
    return db_iwp


def get_iwp(db: Session, iwp_id: int):
    """Obtener IWP por ID"""
    return db.query(models.IWP).filter(models.IWP.id == iwp_id).first()


def get_iwps_por_cwp(db: Session, cwp_id: int):
    """Obtener todos los IWPs de un CWP"""
    return db.query(models.IWP).filter(models.IWP.cwp_id == cwp_id).all()


# ============================================================================
# ENTREGABLES EWP
# ============================================================================

def create_entregable_ewp(db: Session, entregable: schemas.EntregableEWPCreate, ewp_id: int):
    """Crear entregable en EWP con código auto-generado"""
    db_ewp = get_ewp(db, ewp_id)
    db_tipo = get_tipo_entregable(db, entregable.tipo_entregable_id)
    
    if not db_ewp or not db_tipo:
        raise ValueError("EWP o Tipo de entregable no encontrado")
    
    # Generar código: {tipo_codigo}-{ewp_codigo}-{consecutivo}
    contador = db.query(func.count(models.EntregableEWP.id)).filter(
        models.EntregableEWP.ewp_id == ewp_id,
        models.EntregableEWP.tipo_entregable_id == entregable.tipo_entregable_id
    ).scalar() or 0
    codigo = f"{db_tipo.codigo}-{db_ewp.codigo}-{str(contador + 1).zfill(3)}"
    
    db_entregable = models.EntregableEWP(
        nombre=entregable.nombre,
        codigo=codigo,
        descripcion=entregable.descripcion,
        ewp_id=ewp_id,
        tipo_entregable_id=entregable.tipo_entregable_id,
        responsable=entregable.responsable,
        es_entregable_cliente=entregable.es_entregable_cliente
    )
    
    db.add(db_entregable)
    db.commit()
    db.refresh(db_entregable)
    
    return db_entregable


def get_entregable_ewp(db: Session, entregable_id: int):
    """Obtener entregable por ID"""
    return db.query(models.EntregableEWP).filter(
        models.EntregableEWP.id == entregable_id
    ).first()


def get_entregables_por_ewp(db: Session, ewp_id: int):
    """Obtener todos los entregables de un EWP"""
    return db.query(models.EntregableEWP).filter(
        models.EntregableEWP.ewp_id == ewp_id
    ).all()


# ============================================================================
# REFERENCIAS A TRANSVERSALES
# ============================================================================

def crear_referencia_transversal(
    db: Session,
    cwp_id: int,
    referencia: schemas.ReferenciaTransversalCreate
):
    """Crear referencia a transversal"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    db_referencia = models.ReferenciaTransversal(
        cwp_geografico_id=cwp_id,
        ewp_transversal_id=referencia.ewp_transversal_id,
        pwp_transversal_id=referencia.pwp_transversal_id,
        iwp_transversal_id=referencia.iwp_transversal_id,
        debe_completarse=referencia.debe_completarse
    )
    
    db.add(db_referencia)
    db.commit()
    db.refresh(db_referencia)
    
    return db_referencia


def get_referencias_transversales(db: Session, cwp_id: int):
    """Obtener referencias transversales de un CWP"""
    return db.query(models.ReferenciaTransversal).filter(
        models.ReferenciaTransversal.cwp_geografico_id == cwp_id
    ).all()


def listar_transversales_disponibles(db: Session, proyecto_id: int):
    """Listar EWP, PWP, IWP transversales disponibles para asociar"""
    # CWA transversal
    cwa_transversal = db.query(models.CWA).join(models.PlotPlan).filter(
        models.PlotPlan.proyecto_id == proyecto_id,
        models.CWA.es_transversal == True
    ).first()
    
    if not cwa_transversal:
        return {"ewps": [], "pwps": [], "iwps": []}
    
    ewps_transversales = db.query(models.EWP).join(models.CWP).filter(
        models.CWP.cwa_id == cwa_transversal.id
    ).all()
    
    pwps_transversales = db.query(models.PWP).join(models.CWP).filter(
        models.CWP.cwa_id == cwa_transversal.id
    ).all()
    
    iwps_transversales = db.query(models.IWP).join(models.CWP).filter(
        models.CWP.cwa_id == cwa_transversal.id
    ).all()
    
    return {
        "ewps": ewps_transversales,
        "pwps": pwps_transversales,
        "iwps": iwps_transversales
    }


# ============================================================================
# JERARQUÍA COMPLETA
# ============================================================================

def obtener_jerarquia_completa(db: Session, plot_plan_id: int):
    """
    Obtiene la jerarquía completa: PlotPlan -> CWA -> CWP -> EWP/PWP/IWP -> Entregables
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
                "asignaciones_disciplina": [
                    {
                        "id": asig.id,
                        "disciplina_id": asig.disciplina_id
                    }
                    for asig in cwp.asignaciones_disciplina
                ],
                "ewps": [],
                "pwps": [],
                "iwps": [],
                "referencias_transversales": []
            }
            
            # EWPs
            ewps = get_ewps_por_cwp(db, cwp.id)
            for ewp in ewps:
                ewp_data = {
                    "id": ewp.id,
                    "nombre": ewp.nombre,
                    "codigo": ewp.codigo,
                    "descripcion": ewp.descripcion,
                    "estado": ewp.estado,
                    "porcentaje_completitud": ewp.porcentaje_completitud,
                    "fecha_publicacion_prevista": str(ewp.fecha_publicacion_prevista) if ewp.fecha_publicacion_prevista else None,
                    "entregables": []
                }
                
                entregables = get_entregables_por_ewp(db, ewp.id)
                for entregable in entregables:
                    entregable_data = {
                        "id": entregable.id,
                        "nombre": entregable.nombre,
                        "codigo": entregable.codigo,
                        "estado_documento": entregable.estado_documento,
                        "responsable": entregable.responsable
                    }
                    ewp_data["entregables"].append(entregable_data)
                
                cwp_data["ewps"].append(ewp_data)
            
            # PWPs
            pwps = get_pwps_por_cwp(db, cwp.id)
            for pwp in pwps:
                pwp_data = {
                    "id": pwp.id,
                    "nombre": pwp.nombre,
                    "codigo": pwp.codigo,
                    "descripcion": pwp.descripcion,
                    "estado": pwp.estado,
                    "porcentaje_completitud": pwp.porcentaje_completitud,
                    "fecha_ros_prevista": str(pwp.fecha_ros_prevista) if pwp.fecha_ros_prevista else None,
                    "items_adquisicion": [
                        {
                            "id": item.id,
                            "nombre": item.nombre
                        }
                        for item in pwp.items_adquisicion
                    ]
                }
                cwp_data["pwps"].append(pwp_data)
            
            # IWPs
            iwps = get_iwps_por_cwp(db, cwp.id)
            for iwp in iwps:
                iwp_data = {
                    "id": iwp.id,
                    "nombre": iwp.nombre,
                    "codigo": iwp.codigo,
                    "descripcion": iwp.descripcion,
                    "estado": iwp.estado,
                    "porcentaje_completitud": iwp.porcentaje_completitud,
                    "fecha_inicio_prevista": str(iwp.fecha_inicio_prevista) if iwp.fecha_inicio_prevista else None,
                    "fecha_fin_prevista": str(iwp.fecha_fin_prevista) if iwp.fecha_fin_prevista else None,
                    "items_instalacion": [
                        {
                            "id": item.id,
                            "nombre": item.nombre
                        }
                        for item in iwp.items_instalacion
                    ]
                }
                cwp_data["iwps"].append(iwp_data)
            
            # Referencias transversales
            referencias = get_referencias_transversales(db, cwp.id)
            cwp_data["referencias_transversales"] = [
                {
                    "id": ref.id,
                    "ewp_id": ref.ewp_transversal_id,
                    "pwp_id": ref.pwp_transversal_id,
                    "iwp_id": ref.iwp_transversal_id,
                    "completado": ref.completado
                }
                for ref in referencias
            ]
            
            cwa_data["cwps"].append(cwp_data)
        
        jerarquia["cwas"].append(cwa_data)
    
    return jerarquia

# ============================================================================
# SECUENCIACIÓN DE CWPs
# ============================================================================

def actualizar_secuencia_cwp(db: Session, cwp_id: int, nueva_secuencia: int):
    """Actualizar la secuencia de un CWP"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    db_cwp.secuencia = nueva_secuencia
    db.commit()
    db.refresh(db_cwp)
    return db_cwp


def reordenar_cwps_por_cwa(db: Session, cwa_id: int, nuevas_secuencias: dict):
    """
    Reordena todos los CWPs de un CWA según un diccionario {cwp_id: secuencia}
    Ejemplo: {1: 1, 2: 2, 3: 3}
    """
    for cwp_id, secuencia in nuevas_secuencias.items():
        db_cwp = get_cwp(db, cwp_id)
        if db_cwp and db_cwp.cwa_id == cwa_id:
            db_cwp.secuencia = secuencia
    
    db.commit()
    return True


# ============================================================================
# DEPENDENCIAS
# ============================================================================

def crear_dependencia(db: Session, dependencia: schemas.DependenciaCWPCreate, cwp_origen_id: int):
    """Crear dependencia entre CWPs"""
    db_cwp_origen = get_cwp(db, cwp_origen_id)
    db_cwp_destino = get_cwp(db, dependencia.cwp_destino_id)
    
    if not db_cwp_origen or not db_cwp_destino:
        raise ValueError("CWP origen o destino no encontrado")
    
    # Validar que no exista ciclo
    if detectar_ciclo_dependencias(db, cwp_origen_id, dependencia.cwp_destino_id):
        raise ValueError("Esta dependencia crearía un ciclo circular")
    
    db_dependencia = models.DependenciaCWP(
        cwp_origen_id=cwp_origen_id,
        cwp_destino_id=dependencia.cwp_destino_id,
        tipo_dependencia=dependencia.tipo_dependencia,
        duracion_lag_dias=dependencia.duracion_lag_dias,
        descripcion=dependencia.descripcion
    )
    
    db.add(db_dependencia)
    db.commit()
    db.refresh(db_dependencia)
    return db_dependencia


def detectar_ciclo_dependencias(db: Session, cwp_origen_id: int, cwp_destino_id: int) -> bool:
    """
    Detecta si agregar una dependencia CWP_origen -> CWP_destino crearía un ciclo.
    Usa BFS para verificar si CWP_destino ya depende (directa o indirectamente) de CWP_origen.
    """
    visitados = set()
    cola = [cwp_destino_id]
    
    while cola:
        actual_id = cola.pop(0)
        
        if actual_id == cwp_origen_id:
            return True  # Ciclo detectado
        
        if actual_id in visitados:
            continue
        
        visitados.add(actual_id)
        
        # Obtener dependencias del actual
        dependencias = db.query(models.DependenciaCWP).filter(
            models.DependenciaCWP.cwp_origen_id == actual_id
        ).all()
        
        for dep in dependencias:
            cola.append(dep.cwp_destino_id)
    
    return False


def get_dependencias_cwp(db: Session, cwp_id: int):
    """Obtener todas las dependencias de un CWP (como origen)"""
    return db.query(models.DependenciaCWP).filter(
        models.DependenciaCWP.cwp_origen_id == cwp_id
    ).all()


def get_predecesores_cwp(db: Session, cwp_id: int):
    """Obtener todos los CWPs que son predecesores (este CWP depende de ellos)"""
    return db.query(models.DependenciaCWP).filter(
        models.DependenciaCWP.cwp_destino_id == cwp_id
    ).all()


def eliminar_dependencia(db: Session, dependencia_id: int):
    """Eliminar una dependencia"""
    db_dependencia = db.query(models.DependenciaCWP).filter(
        models.DependenciaCWP.id == dependencia_id
    ).first()
    
    if not db_dependencia:
        raise ValueError("Dependencia no encontrada")
    
    db.delete(db_dependencia)
    db.commit()
    return True

# ============================================================================
# MÉTODOS QUE FALTA AGREGAR A backend/app/crud.py
# ============================================================================

# Agregar estos métodos al final del archivo crud.py:

def update_entregable(db: Session, db_entregable: models.EntregableEWP, entregable_update: schemas.EntregableEWPUpdate):
    """Actualizar entregable"""
    update_data = entregable_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entregable, key, value)
    
    db_entregable.fecha_ultima_modificacion = datetime.utcnow()
    db.commit()
    db.refresh(db_entregable)
    return db_entregable


def eliminar_entregable(db: Session, entregable_id: int):
    """Eliminar entregable"""
    db_entregable = get_entregable_ewp(db, entregable_id)
    if not db_entregable:
        raise ValueError("Entregable no encontrado")
    
    db.delete(db_entregable)
    db.commit()
    return True


def obtener_resumen_cwa(db: Session, cwa_id: int):
    """Obtener resumen rápido de un CWA"""
    db_cwa = get_cwa(db, cwa_id)
    if not db_cwa:
        raise ValueError("CWA no encontrado")
    
    cwps = get_cwps_por_cwa(db, cwa_id)
    
    return {
        "id": db_cwa.id,
        "codigo": db_cwa.codigo,
        "nombre": db_cwa.nombre,
        "es_transversal": db_cwa.es_transversal,
        "cwps_count": len(cwps),
        "ewps_count": sum(len(c.ewps) for c in cwps),
        "pwps_count": sum(len(c.pwps) for c in cwps),
        "iwps_count": sum(len(c.iwps) for c in cwps),
    }


def obtener_resumen_proyecto_awp(db: Session, proyecto_id: int):
    """Resumen general del AWP del proyecto"""
    db_proyecto = get_proyecto(db, proyecto_id)
    if not db_proyecto:
        raise ValueError("Proyecto no encontrado")
    
    plot_plans = get_plot_plans_por_proyecto(db, proyecto_id)
    
    total_cwas = 0
    total_cwps = 0
    total_ewps = 0
    total_pwps = 0
    total_iwps = 0
    
    for pp in plot_plans:
        cwas = get_cwas_por_plot_plan(db, pp.id)
        total_cwas += len(cwas)
        
        for cwa in cwas:
            cwps = get_cwps_por_cwa(db, cwa.id)
            total_cwps += len(cwps)
            
            for cwp in cwps:
                total_ewps += len(get_ewps_por_cwp(db, cwp.id))
                total_pwps += len(get_pwps_por_cwp(db, cwp.id))
                total_iwps += len(get_iwps_por_cwp(db, cwp.id))
    
    return {
        "proyecto_id": proyecto_id,
        "plot_plans": len(plot_plans),
        "cwas": total_cwas,
        "cwps": total_cwps,
        "ewps": total_ewps,
        "pwps": total_pwps,
        "iwps": total_iwps,
    }


def actualizar_restricciones_cwp(db: Session, cwp_id: int, restricciones_json: dict, restricciones_levantadas: bool):
    """Actualizar restricciones de un CWP"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    db_cwp.restricciones_json = restricciones_json
    db_cwp.restricciones_levantadas = restricciones_levantadas
    
    db.commit()
    db.refresh(db_cwp)
    return db_cwp


def actualizar_prioridad_cwp(db: Session, cwp_id: int, prioridad: str):
    """Actualizar prioridad de un CWP"""
    db_cwp = get_cwp(db, cwp_id)
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    if prioridad not in ["ALTA", "MEDIA", "BAJA"]:
        raise ValueError("Prioridad debe ser ALTA, MEDIA o BAJA")
    
    db_cwp.prioridad = prioridad
    
    db.commit()
    db.refresh(db_cwp)
    return db_cwp
