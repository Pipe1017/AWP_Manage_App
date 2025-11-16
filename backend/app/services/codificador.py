from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models


class CodificadorAWP:
    """
    Sistema de codificación semi-automática para estructura AWP.
    
    Ejemplo:
    CWA: CWA(Fijo)-037-01 (Usuario define)
    CWP: CWP-037-01-INS-0001 (Auto: CWA-código + Disciplina + Consecutivo)
    EWP: EWP-037-01-INS-0001-001 (Auto: CWP-código + Consecutivo)
    Entregable: P&ID-037-01-INS-0001-001 (Auto: TipoEntregable + CWP + Consecutivo)
    """
    
    @staticmethod
    def generar_codigo_cwp(db: Session, cwa: models.CWA, disciplina: models.Disciplina) -> str:
        """
        Genera código CWP automáticamente.
        Formato: CWP-{cwa_codigo}-{disciplina_codigo}-{consecutivo_4_digitos}
        Ej: CWP-037-01-INS-0001
        """
        # Extraer parte numérica del CWA (ej: "037-01" de "CWA(Fijo)-037-01")
        cwa_parte = CodificadorAWP._extraer_parte_numerica_cwa(cwa.codigo)
        
        # Contar CWP existentes para esta CWA y disciplina
        contador = db.query(func.count(models.CWP.id)).filter(
            models.CWP.cwa_id == cwa.id,
            models.CWP.codigo.ilike(f"CWP-{cwa_parte}-{disciplina.codigo}-%")
        ).scalar() or 0
        
        consecutivo = str(contador + 1).zfill(4)  # 0001, 0002, etc
        
        codigo = f"CWP-{cwa_parte}-{disciplina.codigo}-{consecutivo}"
        return codigo
    
    
    @staticmethod
    def _extraer_parte_numerica_cwa(codigo_cwa: str) -> str:
        """
        Extrae la parte numérica del código CWA.
        Ej: "CWA(Fijo)-037-01" -> "037-01"
        """
        if "-" in codigo_cwa:
            # Toma todo después del primer guion que siga a paréntesis
            partes = codigo_cwa.split("-")
            if len(partes) >= 2:
                # Si tiene formato como "CWA(Fijo)-037-01", toma "037-01"
                return "-".join(partes[1:])
        return codigo_cwa
    
    
    @staticmethod
    def validar_codigo_cwa(codigo: str) -> tuple:
        """
        Valida formato del código CWA.
        Formato esperado: {prefijo}({descripcion})-{numero}-{seccion}
        Ej: CWA(Fijo)-037-01
        """
        # Ejemplo simple: debe contener guiones y paréntesis
        if "(" not in codigo or ")" not in codigo or "-" not in codigo:
            return False, "Formato inválido. Use: PREFIJO(Descripción)-NUMERO-SECCION"
        
        # Más validaciones si es necesario
        return True, "Válido"
    
    
    @staticmethod
    def generar_codigo_customizado(
        patron: str,
        variables: dict
    ) -> str:
        """
        Genera código basado en un patrón customizado.
        
        Patrón: "CWP-{cwa_codigo}-{disciplina}-{consecutivo}"
        Variables: {"cwa_codigo": "037-01", "disciplina": "INS", "consecutivo": "0001"}
        """
        codigo = patron
        for key, value in variables.items():
            codigo = codigo.replace(f"{{{key}}}", str(value))
        return codigo