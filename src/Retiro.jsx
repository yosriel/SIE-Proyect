import { useRef, useState } from 'react';
import { disponible, dinero, fecha, PRECIO, ubicaciones } from './dominio/modelo.js';
import { BuscarPedido, Campo, Formulario, Historial, Panel } from './ui.jsx';
import foto from './assets/audifonos.webp';
import './retiro.css';

function Producto({ db, hacer, ir }) {
  const tiendas = ubicaciones.slice(0, 2);
  const [tienda, elegir] = useState(() => tiendas.find(l => disponible(db.stock[l]) > 0) || '');
  const [cantidad, contar] = useState('1');
  const [revision, revisar] = useState(false);
  const documento = useRef(null);
  const ampliar = useRef(null);
  const libres = tienda ? disponible(db.stock[tienda]) : 0;
  const unidades = Number(cantidad);
  const valido = Number.isInteger(unidades) && unidades > 0 && unidades <= libres;
  function cambiarCantidad(valor) { contar(valor); revisar(false); }
  function continuar(e) {
    e.preventDefault();
    if (valido) {
      revisar(true);
      requestAnimationFrame(() => documento.current?.focus());
    }
  }
  return <div className="ficha">
    <figure className="galeria">
      <img src={foto} alt="Audífonos de diadema color grafito, vistos de tres cuartos"/>
      <button className="acercar" aria-label="Ampliar foto del producto" onClick={()=>ampliar.current.showModal()}><span aria-hidden="true">＋</span></button>
      <dialog ref={ampliar} aria-label="Foto de los audífonos"><img src={foto} alt="Vista ampliada de los audífonos grafito"/><form method="dialog"><button autoFocus>Cerrar foto</button></form></dialog>
    </figure>
    <div className="compra">
      <h1>Audífonos A</h1>
      <p className="precio">{dinero(PRECIO)}</p>
      <p className="acabado"><i aria-hidden="true"/> Color grafito</p>
      <form className="eleccion" onSubmit={continuar}>
        <fieldset><legend>¿Dónde quieres recogerlos?</legend>
        <div className="opciones-tienda">{tiendas.map(l=>{
          const n = disponible(db.stock[l]);
          return <label className="opcion-tienda" key={l}>
            <input type="radio" name="tienda" checked={tienda===l && n>0} disabled={n===0} onChange={()=>{elegir(l);revisar(false);}}/>
            <span><strong>{l}</strong><small>{n===0?'Sin stock':n===1?'1 disponible':n+' disponibles'}</small></span>
          </label>;
        })}</div></fieldset>
        <div className="fila-cantidad"><label htmlFor="unidades">Cantidad</label>
          <div className="contador"><button type="button" aria-label="Quitar una unidad" disabled={unidades<=1} onClick={()=>cambiarCantidad(String(unidades-1))}>−</button>
            <input id="unidades" inputMode="numeric" type="number" min="1" max={libres || 1} step="1" required value={cantidad} onChange={e=>cambiarCantidad(e.target.value)}/>
            <button type="button" aria-label="Añadir una unidad" disabled={unidades>=libres} onClick={()=>cambiarCantidad(String(unidades+1))}>+</button></div>
        </div>
        {!valido && <p role="status" className="error">{libres ? 'Elige entre 1 y '+libres+' unidades para esta tienda.' : 'En este momento no puedes retirar en la tienda seleccionada.'}</p>}
        {!revision && <button className="reservar" disabled={!valido}>Reservar para retiro {valido && <span>{dinero(unidades*PRECIO)}</span>}</button>}
      </form>
      {revision && valido && <Formulario className="revision" boton="Confirmar pedido" accion={a=>hacer('reservar',{...a,tienda,cantidad})} fin={id=>ir('seguimiento',id)}>
        <h2>Confirma tu retiro</h2>
        <p>{tienda} · {unidades} {unidades===1?'unidad':'unidades'} · <strong>{dinero(unidades*PRECIO)}</strong></p>
        <label htmlFor="dni-demo">Documento ficticio del cliente</label>
        <input ref={documento} id="dni-demo" name="dni" inputMode="numeric" pattern="[0-9]{8}" maxLength="8" required defaultValue="00000001"/>
      </Formulario>}
      <details className="traslado"><summary>Stock en el centro de distribución</summary>
        <p>{disponible(db.stock['CD Lima'])} unidades en CD Lima. Traslado referencial en 2 días.</p></details>
    </div>
  </div>;
}

const etapas = ['Reservado', 'En preparación', 'Listo para retiro', 'Entregado'];

function Progreso({ estado }) {
  const actual = etapas.indexOf(estado);
  if (actual < 0) return <p className="estado">{estado}</p>;
  return <ol className="progreso" aria-label="Progreso del retiro">{etapas.map((nombre,i)=>
    <li key={nombre} className={i<=actual?'alcanzada':''} aria-current={i===actual?'step':undefined}>{nombre}</li>)}</ol>;
}

export default function Retiro({ db, vista, hacer, ir, id }) {
  const [seleccion, elegir] = useState(id);
  if (vista === 'retiro') return <Producto {...{db, hacer, ir}}/>;
  const p = db.pedidos.find(x => x.id === seleccion);
  const cliente = vista === 'seguimiento';
  const paso = (accion, boton, confirmar) => <Formulario key={accion} boton={boton} confirmar={confirmar} accion={() => hacer('pedido', { id:p.id, accion })}/>;
  return <div className="columnas"><Panel titulo="Localizar pedido"><BuscarPedido pedidos={db.pedidos} seleccionado={seleccion} elegir={elegir}/></Panel>
    <Panel titulo={p ? p.id : 'Detalle del pedido'}>{!p && <p>Elige una compra para ver su estado y el siguiente paso.</p>}{p && <>
      <Progreso estado={p.estado}/><p>Audífonos A · {p.cantidad} unidades · {dinero(p.cantidad * p.precio)}</p>
      <p>{p.tienda} · Documento ••••{p.dni.slice(-4)}</p>
      {cliente && p.estado === 'Listo para retiro' && <div className="exito">Listo para retiro de 10:00 a 20:00. Código <strong>{p.codigo}</strong><br/>Vigente hasta {fecha(p.vence)}</div>}
      {cliente && ['Reservado','En preparación','Listo para retiro'].includes(p.estado) && paso('cancelar','Cancelar pedido','¿Cancelar el pedido y liberar la reserva?')}
      {!cliente && p.estado === 'Reservado' && paso('preparar','Iniciar preparación')}
      {!cliente && p.estado === 'En preparación' && paso('listo','Marcar listo para retiro')}
      {!cliente && p.estado === 'Listo para retiro' && <Formulario boton="Confirmar entrega" confirmar="La entrega descuenta el inventario y cierra el retiro. ¿Confirmar?" accion={a => hacer('pedido', { ...a, id:p.id, accion:'entregar' })}>
        <Campo nombre="Código de retiro" name="codigo"/><Campo nombre="Documento del cliente" name="dni" pattern="[0-9]{8}"/>
      </Formulario>}
      {cliente && ['Reservado','En preparación','Listo para retiro'].includes(p.estado) && <a className="enlace-paso" href={'?vista=entrega&id='+encodeURIComponent(p.id)}>Abrir este pedido en tienda</a>}
      {!cliente && p.estado==='Listo para retiro' && <a className="enlace-paso" href={'?vista=seguimiento&id='+encodeURIComponent(p.id)}>Ver el código en Mis pedidos</a>}
      {p.estado==='Entregado' && <a className="enlace-paso" href={'?vista=validar&id='+encodeURIComponent(p.id)}>Consultar una devolución</a>}
      <Historial eventos={db.eventos.filter(e => e.entidad === p.id)}/>
    </>}</Panel></div>;
}
