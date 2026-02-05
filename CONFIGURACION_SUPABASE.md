# 🔑 Configuración de Supabase

## Diferencia entre conexión PostgreSQL y cliente Supabase

### ❌ NO usar (para Next.js):
```
postgresql://postgres:[PASSWORD]@db.pkvpnxycunmbpfudzncw.supabase.co:5432/postgres
```
Esta cadena es para conexión directa a PostgreSQL (herramientas como pgAdmin, DBeaver, scripts SQL).

### ✅ SÍ usar (para Next.js):
- `NEXT_PUBLIC_SUPABASE_URL`: https://pkvpnxycunmbpfudzncw.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave pública/anónima

## 📍 Cómo obtener la ANON KEY

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto: `pkvpnxycunmbpfudzncw`
3. Ve a **Settings** (⚙️) → **API**
4. En la sección **Project API keys**, copia la clave **`anon` `public`**
   - Esta es la clave que empieza con `eyJ...` (es un JWT)
   - ⚠️ NO uses la clave `service_role` (es privada y no debe estar en el frontend)

## 🔧 Configuración del archivo .env.local

Ya tienes el archivo `.env.local` creado. Solo necesitas:

1. Abrir `.env.local`
2. Reemplazar `TU_ANON_KEY_AQUI` con tu clave anónima real
3. Guardar el archivo
4. Reiniciar el servidor de desarrollo (`npm run dev`)

## 📝 Ejemplo de .env.local completo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pkvpnxycunmbpfudzncw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnBueHljdW5tYnBmdWR6bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.ejemplo...
NEXT_PUBLIC_GEMINI_API_KEY=opcional
```

## 🔐 Seguridad

- ✅ La `anon` key es segura para usar en el frontend (está protegida por RLS)
- ❌ NUNCA expongas la `service_role` key en el frontend
- ✅ El archivo `.env.local` está en `.gitignore` y no se sube a GitHub

## 🗄️ Cadena de conexión PostgreSQL (para otras herramientas)

Si necesitas conectarte directamente a PostgreSQL (para pgAdmin, DBeaver, etc.):

```
postgresql://postgres:[TU_PASSWORD]@db.pkvpnxycunmbpfudzncw.supabase.co:5432/postgres
```

Para obtener la contraseña:
1. Ve a **Settings** → **Database**
2. Busca la sección **Connection string** o **Connection pooling**
3. La contraseña es la que configuraste al crear el proyecto
