FROM python:3.11-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Instala herramientas necesarias
RUN apt-get update && apt-get install -y netcat-openbsd dos2unix && rm -rf /var/lib/apt/lists/*

# Copia solo el archivo de requerimientos primero (para caché de Docker)
COPY requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código del backend
COPY . .

# Copia el entrypoint script, convierte line endings y dale permisos
COPY entrypoint.sh /app/entrypoint.sh
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expone el puerto 8000 (donde correrá FastAPI)
EXPOSE 8000

# Comando para correr el entrypoint
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]