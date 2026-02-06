# ⚙️ Configurar Variables de Entorno en Vercel

## 📋 Información de tu Proyecto

Tu proyecto Supabase:
- **URL**: `https://pkvpnxycunmbpfudzncw.supabase.co`
- **Proyecto ID**: `pkvpnxycunmbpfudzncw`

## 🚀 Pasos para Configurar en Vercel

### Paso 1: Obtener la ANON KEY de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **pkvpnxycunmbpfudzncw**
4. En el menú lateral, ve a **Settings** (⚙️) → **API**
5. En la sección **Project API keys**, encontrarás dos claves:
   - **`anon` `public`** ← **USA ESTA** (es segura para el frontend)
   - **`service_role` `secret`** ← **NO uses esta** (es privada)
6. Copia la clave **`anon` `public`** (empieza con `eyJ...`)

### Paso 2: Agregar Variables en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **Inventario2.0** (o el nombre que le hayas dado)
3. Ve a **Settings** (en la parte superior)
4. En el menú lateral, haz clic en **Environment Variables**
5. Agrega las siguientes variables:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL

1. Haz clic en **Add New**
2. **Key**: `NEXT_PUBLIC_SUPABASE_URL`
3. **Value**: `https://pkvpnxycunmbpfudzncw.supabase.co`
4. **Environment**: Marca todas las opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **Save**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Haz clic en **Add New** nuevamente
2. **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Value**: Pega la clave `anon` `public` que copiaste de Supabase
   - Debe empezar con `eyJ...`
   - Es una cadena larga (más de 100 caracteres)
4. **Environment**: Marca todas las opciones:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **Save**

### Paso 3: Redesplegar la Aplicación

Después de agregar las variables, necesitas redesplegar:

**Opción A: Redeploy desde Vercel**
1. Ve a la pestaña **Deployments**
2. Encuentra el último despliegue
3. Haz clic en los tres puntos (⋯) a la derecha
4. Selecciona **Redeploy**
5. Confirma el redeploy

**Opción B: Hacer un nuevo commit** (recomendado)
1. Haz cualquier cambio pequeño (o simplemente toca un archivo)
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push origin master
   ```
3. Vercel detectará el cambio y desplegará automáticamente

### Paso 4: Verificar que Funciona

1. Espera a que termine el despliegue (2-5 minutos)
2. Visita tu aplicación en Vercel
3. Deberías ver la página de login sin el error
4. Si aún ves el error, espera 1-2 minutos más (a veces tarda en propagarse)

## ✅ Verificación

Para verificar que las variables están configuradas:

1. En Vercel, ve a **Settings** → **Environment Variables**
2. Deberías ver:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://pkvpnxycunmbpfudzncw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (tu clave)

## 🔍 Troubleshooting

### Si el error persiste después de configurar:

1. **Verifica que las variables estén en todos los ambientes**
   - Production ✅
   - Preview ✅
   - Development ✅

2. **Verifica que no haya espacios extra**
   - Copia y pega directamente, sin espacios al inicio o final

3. **Verifica que estés usando la clave correcta**
   - Debe ser la clave `anon` `public`
   - NO la clave `service_role`

4. **Espera unos minutos**
   - A veces las variables tardan en propagarse
   - Haz un hard refresh (Ctrl+F5) en el navegador

5. **Revisa los logs de Vercel**
   - Ve a **Deployments** → Tu despliegue → **View Function Logs**
   - Busca errores relacionados con Supabase

## 📸 Capturas de Pantalla de Referencia

### En Supabase (obtener la clave):
```
Settings → API → Project API keys
┌─────────────────────────────────────┐
│ anon public                         │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │ ← Copia esta
│ [Reveal] [Copy]                     │
├─────────────────────────────────────┤
│ service_role secret                 │
│ (No la uses en el frontend)        │
└─────────────────────────────────────┘
```

### En Vercel (agregar variables):
```
Settings → Environment Variables → Add New
┌─────────────────────────────────────┐
│ Key: NEXT_PUBLIC_SUPABASE_URL       │
│ Value: https://pkvpnxycunmbpfudzncw.│
│       supabase.co                   │
│ Environment:                        │
│ ☑ Production                        │
│ ☑ Preview                           │
│ ☑ Development                        │
│ [Save]                              │
└─────────────────────────────────────┘
```

## 🆘 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. Verifica que tu proyecto Supabase esté activo
2. Verifica que tengas acceso al proyecto en Supabase
3. Revisa la consola del navegador (F12) para ver errores específicos
4. Revisa los logs de Vercel para errores del servidor

---

**Nota**: Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se exponen al cliente del navegador. Esto es seguro para la clave `anon` porque está protegida por Row Level Security (RLS) en Supabase.
