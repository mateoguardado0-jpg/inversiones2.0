// Script para verificar la configuración de Supabase
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Supabase...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: El archivo .env.local no existe');
  console.log('💡 Solución: Crea el archivo .env.local en la raíz del proyecto');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let supabaseUrl = null;
let supabaseKey = null;

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = trimmed.split('=')[1]?.trim();
  }
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = trimmed.split('=')[1]?.trim();
  }
});

console.log('📋 Variables encontradas:');
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ No encontrada'}`);
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Configurada' : '❌ No encontrada'}\n`);

if (!supabaseUrl) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada');
  process.exit(1);
}

// Validar que no sea un placeholder
const placeholders = [
  'your_supabase_anon_key_here',
  'TU_ANON_KEY_AQUI',
  'TU_CLAVE_ANON_AQUI'
];

const isPlaceholder = placeholders.some(placeholder => 
  supabaseKey.includes(placeholder)
);

if (isPlaceholder) {
  console.error('❌ ERROR: La API key todavía tiene un valor placeholder');
  console.log(`   Valor actual: ${supabaseKey.substring(0, 50)}...`);
  console.log('\n💡 Solución:');
  console.log('   1. Ve a Supabase Dashboard → Settings → API');
  console.log('   2. Copia la clave "anon public" (NO la "service_role")');
  console.log('   3. Reemplaza el valor en .env.local');
  console.log('   4. Guarda el archivo');
  console.log('   5. Reinicia el servidor (Ctrl+C y luego npm run dev)');
  process.exit(1);
}

// Validar formato de la clave
if (supabaseKey.length < 20) {
  console.error('❌ ERROR: La API key parece ser muy corta');
  console.log(`   Longitud: ${supabaseKey.length} caracteres`);
  console.log('   Una clave válida de Supabase suele tener más de 100 caracteres');
  process.exit(1);
}

if (!supabaseKey.startsWith('eyJ')) {
  console.warn('⚠️  ADVERTENCIA: La API key no empieza con "eyJ"');
  console.log('   Las claves de Supabase suelen empezar con "eyJ" (JWT)');
  console.log('   Verifica que copiaste la clave correcta');
}

// Validar URL
if (!supabaseUrl.startsWith('https://')) {
  console.error('❌ ERROR: La URL de Supabase debe empezar con https://');
  process.exit(1);
}

console.log('✅ Configuración válida!');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}`);
console.log(`   Longitud de key: ${supabaseKey.length} caracteres\n`);

console.log('💡 Si sigues teniendo problemas:');
console.log('   1. Asegúrate de haber guardado el archivo .env.local');
console.log('   2. Reinicia el servidor: Ctrl+C y luego npm run dev');
console.log('   3. Verifica que no haya espacios extra en las variables');
console.log('   4. Asegúrate de usar la clave "anon public", NO "service_role"');
