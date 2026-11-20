import { cloneElement, useId, useRef, useState } from 'react';
import { fecha } from './dominio/modelo.js';

export function Panel({ titulo, children }) {
  return <section className="panel"><h2>{titulo}</h2>{children}</section>;
}
export function Campo({ nombre, children, ...props }) {
  const id = useId();
  return <div className="campo"><label htmlFor={id}>{nombre}</label>{children ? cloneElement(children, {id}) : <input id={id} required {...props}/>}</div>;
}
export function Opciones({ valores, ...props }) {
  return <select required {...props}>{valores.map(v => <option key={v}>{v}</option>)}</select>;
}
export function Formulario({ accion, boton, children, confirmar, fin, className = '' }) {
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const bloqueo = useRef(false);
  async function enviar(e) {
    e.preventDefault();
    if (bloqueo.current || (confirmar && !window.confirm(confirmar))) return;
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    bloqueo.current = true;
    setOcupado(true);
    setAviso('');
    try {
      const resultado = await accion(datos);
      setError(false); setAviso('Operación registrada.');
      fin?.(resultado);
    } catch (fallo) {
      setError(true); setAviso(fallo.message);
    } finally { bloqueo.current = false; setOcupado(false); }
  }
  return <form className={className} onSubmit={enviar} onChange={() => setAviso('')}>
    {children}
    <button disabled={ocupado}>{boton}</button>
    {aviso && <p className={error ? 'error' : 'exito'} role="status">{aviso}</p>}
  </form>;
}
export function Historial({ eventos }) {
  return eventos.length ? <ol className="historial">{eventos.map(e =>
    <li key={e.id}><strong>{e.tipo}</strong><span>{e.actor} · {fecha(e.fecha)}</span><small>{e.detalle}</small></li>
  )}</ol> : <p>Aún no hay movimientos registrados.</p>;
}
export function Navegacion({ enlaces, vista }) {
  return <nav className="subnav" aria-label="Pantallas del proceso">{enlaces.map(([id, titulo]) =>
    <a href={'?vista=' + id} key={id} aria-current={vista === id ? 'page' : undefined}>{titulo}</a>)}</nav>;
}
export function BuscarPedido({ pedidos, elegir }) {
  const [valor, setValor] = useState('');
  const [busqueda, setBusqueda] = useState(null);
  const encontrados = busqueda === null ? pedidos : pedidos.filter(p => [p.id, p.dni, p.codigo].includes(busqueda));
  return <><form onSubmit={e => { e.preventDefault(); setBusqueda(valor.trim().toUpperCase()); }}>
    <Campo nombre="Buscar por pedido o documento" value={valor} onChange={e => setValor(e.target.value)} placeholder="PED-DEMO o 00000001" />
    <button>Buscar compra</button></form>
    {encontrados.length ? <div className="lista">{encontrados.map(p => <button className="fila" key={p.id} onClick={() => elegir(p.id)}>
      <strong>{p.id}</strong><span>{p.tienda} · {p.estado}</span></button>)}</div> : <p role="status">No se encontró la compra.</p>}</>;
}
