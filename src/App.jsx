import RevisionTecnica from "./revision/RevisionTecnica.jsx";
import RevisionProcesos from "./revision/RevisionProcesos.jsx";
import { useEffect, useRef, useState } from 'react';
import Cabecera from './Cabecera.jsx';
import Planificacion from './Planificacion.jsx';
import Retiro from './Retiro.jsx';
import Inventario from './Inventario.jsx';
import Devoluciones from './Devoluciones.jsx';
import Sellers from './Sellers.jsx';
import Integracion from './Integracion.jsx';
import { Navegacion } from './ui.jsx';
import { ejecutar, transaccion } from './dominio/almacen.js';
import './portal.css';

const grupos = [
  { nombre: "Arquitectura e integración", componente: RevisionTecnica, enlaces: [["laboratorio","Laboratorio del Sprint 3"]] },
  { nombre: "Procesos de tienda", componente: RevisionProcesos, enlaces: [["procesos","Recorridos del Sprint 2"]] },
  { nombre: 'Retiro en tienda', componente: Retiro, enlaces: [['retiro','Producto y disponibilidad'],['seguimiento','Seguimiento del pedido'],['entrega','Entrega en tienda']] },
  { nombre: 'Inventario', componente: Inventario, enlaces: [['existencias','Consulta de existencias'],['movimientos','Movimientos']] },
  { nombre: 'Devoluciones', componente: Devoluciones, enlaces: [['validar','Validación de compra'],['devoluciones','Seguimiento de devolución']] },
  { nombre: 'Marketplace', componente: Sellers, enlaces: [['sellers','Registro de sellers'],['productos','Productos y despachos']] },
  { nombre: 'Integración', componente: Integracion, enlaces: [['integracion','Monitor de integración']] },
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
  const pendiente = useRef(false);
  pendiente.current = db?.integracion.cola.some(m => Object.values(m.entregas).some(e => e.estado === 'Pendiente'));
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
    const reintentos = window.setInterval(() => { if (pendiente.current) actualizar(); }, 1000);
    window.addEventListener('focus', actualizar);
    return () => { activo = false; canal.current?.close(); clearInterval(reloj); clearInterval(reintentos); window.removeEventListener('focus', actualizar); };
  }, []);
  function actualizar(estado) {
    mostrar(estado);
    canal.current?.postMessage('cambio');
  }
  async function hacer(tipo, datos, clave) {
    const {estado, resultado} = await ejecutar(tipo, datos, clave);
    actualizar(estado);
    return resultado;
  }
  const titulo = grupo?.enlaces.find(([id])=>id===vista)?.[1];
  const Vista = grupo?.componente;
  const producto = vista === 'retiro';
  return <><Cabecera vista={vista} integracion={grupos.some(g=>g.enlaces[0][0]==='integracion')}/>
    {vista === 'planificacion' ? <Planificacion/> : <main className="portal">
      {producto ? <p className="ruta-producto">Tienda <span>/</span> Audio <span>/</span> Audífonos</p> : <>
        <p className="rotulo">{grupo?.nombre || 'Tienda'}</p><h1>{titulo || 'Pantalla no encontrada'}</h1>
        {grupo && grupo.componente!==Retiro && grupo.enlaces.length>1 && <Navegacion enlaces={grupo.enlaces} vista={vista}/>}
      </>}
      {error ? <p role="alert" className="error">{error}</p> : !grupo ? <a href="?vista=retiro">Volver a comprar</a> : !db ? <p>Cargando la tienda…</p> :
        <Vista {...{db, vista, hacer, ir, actualizar}} id={params.get('id')}/>}
    </main>}<footer className="pie"><strong>Omni-SI Falabella</strong><span>Proyecto académico · Datos de ejemplo en este navegador</span></footer></>;
}
