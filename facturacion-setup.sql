-- ============================================
-- Script de configuración de Facturación
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- Crear tabla de facturas en schema public
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Crear tabla de items de factura en schema public
CREATE TABLE IF NOT EXISTS public.factura_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factura_items ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Users can read own invoices" ON public.facturas;
DROP POLICY IF EXISTS "Users can insert own invoices" ON public.facturas;
DROP POLICY IF EXISTS "Users can read own invoice items" ON public.factura_items;
DROP POLICY IF EXISTS "Users can insert own invoice items" ON public.factura_items;

-- Políticas para facturas
-- Los usuarios pueden leer sus propias facturas
CREATE POLICY "Users can read own invoices"
  ON public.facturas FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar sus propias facturas
CREATE POLICY "Users can insert own invoices"
  ON public.facturas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para factura_items
-- Los usuarios pueden leer items de sus propias facturas
CREATE POLICY "Users can read own invoice items"
  ON public.factura_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.facturas
      WHERE facturas.id = factura_items.factura_id
      AND facturas.user_id = auth.uid()
    )
  );

-- Los usuarios pueden insertar items en sus propias facturas
CREATE POLICY "Users can insert own invoice items"
  ON public.factura_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.facturas
      WHERE facturas.id = factura_items.factura_id
      AND facturas.user_id = auth.uid()
    )
  );

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS facturas_user_id_idx ON public.facturas(user_id);
CREATE INDEX IF NOT EXISTS facturas_created_at_idx ON public.facturas(created_at DESC);
CREATE INDEX IF NOT EXISTS factura_items_factura_id_idx ON public.factura_items(factura_id);
CREATE INDEX IF NOT EXISTS factura_items_producto_id_idx ON public.factura_items(producto_id);

-- Función transaccional para crear factura
-- Esta función valida stock, crea la factura, items, descuenta inventario y registra historial
CREATE OR REPLACE FUNCTION crear_factura(
  p_user_id UUID,
  p_items JSONB
)
RETURNS TABLE(
  factura_id UUID,
  total DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_factura_id UUID;
  v_total DECIMAL(10, 2) := 0;
  v_item RECORD;
  v_producto RECORD;
  v_stock_disponible INTEGER;
  v_subtotal DECIMAL(10, 2);
  v_precio_producto DECIMAL(10, 2);
  v_error TEXT;
BEGIN
  -- Validar que todos los productos tengan stock suficiente
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) AS item
  LOOP
    -- Obtener información del producto
    SELECT id, cantidad, precio, estado, nombre
    INTO v_producto
    FROM public.productos
    WHERE id = (v_item->>'producto_id')::UUID
    AND user_id = p_user_id;

    -- Verificar que el producto existe
    IF v_producto IS NULL THEN
      RETURN QUERY SELECT NULL::UUID, 0::DECIMAL, 
        format('Producto con ID %s no encontrado', v_item->>'producto_id')::TEXT;
      RETURN;
    END IF;

    -- Verificar que el producto esté activo
    IF v_producto.estado != 'activo' THEN
      RETURN QUERY SELECT NULL::UUID, 0::DECIMAL, 
        format('El producto %s no está activo', v_producto.nombre)::TEXT;
      RETURN;
    END IF;

    -- Verificar stock disponible
    v_stock_disponible := v_producto.cantidad;
    IF v_stock_disponible < (v_item->>'cantidad')::INTEGER THEN
      RETURN QUERY SELECT NULL::UUID, 0::DECIMAL, 
        format('Stock insuficiente para %s. Disponible: %s, Solicitado: %s', 
          v_producto.nombre, v_stock_disponible, (v_item->>'cantidad')::INTEGER)::TEXT;
      RETURN;
    END IF;
  END LOOP;

  -- Si llegamos aquí, todo está validado. Crear la factura
  INSERT INTO public.facturas (user_id, total)
  VALUES (p_user_id, 0)
  RETURNING id INTO v_factura_id;

  -- Crear items y calcular total
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) AS item
  LOOP
    -- Obtener precio del producto
    SELECT precio INTO v_precio_producto
    FROM public.productos
    WHERE id = (v_item->>'producto_id')::UUID;

    -- Calcular subtotal
    v_subtotal := (v_item->>'cantidad')::INTEGER * v_precio_producto;
    v_total := v_total + v_subtotal;

    -- Insertar item de factura
    INSERT INTO public.factura_items (
      factura_id,
      producto_id,
      cantidad,
      precio,
      subtotal
    ) VALUES (
      v_factura_id,
      (v_item->>'producto_id')::UUID,
      (v_item->>'cantidad')::INTEGER,
      v_precio_producto,
      v_subtotal
    );

    -- Descontar stock del producto
    UPDATE public.productos
    SET cantidad = cantidad - (v_item->>'cantidad')::INTEGER,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = (v_item->>'producto_id')::UUID
    AND user_id = p_user_id;

    -- Registrar en historial de inventario
    INSERT INTO public.historial_inventario (
      producto_id,
      tipo_movimiento,
      cantidad_anterior,
      cantidad_nueva,
      cantidad_cambio,
      motivo,
      user_id
    )
    SELECT 
      (v_item->>'producto_id')::UUID,
      'salida',
      cantidad + (v_item->>'cantidad')::INTEGER,
      cantidad,
      -(v_item->>'cantidad')::INTEGER,
      format('Venta - Factura %s', v_factura_id),
      p_user_id
    FROM public.productos
    WHERE id = (v_item->>'producto_id')::UUID;
  END LOOP;

  -- Actualizar total de la factura
  UPDATE public.facturas
  SET total = v_total
  WHERE id = v_factura_id;

  -- Retornar éxito
  RETURN QUERY SELECT v_factura_id, v_total, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION crear_factura(UUID, JSONB) TO anon, authenticated, service_role;

-- Otorgar permisos en las tablas
GRANT ALL ON public.facturas TO anon, authenticated, service_role;
GRANT ALL ON public.factura_items TO anon, authenticated, service_role;

-- Asegurar que las tablas están en el schema public
ALTER TABLE IF EXISTS facturas SET SCHEMA public;
ALTER TABLE IF EXISTS factura_items SET SCHEMA public;