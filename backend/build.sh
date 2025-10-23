#!/bin/bash
# Script de build para Vercel - Backend

echo "🔧 Generando Prisma Client..."
cd backend
npx prisma generate
echo "✅ Prisma Client generado exitosamente"
