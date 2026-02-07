-- ============================================
-- Script COMPLETO para corregir el error "Invalid schema: public"
-- Ejecutar en el SQL Editor de Supabase
-- Este script es más agresivo y corrige todos los problemas posibles
-- ============================================

-- PASO 1: Verificar y crear el esquema public
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'public') THEN
    CREATE SCHEMA public;
    RAISE NOTICE '✅ Esquema public creado';
  ELSE
    RAISE NOTICE '✅ Esquema public ya existe';
  END IF;
END $$;

-- PASO 2: Otorgar TODOS los permisos necesarios al esquema public
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- PASO 3: Asegurar que public sea el esquema predeterminado
ALTER DATABASE postgres SET search_path TO public, extensions;

-- PASO 4: Crear extensión si no existe (necesaria para UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PASO 5: Verificar y crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- PASO 6: Verificar y crear tabla productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 0,
  unidad_medida TEXT DEFAULT 'unidad',
  proveedor TEXT,
  codigo_barras TEXT,
  ubicacion TEXT,
  fecha_vencimiento DATE,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'agotado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- PASO 7: Verificar y crear tabla historial_inventario
CREATE TABLE IF NOT EXISTS public.historial_inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE NOT NULL,
  tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste', 'creacion', 'edicion', 'eliminacion')),
  cantidad_anterior INTEGER NOT NULL DEFAULT 0,
  cantidad_nueva INTEGER NOT NULL DEFAULT 0,
  cantidad_cambio INTEGER NOT NULL DEFAULT 0,
  motivo TEXT,
  notas TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- PASO 8: Otorgar permisos en TODAS las tablas
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.productos TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.historial_inventario TO postgres, anon, authenticated, service_role;

-- PASO 9: Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_inventario ENABLE ROW LEVEL SECURITY;

-- PASO 10: Eliminar TODAS las políticas existentes (limpieza completa)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Eliminar políticas de profiles
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.profiles';
  END LOOP;
  
  -- Eliminar políticas de productos
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'productos') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.productos';
  END LOOP;
  
  -- Eliminar políticas de historial_inventario
  FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'historial_inventario') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.historial_inventario';
  END LOOP;
END $$;

-- PASO 11: Crear políticas RLS para profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PASO 12: Crear políticas RLS para productos
CREATE POLICY "Users can read own products"
  ON public.productos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON public.productos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.productos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.productos FOR DELETE
  USING (auth.uid() = user_id);

-- PASO 13: Crear políticas RLS para historial
CREATE POLICY "Users can read own inventory history"
  ON public.historial_inventario FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory history"
  ON public.historial_inventario FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PASO 14: Crear/actualizar funciones
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para historial al crear producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_create()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historial_inventario (
    producto_id,
    tipo_movimiento,
    cantidad_anterior,
    cantidad_nueva,
    cantidad_cambio,
    motivo,
    user_id
  ) VALUES (
    NEW.id,
    'creacion',
    0,
    NEW.cantidad,
    NEW.cantidad,
    'Producto creado',
    NEW.user_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para historial al actualizar producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_update()
RETURNS TRIGGER AS $$
DECLARE
  cantidad_cambio INTEGER;
BEGIN
  cantidad_cambio := NEW.cantidad - OLD.cantidad;
  
  IF cantidad_cambio != 0 THEN
    INSERT INTO public.historial_inventario (
      producto_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cantidad_cambio,
      motivo,
      user_id
    ) VALUES (
      NEW.id,
      CASE 
        WHEN cantidad_cambio > 0 THEN 'entrada'
        WHEN cantidad_cambio < 0 THEN 'salida'
        ELSE 'ajuste'
      END,
      OLD.cantidad,
      NEW.cantidad,
      cantidad_cambio,
      'Actualización de producto',
      NEW.user_id
    );
  ELSE
    INSERT INTO public.historial_inventario (
      producto_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cantidad_cambio,
      motivo,
      user_id
    ) VALUES (
      NEW.id,
      'edicion',
      OLD.cantidad,
      NEW.cantidad,
      0,
      'Edición de información del producto',
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para historial al eliminar producto
CREATE OR REPLACE FUNCTION public.create_inventory_history_on_product_delete()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.historial_inventario (
    producto_id,
    tipo_movimiento,
    cantidad_anterior,
    cantidad_nueva,
    cantidad_cambio,
    motivo,
    user_id
  ) VALUES (
    OLD.id,
    'eliminacion',
    OLD.cantidad,
    0,
    -OLD.cantidad,
    'Producto eliminado',
    OLD.user_id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 15: Eliminar y recrear triggers
DROP TRIGGER IF EXISTS update_productos_updated_at ON public.productos;
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_producto_created ON public.productos;
CREATE TRIGGER on_producto_created
  AFTER INSERT ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_create();

DROP TRIGGER IF EXISTS on_producto_updated ON public.productos;
CREATE TRIGGER on_producto_updated
  AFTER UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_update();

DROP TRIGGER IF EXISTS on_producto_deleted ON public.productos;
CREATE TRIGGER on_producto_deleted
  BEFORE DELETE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.create_inventory_history_on_product_delete();

-- PASO 16: Crear índices
CREATE INDEX IF NOT EXISTS productos_user_id_idx ON public.productos(user_id);
CREATE INDEX IF NOT EXISTS productos_categoria_idx ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS productos_estado_idx ON public.productos(estado);
CREATE INDEX IF NOT EXISTS historial_producto_id_idx ON public.historial_inventario(producto_id);
CREATE INDEX IF NOT EXISTS historial_user_id_idx ON public.historial_inventario(user_id);
CREATE INDEX IF NOT EXISTS historial_created_at_idx ON public.historial_inventario(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- PASO 17: Verificación final y reporte
DO $$
DECLARE
  schema_exists BOOLEAN;
  profiles_exists BOOLEAN;
  productos_exists BOOLEAN;
  historial_exists BOOLEAN;
  policies_count INTEGER;
BEGIN
  -- Verificar esquema
  SELECT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'public') INTO schema_exists;
  
  -- Verificar tablas
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') INTO profiles_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'productos') INTO productos_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'historial_inventario') INTO historial_exists;
  
  -- Contar políticas
  SELECT COUNT(*) INTO policies_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICACIÓN FINAL';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Esquema public: %', CASE WHEN schema_exists THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END;
  RAISE NOTICE 'Tabla profiles: %', CASE WHEN profiles_exists THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END;
  RAISE NOTICE 'Tabla productos: %', CASE WHEN productos_exists THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END;
  RAISE NOTICE 'Tabla historial_inventario: %', CASE WHEN historial_exists THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END;
  RAISE NOTICE 'Políticas RLS: %', policies_count;
  RAISE NOTICE '========================================';
  
  IF schema_exists AND profiles_exists AND productos_exists AND historial_exists THEN
    RAISE NOTICE '✅ TODO CONFIGURADO CORRECTAMENTE';
  ELSE
    RAISE WARNING '⚠️ ALGUNOS ELEMENTOS NO SE CREARON CORRECTAMENTE';
  END IF;
END $$;
