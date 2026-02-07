# 🔧 Solución: Error 406 (Not Acceptable)

## Problema
Al intentar cargar o insertar productos, aparece el error:
```
Failed to load resource: the server responded with a status of 406 ()
pkvpnxycunmbpfudzncw.supabase.co/rest/v1/productos?columns=...
```

## ¿Qué significa el error 406?

El error **406 Not Acceptable** en Supabase generalmente indica que:
1. La API REST no puede procesar la petición debido a headers incorrectos
2. Hay un problema con la configuración de la API REST
3. Row Level Security (RLS) está bloqueando la petición de una manera que devuelve 406
4. Hay un problema con los tipos de datos o formato de la consulta

## Causa Más Común

El error 406 en Supabase generalmente ocurre cuando:
- **RLS está bloqueando el acceso** pero devuelve 406 en lugar de 403
- **Hay un problema con los headers** de la petición (falta `Accept` o `Content-Type`)
- **La consulta especifica columnas** que no son accesibles debido a RLS
- **El usuario no está autenticado** correctamente

## Solución Paso a Paso

### Paso 1: Ejecutar Script de Corrección

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** → **New query**
4. Copia y pega el contenido completo de `fix-api-rest-406.sql`
5. Haz clic en **Run**

Este script:
- ✅ Verifica permisos de las tablas
- ✅ Verifica políticas RLS
- ✅ Otorga permisos necesarios a la API REST
- ✅ Crea una vista de prueba
- ✅ Genera un reporte de verificación

### Paso 2: Verificar Autenticación

El error 406 puede ocurrir si no estás autenticado correctamente:

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña "Application" o "Storage"**
3. **Busca las cookies** de tu dominio
4. **Verifica que hay cookies de Supabase** (deben empezar con `sb-`)

**Si no hay cookies de Supabase**:
- Cierra sesión y vuelve a iniciar sesión
- Limpia las cookies del navegador
- Intenta en modo incógnito

### Paso 3: Verificar Variables de Entorno

Asegúrate de que las variables de entorno estén correctas:

1. Abre `.env.local`
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada correctamente
3. Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea la clave `anon public` (NO `service_role`)
4. **Reinicia el servidor de desarrollo** después de cambiar las variables:
   ```bash
   # Detén el servidor (Ctrl + C)
   npm run dev
   ```

### Paso 4: Verificar en Supabase Dashboard

1. Ve a **Supabase Dashboard** → **Settings** → **API**
2. Verifica que la URL y la clave coinciden con tu `.env.local`
3. Ve a **Database** → **Tables**
4. Verifica que la tabla `productos` existe y está en el esquema `public`

### Paso 5: Verificar RLS (Row Level Security)

El error 406 puede ocurrir si RLS está bloqueando incorrectamente:

1. Ve a **Supabase Dashboard** → **Database** → **Tables** → `productos`
2. Haz clic en **Policies**
3. Verifica que existen estas políticas:
   - ✅ `Users can read own products` (SELECT)
   - ✅ `Users can insert own products` (INSERT)
   - ✅ `Users can update own products` (UPDATE)
   - ✅ `Users can delete own products` (DELETE)

**Si faltan políticas**: Ejecuta `fix-schema-public-completo.sql`

### Paso 6: Probar con una Consulta Simple

Ejecuta esto en el SQL Editor de Supabase para probar acceso directo:

```sql
-- Obtener tu user_id
SELECT id, email FROM auth.users LIMIT 1;

-- Luego intenta leer productos (reemplaza 'TU_USER_ID' con el ID real)
SELECT * FROM public.productos 
WHERE user_id = 'TU_USER_ID'  -- Reemplaza con un UUID real
LIMIT 5;
```

**Si esto funciona**: El problema está en el código de la aplicación
**Si esto falla**: El problema está en la configuración de Supabase

### Paso 7: Verificar Logs de Supabase

1. Ve a **Supabase Dashboard** → **Logs** → **API Logs**
2. Busca peticiones a `/rest/v1/productos`
3. Revisa los errores detallados

Los logs mostrarán:
- El código de estado exacto
- El mensaje de error detallado
- Los headers de la petición

### Paso 8: Limpiar Caché del Navegador

A veces el problema es caché:

1. **Limpia la caché del navegador**:
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Selecciona "Cached images and files"
   - Haz clic en "Clear data"

2. **O prueba en modo incógnito**:
   - `Ctrl + Shift + N` (Chrome/Edge)
   - Inicia sesión de nuevo
   - Intenta agregar un producto

## Soluciones Específicas por Causa

### Si el problema es RLS:

Ejecuta este SQL para verificar y corregir políticas:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'productos';

-- Si faltan, crear políticas
CREATE POLICY "Users can read own products"
  ON public.productos FOR SELECT
  USING (auth.uid() = user_id);
```

### Si el problema es permisos:

Ejecuta:

```sql
GRANT ALL ON public.productos TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
```

### Si el problema es autenticación:

1. Verifica que estás autenticado:
   ```javascript
   const { data: { user } } = await supabase.auth.getUser()
   console.log('Usuario:', user)
   ```

2. Si `user` es `null`, necesitas iniciar sesión primero

## Verificación Final

Después de seguir todos los pasos, verifica:

- [ ] El script `fix-api-rest-406.sql` se ejecutó sin errores
- [ ] Estás autenticado en la aplicación (hay cookies de Supabase)
- [ ] Las variables de entorno están correctas en `.env.local`
- [ ] El servidor de desarrollo se reinició después de cambiar `.env.local`
- [ ] Las políticas RLS existen y están correctas
- [ ] La tabla `productos` existe en el esquema `public`
- [ ] Los permisos están otorgados correctamente
- [ ] La caché del navegador está limpia

## Solución Rápida: Cambiar la Consulta

Si el error 406 persiste, puede ser que el problema esté en cómo se especifican las columnas. Prueba cambiar:

**Antes (puede causar 406)**:
```javascript
.select('nombre,descripcion,categoria,precio,cantidad,unidad_medida,proveedor,codigo_barras,ubicacion,fecha_vencimiento,user_id')
```

**Después (más seguro)**:
```javascript
.select('*')  // Selecciona todas las columnas
```

O especifica las columnas de forma más explícita:
```javascript
.select(`
  id,
  nombre,
  descripcion,
  categoria,
  precio,
  cantidad,
  unidad_medida,
  proveedor,
  codigo_barras,
  ubicacion,
  fecha_vencimiento,
  estado,
  user_id,
  created_at,
  updated_at
`)
```

## Si el Error Persiste

1. **Revisa los logs de API en Supabase Dashboard**
   - Ve a Logs → API Logs
   - Busca la petición que falla
   - Revisa el error detallado

2. **Verifica que estás autenticado**:
   ```javascript
   const { data: { user }, error } = await supabase.auth.getUser()
   if (error || !user) {
     console.error('No autenticado:', error)
     // Redirigir al login
   }
   ```

3. **Prueba con una consulta simple primero**:
   ```javascript
   // Prueba simple sin filtros
   const { data, error } = await supabase
     .from('productos')
     .select('*')
     .limit(1)
   
   console.log('Resultado:', data, error)
   ```

4. **Contacta con soporte de Supabase**:
   - Proporciona los logs de API
   - Proporciona el error exacto de la consola
   - Indica qué pasos de diagnóstico ya probaste

## Documentación Relacionada

- `fix-api-rest-406.sql`: Script para corregir el error 406
- `fix-schema-public-completo.sql`: Script completo para corregir problemas de esquema
- `DIAGNOSTICO_ERROR_SCHEMA.md`: Guía de diagnóstico general
- `SOLUCION_ERROR_SCHEMA.md`: Solución para error de esquema
