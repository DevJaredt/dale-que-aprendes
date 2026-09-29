# 🎈 ¡Dale Que Aprendes!

Juego educativo para colegios de Colombia. Los profesores crean tareas por **grado, materia y tema** (alineadas a los DBA / Estándares Básicos del MEN) y los estudiantes las resuelven desde su celular, tablet o computador.

Pensado para **primaria (1° a 5°)** y **secundaria (6° a 11°)**.

---

## ✨ ¿Qué incluye?

- **5 tipos de pregunta:** opción múltiple, verdadero/falso, emparejar, ordenar secuencia y respuesta corta.
- **Juego con gamificación:** vidas, racha 🔥, puntaje, cronómetro, estrellas y confeti.
- **Retroalimentación con el "¿por qué?"** después de cada respuesta: refuerza el aprendizaje, no solo la memoria.
- **Acceso separado:** los estudiantes solo juegan; crear tareas y ver resultados requiere la **clave de profesores**.
- **Panel del profesor con dashboard:** participaciones, estudiantes únicos, precisión y puntaje promedio, desglose por materia y grado, y últimas participaciones.
- **Crear tareas:** banco de preguntas sugeridas, editor propio, código de 6 letras y **código QR** para entrar.
- **Resultados por tarea:** distribución de puntajes, tabla de posiciones, exportar a CSV y desempeño por pregunta (para saber qué reforzar en clase).
- **Banco semilla de ~120 preguntas** de todas las materias, más las que cada profe quiera crear.
- **Funciona sin internet**: se instala y corre en un computador del colegio; los estudiantes se conectan por la red WiFi.

---

## 🔐 Acceso de profesores

Las tareas y los resultados están protegidos con una clave. La primera vez es:

```
dale2026
```

Aparece también en la consola al encender el servidor. Se puede cambiar desde **Panel → 🔑 Cambiar la clave de profesores**, o definiendo la variable `CLAVE_PROFESOR` antes de arrancar:

```powershell
$env:CLAVE_PROFESOR = "mi-clave-segura"
npm start
```

> Si olvidas la clave, bórrala de `server/data/db.json` (la propiedad `config`) y al reiniciar vuelve a `dale2026`.

---

## 🚀 Cómo usarlo en el colegio (modo aula)

Requisitos: [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install     # solo la primera vez
npm run build   # compila la aplicación
npm start       # enciende el servidor
```

La consola mostrará algo así:

```
Servidor listo en:  http://localhost:3000
En la red del colegio:  http://192.168.1.20:3000
[ QR ]
```

1. El profe abre `http://localhost:3000` en su computador.
2. Los estudiantes se conectan a la **misma red WiFi** y entran a la dirección de la red del colegio (o **escanean el QR**).
3. ¡A jugar!

> 💡 Si los estudiantes no pueden entrar, revisa el firewall de Windows y permite Node.js en redes privadas. También confirma que todos estén en la misma red WiFi.

---

## 🛠️ Modo desarrollo

```bash
npm run dev
```

Levanta el servidor y Vite con recarga automática en `http://localhost:5173`.

### Pruebas

```bash
npm test          # 27 pruebas: API y simulación de estudiantes/profesores
npm run test:render   # verifica que todas las páginas y tipos de pregunta rendericen
```

Las pruebas de interfaz simulan a un estudiante respondiendo los 5 tipos de pregunta
y a un profesor entrando al panel. Las de API verifican la autenticación, la creación
de tareas y los porcentajes del dashboard.

---

## 👩‍🏫 Cómo crear una tarea (profesor)

1. Entra a **"Soy profesor(a)"** e ingresa tu **nombre** y la **clave de profesores**.
2. En el panel verás tu **dashboard**: participaciones, estudiantes, precisión promedio, desglose por materia y grado, y las últimas jugadas.
3. Toca **"Crear tarea"**.
4. **Paso 1:** título, grado, materia y tema. Ajusta tiempo por pregunta, vidas y si se muestra la explicación.
5. **Paso 2:** agrega preguntas del **banco sugerido** o **crea las tuyas**. Puedes editar y quitar las que quieras.
6. **Paso 3:** aparece el **código** y el **QR**. Proyéctalos o compártelos.
7. En **"📊 Resultados"** de cada tarea ves la distribución de puntajes, la tabla de posiciones, el desempeño por pregunta y puedes exportar a CSV.

## 🧑‍🎓 Cómo jugar (estudiante)

1. Entra a **"Soy estudiante"**.
2. Escribe el **código** de la tarea, tu **nombre** y elige un **avatar**.
3. Responde. Al final verás tu puntaje, tus estrellas y el repaso de cada pregunta con su explicación.

---

## 📁 Estructura del proyecto

```
app-juego/
├─ server/index.js          # API + sirve la app compilada + imprime IP y QR
├─ server/data/db.json      # tareas, resultados y clave (se crea solo, no se sube a git)
├─ scripts/smoke.mjs        # prueba de render de todas las páginas
├─ vitest.config.js         # configuración de las pruebas
└─ src/
   ├─ data/curriculo.js     # grados → materias → temas (base curricular)
   ├─ data/bancoPreguntas.js# banco de preguntas semilla
   ├─ test/                 # pruebas automáticas (interfaz y API)
   ├─ preguntas/            # un componente por tipo de pregunta
   ├─ components/           # botones, QR, confeti, editor de preguntas…
   ├─ paginas/              # inicio, juego, resultado, panel del profesor…
   └─ lib/                  # API, sonidos, utilidades
```

---

## ✏️ Cómo personalizarlo

### Agregar preguntas al banco

Edita `src/data/bancoPreguntas.js` y agrega un objeto al arreglo `BANCO`:

```js
{
  id: 'p-mia-01',
  grado: '5',
  materia: 'Matemáticas',
  tema: 'Porcentajes',
  tipo: 'multiple',
  dificultad: 2,
  enunciado: '¿Cuánto es el 10% de 50?',
  opciones: ['5', '10', '15', '20'],
  correcta: 0,                    // índice de la opción correcta
  explicacion: 'El 10% es la décima parte: 50 ÷ 10 = 5.',
}
```

Para los otros tipos:

| Tipo | Campos necesarios |
|------|-------------------|
| `boolean` | `correcta: true` o `false` |
| `emparejar` | `pares: [{ izq, der }, …]` |
| `ordenar` | `secuencia: ['primero', 'segundo', …]` (ya en orden) |
| `corta` | `respuestas: ['32', 'treinta y dos']` (varias formas válidas) |

Todos los tipos aceptan `explicacion` y `puntos`.

### Agregar temas o materias

Edita `src/data/curriculo.js`. Está organizado así:

```js
'5': {
  'Matemáticas': ['Números decimales', 'Porcentajes', 'Fracciones equivalentes', …],
  …
}
```

> El grado y la materia de cada pregunta del banco deben coincidir **exactamente** con los nombres del currículo para que aparezcan en el filtro del profesor.

---

## 💾 Datos y respaldo

Todo se guarda en `server/data/db.json`. Para respaldar, copia ese archivo. Para empezar de cero, bórralo (se vuelve a crear vacío).

Los intentos de los estudiantes se guardan en el servidor, así que se ven desde cualquier dispositivo.

---

## 📌 Notas

- Las respuestas correctas viajan al navegador para poder dar retroalimentación inmediata. Es un juego didáctico de aula: no está pensado como examen de alta seguridad.
- El área de profesores está protegida con una clave (hash SHA-256 en el servidor). Los estudiantes nunca la necesitan: solo ingresan el código de la tarea y su nombre.
- El sonido se puede silenciar con el botón 🔊 en la parte superior.

---

Hecho con cariño para los colegios de Colombia. 🇨🇴
