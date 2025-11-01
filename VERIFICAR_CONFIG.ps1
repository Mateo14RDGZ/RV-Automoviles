# Script para verificar la configuracion antes del deploy a Vercel
# Ejecutar desde la raiz del proyecto: .\VERIFICAR_CONFIG.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   VERIFICADOR DE CONFIGURACION VERCEL" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$errores = 0
$advertencias = 0

# 1. Verificar archivo vercel.json
Write-Host "[1/6] Verificando vercel.json..." -ForegroundColor Yellow
if (Test-Path ".\vercel.json") {
    Write-Host "  OK vercel.json encontrado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: vercel.json no encontrado" -ForegroundColor Red
    $errores++
}

# 2. Verificar backend/api/index.js
Write-Host "[2/6] Verificando backend/api/index.js..." -ForegroundColor Yellow
if (Test-Path ".\backend\api\index.js") {
    Write-Host "  OK backend/api/index.js encontrado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: backend/api/index.js no encontrado" -ForegroundColor Red
    $errores++
}

# 3. Verificar backend/package.json tiene postinstall
Write-Host "[3/6] Verificando backend/package.json..." -ForegroundColor Yellow
if (Test-Path ".\backend\package.json") {
    $packageJson = Get-Content ".\backend\package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.postinstall) {
        Write-Host "  OK Script postinstall encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ADVERTENCIA: Script postinstall no encontrado" -ForegroundColor Yellow
        $advertencias++
    }
} else {
    Write-Host "  ERROR: backend/package.json no encontrado" -ForegroundColor Red
    $errores++
}

# 4. Verificar frontend/package.json
Write-Host "[4/6] Verificando frontend/package.json..." -ForegroundColor Yellow
if (Test-Path ".\frontend\package.json") {
    $packageJson = Get-Content ".\frontend\package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.build) {
        Write-Host "  OK Script build encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: Script build no encontrado" -ForegroundColor Red
        $errores++
    }
} else {
    Write-Host "  ERROR: frontend/package.json no encontrado" -ForegroundColor Red
    $errores++
}

# 5. Verificar schema.prisma
Write-Host "[5/6] Verificando backend/prisma/schema.prisma..." -ForegroundColor Yellow
if (Test-Path ".\backend\prisma\schema.prisma") {
    $schema = Get-Content ".\backend\prisma\schema.prisma" -Raw
    if ($schema -match 'provider\s*=\s*"postgresql"') {
        Write-Host "  OK Provider PostgreSQL configurado" -ForegroundColor Green
    } else {
        Write-Host "  ADVERTENCIA: Provider no es PostgreSQL" -ForegroundColor Yellow
        $advertencias++
    }
} else {
    Write-Host "  ERROR: backend/prisma/schema.prisma no encontrado" -ForegroundColor Red
    $errores++
}

# 6. Verificar .gitignore
Write-Host "[6/6] Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".\.gitignore") {
    Write-Host "  OK .gitignore encontrado" -ForegroundColor Green
} else {
    Write-Host "  ADVERTENCIA: .gitignore no encontrado" -ForegroundColor Yellow
    $advertencias++
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   RESUMEN" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

if ($errores -eq 0 -and $advertencias -eq 0) {
    Write-Host "TODO CORRECTO - Listo para deploy" -ForegroundColor Green
} elseif ($errores -eq 0) {
    Write-Host "$advertencias advertencia(s) encontrada(s)" -ForegroundColor Yellow
    Write-Host "Puedes deployar, pero revisa las advertencias" -ForegroundColor Yellow
} else {
    Write-Host "$errores error(es) encontrado(s)" -ForegroundColor Red
    Write-Host "Corrige los errores antes de deployar" -ForegroundColor Red
}

Write-Host ""
Write-Host "SIGUIENTE PASO: Configura variables en Vercel Dashboard" -ForegroundColor Cyan
Write-Host "Detalles en: DEPLOY_VERCEL_COMPLETO.md" -ForegroundColor Cyan
Write-Host ""
