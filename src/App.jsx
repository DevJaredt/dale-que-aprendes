import { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { sonidos } from './lib/sonidos.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Inicio from './paginas/Inicio.jsx'
import IngresoEstudiante from './paginas/IngresoEstudiante.jsx'
import Jugar from './paginas/Jugar.jsx'
import Resultado from './paginas/Resultado.jsx'
import Profesor from './paginas/Profesor.jsx'
import CrearTarea from './paginas/CrearTarea.jsx'
import VerResultados from './paginas/VerResultados.jsx'

export default function App() {
  const navegar = useNavigate()
  const [sonidoActivo, setSonidoActivo] = useState(sonidos.habilitado)

  return (
    <>
      <div className="contenedor">
        <header className="encabezado-app">
          <button className="marca" onClick={() => navegar('/')}>
            <span className="logo">🎈</span>
            <span>¡Dale Que Aprendes!</span>
          </button>
          <div className="acciones-encabezado">
            <button
              className="boton boton-icono"
              title={sonidoActivo ? 'Silenciar sonidos' : 'Activar sonidos'}
              onClick={() => setSonidoActivo(sonidos.alternar())}
            >
              {sonidoActivo ? '🔊' : '🔇'}
            </button>
          </div>
        </header>
      </div>

      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/entrar" element={<IngresoEstudiante />} />
        <Route path="/jugar/:codigo" element={<Jugar />} />
        <Route path="/resultado" element={<Resultado />} />
        <Route path="/profesor" element={<Profesor />} />
        <Route path="/profesor/crear" element={<CrearTarea />} />
        <Route path="/profesor/tarea/:codigo" element={<VerResultados />} />
        <Route
          path="*"
          element={
            <div className="contenedor-angosto">
              <div className="tarjeta vacio">
                <span className="emoji">🧭</span>
                <h3>Esta página no existe</h3>
                <p>Revisa el enlace o vuelve al inicio.</p>
                <button className="boton boton-primario" onClick={() => navegar('/')}>
                  Ir al inicio
                </button>
              </div>
            </div>
          }
        />
        </Routes>
      </ErrorBoundary>
    </>
  )
}
