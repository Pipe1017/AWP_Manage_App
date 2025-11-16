#!/bin/bash
set -e

echo "⏳ Esperando a que PostgreSQL esté listo..."
while ! nc -z db 5432; do
  sleep 1
done
echo "✅ PostgreSQL está listo!"

echo "🚀 Iniciando FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload