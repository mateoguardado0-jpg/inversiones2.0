# 🔧 Solución: Error PGRST106 - Schema `public` no expuesto

## Problema

Al intentar agregar productos o cargar el historial, aparece el error:

```
Invalid schema: public — Código: PGRST106 — Hint: Only the following schemas are exposed: graphql_public
```

## ¿Qué significa este error?

El error **PGRST106** significa que la **API REST de Supabase (PostgREST) no está exponiendo el schema `public`**. 

Por defecto, Supabase solo expone el schema `graphql_public` para GraphQL, pero **NO expone `public` para la API REST**, que es lo que necesita tu aplicación Next.js.

## ✅ Solución: Exponer el Schema `public` en Supabase

### Paso 1: Ir a Configuración de API

1. Abre tu navegador y ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (el que corresponde a la URL en tu `.env.local`)
3. En el menú lateral izquierdo, haz clic en **Settings** (⚙️ Configuración)
4. Haz clic en **API** en el submenú

### Paso 2: Configurar Schemas Expuestos

1. En la página de configuración de API, busca la sección **"Exposed schemas"** o **"Schemas expuestos"**
2. Verás una lista de schemas que están expuestos actualmente (probablemente solo `graphql_public`)
3. **Agrega `public`** a la lista:
   - Si hay un campo de texto, escribe `public` y presiona Enter
   - Si hay checkboxes, marca el checkbox de `public`
   - Si hay un botón "Add schema" o "+", haz clic y agrega `public`

4. **Guarda los cambios** (botón "Save" o "Guardar")

### Paso 3: Verificar que se guardó

Después de guardar, deberías ver `public` en la lista de schemas expuestos junto con `graphql_public`.

### Paso 4: Recargar la aplicación

1. **Cierra completamente tu aplicación** (si está corriendo en desarrollo, presiona `Ctrl + C` en la terminal)
2. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
3. **Recarga la página en el navegador** (presiona `Ctrl + Shift + R` o `F5` para forzar recarga sin caché)
4. **Intenta agregar un producto de nuevo**

## 📸 Ubicación Visual (Referencia)

La configuración está en:
```
Supabase Dashboard
  → Settings (⚙️)
    → API
      → Exposed schemas (o "Schemas expuestos")
```

## ⚠️ Nota Importante

- Esta configuración es **por proyecto** en Supabase
- Si tienes múltiples proyectos, debes configurarlo en **cada uno** que uses
- Los cambios se aplican **inmediatamente**, pero a veces necesitas recargar la app

## 🔍 Verificación Adicional

Si después de exponer `public` sigues teniendo problemas, verifica:

1. **Que las tablas existen**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('productos', 'historial_inventario', 'profiles');
   ```
   Deberías ver las 3 tablas listadas.

2. **Que tienes permisos**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE schemaname = 'public' 
   AND tablename = 'productos';
   ```
   Deberías ver políticas RLS listadas.

3. **Que estás autenticado**: Verifica que hay cookies de Supabase en tu navegador (F12 → Application → Cookies)

## 📚 Documentación Relacionada

- `RESUMEN_SOLUCIONES.md` - Resumen de todos los errores y soluciones
- `fix-api-rest-406.sql` - Script para corregir permisos (ejecutar DESPUÉS de exponer el schema)
- `inventario-setup.sql` - Script para crear las tablas (si no existen)

## 🆘 Si el Error Persiste

Si después de exponer `public` sigues viendo el error:

1. **Verifica que guardaste los cambios** en Supabase Dashboard
2. **Espera 1-2 minutos** (a veces hay un pequeño delay)
3. **Limpia la caché del navegador** completamente
4. **Verifica que estás en el proyecto correcto** de Supabase (el que corresponde a tu URL en `.env.local`)
5. **Ejecuta los scripts SQL** en este orden:
   - `supabase-setup.sql`
   - `inventario-setup.sql`
   - `fix-api-rest-406.sql`
