# 🎈 ¡Dale Que Aprendes!

Juego educativo para colegios de Colombia. Los profesores crean tareas por **grado, materia y tema** (alineadas a los DBA / Estándares Básicos del MEN) y los estudiantes las resuelven desde su celular, tablet o computador.

Pensado para **primaria (1° a 5°)** y **secundaria (6° a 11°)**.

---

## ✨ ¿Qué incluye?

- **5 tipos de pregunta:** opción múltiple, verdadero/falso, emparejar, ordenar secuencia y respuesta corta.
- **Juego con gamificación:** vidas, racha 🔥, puntaje, cronómetro, estrellas y confeti.
- **Retroalimentación con el "¿por qué?"** después de cada respuesta: refuerza el aprendizaje, no solo la memoria.
- **Cuentas de estudiante:** con usuario y contraseña el estudiante guarda su **historial, puntos e insignias** y puede entrar desde cualquier dispositivo. También se puede jugar sin cuenta.
- **13 insignias y logros** que se desbloquean solos (rachas, materias dominadas, constancia…).
- **Acceso separado:** los estudiantes solo juegan; crear tareas y ver resultados requiere la **clave de profesores**.
- **Panel del profesor con dashboard:** participaciones, estudiantes únicos, precisión y puntaje promedio, desglose por materia y grado, y últimas participaciones.
- **Reportes comparativos:** por materia, por grado, por combinación grado+materia y evolución por semana, con la lista de lo que más se falla.
- **Modo clase en vivo:** ranking que se actualiza solo, para proyectar mientras los estudiantes juegan.
- **Crear tareas:** banco de preguntas sugeridas, editor propio, código de 6 letras y **código QR** para entrar.
- **Resultados por tarea:** distribución de puntajes, tabla de posiciones, exportar a CSV y desempeño por pregunta.
- **Banco de 273 preguntas** de todas las materias, más las que cada profe quiera crear.
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

### La sesión se recuerda

Al entrar, la sesión del profesor dura **7 días** y **se guarda en disco**, así que
sigue siendo válida aunque apagues y vuelvas a encender el servidor: no hay que
escribir la clave cada vez. Se puede ajustar con `SESION_HORAS`:

```powershell
$env:SESION_HORAS = "24"
npm start
```

### ¿Olvidaste la clave?

No hay problema, se restablece sin perder nada (tareas ni resultados):

```powershell
npm run clave:reset                # vuelve a "dale2026"
npm run clave:reset -- mi-clave    # o establece la que quieras
```

> Esto cierra las sesiones abiertas. Si el servidor está encendido, reinícialo.

Los estudiantes **nunca** necesitan clave: solo ingresan el código de la tarea y su nombre.

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
npm test          # 70 pruebas: API, interfaz, insignias, banco y persistencia de sesión
npm run test:render   # verifica que todas las páginas y tipos de pregunta rendericen
```

Las pruebas incluyen: el recorrido completo de un estudiante por los 5 tipos de pregunta,
el ingreso del profesor, las cuentas de estudiante, el cálculo de insignias, la integridad
del banco de preguntas (que cada tema exista en el currículo), los reportes, el modo en
vivo, y una que **apaga y enciende el servidor de verdad** para comprobar que la sesión
del profesor no se pierde.

---

## 👩‍🏫 Cómo crear una tarea (profesor)

1. Entra a **"Soy profesor(a)"** e ingresa tu **nombre** y la **clave de profesores**.
2. En el panel verás tu **dashboard**: participaciones, estudiantes, precisión promedio, desglose por materia y grado, y las últimas jugadas.
3. Toca **"Crear tarea"**.
4. **Paso 1:** título, grado, materia y tema. Ajusta tiempo por pregunta, vidas y si se muestra la explicación.
5. **Paso 2:** agrega preguntas del **banco sugerido** o **crea las tuyas**. Puedes editar y quitar las que quieras.
6. **Paso 3:** aparece el **código** y el **QR**. Proyéctalos o compártelos.
7. En **"📊 Resultados"** de cada tarea ves la distribución de puntajes, la tabla de posiciones, el desempeño por pregunta y puedes exportar a CSV.
8. Con **"🔴 En vivo"** proyectas el ranking mientras juegan, y en **"📈 Reportes"** comparas materias, grados y semanas.

## 🧑‍🎓 Cómo jugar (estudiante)

### Con cuenta (recomendado)

1. Entra a **"Soy estudiante"** → **"Entra a tu cuenta"** o **"crea una"**.
2. Elige tu usuario, contraseña, grado y avatar. **Una sola vez.**
3. Después, en **"Mi progreso"** ves tus puntos, tu precisión por materia, tus insignias y todo tu historial.
4. Si entras desde otro celular o computador, tus datos siguen ahí.

### Sin cuenta (juego rápido)

1. Entra a **"Soy estudiante"** y escribe el **código** de la tarea, tu **nombre** y elige un **avatar**.
2. Respondes y al final ves tu puntaje, tus estrellas y el repaso de cada pregunta.
3. *No se guarda el historial*, pero el profe sí ve el resultado en su panel.

---

## 🎒 Progreso e insignias

Con cuenta, el estudiante gana insignias automáticamente. Algunas:

| Insignia | Cómo se consigue |
|---|---|
| 👣 Primer paso | Completar la primera tarea |
| 💯 Puntaje perfecto | Acertar todas las preguntas de una tarea |
| 🔥 En racha | Acertar 5 preguntas seguidas |
| ⚡ Imparable | Acertar 10 preguntas seguidas |
| 📅 Constante | Jugar en 3 días diferentes |
| 🧭 Explorador | Jugar tareas de 4 materias distintas |
| 🧮 Matemático | 3 tareas de Matemáticas con 80 % o más |
| 🚀 Mente rápida | Terminar una tarea en menos de 15 s por pregunta |
| 🎖️ Veterano | Completar 10 tareas |

Cuando se desbloquea una, aparece en la pantalla de resultados con **"¡Nuevo logro!"**.

---

## 🔴 Modo clase en vivo

Ideal para proyectar en el salón:

1. En el panel, toca **"🔴 En vivo"** en la tarea que van a jugar.
2. El ranking se **actualiza solo cada 4 segundos**: podio, tabla de posiciones y aviso cuando alguien termina.
3. Los que lleguen tarde entran con el **código** o el **QR** que aparecen en la misma pantalla.
4. Puedes pausar la actualización automática si quieres congelar la pantalla.

---

## 📈 Reportes comparativos

En **Panel → 📈 Reportes** encuentras:

- Totales: tareas, participaciones, estudiantes y precisión general.
- **Comparación por materia**, **por grado** y **por combinación grado + materia**.
- **Evolución por semana** (participaciones y precisión).
- **Qué conviene reforzar**: tareas ordenadas de la que más se falla a la que mejor sale, con el detalle de cada pregunta al desplegarla.

---

## 📁 Estructura del proyecto

```
app-juego/
├─ server/index.js          # API + sirve la app compilada + imprime IP y QR
├─ server/logros.js         # cálculo de insignias (lógica pura)
├─ server/data/db.json      # tareas, resultados, cuentas y sesiones (no se sube a git)
├─ scripts/smoke.mjs        # prueba de render de todas las páginas
├─ scripts/clave-reset.mjs  # restablece la clave de profesores
├─ vitest.config.js         # configuración de las pruebas
└─ src/
   ├─ data/curriculo.js     # grados → materias → temas (base curricular)
   ├─ data/bancoPreguntas.js# banco base + unión con el ampliado
   ├─ data/bancoAmpliado.js # 150 preguntas adicionales
   ├─ test/                 # pruebas automáticas (interfaz y API)
   ├─ preguntas/            # un componente por tipo de pregunta
   ├─ components/           # botones, QR, confeti, editor de preguntas…
   ├─ paginas/              # inicio, juego, resultado, progreso, panel, reportes, en vivo…
   └─ lib/                  # API, sonidos, utilidades
```

---

## ✏️ Cómo personalizarlo

### Agregar preguntas al banco

Las preguntas viven en dos archivos:

- `src/data/bancoPreguntas.js` → preguntas base (arreglo `BANCO_BASE`).
- `src/data/bancoAmpliado.js` → 150 preguntas adicionales (arreglo `BANCO_AMPLIADO`).

El juego usa `BANCO = [...BANCO_BASE, ...BANCO_AMPLIADO]`. Agrega un objeto así:

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

> El grado y la materia de cada pregunta del banco deben coincidir **exactamente** con los nombres del currículo para que aparezcan en el filtro del profesor. La prueba `npm test` verifica esto automáticamente.

---

## 💾 Datos y respaldo

Todo se guarda en `server/data/db.json`. Para respaldar, copia ese archivo. Para empezar de cero, bórralo (se vuelve a crear vacío).

Los intentos de los estudiantes se guardan en el servidor, así que se ven desde cualquier dispositivo.

---

## 📌 Notas

- Las respuestas correctas viajan al navegador para poder dar retroalimentación inmediata. Es un juego didáctico de aula: no está pensado como examen de alta seguridad.
- El área de profesores está protegida con una clave (hash SHA-256 en el servidor). Los estudiantes **nunca** necesitan esa clave: usan su propia cuenta o juegan con el código de la tarea.
- Las contraseñas de los estudiantes también se guardan con hash SHA-256, nunca en texto plano.
- El sonido se puede silenciar con el botón 🔊 en la parte superior.

---

Hecho con cariño para los colegios de Colombia. 🇨🇴
