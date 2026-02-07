# Inventario 2.0

Sistema web de gestión de inventario online construido con Next.js, Supabase y TypeScript.

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database + RLS)
- **Autenticación**: Supabase Auth (email/password y Google OAuth)
- **Hosting**: Vercel (recomendado)
- **IA**: Google Gemini API (integración base)

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase
- Cuenta de Google Cloud (opcional, para Gemini API)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd Inventario2.0
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` y agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase
   - `NEXT_PUBLIC_GEMINI_API_KEY`: (Opcional) Clave de API de Gemini

4. **Configurar base de datos en Supabase**

   ⚠️ **IMPORTANTE**: Ejecuta los scripts SQL en el siguiente orden:

   **Paso 4.1: Configurar perfiles de usuario**
   
   Ejecuta el contenido del archivo `supabase-setup.sql` en el SQL Editor de Supabase:
   - Ve a Supabase Dashboard → SQL Editor → New query
   - Copia y pega el contenido completo de `supabase-setup.sql`
   - Haz clic en **Run** (o presiona `Ctrl + Enter`)

   **Paso 4.2: Configurar tablas de inventario**
   
   Ejecuta el contenido del archivo `inventario-setup.sql` en el SQL Editor de Supabase:
   - En el mismo SQL Editor, crea una nueva query
   - Copia y pega el contenido completo de `inventario-setup.sql`
   - Haz clic en **Run**

   ⚠️ **Si encuentras el error "Invalid schema: public"**:
   - Ejecuta el archivo `fix-schema-public.sql` en el SQL Editor
   - Consulta `SOLUCION_ERROR_SCHEMA.md` para más detalles

5. **Configurar Google OAuth en Supabase**

   - Ir a Authentication > Providers en el dashboard de Supabase
   - Habilitar Google OAuth
   - Configurar Client ID y Client Secret de Google Cloud Console
   - Agregar URL de callback: `https://tu-dominio.com/auth/callback`

6. **Ejecutar el proyecto**
   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
Inventario2.0/
├── app/                    # App Router de Next.js
│   ├── auth/              # Rutas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página de inicio (redirige)
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── auth/             # Componentes de autenticación
│   ├── dashboard/        # Componentes del dashboard
│   └── ui/               # Componentes de shadcn/ui
├── lib/                  # Utilidades y configuraciones
│   ├── supabase/         # Clientes de Supabase
│   ├── gemini.ts         # Cliente de Gemini AI
│   └── utils.ts          # Utilidades generales
├── middleware.ts         # Middleware de Next.js (protección de rutas)
└── public/               # Archivos estáticos
```

## 🔐 Autenticación

El sistema soporta dos métodos de autenticación:

1. **Email/Password**: Registro e inicio de sesión tradicional
2. **Google OAuth**: Inicio de sesión con cuenta de Google

## 🛡️ Protección de Rutas

El middleware protege automáticamente todas las rutas excepto `/login` y `/register`. Los usuarios no autenticados son redirigidos al login.

## 👥 Roles de Usuario

El sistema incluye tres roles:

- **admin**: Administrador con acceso completo
- **user**: Usuario estándar
- **viewer**: Usuario de solo lectura

## 📦 Gestión de Inventario

El sistema incluye una interfaz completa de gestión de inventario con las siguientes funcionalidades:

### Funcionalidades Implementadas

- ✅ **Historial de Inventario**: Visualización completa de productos y movimientos
- ✅ **Agregar Productos**: Formulario para agregar nuevos productos al inventario
- ✅ **Editar Productos**: Modificación de información de productos existentes
- ✅ **Eliminar Productos**: Eliminación de productos del inventario
- ✅ **Historial de Movimientos**: Registro automático de todos los cambios (entradas, salidas, ajustes, etc.)

### Configuración de Base de Datos

**Orden de ejecución de scripts SQL:**

1. **Primero**: Ejecuta `supabase-setup.sql` para crear las tablas de perfiles
2. **Segundo**: Ejecuta `inventario-setup.sql` para crear las tablas de inventario
3. **Si hay problemas**: Ejecuta `fix-schema-public.sql` para corregir el esquema

Todos los scripts deben ejecutarse en el SQL Editor de Supabase (Dashboard → SQL Editor).

**Archivos SQL disponibles:**
- `supabase-setup.sql`: Configuración inicial de perfiles de usuario
- `inventario-setup.sql`: Tablas de productos e historial de inventario
- `fix-schema-public.sql`: Corrección del error "Invalid schema: public"

**Solución de problemas:**
- Si encuentras el error "Invalid schema: public", consulta `SOLUCION_ERROR_SCHEMA.md`
- Verifica que las variables de entorno estén configuradas correctamente en `.env.local`

Este script crea:
- Tabla `productos`: Almacena todos los productos del inventario
- Tabla `historial_inventario`: Registra todos los movimientos y cambios
- Políticas RLS: Protege los datos por usuario
- Triggers automáticos: Crea registros en el historial cuando se crean, editan o eliminan productos

## 🚧 Próximas Funcionalidades

- [ ] Reportes y análisis
- [ ] Integración avanzada con IA (Gemini)
- [ ] Notificaciones en tiempo real
- [ ] Exportación de datos
- [ ] Búsqueda y filtros avanzados

## 🚀 Despliegue en Vercel

El proyecto está completamente preparado para desplegarse en Vercel. Para instrucciones detalladas, consulta el archivo [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md).

### Resumen rápido:

1. **Sube tu código a GitHub**
2. **Conecta tu repositorio en Vercel**
3. **Configura las variables de entorno**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY` (opcional)
4. **Actualiza las URLs de callback en Supabase** con tu dominio de Vercel
5. **Despliega** - Vercel detectará automáticamente Next.js y desplegará tu aplicación

## 📝 Notas

- El proyecto está configurado para producción en Vercel
- Las variables de entorno deben configurarse en Vercel para el despliegue
- La integración de Gemini está preparada pero no implementada completamente
- Todas las páginas están configuradas como dinámicas para soportar autenticación

## 📄 Licencia

Este proyecto es privado.
