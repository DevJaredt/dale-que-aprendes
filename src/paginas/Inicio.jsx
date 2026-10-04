import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BANCO } from '../data/bancoPreguntas.js'
import { getEstudianteLocal } from '../lib/api.js'
import Boton from '../components/Boton.jsx'

/** Portada: elegir entre estudiante y profesor. */
export default function Inicio() {
  const navegar = useNavigate()
  const [codigo, setCodigo] = useState('')
  const estudiante = getEstudianteLocal()

  const entrarConCodigo = (e) => {
    e.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    navegar(limpio ? `/entrar?codigo=${limpio}` : '/entrar')
  }

  return (
    <div className="centrado">
      <div className="portada">
        {estudiante && (
          <div className="barra-cuenta">
            <span style={{ fontSize: '1.6rem' }}>{estudiante.avatar}</span>
            <span>
              ¡Hola, <strong>{estudiante.nombre}</strong>!
            </span>
            <Boton variante="primario" mini onClick={() => navegar('/progreso')}>
              📈 Mi progreso
            </Boton>
          </div>
        )}

        <span className="burbuja">🎈</span>
        <h1>¡Dale Que Aprendes!</h1>
        <p className="lema">
          Retos divertidos de todas las materias para estudiantes de primaria y secundaria de Colombia.
          Aprende, juega y demuestra lo que sabes.
        </p>

        <div className="opciones-portada">
          <button className="opcion-portada estudiante" onClick={() => navegar('/entrar')}>
            <span className="emoji">🧑‍🎓</span>
            <h3>Soy estudiante</h3>
            <p>Ingresa el código de la tarea y empieza a jugar.</p>
          </button>

          <button className="opcion-portada profesor" onClick={() => navegar('/profesor')}>
            <span className="emoji">👩‍🏫</span>
            <h3>Soy profesor(a)</h3>
            <p>Solo docentes: ingresa con tu clave para crear tareas y ver resultados.</p>
          </button>
        </div>

        <div className="tarjeta" style={{ marginTop: 24, textAlign: 'left' }}>
          <form onSubmit={entrarConCodigo}>
            <div className="campo" style={{ marginBottom: 10 }}>
              <label>¿Ya tienes un código de tarea?</label>
              <div className="fila">
                <input
                  type="text"
                  className="entrada-codigo"
                  placeholder="ABC123"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                />
                <button className="boton boton-amarillo" type="submit" style={{ flex: '0 0 auto' }}>
                  Entrar
                </button>
              </div>
            </div>
          </form>
          <div className="ayuda" style={{ margin: 0 }}>
            {BANCO.length} preguntas listas en el banco, organizadas por grado, materia y tema.
          </div>
        </div>
      </div>
    </div>
  )
}
