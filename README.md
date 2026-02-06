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

   Ejecutar el siguiente SQL en el SQL Editor de Supabase:

   ```sql
   -- Crear tabla de perfiles
   CREATE TABLE IF NOT EXISTS profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     email TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
   );

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Política: Los usuarios pueden leer su propio perfil
   CREATE POLICY "Users can read own profile"
     ON profiles FOR SELECT
     USING (auth.uid() = id);

   -- Política: Los usuarios pueden actualizar su propio perfil
   CREATE POLICY "Users can update own profile"
     ON profiles FOR UPDATE
     USING (auth.uid() = id);

   -- Política: Los usuarios pueden insertar su propio perfil
   CREATE POLICY "Users can insert own profile"
     ON profiles FOR INSERT
     WITH CHECK (auth.uid() = id);

   -- Función para crear perfil automáticamente al registrarse
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, role)
     VALUES (NEW.id, NEW.email, 'user');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Trigger para crear perfil cuando se crea un usuario
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

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

Después de configurar las tablas de perfiles (ver sección de instalación), ejecuta el siguiente script SQL en el SQL Editor de Supabase:

```bash
# El archivo inventario-setup.sql contiene todas las tablas y políticas necesarias
```

O ejecuta directamente el contenido del archivo `inventario-setup.sql` en Supabase.

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
