/**
 * Compila la aplicación si todavía no existe la carpeta dist/.
 *
 * Se ejecuta automáticamente antes de "npm start" (script "prestart").
 * Así, quien clona el repositorio solo necesita:
 *
 *     npm install
 *     npm start
 *
 * sin tener que acordarse de compilar la primera vez.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const COMPILADO = path.join(RAIZ, 'dist', 'index.html')

if (fs.existsSync(COMPILADO)) {
  process.exit(0)
}

console.log('\n  Primera vez: compilando la aplicación (tarda unos segundos)…\n')

try {
  execSync('npm run build', { cwd: RAIZ, stdio: 'inherit' })
} catch {
  console.error('\n  ⚠️  No se pudo compilar automáticamente.')
  console.error('     Ejecuta manualmente:  npm run build\n')
  process.exit(1)
}
