# Script para actualizar .env.local con la clave de Supabase
param(
    [Parameter(Mandatory=$true)]
    [string]$ClaveSupabase
)

$envPath = ".env.local"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ ERROR: El archivo .env.local no existe" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Actualizando .env.local..." -ForegroundColor Yellow

# Leer el contenido actual
$contenido = Get-Content $envPath -Raw

# Reemplazar la clave
$contenidoNuevo = $contenido -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$ClaveSupabase"

# Guardar el archivo
$contenidoNuevo | Set-Content $envPath -NoNewline

Write-Host "✅ Archivo actualizado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Verificando..." -ForegroundColor Cyan
node verificar-config.js

Write-Host ""
Write-Host "💡 IMPORTANTE: Reinicia el servidor (Ctrl+C y luego npm run dev)" -ForegroundColor Yellow
