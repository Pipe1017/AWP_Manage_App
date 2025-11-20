from fastapi import FastAPI
from . import models
from .database import engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Importa AMBOS routers
from .routers import awp, proyectos 

# Crea las tablas de la BD
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AWP Management System")

# --- Montar Carpeta Estática ---
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- CORS: CONFIGURACIÓN ACTUALIZADA CON IP POR CABLE ---
# Es necesario listar explícitamente los orígenes si allow_credentials=True.
origins = [
    "http://localhost:3000",       # Acceso local (tú)
    "http://127.0.0.1:3000",       # Alternativa de localhost
    
    # 🚨 NUEVA IP DE CABLE PARA COMPARTIR 🚨
    "http://10.92.12.84:3000",   # Tu IP de la empresa (Frontend)
    "http://10.92.12.84:8000",   # Tu IP de la empresa (Backend, si lo acceden directo)
    
    # Puerto interno de Vite
    "http://localhost:5173",       
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Usar la lista de orígenes específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cargar Routers ---
app.include_router(proyectos.router, prefix="/api/v1")
app.include_router(awp.router, prefix="/api/v1")

# --- Health Check ---
@app.get("/")
def read_root():
    return {"message": "¡Bienvenido al Backend de AWP Manager!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}