/**
 * Restablece la clave de profesores.
 *
 * Sirve para cuando se olvida la clave.
 *
 * Uso:
 *   npm run clave:reset              -> vuelve a "dale2026"
 *   npm run clave:reset -- mi-clave  -> establece "mi-clave"
 *
 * También cierra todas las sesiones abiertas.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ARCHIVO = process.env.DB_PATH || path.join(RAIZ, 'server', 'data', 'db.json')
const clave = process.argv[2] || process.env.CLAVE_PROFESOR || 'dale2026'

if (!fs.existsSync(ARCHIVO)) {
  console.error(`\n  ⚠️  No existe el archivo de datos: ${ARCHIVO}`)
  console.error('     Enciende el servidor una vez (npm start) y vuelve a intentarlo.\n')
  process.exit(1)
}

let db
try {
  db = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8'))
} catch (err) {
  console.error(`\n  ⚠️  No se pudo leer ${ARCHIVO}: ${err.message}\n`)
  process.exit(1)
}

db.config = {
  ...(db.config || {}),
  claveHash: crypto.createHash('sha256').update(clave).digest('hex'),
}
db.sesiones = {} // se cierran todas las sesiones abiertas

fs.writeFileSync(ARCHIVO, JSON.stringify(db, null, 2), 'utf8')

console.log('\n  ✅ Clave de profesores restablecida')
console.log(`     Nueva clave: ${clave}`)
console.log('     Se cerraron todas las sesiones abiertas.')
console.log('     (Si el servidor está encendido, reinícialo para que la tome.)\n')
