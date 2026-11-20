import { useState } from 'react';
import { disponible, dinero, fecha, PRECIO, ubicaciones } from './dominio/modelo.js';
import { BuscarPedido, Campo, Formulario, Historial, Panel } from './ui.jsx';
import './retiro.css';

function Producto({ db, hacer, ir }) {
  const [tienda, setTienda] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [consulta, consultar] = useState(false);
  const ok = tienda && Number.isInteger(+cantidad) && +cantidad > 0 && +cantidad <= disponible(db.stock[tienda]);
  return <div className="producto">
    <div className="retiro"><figure aria-label="Audífonos color grafito">
      <div className="audifonos" aria-hidden="true"><div className="diadema"/><div className="copa izquierda"/><div className="copa derecha"/></div>
      <figcaption><i/> Grafito</figcaption></figure></div>
    <Panel titulo="Audífonos A"><p className="precio">{dinero(PRECIO)}</p>
      <form onSubmit={e => { e.preventDefault(); consultar(true); }}>
        <Campo nombre="Tienda de retiro"><select required value={tienda} onChange={e => { setTienda(e.target.value); consultar(false); }}>
          <option value="">Selecciona una tienda</option>{ubicaciones.slice(0, 2).map(l => <option key={l} value={l} disabled={!disponible(db.stock[l])}>{l} · {disponible(db.stock[l])} disponibles</option>)}</select></Campo>
        <Campo nombre="Cantidad" type="number" min="1" step="1" value={cantidad} onChange={e => {setCantidad(e.target.value); consultar(false);}} />
        <button>Consultar disponibilidad</button>
      </form>
      <p>Centro de distribución · {disponible(db.stock['CD Lima'])} unidades. Traslado referencial en 2 días.</p>
      {consulta && <p role="status" className={ok ? 'exito' : 'error'}>{ok ? 'Disponible para retiro' : 'Stock insuficiente'} · {tienda} · {disponible(db.stock[tienda])} unidades</p>}
      {consulta && ok && <Formulario boton="Confirmar pedido" accion={a => hacer('reservar', { ...a, tienda, cantidad })} fin={id => ir('seguimiento', id)}>
        <strong>{cantidad} × Audífonos A · Total {dinero(cantidad * PRECIO)}</strong>
        <Campo nombre="Documento ficticio del cliente" name="dni" inputMode="numeric" pattern="[0-9]{8}" defaultValue="00000001" />
      </Formulario>}
    </Panel></div>;
}

export default function Retiro({ db, vista, hacer, ir, id }) {
  const [seleccion, elegir] = useState(id);
  if (vista === 'retiro') return <Producto {...{db, hacer, ir}}/>;
  const p = db.pedidos.find(x => x.id === seleccion);
  const cliente = vista === 'seguimiento';
  const paso = (accion, boton, confirmar) => <Formulario key={accion} boton={boton} confirmar={confirmar} accion={() => hacer('pedido', { id:p.id, accion })}/>;
  return <div className="columnas"><Panel titulo="Localizar pedido"><BuscarPedido pedidos={db.pedidos} elegir={elegir}/></Panel>
    <Panel titulo={p ? p.id : 'Selecciona un pedido'}>{p && <>
      <p className="estado">{p.estado}</p><p>Audífonos A · {p.cantidad} unidades · {dinero(p.cantidad * p.precio)}</p>
      <p>{p.tienda} · Documento ••••{p.dni.slice(-4)}</p>
      {cliente && p.estado === 'Listo para retiro' && <div className="exito">Listo para retiro de 10:00 a 20:00. Código <strong>{p.codigo}</strong><br/>Vigente hasta {fecha(p.vence)}</div>}
      {cliente && ['Reservado','En preparación','Listo para retiro'].includes(p.estado) && paso('cancelar','Cancelar pedido','¿Cancelar el pedido y liberar la reserva?')}
      {!cliente && p.estado === 'Reservado' && paso('preparar','Iniciar preparación')}
      {!cliente && p.estado === 'En preparación' && paso('listo','Marcar listo para retiro')}
      {!cliente && p.estado === 'Listo para retiro' && <Formulario boton="Confirmar entrega" confirmar="La entrega descuenta el inventario y cierra el retiro. ¿Confirmar?" accion={a => hacer('pedido', { ...a, id:p.id, accion:'entregar' })}>
        <Campo nombre="Código de retiro" name="codigo"/><Campo nombre="Documento del cliente" name="dni" pattern="[0-9]{8}"/>
      </Formulario>}
      <Historial eventos={db.eventos.filter(e => e.entidad === p.id)}/>
    </>}</Panel></div>;
}
