#!/bin/bash

# Asegurarse de que la carpeta existe
mkdir -p .docker/db

echo "📦 Exportando datos actuales de la base de datos 'awp_db'..."

# Ejecuta pg_dump dentro del contenedor.
# -U admin: Usuario
# --clean: Incluye comandos para borrar tablas viejas antes de crear nuevas (útil para quien restaura)
# --if-exists: Evita errores si las tablas no existen al borrar
docker exec -e PGPASSWORD=admin awp_db pg_dump -U admin -d awp_db --clean --if-exists > ./.docker/db/init.sql

if [ $? -eq 0 ]; then
    echo "✅ Éxito: La base de datos se ha guardado en '.docker/db/init.sql'"
    echo "📝 Ahora puedes subir este archivo a GitHub."
else
    echo "❌ Error: Asegúrate de que el contenedor 'awp_db' esté corriendo (docker-compose up)."
fi