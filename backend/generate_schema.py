import sys
import os

# Agregamos el directorio actual al path para poder importar 'app'
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable
from app.database import Base
# Importamos todos los modelos para que se registren en Base.metadata
from app.models import (
    Proyecto, Disciplina, TipoEntregable, 
    PlotPlan, CWA, CWP, Paquete, Item, CWPColumnaMetadata
)

def dump(sql, *multiparams, **params):
    # Compila la sentencia SQL usando el dialecto de Postgres y la imprime
    print(sql.compile(dialect=engine.dialect))
    # Separador para que el archivo SQL sea legible
    print(";") 

if __name__ == "__main__":
    # Usamos una estrategia 'mock' de SQLAlchemy. 
    # Esto simula una conexión a DB pero solo para generar el DDL.
    engine = create_engine('postgresql://', strategy='mock', executor=dump)
    
    print("-- AWP MANAGER INIT SCRIPT GENERATED FROM MODELS")
    print("-- Generated automatically")
    print("")
    
    # Esto genera los CREATE TABLE en el orden correcto de dependencias
    Base.metadata.create_all(engine, checkfirst=False)