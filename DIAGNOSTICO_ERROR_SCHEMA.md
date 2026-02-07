# 🔍 Diagnóstico Completo: Error "Invalid schema: public"

Si el error persiste después de ejecutar los scripts, sigue estos pasos de diagnóstico:

## Paso 1: Verificar el Esquema Public

Ejecuta en el SQL Editor de Supabase:

```sql
-- Verificar que el esquema existe
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';
```

**Resultado esperado**: Deberías ver una fila con `schema_name = 'public'`

**Si no existe**: Ejecuta:
```sql
CREATE SCHEMA IF NOT EXISTS public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
```

---

## Paso 2: Verificar Permisos del Esquema

```sql
-- Verificar permisos del esquema
SELECT 
  nspname as schema_name,
  nspowner::regrole as owner
FROM pg_namespace 
WHERE nspname = 'public';
```

**Resultado esperado**: El esquema debe existir y tener un propietario

---

## Paso 3: Verificar que las Tablas Existen

```sql
-- Verificar tablas
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'productos', 'historial_inventario')
ORDER BY table_name;
```

**Resultado esperado**: Deberías ver las 3 tablas listadas

**Si faltan tablas**: Ejecuta `fix-schema-public-completo.sql`

---

## Paso 4: Verificar Permisos en las Tablas

```sql
-- Verificar permisos en productos
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'productos'
AND grantee IN ('anon', 'authenticated', 'service_role');
```

**Resultado esperado**: Deberías ver permisos para `anon` y `authenticated`

**Si no hay permisos**: Ejecuta:
```sql
GRANT ALL ON public.productos TO anon, authenticated, service_role;
GRANT ALL ON public.historial_inventario TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
```

---

## Paso 5: Verificar Row Level Security (RLS)

```sql
-- Verificar RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'historial_inventario', 'profiles');
```

**Resultado esperado**: `rowsecurity = true` para todas las tablas

**Si RLS no está habilitado**: Ejecuta:
```sql
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

## Paso 6: Verificar Políticas RLS

```sql
-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'productos'
ORDER BY tablename, policyname;
```

**Resultado esperado**: Deberías ver al menos 4 políticas para `productos`:
- Users can read own products
- Users can insert own products
- Users can update own products
- Users can delete own products

**Si faltan políticas**: Ejecuta `fix-schema-public-completo.sql`

---

## Paso 7: Verificar Search Path

```sql
-- Verificar search_path de la base de datos
SHOW search_path;
```

**Resultado esperado**: Debería incluir `public` (ej: `public, extensions`)

**Si no incluye public**: Ejecuta:
```sql
ALTER DATABASE postgres SET search_path TO public, extensions;
```

---

## Paso 8: Verificar Variables de Entorno

En tu aplicación, verifica que las variables de entorno estén correctas:

1. Abre `.env.local`
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada
3. Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté configurada y sea la clave `anon public` (NO `service_role`)

**Cómo verificar la clave**:
- Ve a Supabase Dashboard → Settings → API
- Copia la clave que dice `anon` `public`
- Debe empezar con `eyJ...`

---

## Paso 9: Probar Conexión Directa

Ejecuta este SQL para probar si puedes insertar un producto de prueba (reemplaza `TU_USER_ID` con un UUID real):

```sql
-- Obtener un user_id de prueba
SELECT id FROM auth.users LIMIT 1;

-- Luego intenta insertar (reemplaza 'TU_USER_ID' con el ID real)
INSERT INTO public.productos (
  nombre,
  precio,
  cantidad,
  user_id
) VALUES (
  'Producto de Prueba',
  10.00,
  1,
  'TU_USER_ID'  -- Reemplaza con un UUID real
);
```

**Si esto funciona**: El problema está en el código de la aplicación
**Si esto falla**: El problema está en la configuración de Supabase

---

## Paso 10: Verificar en la Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**
4. Intenta agregar un producto
5. Busca errores en la consola

**Errores comunes**:
- `Invalid schema: public` → Problema de configuración de Supabase
- `permission denied` → Problema de RLS o permisos
- `relation does not exist` → Las tablas no existen
- `JWT expired` → Problema de autenticación

---

## Solución Rápida: Script Completo

Si después de todos estos pasos el error persiste, ejecuta el script más completo:

**Archivo**: `fix-schema-public-completo.sql`

Este script:
- ✅ Verifica y crea el esquema public
- ✅ Otorga todos los permisos necesarios
- ✅ Crea todas las tablas si no existen
- ✅ Configura RLS y políticas
- ✅ Crea funciones y triggers
- ✅ Genera un reporte de verificación

---

## Si Nada Funciona

1. **Verifica que estás en el proyecto correcto de Supabase**
   - Confirma que la URL en `.env.local` coincide con tu proyecto

2. **Revisa los logs de Supabase**
   - Ve a Supabase Dashboard → Logs → Postgres Logs
   - Busca errores relacionados con "schema" o "public"

3. **Contacta con soporte de Supabase**
   - Puede ser un problema específico de tu proyecto
   - Proporciona los resultados de los pasos de diagnóstico anteriores

4. **Considera recrear el proyecto**
   - Como último recurso, puedes crear un nuevo proyecto de Supabase
   - Ejecuta todos los scripts desde cero

---

## Checklist Final

Antes de reportar que el error persiste, verifica:

- [ ] El esquema `public` existe
- [ ] Las tablas `productos`, `historial_inventario`, `profiles` existen
- [ ] RLS está habilitado en todas las tablas
- [ ] Las políticas RLS están creadas
- [ ] Los permisos están otorgados a `anon` y `authenticated`
- [ ] `search_path` incluye `public`
- [ ] Las variables de entorno están correctamente configuradas
- [ ] La clave `anon public` es la correcta (no `service_role`)
- [ ] El usuario está autenticado en la aplicación
- [ ] Se ejecutó `fix-schema-public-completo.sql`

Si todos estos puntos están verificados y el error persiste, el problema puede estar en otro lugar (caché del navegador, versión de Supabase, etc.).
