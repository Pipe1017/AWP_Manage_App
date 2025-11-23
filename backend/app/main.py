# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .routers import awp, proyectos, awp_nuevo
from .database import engine, Base

# Crear tablas en BD
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AWP Manager API",
    description="API para gestión de Advanced Work Packaging",
    version="2.0.0"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción cambiar por la IP del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 📂 CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
# ==========================================

# 1. Obtener ruta absoluta del directorio actual (en Docker es /app)
BASE_DIR = os.getcwd()

# 2. Definir ruta absoluta de uploads
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# 3. Crear la carpeta si no existe
os.makedirs(UPLOAD_DIR, exist_ok=True)

print(f"📂 [Main] Montando uploads desde: {UPLOAD_DIR}")

# 4. Montar la ruta para que sea accesible vía web
# Ejemplo: http://localhost:8000/uploads/imagen.jpg -> /app/uploads/imagen.jpg
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ==========================================

# Registrar routers
app.include_router(proyectos.router, prefix="/api/v1")
app.include_router(awp.router, prefix="/api/v1")
app.include_router(awp_nuevo.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "message": "AWP Manager API",
        "version": "2.0.0",
        "status": "running",
        "upload_dir_configured": UPLOAD_DIR
    }