-- ============================================
-- Script para corregir el error 406 (Not Acceptable)
-- Este error generalmente ocurre por problemas con la API REST de Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- PASO 1: Verificar que las tablas están expuestas a la API REST
-- En Supabase, las tablas deben estar en el esquema public y tener permisos correctos

-- Verificar que las tablas existen y están en public
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('productos', 'historial_inventario', 'profiles')
ORDER BY table_name;

-- PASO 2: Asegurar que las tablas tienen todos los permisos necesarios
GRANT ALL ON public.productos TO anon, authenticated, service_role;
GRANT ALL ON public.historial_inventario TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;

-- PASO 3: Verificar que RLS está configurado correctamente
-- El error 406 puede ocurrir si RLS está bloqueando la petición de manera incorrecta

-- Verificar políticas RLS para productos
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'productos'
ORDER BY policyname;

-- PASO 4: Asegurar que las políticas permiten SELECT con las columnas necesarias
-- A veces el error 406 ocurre cuando RLS bloquea el acceso a ciertas columnas

-- Verificar que la política de SELECT existe y es correcta
DO $$
BEGIN
  -- Verificar si existe la política de SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'productos' 
    AND policyname = 'Users can read own products'
  ) THEN
    RAISE NOTICE '⚠️ La política de SELECT no existe, creándola...';
    CREATE POLICY "Users can read own products"
      ON public.productos FOR SELECT
      USING (auth.uid() = user_id);
  ELSE
    RAISE NOTICE '✅ La política de SELECT existe';
  END IF;
END $$;

-- PASO 5: Verificar que el esquema public tiene los permisos correctos para la API REST
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- PASO 6: Asegurar que las funciones necesarias tienen permisos
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_inventory_history_on_product_create() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_inventory_history_on_product_update() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_inventory_history_on_product_delete() TO anon, authenticated, service_role;

-- PASO 7: Verificar que no hay restricciones que puedan causar 406
-- El error 406 puede ocurrir si hay problemas con:
-- - Foreign keys
-- - Check constraints
-- - Column types

-- Verificar foreign keys
SELECT
  tc.table_schema, 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
AND tc.table_name = 'productos';

-- PASO 8: Verificar tipos de datos de las columnas
-- A veces el error 406 ocurre por problemas con tipos de datos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'productos'
ORDER BY ordinal_position;

-- PASO 9: Crear una vista de prueba para verificar acceso
-- Esto ayuda a diagnosticar si el problema es con la tabla o con la API
CREATE OR REPLACE VIEW public.productos_test AS
SELECT 
  id,
  nombre,
  descripcion,
  categoria,
  precio,
  cantidad,
  unidad_medida,
  user_id,
  created_at
FROM public.productos;

GRANT SELECT ON public.productos_test TO anon, authenticated, service_role;

-- PASO 10: Reporte final
DO $$
DECLARE
  productos_count INTEGER;
  policies_count INTEGER;
  rls_enabled BOOLEAN;
BEGIN
  -- Contar productos
  SELECT COUNT(*) INTO productos_count FROM public.productos;
  
  -- Contar políticas
  SELECT COUNT(*) INTO policies_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'productos';
  
  -- Verificar RLS
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'productos';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN API REST';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Productos en la tabla: %', productos_count;
  RAISE NOTICE 'Políticas RLS: %', policies_count;
  RAISE NOTICE 'RLS habilitado: %', CASE WHEN rls_enabled THEN '✅ SÍ' ELSE '❌ NO' END;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Si el error 406 persiste:';
  RAISE NOTICE '1. Verifica que estás autenticado en la aplicación';
  RAISE NOTICE '2. Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY está correcta';
  RAISE NOTICE '3. Revisa la consola del navegador para más detalles';
  RAISE NOTICE '4. Verifica los logs de Supabase Dashboard → Logs → API Logs';
END $$;
