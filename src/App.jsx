import Marca from './Marca.jsx';
import Planificacion from './Planificacion.jsx';

export default function App() {
  return <>
    <header className="mastil"><div className="envoltura"><Marca href="?"/><span>Planificación</span></div></header>
    <Planificacion />
  </>;
}
