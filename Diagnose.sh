#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO AWP MANAGER - MAC M4"
echo "=============================================="
echo ""

# 1. DOCKER STATUS
echo "📦 DOCKER STATUS"
echo "---"
docker -v 2>/dev/null || echo "❌ Docker no encontrado"
docker ps -a --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "❌ No se puede listar contenedores"
echo ""

# 2. REVISAR LOGS
echo "📋 ÚLTIMOS LOGS (últimas 20 líneas por servicio)"
echo "---"
echo "📍 Backend:"
docker-compose logs --tail=20 backend 2>/dev/null || echo "⚠️ No hay logs backend"
echo ""
echo "📍 Frontend:"
docker-compose logs --tail=20 frontend 2>/dev/null || echo "⚠️ No hay logs frontend"
echo ""
echo "📍 Base de datos:"
docker-compose logs --tail=20 db 2>/dev/null || echo "⚠️ No hay logs db"
echo ""

# 3. CONECTIVIDAD
echo "🌐 CONECTIVIDAD"
echo "---"
echo "Backend (8000):"
curl -s http://192.168.1.4:8000/health -w "\nStatus: %{http_code}\n" || echo "❌ No responde"
echo ""
echo "Frontend (3000):"
curl -s http://192.168.1.4:3000 -w "\nStatus: %{http_code}\n" || echo "❌ No responde"
echo ""
echo "BD (5433):"
nc -zv 192.168.1.4 5433 2>&1 || echo "❌ BD no accesible"
echo ""

# 4. ESTRUCTURA DEL PROYECTO
echo "📁 ESTRUCTURA DEL PROYECTO"
echo "---"
echo "Backend files:"
ls -la backend/app/*.py 2>/dev/null | wc -l
echo "Frontend files:"
ls -la frontend/src/components 2>/dev/null | wc -l
echo ""

# 5. VARIABLES DE AMBIENTE
echo "⚙️ VARIABLES CONFIGURADAS"
echo "---"
echo "DATABASE_URL en backend:"
docker-compose exec backend env | grep DATABASE_URL 2>/dev/null || echo "⚠️ No se pudo verificar"
echo ""

# 6. VERIFICAR ARCHIVOS CRÍTICOS
echo "🔐 ARCHIVOS CRÍTICOS"
echo "---"
echo "✓ Backend main.py: $(test -f backend/app/main.py && echo 'OK' || echo 'FALTA')"
echo "✓ Backend models.py: $(test -f backend/app/models.py && echo 'OK' || echo 'FALTA')"
echo "✓ Backend crud.py: $(test -f backend/app/crud.py && echo 'OK' || echo 'FALTA')"
echo "✓ Backend database.py: $(test -f backend/app/database.py && echo 'OK' || echo 'FALTA')"
echo "✓ Frontend App.jsx: $(test -f frontend/src/App.jsx && echo 'OK' || echo 'FALTA')"
echo "✓ docker-compose.yml: $(test -f docker-compose.yml && echo 'OK' || echo 'FALTA')"
echo ""

echo "✅ DIAGNÓSTICO COMPLETADO"