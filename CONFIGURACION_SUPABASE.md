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

## 🔐 Configuración de Google OAuth

Si estás recibiendo alguno de estos errores:
- `"Unsupported provider: provider is not enabled"` - Google OAuth no está habilitado
- `"Unsupported provider: missing OAuth secret"` - Falta el Client Secret en la configuración

Sigue estos pasos para configurar Google OAuth correctamente:

### Paso 1: Crear credenciales en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Haz clic en **Create Credentials** → **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth:
   - Tipo: **External** (o Internal si tienes Google Workspace)
   - Completa la información requerida
   - Guarda y continúa
6. Crea el OAuth client ID:
   - Tipo de aplicación: **Web application**
   - Nombre: `Inventario2.0` (o el que prefieras)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (para desarrollo)
     - `https://tu-dominio.com/auth/callback` (para producción)
     - `https://pkvpnxycunmbpfudzncw.supabase.co/auth/v1/callback` (URL de Supabase)
7. Copia el **Client ID** y **Client Secret** que se generan

### Paso 2: Habilitar Google OAuth en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** → **Providers** (en el menú lateral)
3. Busca **Google** en la lista de proveedores
4. Haz clic en el toggle para **habilitar** Google
5. Completa los campos:
   - **Client ID (for OAuth)**: Pega el Client ID de Google Cloud Console
   - **Client Secret (for OAuth)**: Pega el Client Secret de Google Cloud Console
6. Haz clic en **Save**

### Paso 3: Verificar la configuración

1. Asegúrate de que el toggle de Google esté **habilitado** (verde/azul)
2. Verifica que las URLs de redirección en Google Cloud Console incluyan:
   - La URL de tu aplicación: `http://localhost:3000/auth/callback`
   - La URL de Supabase: `https://pkvpnxycunmbpfudzncw.supabase.co/auth/v1/callback`

### Paso 4: Probar la autenticación

1. Reinicia tu servidor de desarrollo si está corriendo
2. Ve a la página de login
3. Haz clic en el botón "Google"
4. Deberías ser redirigido a Google para autenticarte

### ⚠️ Notas importantes

- **Desarrollo local**: Usa `http://localhost:3000` en las URLs autorizadas
- **Producción**: Reemplaza con tu dominio real (ej: `https://inventario.com`)
- **URL de Supabase**: Siempre incluye `https://pkvpnxycunmbpfudzncw.supabase.co/auth/v1/callback` en las redirect URIs
- Si cambias las URLs, puede tomar unos minutos en propagarse

### 🐛 Solución de problemas

**Error: "Unsupported provider: provider is not enabled"**
- ✅ Verifica que el toggle de Google esté habilitado en Supabase
- ✅ Verifica que hayas guardado los cambios después de ingresar Client ID y Secret

**Error: "Unsupported provider: missing OAuth secret"** ⚠️ **ESTE ES TU ERROR ACTUAL**
- ✅ Ve a Supabase Dashboard → Authentication → Providers → Google
- ✅ Asegúrate de que el toggle esté **habilitado**
- ✅ Verifica que el campo **Client Secret (for OAuth)** esté **completamente lleno**
- ✅ Si el campo está vacío, pega el Client Secret de Google Cloud Console
- ✅ **IMPORTANTE**: Haz clic en **Save** después de ingresar el Client Secret
- ✅ Espera unos segundos y recarga la página para verificar que se guardó

**Error: "redirect_uri_mismatch"**
- ✅ Verifica que todas las URLs de callback estén en Google Cloud Console
- ✅ Asegúrate de incluir tanto la URL de tu app como la de Supabase

**Error: "invalid_client"**
- ✅ Verifica que el Client ID y Client Secret sean correctos
- ✅ Asegúrate de haber copiado los valores completos sin espacios

**Error: "Invalid API key"** ⚠️ **ERROR AL REGISTRARSE**
- ✅ Verifica que tengas un archivo `.env.local` en la raíz del proyecto
- ✅ Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté configurada con tu clave anónima real
- ✅ **NO uses valores placeholder** como `your_supabase_anon_key_here` o `TU_ANON_KEY_AQUI`
- ✅ La clave debe empezar con `eyJ...` (es un JWT)
- ✅ Obtén la clave correcta en Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- ✅ **IMPORTANTE**: Después de actualizar `.env.local`, **reinicia el servidor de desarrollo** (`Ctrl+C` y luego `npm run dev`)
- ✅ Verifica que no haya espacios extra al inicio o final de la clave