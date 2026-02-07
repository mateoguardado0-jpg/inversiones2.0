# 🔑 Configurar API Key de Gemini en Vercel

## 📋 Pasos para Configurar la API Key de Gemini

### 1. Acceder a la Configuración de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto **Inventario 2.0**
3. Ve a **Settings** → **Environment Variables**

### 2. Agregar la Variable de Entorno

1. Click en **"Add New"** o **"Add Environment Variable"**
2. Completa los siguientes campos:

   **Name:**
   ```
   NEXT_PUBLIC_GEMINI_API_KEY
   ```

   **Value:**
   ```
   AIzaSyAXgvJIDx0bgcP8ylBVEUbPcIcUVc6D270
   ```

   **Environment:**
   - ✅ Marca **Production**
   - ✅ Marca **Preview**
   - ✅ Marca **Development**

3. Click en **"Save"**

### 3. Verificar que la Variable esté Configurada

Después de agregar la variable, deberías verla en la lista de variables de entorno con:
- ✅ Nombre: `NEXT_PUBLIC_GEMINI_API_KEY`
- ✅ Valor: `AIzaSyAXgvJIDx0bgcP8ylBVEUbPcIcUVc6D270` (parcialmente oculto por seguridad)
- ✅ Environments: Production, Preview, Development

### 4. Redesplegar la Aplicación

**IMPORTANTE**: Después de agregar una nueva variable de entorno, debes redesplegar:

1. Ve a la pestaña **"Deployments"** en Vercel
2. Encuentra el último despliegue
3. Click en los **tres puntos (⋯)** → **"Redeploy"**
4. O simplemente haz un nuevo push a Git (Vercel detectará los cambios)

### 5. Verificar que Funciona

1. Espera a que el despliegue termine (2-5 minutos)
2. Visita tu aplicación en Vercel
3. Inicia sesión en el dashboard
4. Ve a **"Ingreso Inteligente"** en el menú
5. Intenta subir una factura para verificar que la IA funciona

## 🔄 Si los Cambios No Aparecen

### Opción 1: Redesplegar Manualmente

1. En Vercel Dashboard → **Deployments**
2. Click en **"Redeploy"** en el último despliegue
3. Espera a que termine

### Opción 2: Hacer un Push Nuevo

```bash
# Hacer un cambio pequeño (por ejemplo, agregar un comentario)
# Luego:
git add .
git commit -m "trigger: Forzar redeploy en Vercel"
git push origin master
```

### Opción 3: Verificar Logs de Build

1. Ve a **Deployments** en Vercel
2. Click en el último despliegue
3. Revisa los **Build Logs** para ver si hay errores
4. Si hay errores, corrígelos y vuelve a hacer push

## ✅ Checklist

Antes de verificar que todo funciona:

- [ ] Variable `NEXT_PUBLIC_GEMINI_API_KEY` agregada en Vercel
- [ ] Valor de la API key configurado correctamente
- [ ] Todas las opciones de Environment marcadas (Production, Preview, Development)
- [ ] Aplicación redesplegada después de agregar la variable
- [ ] Build completado sin errores
- [ ] Sección "Ingreso Inteligente" visible en el dashboard
- [ ] Funcionalidad de subir facturas funciona correctamente

## 🐛 Solución de Problemas

### Error: "API key de Gemini no configurada"

**Solución:**
1. Verifica que la variable esté agregada en Vercel
2. Asegúrate de que el nombre sea exactamente: `NEXT_PUBLIC_GEMINI_API_KEY`
3. Verifica que hayas redesplegado después de agregar la variable
4. Espera 1-2 minutos después del despliegue para que las variables se propaguen

### Error: "Error al procesar el archivo"

**Solución:**
1. Verifica que la API key sea válida
2. Revisa los logs del servidor en Vercel (Functions → Logs)
3. Asegúrate de que el archivo subido sea una imagen o PDF válido

### Los Cambios No Aparecen

**Solución:**
1. Limpia la caché del navegador (Ctrl + Shift + R)
2. Verifica que el despliegue en Vercel haya terminado
3. Revisa que estés viendo la versión de producción (no una preview)
4. Espera 1-2 minutos después del despliegue

## 📝 Notas Importantes

- ⚠️ **Nunca** subas la API key directamente en el código
- ✅ Siempre usa variables de entorno para credenciales
- ✅ La variable `NEXT_PUBLIC_` es accesible tanto en servidor como cliente
- ✅ Vercel encripta las variables de entorno automáticamente
- ✅ Cada vez que agregues una nueva variable, debes redesplegar

---

¡Listo! Tu módulo de ingreso inteligente debería estar funcionando en Vercel. 🎉
