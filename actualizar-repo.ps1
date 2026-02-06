# Script para actualizar el repositorio en GitHub
# Ejecuta: .\actualizar-repo.ps1

Write-Host "🔄 Actualizando repositorio..." -ForegroundColor Cyan

# Verificar estado
Write-Host "`n📊 Verificando estado del repositorio..." -ForegroundColor Yellow
git status

# Preguntar si continuar
$continuar = Read-Host "`n¿Deseas continuar con el commit y push? (S/N)"
if ($continuar -ne "S" -and $continuar -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit
}

# Agregar todos los cambios
Write-Host "`n➕ Agregando cambios..." -ForegroundColor Yellow
git add .

# Solicitar mensaje de commit
Write-Host "`n💬 Ingresa el mensaje de commit (o presiona Enter para usar el mensaje por defecto):" -ForegroundColor Yellow
$mensaje = Read-Host
if ([string]::IsNullOrWhiteSpace($mensaje)) {
    $mensaje = "Actualizar proyecto - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Hacer commit
Write-Host "`n📝 Creando commit..." -ForegroundColor Yellow
git commit -m $mensaje

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit creado exitosamente" -ForegroundColor Green
    
    # Hacer push
    Write-Host "`n🚀 Subiendo cambios a GitHub..." -ForegroundColor Yellow
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ ¡Repositorio actualizado exitosamente!" -ForegroundColor Green
        Write-Host "🌐 Puedes ver los cambios en: https://github.com/mateoguardado0-jpg/inversiones2.0" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Error al subir cambios" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Error al crear commit (puede que no haya cambios para commitear)" -ForegroundColor Red
}
