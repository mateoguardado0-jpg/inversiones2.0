# 🔧 Instrucciones paso a paso para configurar la API key

## ⚠️ PROBLEMA DETECTADO
El archivo `.env.local` todavía tiene el valor placeholder. Sigue estos pasos EXACTOS:

## 📝 Paso 1: Abrir el archivo .env.local

1. Ve a la carpeta del proyecto: `C:\Users\mateo\OneDrive\Escritorio\Documentos\Inventario2.0`
2. Abre el archivo `.env.local` con:
   - **Bloc de notas** (Notepad)
   - **VS Code** o **Cursor**
   - Cualquier editor de texto simple

## 📋 Paso 2: Ver el contenido actual

El archivo debería verse así:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pkvpnxycunmbpfudzncw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🔑 Paso 3: Obtener la clave correcta de Supabase

1. Ve a: https://app.supabase.com
2. Inicia sesión
3. Selecciona tu proyecto: `pkvpnxycunmbpfudzncw`
4. Ve a **Settings** (⚙️) → **API**
5. En **Project API keys**, busca la clave que dice:
   - `anon` `public` ← **ESTA ES LA CORRECTA**
6. Haz clic en el botón de **copiar** (📋) junto a esa clave
7. La clave debería verse así: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnBueHljdW5tYnBmdWR6bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.XXXXX...`

## ✏️ Paso 4: Reemplazar en .env.local

1. En el archivo `.env.local`, encuentra esta línea:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

2. **BORRA** `your_supabase_anon_key_here`

3. **PEGA** la clave que copiaste de Supabase (sin espacios antes o después)

4. Debería quedar así (con TU clave real):
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnBueHljdW5tYnBmdWR6bmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.XXXXX...
   ```

## 💾 Paso 5: GUARDAR el archivo

1. Presiona **Ctrl + S** (o File → Save)
2. **IMPORTANTE**: Asegúrate de que el archivo se guardó correctamente
3. Cierra el editor

## 🔄 Paso 6: Reiniciar el servidor

1. Ve a la terminal donde está corriendo `npm run dev`
2. Presiona **Ctrl + C** para detener el servidor
3. Espera a que se detenga completamente
4. Ejecuta de nuevo: `npm run dev`
5. Espera a que veas: `✓ Ready in X seconds`

## ✅ Paso 7: Verificar

1. Abre el navegador en: `http://localhost:3000/login`
2. Deberías ver el formulario de login sin errores
3. Si ves un error, ejecuta: `node verificar-config.js` para ver qué está mal

## 🐛 Problemas comunes

**"Sigue diciendo lo mismo"**
- ✅ Verifica que guardaste el archivo (Ctrl + S)
- ✅ Verifica que reiniciaste el servidor (Ctrl + C y luego npm run dev)
- ✅ Verifica que no hay espacios antes o después del signo `=`
- ✅ Verifica que estás usando la clave `anon public`, NO `service_role`

**"No encuentro el archivo .env.local"**
- El archivo está en la raíz del proyecto
- Puede estar oculto (en Windows, activa "Mostrar archivos ocultos")
- O crea uno nuevo con el contenido correcto

**"La clave es muy larga"**
- Es normal, las claves de Supabase son muy largas (más de 100 caracteres)
- Asegúrate de copiar la clave COMPLETA

**"Invalid schema: public" al subir artículos**
- Este error indica que el esquema `public` no está correctamente configurado en Supabase
- **Solución Rápida**: Ejecuta el script `fix-schema-public-completo.sql` en el SQL Editor de Supabase
  1. Ve a Supabase Dashboard → SQL Editor
  2. Copia y pega el contenido de `fix-schema-public-completo.sql`
  3. Haz clic en "Run"
  4. Espera a ver el mensaje de verificación final
  5. Vuelve a intentar subir el artículo
- **Si el error persiste**: Consulta `DIAGNOSTICO_ERROR_SCHEMA.md` para diagnóstico paso a paso
- Para más detalles, consulta `SOLUCION_ERROR_SCHEMA.md`