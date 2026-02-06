# Solución: Error "email rate limit exceeded"

## ¿Qué significa este error?

El error **"email rate limit exceeded"** ocurre cuando Supabase intenta enviar demasiados emails de confirmación en un período corto de tiempo. Esto puede pasar si:

1. Intentaste registrarte varias veces con el mismo email
2. Supabase tiene habilitada la confirmación de email por defecto
3. Se excedió el límite de emails por hora/día que permite Supabase

## Soluciones

### Opción 1: Deshabilitar confirmación de email (Recomendado para desarrollo)

Esta es la solución más rápida para desarrollo y pruebas:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Settings** (en el menú lateral)
3. Busca la sección **"Email Auth"**
4. **IMPORTANTE**: Busca la opción **"Enable email confirmations"** (NO es "Enable custom SMTP")
5. Desactiva la opción **"Enable email confirmations"**
6. Guarda los cambios

**Nota**: Con esta configuración, los usuarios podrán iniciar sesión inmediatamente después de registrarse sin necesidad de confirmar su email.

**Diferencia importante**:
- **"Enable email confirmations"**: Controla si se requiere confirmar el email antes de iniciar sesión
- **"Enable custom SMTP"**: Permite usar tu propio servidor de email (no es necesario para solucionar el rate limit)

### Opción 2: Esperar y reintentar

Si prefieres mantener la confirmación de email habilitada:

1. Espera entre **15-30 minutos** antes de intentar registrarte nuevamente
2. El límite de rate limit se resetea automáticamente después de un tiempo

### Opción 3: Usar un email diferente

Si necesitas probar inmediatamente:

1. Usa un email diferente para el registro
2. O elimina el usuario existente desde el dashboard de Supabase:
   - Ve a **Authentication** → **Users**
   - Busca el usuario y elimínalo
   - Intenta registrarte nuevamente

## Configuración recomendada para desarrollo

Para evitar este problema durante el desarrollo, te recomendamos:

1. **Deshabilitar confirmación de email** (Opción 1)
2. **Configurar emails de prueba** en Supabase:
   - Ve a **Authentication** → **Email Templates**
   - Puedes personalizar los templates o usar los predeterminados
   - Para desarrollo, puedes usar servicios como [Mailtrap](https://mailtrap.io) o simplemente deshabilitar la confirmación

## Configuración para producción

Para producción, es recomendable:

1. **Mantener la confirmación de email habilitada** (seguridad)
2. **Configurar un servicio de email personalizado** (opcional pero recomendado):
   - Ve a **Authentication** → **Settings** → **SMTP Settings**
   - Activa **"Enable custom SMTP"**
   - Configura tu propio servidor SMTP (SendGrid, Mailgun, AWS SES, etc.)
   - Esto te da más control sobre los límites de envío y evita el rate limit de Supabase

**Servicios SMTP recomendados**:
- **SendGrid**: 100 emails gratis/día
- **Mailgun**: 5,000 emails gratis/mes
- **AWS SES**: Muy económico, pago por uso
- **Resend**: Diseñado para desarrolladores, 3,000 emails gratis/mes

## Verificar la configuración actual

Para verificar si la confirmación de email está habilitada:

1. Ve a **Authentication** → **Settings**
2. Busca **"Enable email confirmations"** (NO confundir con "Enable custom SMTP")
3. Si está activada, verás un toggle en verde/azul

**Ubicación exacta en Supabase**:
- **Authentication** → **Settings** → Sección **"Email Auth"**
- Busca específicamente **"Enable email confirmations"**
- Esta opción controla si los usuarios deben confirmar su email antes de iniciar sesión

**"Enable custom SMTP"** es una opción diferente que:
- Permite usar tu propio servidor de email
- No afecta el rate limit directamente
- Solo es útil si quieres usar un servicio SMTP externo

## Mensaje de error mejorado

El código ahora muestra un mensaje más claro cuando ocurre este error, explicando qué hacer.
