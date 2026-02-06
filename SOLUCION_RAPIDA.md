# ⚡ SOLUCIÓN RÁPIDA - Actualizar .env.local

## 🔴 PROBLEMA ACTUAL
El archivo `.env.local` todavía tiene: `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Desde PowerShell (RÁPIDO)

1. **Abre PowerShell** en la carpeta del proyecto

2. **Ejecuta este comando** (reemplaza TU_CLAVE_AQUI con tu clave real):
```powershell
$clave = "TU_CLAVE_AQUI"
(Get-Content .env.local) -replace 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here', "NEXT_PUBLIC_SUPABASE_ANON_KEY=$clave" | Set-Content .env.local
```

### Opción 2: Manual (PASO A PASO)

1. **Abre el archivo** `.env.local` con Bloc de notas:
   - Click derecho en `.env.local` → Abrir con → Bloc de notas

2. **Busca esta línea**:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Reemplaza** `your_supabase_anon_key_here` con tu clave real de Supabase

4. **GUARDA** el archivo (Ctrl + S)

5. **Cierra** el Bloc de notas

### Opción 3: Desde VS Code/Cursor

1. Abre VS Code/Cursor en la carpeta del proyecto
2. Abre el archivo `.env.local`
3. Busca: `your_supabase_anon_key_here`
4. Reemplázalo con tu clave real
5. Guarda (Ctrl + S)

## 🔄 DESPUÉS DE ACTUALIZAR

1. **Detén el servidor**: Ctrl + C en la terminal
2. **Elimina el caché de Next.js**:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. **Reinicia el servidor**:
   ```powershell
   npm run dev
   ```

## ✅ VERIFICAR

Ejecuta:
```powershell
node verificar-config.js
```

Debería decir: `✅ Configuración válida!`
