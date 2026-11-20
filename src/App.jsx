import Planificacion from './Planificacion.jsx';
import Retiro from './Retiro.jsx';

export default function App() {
  const planificacion = new URLSearchParams(window.location.search).get('vista') === 'planificacion';
  return (
    <>
      <nav className="vistas" aria-label="Demostraciones por sprint">
        <a href="?vista=planificacion" aria-current={planificacion ? 'page' : undefined}>Planificación</a>
        <a href="?vista=retiro" aria-current={planificacion ? undefined : 'page'}>Consulta de stock</a>
      </nav>
      {planificacion ? <Planificacion /> : <Retiro />}
    </>
  );
}
