# Script para aplicar migraciones pendientes en producción
# Ejecuta este script después de configurar tu DATABASE_URL

# Instrucciones:
# 1. Copia tu DATABASE_URL de Vercel (Variables de entorno)
# 2. Ejecuta en PowerShell:
#    $env:DATABASE_URL="tu_url_de_base_de_datos_aqui"
#    cd api
#    npx prisma migrate deploy
#
# Esto aplicará todas las migraciones pendientes incluyendo la de escribana

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  APLICAR MIGRACIONES EN PRODUCCIÓN" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si DATABASE_URL está configurada
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL no está configurada" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ejecuta primero:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://usuario:password@host/database"' -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicando migraciones..." -ForegroundColor Yellow

# Cambiar al directorio api
Set-Location -Path "$PSScriptRoot\api"

# Ejecutar migración
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migraciones aplicadas exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "La columna 'escribana' ahora está disponible en la base de datos." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error al aplicar migraciones" -ForegroundColor Red
    Write-Host "Revisa los mensajes de error arriba" -ForegroundColor Yellow
}
