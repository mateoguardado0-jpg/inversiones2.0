# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación Inventario 2.0 en Vercel de forma rápida y sencilla.

## 📋 Requisitos Previos

1. ✅ Cuenta de GitHub (o GitLab/Bitbucket)
2. ✅ Cuenta de Vercel (gratuita)
3. ✅ Proyecto en Supabase configurado
4. ✅ Variables de entorno listas

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar que todo esté en Git

```bash
# Verificar estado
git status

# Si hay cambios sin commitear
git add .
git commit -m "Preparar para despliegue en Vercel"
```

### 1.2 Subir a GitHub

```bash
# Si aún no tienes un repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Subir el código
git push -u origin main
```

## 🌐 Paso 2: Configurar Vercel

### 2.1 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"** o **"Import Project"**
3. Conecta tu cuenta de GitHub si es la primera vez
4. Selecciona el repositorio de Inventario 2.0
5. Vercel detectará automáticamente que es un proyecto Next.js

### 2.2 Configurar Variables de Entorno

En la pantalla de configuración del proyecto, agrega las siguientes variables de entorno:

#### Variables Requeridas:

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Valor**: Tu URL de Supabase (ej: `https://pkvpnxycunmbpfudzncw.supabase.co`)
- **Tipo**: Plaintext

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Valor**: Tu clave anónima de Supabase (la que empieza con `eyJ...`)
- **Tipo**: Plaintext
- **⚠️ Importante**: Esta es la clave `anon` `public`, NO la `service_role`

#### Variables Opcionales:

```
NEXT_PUBLIC_GEMINI_API_KEY
```
- **Valor**: Tu clave de API de Google Gemini (si la usas)
- **Tipo**: Plaintext
- **Nota**: Puedes dejarla vacía si no la usas

### 2.3 Configurar Supabase para Producción

#### 2.3.1 Actualizar URL de Callback en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** → **URL Configuration**
3. Agrega tu URL de Vercel en **Redirect URLs**:
   ```
   https://tu-proyecto.vercel.app/auth/callback
   ```
4. Si tienes un dominio personalizado:
   ```
   https://tu-dominio.com/auth/callback
   ```

#### 2.3.2 Configurar Google OAuth (si lo usas)

1. En Supabase, ve a **Authentication** → **Providers** → **Google**
2. Actualiza la **Redirect URL** en Google Cloud Console:
   ```
   https://pkvpnxycunmbpfudzncw.supabase.co/auth/v1/callback
   ```
3. Agrega tu dominio de Vercel en **Authorized JavaScript origins**:
   ```
   https://tu-proyecto.vercel.app
   ```

## 🚀 Paso 3: Desplegar

### 3.1 Despliegue Automático

1. Después de configurar las variables de entorno, click en **"Deploy"**
2. Vercel comenzará a construir tu proyecto
3. El proceso tomará 2-5 minutos

### 3.2 Verificar el Despliegue

Una vez completado:

1. Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
2. Visita la URL y verifica que todo funcione
3. Prueba:
   - ✅ Página de login carga correctamente
   - ✅ Registro de usuarios funciona
   - ✅ Autenticación con Google funciona (si está configurada)
   - ✅ Dashboard carga después de login

## 🔄 Paso 4: Configurar Dominio Personalizado (Opcional)

### 4.1 Agregar Dominio

1. En el dashboard de Vercel, ve a tu proyecto
2. Click en **Settings** → **Domains**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los DNS

### 4.2 Actualizar Supabase

Después de configurar el dominio:

1. Actualiza la URL de callback en Supabase con tu nuevo dominio
2. Si usas Google OAuth, actualiza las URLs autorizadas en Google Cloud Console

## 🐛 Solución de Problemas

### Error: "Application error: a client-side exception has occurred"

Este es el error más común. **Consulta el archivo [SOLUCION_ERROR_CLIENTE.md](./SOLUCION_ERROR_CLIENTE.md) para una guía completa.**

**Solución rápida**:
1. Verifica que las variables de entorno estén configuradas en Vercel
2. Asegúrate de usar la clave `anon` `public` (NO `service_role`)
3. Redesplega la aplicación después de agregar las variables

### Error: "Las variables de entorno de Supabase no están configuradas"

**Solución**: Verifica que hayas agregado las variables de entorno en Vercel:
- Ve a **Settings** → **Environment Variables**
- Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén configuradas
- **Importante**: Marca todas las opciones de Environment (Production, Preview, Development)
- Reinicia el despliegue después de agregar variables

### Error: "OAuth callback failed"

**Solución**: 
1. Verifica que la URL de callback en Supabase incluya tu dominio de Vercel
2. Si usas Google OAuth, verifica las URLs autorizadas en Google Cloud Console

### Error: "Build failed"

**Solución**:
1. Revisa los logs de build en Vercel
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que no haya errores de TypeScript:
   ```bash
   npm run build
   ```

### La aplicación funciona en local pero no en Vercel

**Solución**:
1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de que el archivo `.env.local` no esté en el repositorio (está en `.gitignore`)
3. Revisa los logs de runtime en Vercel

## 📝 Checklist de Despliegue

Antes de desplegar, verifica:

- [ ] Código subido a GitHub/GitLab
- [ ] Variables de entorno configuradas en Vercel
- [ ] URL de callback actualizada en Supabase
- [ ] Google OAuth configurado (si aplica)
- [ ] Build local funciona sin errores (`npm run build`)
- [ ] No hay archivos sensibles en el repositorio
- [ ] `.env.local` está en `.gitignore`

## 🔐 Seguridad

### ✅ Buenas Prácticas

- ✅ Usa siempre la clave `anon` `public` de Supabase (nunca `service_role`)
- ✅ Las variables de entorno en Vercel están encriptadas
- ✅ El archivo `.env.local` está en `.gitignore` y no se sube al repositorio
- ✅ RLS (Row Level Security) está habilitado en Supabase

### ❌ Evita

- ❌ Nunca subas archivos `.env` o `.env.local` al repositorio
- ❌ No uses la clave `service_role` en el frontend
- ❌ No hardcodees credenciales en el código

## 🔄 Actualizaciones Futuras

Cada vez que hagas `git push` a la rama principal:

1. Vercel detectará automáticamente los cambios
2. Creará un nuevo despliegue
3. Te notificará cuando esté listo

Puedes ver el historial de despliegues en el dashboard de Vercel.

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Supabase + Vercel](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs en Vercel (Dashboard → Tu Proyecto → Deployments → Logs)
2. Verifica la configuración de Supabase
3. Prueba hacer un build local: `npm run build`

---

¡Feliz despliegue! 🎉
