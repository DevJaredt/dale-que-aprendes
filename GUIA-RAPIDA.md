# 🚀 Guía rápida: mostrar el juego en otro computador

## 1. Lo único que hay que instalar

**[Node.js](https://nodejs.org)** (versión 18 o superior).
Descarga el botón que dice **LTS** y dale siguiente hasta el final.

> Para saber si ya lo tienes: abre una terminal y escribe `node --version`.
> Si responde algo como `v22.19.0`, ya está instalado.

## 2. Copiar y encender (3 comandos)

Abre la terminal — en Windows: **Inicio → Terminal** o **PowerShell** — y pega esto:

```powershell
git clone https://github.com/DevJaredt/dale-que-aprendes.git
cd dale-que-aprendes
npm install
npm start
```

La **primera vez** `npm start` compila la app solo (tarda unos segundos). Luego muestra:

```
  En este computador:  http://localhost:3000

  📱 Direcciones para los estudiantes (deben estar en la misma WiFi):

     http://192.168.1.68:3000   (Wi-Fi)   ← usa esta

  👩‍🏫 Clave de profesores:  dale2026
```

## 3. Abrir el juego

| Desde dónde | Dirección |
|---|---|
| Ese mismo computador | `http://localhost:3000` |
| Los celulares (misma WiFi) | la que dice **"usa esta"** |

Para que los celulares entren hay que hacer **una sola vez** en una terminal
**como administrador**:

```powershell
npm run firewall
```

> Sin eso, el celular se queda cargando y parece que no funcionara.

## 4. Clave de profesores en una copia nueva

```
dale2026
```

Se puede cambiar desde **Panel → Mi perfil → Cambiar la clave de profesores**.

## 5. Antes de mostrarlo: crea una tarea de prueba

⚠️ Una copia nueva **no trae tareas ni resultados** (los datos viven en tu
computador, no en GitHub). Crear una toma un minuto:

1. **"Soy profesor(a)"** → clave `dale2026`.
2. **➕ Crear tarea** → título, grado, materia y tema.
3. En el **banco sugerido** toca **"Agregar"** en 4 o 5 preguntas.
4. **🚀 Publicar tarea** → aparece el **código** y el **QR**.

> 💡 Para que ya haya resultados cuando la muestres, juega tú mismo esa tarea
> desde otro navegador (o pídele a alguien que la juegue antes).

## 6. Para detenerlo

`Ctrl + C` en la ventana donde está corriendo.

---

## Preguntas frecuentes

**¿Necesito internet para que funcione?**
No. Solo se necesita internet para **clonar** el repositorio. Después el juego
funciona en la red del salón, sin internet.

**¿Y si la otra persona está en otra ciudad?**
Con los mismos pasos funciona en *su* computador y tú lo ves por videollamada.
Si necesita que otros entren desde **fuera** de su red, hay que publicarlo en
internet o usar un túnel temporal — eso sí requiere un paso extra.

**¿Se ven mis tareas desde la copia de la otra persona?**
No. Cada copia tiene sus propios datos. Las tareas no viajan por GitHub.

**El celular no carga la página.**
1. ¿Está en la **misma WiFi** (no datos móviles)?
2. ¿Ejecutaste `npm run firewall` como administrador?
3. ¿El WiFi es el normal y no el de **invitados**? Los de invitados bloquean
   la comunicación entre dispositivos.
4. ¿Hay una **VPN** encendida en el celular o el computador?
5. Prueba escribiendo la dirección a mano en el navegador del celular.

**¿Puedo copiar mis tareas a la otra copia?**
Sí: copia el archivo `server/data/db.json` de tu computador al mismo lugar en
el otro. Ahí está todo (tareas, resultados, cuentas y sesiones).
