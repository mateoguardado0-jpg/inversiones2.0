# 🔑 Guía: ¿Qué API Key de Supabase usar?

## ⚠️ IMPORTANTE: Usa la clave PÚBLICA (anon), NO la secreta

### ✅ SÍ usar: Clave `anon` `public` (PÚBLICA)
- Esta es la clave que DEBES usar en tu aplicación
- Es segura para usar en el frontend
- Está protegida por Row Level Security (RLS)
- Empieza con `eyJ...` (es un JWT)

### ❌ NO usar: Clave `service_role` (SECRETA)
- Esta clave es PRIVADA y NO debe estar en el frontend
- Tiene acceso completo a la base de datos
- Solo debe usarse en el backend con mucho cuidado
- Si la expones, cualquiera puede acceder a tu base de datos

## 📍 Cómo obtener la clave correcta (anon public)

### Paso 1: Ir a Supabase Dashboard
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `pkvpnxycunmbpfudzncw`

### Paso 2: Ir a Settings → API
1. En el menú lateral, haz clic en **Settings** (⚙️)
2. Luego haz clic en **API** en el submenú

### Paso 3: Copiar la clave anon public
1. En la sección **Project API keys**, verás dos claves:
   - `anon` `public` ← **ESTA ES LA QUE NECESITAS**
   - `service_role` `secret` ← **NO USAR ESTA**

2. Haz clic en el ícono de **copiar** (📋) junto a la clave `anon` `public`
3. La clave debería verse así: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnBueHljdW5tYnBmdWR6bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.XXXXX...`

## 🔧 Configurar en tu proyecto

### Paso 1: Abrir el archivo .env.local
El archivo `.env.local` ya está creado en la raíz de tu proyecto.

### Paso 2: Reemplazar la clave
1. Abre `.env.local` con un editor de texto
2. Busca esta línea:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_AQUI
   ```
3. Reemplaza `TU_CLAVE_ANON_AQUI` con la clave que copiaste de Supabase
4. Debería quedar así:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnBueHljdW5tYnBmdWR6bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.XXXXX...
   ```

### Paso 3: Guardar y reiniciar
1. **Guarda** el archivo `.env.local`
2. **Reinicia** el servidor de desarrollo:
   - Detén el servidor (Ctrl+C en la terminal)
   - Ejecuta de nuevo: `npm run dev`

## ✅ Verificación

Después de configurar la clave, deberías poder:
- Acceder a `http://localhost:3000/login` sin errores
- Ver el formulario de login correctamente
- Registrar nuevos usuarios sin el error "Invalid API key"

## 🐛 Solución de problemas

**Error: "Invalid API key"**
- ✅ Verifica que copiaste la clave `anon` `public`, NO la `service_role`
- ✅ Verifica que no hay espacios al inicio o final de la clave
- ✅ Verifica que reiniciaste el servidor después de cambiar `.env.local`

**Error: "variables de entorno no configuradas"**
- ✅ Verifica que el archivo se llama exactamente `.env.local` (con el punto al inicio)
- ✅ Verifica que está en la raíz del proyecto (mismo nivel que `package.json`)

## 📸 Visualización

En Supabase Dashboard → Settings → API, verás algo así:

```
Project API keys
┌─────────────────────────────────────────────────┐
│ anon public                                    │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │ [📋 Copiar]
│                                                 │
│ service_role secret                            │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │ [📋 Copiar]
└─────────────────────────────────────────────────┘
```

**Usa la primera (anon public), NO la segunda (service_role secret)**
