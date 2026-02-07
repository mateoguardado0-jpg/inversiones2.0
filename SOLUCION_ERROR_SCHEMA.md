# 🔧 Solución: Error "Invalid schema: public"

## Problema
Al intentar subir artículos al inventario, aparece el error:
```
Invalid schema: public
```

## Causa
Este error ocurre cuando:
1. El esquema `public` no está correctamente configurado en Supabase
2. Los permisos del esquema no están otorgados correctamente
3. Las tablas no están en el esquema `public` o no tienen los permisos necesarios

## Solución

### Paso 1: Ejecutar el script de corrección

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú lateral)
4. Haz clic en **New query**
5. Copia y pega el contenido completo del archivo `fix-schema-public.sql`
6. Haz clic en **Run** (o presiona `Ctrl + Enter`)

### Paso 2: Verificar que se ejecutó correctamente

Deberías ver mensajes de éxito indicando que:
- El esquema `public` fue creado/verificado
- Las tablas fueron creadas/verificadas
- Las políticas RLS fueron configuradas

### Paso 3: Probar de nuevo

1. Vuelve a tu aplicación
2. Intenta agregar un producto al inventario
3. El error debería estar resuelto

## Verificación adicional

Si el error persiste, verifica lo siguiente:

### 1. Verificar que las tablas existen

Ejecuta en el SQL Editor de Supabase:
```sql
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('productos', 'historial_inventario');
```

Deberías ver ambas tablas listadas.

### 2. Verificar permisos del esquema

Ejecuta:
```sql
SELECT schema_name, schema_owner 
FROM information_schema.schemata 
WHERE schema_name = 'public';
```

### 3. Verificar políticas RLS

Ejecuta:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('productos', 'historial_inventario');
```

Deberías ver las políticas listadas.

## Si el problema persiste

1. **Verifica tu conexión a Supabase**:
   - Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctamente configurados en `.env.local`
   - Reinicia el servidor de desarrollo después de cambiar las variables de entorno

2. **Verifica que estás autenticado**:
   - Asegúrate de haber iniciado sesión en la aplicación
   - El error puede ocurrir si no hay un usuario autenticado

3. **Revisa la consola del navegador**:
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Console"
   - Busca errores adicionales que puedan dar más contexto

4. **Contacta con soporte**:
   - Si nada de lo anterior funciona, puede ser un problema específico de tu proyecto de Supabase
   - Revisa los logs en Supabase Dashboard → Logs → Postgres Logs

## Prevención

Para evitar este problema en el futuro:
- Siempre ejecuta los scripts SQL en el orden correcto (consulta `ORDEN_EJECUCION_SCRIPTS.md`)
- Primero ejecuta `supabase-setup.sql` para crear las tablas de perfiles
- Luego ejecuta `inventario-setup.sql` para crear las tablas de inventario
- Si aparece el error, ejecuta `fix-schema-public.sql` para corregirlo

## Documentación Relacionada

- `ORDEN_EJECUCION_SCRIPTS.md`: Guía completa sobre el orden de ejecución de scripts
- `INSTRUCCIONES_CONFIGURACION.md`: Instrucciones generales de configuración
- `README.md`: Documentación principal del proyecto
