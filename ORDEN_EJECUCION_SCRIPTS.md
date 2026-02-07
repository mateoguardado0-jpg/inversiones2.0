# 📋 Orden de Ejecución de Scripts SQL

Este documento explica el orden correcto para ejecutar los scripts SQL en Supabase.

## ⚠️ Orden Importante

Los scripts deben ejecutarse en el siguiente orden para evitar errores:

### 1️⃣ Paso 1: Configurar Perfiles de Usuario

**Archivo**: `supabase-setup.sql`

**Qué hace**:
- Crea el esquema `public` si no existe
- Crea la tabla `profiles` para almacenar información de usuarios
- Configura Row Level Security (RLS)
- Crea políticas de seguridad
- Crea función y trigger para crear perfiles automáticamente al registrarse

**Cómo ejecutar**:
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral)
4. Haz clic en **New query**
5. Copia y pega el contenido completo de `supabase-setup.sql`
6. Haz clic en **Run** (o presiona `Ctrl + Enter`)

**Verificación**:
Deberías ver mensajes de éxito. Verifica que la tabla `profiles` fue creada:
```sql
SELECT * FROM public.profiles LIMIT 1;
```

---

### 2️⃣ Paso 2: Configurar Tablas de Inventario

**Archivo**: `inventario-setup.sql`

**Qué hace**:
- Crea las tablas `productos` e `historial_inventario`
- Configura Row Level Security (RLS)
- Crea políticas de seguridad para que cada usuario solo vea sus propios productos
- Crea funciones y triggers para:
  - Actualizar `updated_at` automáticamente
  - Registrar movimientos en el historial al crear productos
  - Registrar movimientos en el historial al actualizar productos
  - Registrar movimientos en el historial al eliminar productos
- Crea índices para mejorar el rendimiento

**Cómo ejecutar**:
1. En el mismo SQL Editor, crea una **nueva query**
2. Copia y pega el contenido completo de `inventario-setup.sql`
3. Haz clic en **Run**

**Verificación**:
Verifica que las tablas fueron creadas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('productos', 'historial_inventario');
```

---

### 3️⃣ Paso 3: (Opcional) Corregir Esquema Public

**Archivo**: `fix-schema-public.sql`

**Cuándo usar**:
- Si encuentras el error: `Invalid schema: public`
- Si las tablas no se crean correctamente
- Si hay problemas de permisos

**Qué hace**:
- Asegura que el esquema `public` existe y tiene los permisos correctos
- Verifica/crea las tablas `productos` e `historial_inventario`
- Configura todas las políticas RLS
- Crea/actualiza todas las funciones y triggers
- Crea índices necesarios

**Cómo ejecutar**:
1. En el SQL Editor, crea una **nueva query**
2. Copia y pega el contenido completo de `fix-schema-public.sql`
3. Haz clic en **Run**

**Nota**: Este script es seguro ejecutarlo múltiples veces. Elimina y recrea políticas/triggers para evitar duplicados.

---

## ✅ Verificación Final

Después de ejecutar todos los scripts, verifica que todo esté correcto:

### Verificar Tablas
```sql
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'productos', 'historial_inventario');
```

Deberías ver las 3 tablas listadas.

### Verificar Políticas RLS
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Deberías ver múltiples políticas listadas.

### Verificar Funciones
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

Deberías ver las funciones creadas.

---

## 🐛 Solución de Problemas

### Error: "Invalid schema: public"
- **Solución**: Ejecuta `fix-schema-public.sql`
- **Más información**: Consulta `SOLUCION_ERROR_SCHEMA.md`

### Error: "relation already exists"
- **Causa**: Las tablas ya existen
- **Solución**: Los scripts usan `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlos de nuevo

### Error: "policy already exists"
- **Causa**: Las políticas ya existen
- **Solución**: Los scripts más recientes usan `DROP POLICY IF EXISTS` antes de crear, así que ejecuta `fix-schema-public.sql` para limpiar y recrear

### Error: "permission denied"
- **Causa**: Falta de permisos en el esquema
- **Solución**: Ejecuta `fix-schema-public.sql` que otorga todos los permisos necesarios

---

## 📝 Notas Importantes

1. **Orden es crítico**: No ejecutes `inventario-setup.sql` antes de `supabase-setup.sql`
2. **Ejecución múltiple**: Los scripts están diseñados para ser ejecutados múltiples veces de forma segura
3. **Backup**: Antes de ejecutar scripts en producción, haz un backup de tu base de datos
4. **Variables de entorno**: Asegúrate de tener configuradas `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`

---

## 🔄 Reinstalación Completa

Si necesitas reinstalar todo desde cero:

1. **Opcional**: Elimina las tablas existentes (solo si quieres empezar de cero):
   ```sql
   DROP TABLE IF EXISTS public.historial_inventario CASCADE;
   DROP TABLE IF EXISTS public.productos CASCADE;
   DROP TABLE IF EXISTS public.profiles CASCADE;
   ```

2. Ejecuta `supabase-setup.sql`
3. Ejecuta `inventario-setup.sql`
4. Verifica que todo funcione correctamente

---

## 📚 Archivos Relacionados

- `supabase-setup.sql`: Configuración inicial
- `inventario-setup.sql`: Tablas de inventario
- `fix-schema-public.sql`: Corrección de esquema
- `SOLUCION_ERROR_SCHEMA.md`: Solución detallada del error de esquema
- `INSTRUCCIONES_CONFIGURACION.md`: Instrucciones generales de configuración
