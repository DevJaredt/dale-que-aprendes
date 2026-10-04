import { useState } from 'react'
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { sonidos } from './lib/sonidos.js'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Inicio from './paginas/Inicio.jsx'
import IngresoEstudiante from './paginas/IngresoEstudiante.jsx'
import CuentaEstudiante from './paginas/CuentaEstudiante.jsx'
import MiProgreso from './paginas/MiProgreso.jsx'
import Jugar from './paginas/Jugar.jsx'
import Resultado from './paginas/Resultado.jsx'
import AreaProfesor from './paginas/AreaProfesor.jsx'
import Profesor from './paginas/Profesor.jsx'
import CrearTarea from './paginas/CrearTarea.jsx'
import VerResultados from './paginas/VerResultados.jsx'
import Reportes from './paginas/Reportes.jsx'
import EnVivo from './paginas/EnVivo.jsx'
import Conexion from './paginas/Conexion.jsx'
import PerfilProfesor from './paginas/PerfilProfesor.jsx'

/** Botón para silenciar o activar los sonidos. */
function BotonSonido() {
  const [activo, setActivo] = useState(sonidos.habilitado)
  return (
    <button
      className="boton boton-icono"
      title={activo ? 'Silenciar sonidos' : 'Activar sonidos'}
      onClick={() => setActivo(sonidos.alternar())}
    >
      {activo ? '🔊' : '🔇'}
    </button>
  )
}

/**
 * Área de estudiantes (pública): cabecera + páginas.
 * El área de profesores tiene su propio diseño, separado a propósito.
 */
function LayoutEstudiantes() {
  const navegar = useNavigate()
  return (
    <>
      <div className="contenedor">
        <header className="encabezado-app">
          <button className="marca" onClick={() => navegar('/')}>
            <span className="logo">🎈</span>
            <span>¡Dale Que Aprendes!</span>
          </button>
          <div className="acciones-encabezado">
            <BotonSonido />
          </div>
        </header>
      </div>
      <Outlet />
    </>
  )
}

function NoEncontrada() {
  const navegar = useNavigate()
  return (
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
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* ---- Estudiantes y público ---- */}
        <Route element={<LayoutEstudiantes />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/entrar" element={<IngresoEstudiante />} />
          <Route path="/cuenta" element={<CuentaEstudiante />} />
          <Route path="/progreso" element={<MiProgreso />} />
          <Route path="/jugar/:codigo" element={<Jugar />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>

        {/* ---- Profesores: área aparte, con ingreso propio ---- */}
        <Route path="/profesor" element={<AreaProfesor />}>
          <Route index element={<Profesor />} />
          <Route path="crear" element={<CrearTarea />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="conexion" element={<Conexion />} />
          <Route path="perfil" element={<PerfilProfesor />} />
          <Route path="tarea/:codigo" element={<VerResultados />} />
          <Route path="vivo/:codigo" element={<EnVivo />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
