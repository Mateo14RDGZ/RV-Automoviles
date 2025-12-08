#!/bin/bash

echo "🔄 Aplicando migración: Remover restricción unique de matrícula..."

cd api

# Aplicar migración
npx prisma migrate deploy

# Regenerar cliente de Prisma
npx prisma generate

echo "✅ Migración completada!"
echo ""
echo "📝 Ahora los autos pueden tener:"
echo "   - Matrícula única (no se pueden repetir)"
echo "   - O valor '0km' (puede repetirse múltiples veces)"
