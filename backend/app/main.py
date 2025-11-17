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

# --- CORS ---
origins = [
    "http://",
    "http://192.168.1.4:3000",
    "http://192.168.1.4:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Cargar Routers ---
# ¡AMBOS ROUTERS AHORA USAN EL PREFIJO /api/v1!
app.include_router(proyectos.router, prefix="/api/v1")
app.include_router(awp.router, prefix="/api/v1")

# --- Health Check ---
@app.get("/")
def read_root():
    return {"message": "¡Bienvenido al Backend de AWP Manager!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}