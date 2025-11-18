# backend/app/crud_nuevo.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime

# ============================================================================
# CWP - Auto-codificación: CWP-{area}-{disciplina}-{consecutivo}
# ============================================================================

def create_cwp_auto(db: Session, cwp: schemas.CWPCreate):
    """
    Crear CWP con código auto-generado
    Formato: CWP-{area.codigo}-{disciplina.codigo}-{consecutivo}
    Ejemplo: CWP-005-01-CIV-0001
    """
    # Obtener área y disciplina
    db_area = db.query(models.CWA).filter(models.CWA.id == cwp.area_id).first()
    db_disciplina = db.query(models.Disciplina).filter(models.Disciplina.id == cwp.disciplina_id).first()
    
    if not db_area or not db_disciplina:
        raise ValueError("Área o Disciplina no encontrada")
    
    # Calcular consecutivo para esta combinación area+disciplina
    contador = db.query(func.count(models.CWP.id)).filter(
        models.CWP.cwa_id == cwp.area_id,
        models.CWP.disciplina_id == cwp.disciplina_id
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(4)  # 0001, 0002, etc
    
    # Construir código
    codigo_cwp = f"CWP-{db_area.codigo}-{db_disciplina.codigo}-{consecutivo}"
    
    # Crear CWP
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
# PAQUETE - Auto-codificación: {cwp_codigo}-{tipo}-{consecutivo}
# ============================================================================

def create_paquete_auto(db: Session, paquete: schemas.PaqueteCreate, cwp_id: int):
    """
    Crear Paquete con código auto-generado
    Formato: {cwp.codigo}-{tipo}-{consecutivo}
    Ejemplo: CWP-005-01-CIV-0001-DWP-001
    """
    # Obtener CWP padre
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        raise ValueError("CWP no encontrado")
    
    # Validar tipo
    if paquete.tipo not in ['EWP', 'IWP', 'PWP', 'DWP']:
        raise ValueError("Tipo debe ser: EWP, IWP, PWP o DWP")
    
    # Calcular consecutivo para este tipo en este CWP
    contador = db.query(func.count(models.Paquete.id)).filter(
        models.Paquete.cwp_id == cwp_id,
        models.Paquete.tipo == paquete.tipo
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(3)  # 001, 002, etc (3 dígitos)
    
    # Construir código
    codigo_paquete = f"{db_cwp.codigo}-{paquete.tipo}-{consecutivo}"
    
    # Crear Paquete
    db_paquete = models.Paquete(
        nombre=paquete.nombre,
        codigo=codigo_paquete,
        descripcion=paquete.descripcion,
        tipo=paquete.tipo,
        responsable=paquete.responsable,
        cwp_id=cwp_id,
        fecha_inicio_prevista=paquete.fecha_inicio_prevista,
        fecha_fin_prevista=paquete.fecha_fin_prevista,
        metadata=paquete.metadata
    )
    
    db.add(db_paquete)
    db.commit()
    db.refresh(db_paquete)
    
    return db_paquete


# ============================================================================
# ITEM - Auto-codificación: {paquete_codigo}-{tipo_codigo}-{consecutivo}
# ============================================================================

def create_item_auto(db: Session, item: schemas.ItemCreate, paquete_id: int):
    """
    Crear Item con código auto-generado
    Formato: {paquete.codigo}-{tipo_entregable.codigo}-{consecutivo}
    Ejemplo: CWP-005-01-CIV-0001-DWP-001-PLN-001
    """
    # Obtener Paquete padre
    db_paquete = db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()
    if not db_paquete:
        raise ValueError("Paquete no encontrado")
    
    # Obtener TipoEntregable
    db_tipo = db.query(models.TipoEntregable).filter(
        models.TipoEntregable.id == item.tipo_entregable_id
    ).first()
    if not db_tipo:
        raise ValueError("Tipo de entregable no encontrado")
    
    # Calcular consecutivo para este tipo en este paquete
    contador = db.query(func.count(models.Item.id)).filter(
        models.Item.paquete_id == paquete_id,
        models.Item.tipo_entregable_id == item.tipo_entregable_id
    ).scalar() or 0
    
    consecutivo = str(contador + 1).zfill(3)  # 001, 002, etc (3 dígitos)
    
    # Construir código
    codigo_item = f"{db_paquete.codigo}-{db_tipo.codigo}-{consecutivo}"
    
    # Crear Item
    db_item = models.Item(
        nombre=item.nombre,
        codigo=codigo_item,
        descripcion=item.descripcion,
        tipo_entregable_id=item.tipo_entregable_id,
        responsable=item.responsable,
        paquete_id=paquete_id,
        es_entregable_cliente=item.es_entregable_cliente,
        requiere_aprobacion=item.requiere_aprobacion,
        metadata=item.metadata
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item


# ============================================================================
# OBTENER TIPOS DE ENTREGABLE FILTRADOS POR DISCIPLINA
# ============================================================================

def get_tipos_entregables_disponibles(db: Session, cwp_id: int):
    """
    Obtiene tipos de entregable disponibles para un CWP:
    - Los de la disciplina del CWP
    - Los genéricos (GEN)
    """
    # Obtener CWP con su disciplina
    db_cwp = db.query(models.CWP).filter(models.CWP.id == cwp_id).first()
    if not db_cwp:
        return []
    
    # Tipos de la disciplina del CWP + genéricos
    tipos = db.query(models.TipoEntregable).filter(
        (models.TipoEntregable.disciplina_id == db_cwp.disciplina_id) |
        (models.TipoEntregable.es_generico == True)
    ).all()
    
    return tipos


# ============================================================================
# GETS
# ============================================================================

def get_paquete(db: Session, paquete_id: int):
    return db.query(models.Paquete).filter(models.Paquete.id == paquete_id).first()


def get_paquetes_por_cwp(db: Session, cwp_id: int):
    return db.query(models.Paquete).filter(models.Paquete.cwp_id == cwp_id).all()


def get_item(db: Session, item_id: int):
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_items_por_paquete(db: Session, paquete_id: int):
    return db.query(models.Item).filter(models.Item.paquete_id == paquete_id).all()