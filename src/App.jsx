import { useEffect, useRef, useState } from 'react';
import Planificacion from './Planificacion.jsx';
import Retiro from './Retiro.jsx';
import Inventario from './Inventario.jsx';
import Devoluciones from './Devoluciones.jsx';
import Sellers from './Sellers.jsx';
import { Navegacion } from './ui.jsx';
import { ejecutar, transaccion } from './dominio/almacen.js';
import './portal.css';

const grupos = [
  { nombre: 'Retiro en tienda', componente: Retiro, enlaces: [['retiro','Producto y disponibilidad'],['seguimiento','Seguimiento del pedido'],['entrega','Entrega en tienda']] },
  { nombre: 'Inventario', componente: Inventario, enlaces: [['existencias','Consulta de existencias'],['movimientos','Movimientos']] },
  { nombre: 'Devoluciones', componente: Devoluciones, enlaces: [['validar','Validación de compra'],['devoluciones','Seguimiento de devolución']] },
  { nombre: 'Marketplace', componente: Sellers, enlaces: [['sellers','Registro de sellers'],['productos','Productos y despachos']] },
];
function ir(vista, id) {
  const url = new URL(window.location.href);
  url.search = new URLSearchParams(id ? {vista, id} : {vista});
  window.location.assign(url);
}
export default function App() {
  const params = new URLSearchParams(window.location.search);
  const vista = params.get('vista') || 'retiro';
  const grupo = grupos.find(g => g.enlaces.some(([id])=>id===vista));
  const [db, mostrar] = useState(null);
  const [error, fallar] = useState('');
  const canal = useRef(null);
  useEffect(() => {
    let activo = true;
    async function actualizar() {
      try { const { estado } = await transaccion(); if (activo) { mostrar(estado); fallar(''); } }
      catch { if (activo) fallar('No se pudo abrir el almacenamiento local del prototipo. Revisa los permisos del navegador y recarga la página.'); }
    }
    if ('BroadcastChannel' in window) {
      canal.current = new BroadcastChannel('omni-si');
      canal.current.onmessage = actualizar;
    }
    actualizar();
    const reloj = window.setInterval(actualizar, 30000);
    window.addEventListener('focus', actualizar);
    return () => { activo = false; canal.current?.close(); clearInterval(reloj); window.removeEventListener('focus', actualizar); };
  }, []);
  async function hacer(tipo, datos, clave) {
    const {estado, resultado} = await ejecutar(tipo, datos, clave);
    mostrar(estado); canal.current?.postMessage('cambio');
    return resultado;
  }
  const titulo = grupo?.enlaces.find(([id])=>id===vista)?.[1];
  const Vista = grupo?.componente;
  return <><header className="cabecera"><div><a href="?vista=retiro" className="logo">Omni-SI <span>Falabella</span></a><span>Prototipo académico</span></div></header>
    <nav className="modulos" aria-label="Módulos">{grupos.map(g=><a key={g.nombre} href={'?vista='+g.enlaces[0][0]} aria-current={g===grupo?'page':undefined}>{g.nombre}</a>)}
      <a href="?vista=planificacion" aria-current={vista==='planificacion'?'page':undefined}>Planificación</a></nav>
    {vista === 'planificacion' ? <Planificacion/> : <main className="portal">
      <p className="rotulo">{grupo?.nombre || 'Navegación'}</p><h1>{titulo || 'Pantalla no encontrada'}</h1>
      {grupo && <Navegacion enlaces={grupo.enlaces} vista={vista}/>}
      {error ? <p role="alert" className="error">{error}</p> : !grupo ? <a href="?vista=retiro">Volver al catálogo</a> : !db ? <p>Cargando datos de demostración…</p> :
        <Vista {...{db, vista, hacer, ir}} id={params.get('id')}/>}
    </main>}<footer className="pie">SIE Proyect · Datos ficticios guardados en este navegador</footer></>;
}
