# 🚀 Inicio Rápido - Solución de Errores

## ⚡ Solución Rápida para Error 406

Si estás viendo el error **406 (Not Acceptable)**, sigue estos pasos EN ORDEN:

### 1️⃣ Ejecutar Script SQL en Supabase

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor** → **New query**
4. Copia y pega TODO el contenido de: `fix-api-rest-406.sql`
5. Haz clic en **Run** (o `Ctrl + Enter`)
6. Espera a ver el mensaje de verificación

### 2️⃣ Verificar Autenticación

1. Abre tu aplicación en el navegador
2. Presiona `F12` para abrir la consola
3. Ve a la pestaña **Application** (o **Almacenamiento**)
4. Busca **Cookies** en el menú lateral
5. **DEBE haber cookies de Supabase** (empiezan con `sb-`)

**Si NO hay cookies**:
- Cierra sesión y vuelve a iniciar sesión
- O limpia las cookies y recarga la página

### 3️⃣ Verificar Variables de Entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Verifica que tenga:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://pkvpnxycunmbpfudzncw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui
   ```
3. **IMPORTANTE**: La clave debe ser la `anon public` (NO `service_role`)
4. **Guarda el archivo** (Ctrl + S)

### 4️⃣ Reiniciar el Servidor

1. Ve a la terminal donde corre `npm run dev`
2. Presiona `Ctrl + C` para detener
3. Espera a que se detenga completamente
4. Ejecuta de nuevo: `npm run dev`
5. Espera a ver: `✓ Ready in X seconds`

### 5️⃣ Limpiar Caché del Navegador

1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Cached images and files"
3. Haz clic en "Clear data"
4. O prueba en **modo incógnito**: `Ctrl + Shift + N`

### 6️⃣ Probar de Nuevo

1. Abre la aplicación
2. Inicia sesión
3. Intenta agregar un producto
4. Si el error persiste, ve al paso 7

### 7️⃣ Si el Error Persiste

Consulta la guía completa: `SOLUCION_ERROR_406.md`

---

## 📋 Todos los Archivos Disponibles

### Scripts SQL (ejecutar en Supabase):
- ✅ `supabase-setup.sql` - Configuración inicial
- ✅ `inventario-setup.sql` - Tablas de inventario
- ✅ `fix-schema-public-completo.sql` - Corrige error de esquema
- ✅ `fix-api-rest-406.sql` - Corrige error 406

### Documentación:
- ✅ `RESUMEN_SOLUCIONES.md` - Índice completo de todas las soluciones
- ✅ `SOLUCION_ERROR_406.md` - Guía completa para error 406
- ✅ `SOLUCION_ERROR_SCHEMA.md` - Guía para error de esquema
- ✅ `DIAGNOSTICO_ERROR_SCHEMA.md` - Diagnóstico paso a paso
- ✅ `ORDEN_EJECUCION_SCRIPTS.md` - Orden correcto de ejecución
- ✅ `INSTRUCCIONES_CONFIGURACION.md` - Configuración general

---

## 🔍 Verificar que Todo Está Actualizado

Ejecuta en la terminal:

```bash
git status
git log --oneline -5
```

Deberías ver los commits más recientes:
- `448f42e` - Docs: Agregar resumen completo...
- `ad33aef` - Fix: Agregar solución para error 406...
- `24cfee4` - Fix: Agregar script completo...

Si no ves estos commits, ejecuta:
```bash
git pull origin master
```

---

## ✅ Checklist Rápido

- [ ] Script `fix-api-rest-406.sql` ejecutado en Supabase
- [ ] Estás autenticado (hay cookies de Supabase)
- [ ] Variables de entorno correctas en `.env.local`
- [ ] Servidor reiniciado después de cambiar `.env.local`
- [ ] Caché del navegador limpiada
- [ ] Probado en modo incógnito

Si todos estos puntos están verificados y el error persiste, consulta `SOLUCION_ERROR_406.md` para diagnóstico detallado.

---

**Última actualización**: Todos los archivos están en GitHub y actualizados.
