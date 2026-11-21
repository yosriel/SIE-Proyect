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
export function Formulario({ accion, boton, children, confirmar, fin, className = '', mensaje = 'Cambios guardados.' }) {
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const bloqueo = useRef(false);
  const dialogo = useRef(null);
  const formulario = useRef(null);
  const titulo = useId();
  async function enviar() {
    if (bloqueo.current || !formulario.current.reportValidity()) return;
    const datos = Object.fromEntries(new FormData(formulario.current));
    bloqueo.current = true;
    setOcupado(true); setAviso('');
    try {
      const resultado = await accion(datos);
      setError(false); setAviso(mensaje);
      fin?.(resultado);
    } catch (fallo) {
      setError(true); setAviso(fallo.message);
    } finally { bloqueo.current = false; setOcupado(false); }
  }
  return <><form ref={formulario} className={className} onSubmit={e=>{
    e.preventDefault();
    if (confirmar) dialogo.current.showModal();
    else enviar();
  }} onChange={() => setAviso('')}>
    {children}
    <button disabled={ocupado}>{ocupado ? 'Guardando…' : boton}</button>
    {aviso && <p className={error ? 'error' : 'exito'} role="status">{aviso}</p>}
  </form>
  {confirmar && <dialog className="decision" ref={dialogo} aria-labelledby={titulo}>
    <h2 id={titulo}>{boton}</h2><p>{confirmar}</p>
    <div><button type="button" className="secundario" autoFocus onClick={()=>dialogo.current.close()}>Volver</button>
      <button type="button" onClick={()=>{dialogo.current.close(); enviar();}}>Sí, confirmar</button></div>
  </dialog>}</>;
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
export function BuscarPedido({ pedidos, elegir, seleccionado }) {
  const [valor, setValor] = useState('');
  const consulta = valor.trim().toUpperCase();
  const encontrados = pedidos.filter(p => [p.id, p.dni, p.codigo].some(v => v && v.includes(consulta)));
  return <>
    <Campo nombre="Buscar por pedido o documento" type="search" required={false} value={valor} onChange={e=>setValor(e.target.value)} placeholder="Ej. PED-DEMO"/>
    {encontrados.length ? <div className="lista">{encontrados.map(p => <button className="fila" key={p.id} aria-pressed={p.id===seleccionado} onClick={()=>elegir(p.id)}>
      <span><strong>{p.id}</strong><small>{p.tienda}</small></span><span className="estado">{p.estado}</span></button>)}</div> :
      <p role="status">No encontramos esa compra. Prueba con el documento o con parte del número de pedido.</p>}</>;
}
