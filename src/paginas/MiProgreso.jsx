import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  api,
  esErrorDeSesion,
  getTokenEstudiante,
  getEstudianteLocal,
  setEstudianteLocal,
} from '../lib/api.js'
import { AVATARES, formatearTiempo } from '../lib/util.js'
import { GRADOS } from '../data/curriculo.js'
import Boton from '../components/Boton.jsx'
import { Campo, Cargando, Vacio } from '../components/Ui.jsx'

/** Perfil del estudiante: progreso, insignias e historial. */
export default function MiProgreso() {
  const navegar = useNavigate()
  const [estado, setEstado] = useState('cargando') // cargando | listo | fuera | error
  const [perfil, setPerfil] = useState(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(false)

  const cargar = useCallback(async () => {
    if (!getTokenEstudiante()) {
      navegar('/cuenta?volver=/progreso', { replace: true })
      return
    }
    setEstado('cargando')
    try {
      const datos = await api.perfilEstudiante()
      setPerfil(datos)
      setEstudianteLocal(datos.estudiante)
      setEstado('listo')
    } catch (e) {
      if (esErrorDeSesion(e)) {
        navegar('/cuenta?volver=/progreso', { replace: true })
      } else {
        setError(e.message)
        setEstado('error')
      }
    }
  }, [navegar])

  useEffect(() => {
    cargar()
  }, [cargar])

  async function salir() {
    await api.salirEstudiante()
    navegar('/', { replace: true })
  }

  if (estado === 'cargando') return <Cargando texto="Cargando tu progreso…" />

  if (estado === 'error') {
    return (
      <div className="contenedor-angosto">
        <div className="tarjeta">
          <Vacio emoji="📡" titulo="No pudimos cargar tu progreso" texto={error}>
            <Boton variante="primario" onClick={cargar}>
              🔄 Reintentar
            </Boton>
          </Vacio>
        </div>
      </div>
    )
  }

  const { estudiante, resumen, logros, intentos } = perfil
  const obtenidos = logros.filter((l) => l.obtenido)
  const pendientes = logros.filter((l) => !l.obtenido)

  return (
    <div className="contenedor">
      <div className="encabezado-app">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: '2.6rem' }}>{estudiante.avatar}</span>
          <div>
            <h2 style={{ marginBottom: 2 }}>{estudiante.nombre}</h2>
            <span className="ayuda">
              @{estudiante.usuario} · {estudiante.grado}° ({Number(estudiante.grado) <= 5 ? 'Primaria' : 'Secundaria'})
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Boton variante="amarillo" onClick={() => navegar('/entrar')}>
            🎮 Jugar otra tarea
          </Boton>
          <Boton variante="fantasma" mini onClick={() => setEditando((v) => !v)}>
            ✏️ Editar
          </Boton>
          <Boton variante="fantasma" mini onClick={salir}>
            🚪 Salir
          </Boton>
        </div>
      </div>

      {editando && (
        <EditarPerfil
          estudiante={estudiante}
          onGuardado={(e) => {
            setPerfil((p) => ({ ...p, estudiante: e }))
            setEstudianteLocal(e)
            setEditando(false)
          }}
          onCancelar={() => setEditando(false)}
        />
      )}

      <div className="metricas">
        <div className="metrica">
          <div className="valor">{resumen.tareas}</div>
          <div className="rotulo">Tareas jugadas</div>
        </div>
        <div className="metrica">
          <div className="valor">{resumen.precision}%</div>
          <div className="rotulo">Precisión</div>
        </div>
        <div className="metrica">
          <div className="valor">{resumen.puntaje}</div>
          <div className="rotulo">Puntos totales</div>
        </div>
        <div className="metrica">
          <div className="valor">{formatearTiempo(resumen.segundos)}</div>
          <div className="rotulo">Tiempo jugado</div>
        </div>
        <div className="metrica">
          <div className="valor">
            {obtenidos.length}/{logros.length}
          </div>
          <div className="rotulo">Insignias</div>
        </div>
      </div>

      {resumen.tareas === 0 ? (
        <div className="tarjeta">
          <Vacio
            emoji="🌱"
            titulo="Todavía no has jugado ninguna tarea"
            texto="Cuando termines tu primera tarea aquí verás tus puntos, tu precisión y tus insignias."
          >
            <Boton variante="amarillo" onClick={() => navegar('/entrar')}>
              🎮 Jugar ahora
            </Boton>
          </Vacio>
        </div>
      ) : (
        <>
          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🏅 Mis insignias</h3>
            <p className="ayuda">
              Has conseguido {obtenidos.length} de {logros.length}.
            </p>

            <div className="logros-grid">
              {obtenidos.map((l) => (
                <div className="logro obtenido" key={l.id}>
                  <span className="emoji">{l.emoji}</span>
                  <strong>{l.nombre}</strong>
                  <span className="detalle">{l.descripcion}</span>
                </div>
              ))}
            </div>

            {pendientes.length > 0 && (
              <>
                <h4 style={{ marginTop: 20, marginBottom: 8, fontSize: '0.95rem' }}>
                  Te faltan estas
                </h4>
                <div className="logros-grid">
                  {pendientes.map((l) => (
                    <div className="logro" key={l.id}>
                      <span className="emoji bloqueado">🔒</span>
                      <strong>{l.nombre}</strong>
                      <span className="detalle">{l.descripcion}</span>
                      {l.progreso && l.progreso.meta > 1 && (
                        <div className="barra-mini" style={{ marginTop: 6 }}>
                          <div
                            style={{
                              width: `${Math.round((l.progreso.actual / l.progreso.meta) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                      {l.progreso && l.progreso.meta > 1 && (
                        <span className="ayuda">
                          {l.progreso.actual} de {l.progreso.meta}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>📘 Mi desempeño por materia</h3>
            {resumen.porMateria.map((m) => (
              <div key={m.nombre} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>{m.nombre}</span>
                  <span className="ayuda">
                    {m.precision}% · {m.tareas} tarea(s)
                  </span>
                </div>
                <div className={`barra-mini ${m.precision < 50 ? 'baja' : ''}`} style={{ marginTop: 4 }}>
                  <div style={{ width: `${m.precision}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="tarjeta">
            <h3 style={{ fontSize: '1.05rem' }}>🕒 Mi historial</h3>
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Materia</th>
                    <th>Puntaje</th>
                    <th>Aciertos</th>
                    <th>Precisión</th>
                    <th>Tiempo</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {intentos.map((i) => (
                    <tr key={i.id}>
                      <td>{i.titulo}</td>
                      <td>
                        {i.materia} · {i.grado}°
                      </td>
                      <td>
                        <strong>{i.puntaje}</strong>
                      </td>
                      <td>
                        {i.correctas}/{i.total}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className={`barra-mini ${i.precision < 50 ? 'baja' : ''}`} style={{ width: 60 }}>
                            <div style={{ width: `${i.precision}%` }} />
                          </div>
                          <span>{i.precision}%</span>
                        </div>
                      </td>
                      <td>{formatearTiempo(i.segundos)}</td>
                      <td>{new Date(i.fecha).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* -------------------- Editar perfil -------------------- */

function EditarPerfil({ estudiante, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: estudiante.nombre,
    grado: estudiante.grado || '6',
    avatar: estudiante.avatar || '🦊',
  })
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      const { estudiante: actualizado } = await api.actualizarPerfilEstudiante(form)
      onGuardado(actualizado)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="tarjeta">
      <h3 style={{ fontSize: '1.05rem' }}>✏️ Editar mi perfil</h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={guardar}>
        <Campo etiqueta="Nombre">
          <input
            type="text"
            value={form.nombre}
            maxLength={60}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
        </Campo>
        <Campo etiqueta="Grado">
          <select value={form.grado} onChange={(e) => setForm((f) => ({ ...f, grado: e.target.value }))}>
            {GRADOS.map((g) => (
              <option key={g} value={g}>
                {g}° ({Number(g) <= 5 ? 'Primaria' : 'Secundaria'})
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Avatar">
          <div className="avatares">
            {AVATARES.map((a) => (
              <button
                key={a}
                type="button"
                className={`avatar ${form.avatar === a ? 'activo' : ''}`}
                onClick={() => setForm((f) => ({ ...f, avatar: a }))}
              >
                {a}
              </button>
            ))}
          </div>
        </Campo>
        <div style={{ display: 'flex', gap: 8 }}>
          <Boton variante="verde" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : '💾 Guardar'}
          </Boton>
          <Boton variante="fantasma" onClick={onCancelar}>
            Cancelar
          </Boton>
        </div>
      </form>
    </div>
  )
}
