import { useState } from 'react';
import { DIA, condiciones, dinero, fecha, motivos } from './dominio/modelo.js';
import { elegibilidad, saldoDevolucion } from './dominio/operaciones.js';
import { BuscarPedido, Campo, Formulario, Historial, Opciones, Panel } from './ui.jsx';

export default function Devoluciones({ db, vista, hacer, ir, id }) {
  const [seleccion, elegir] = useState(id);
  const [condicion, cambiar] = useState(condiciones[0]);
  const [cantidad, contar] = useState('1');
  if (vista === 'devoluciones') return <Panel titulo="Seguimiento de reembolsos">
    {!db.devoluciones.length && <p>Aún no hay devoluciones. <a href="?vista=validar">Consultar una compra</a></p>}
    <div className="tarjetas">{db.devoluciones.map(d => <article key={d.id}><h3>{d.id}</h3><p>{d.pedido} · {d.estado}</p>
      <p>{d.cantidad} × {dinero(d.importe / d.cantidad)} = <strong>{dinero(d.importe)}</strong></p>
      <p>{d.motivo} · {d.condicion} · {d.destino}</p>
      {d.estado === 'Registrada' && <Formulario boton="Procesar reembolso" accion={()=>hacer('reembolsar',{id:d.id})}/>}
      <Historial eventos={db.eventos.filter(e=>e.entidad === d.id)}/></article>)}</div></Panel>;
  const p = db.pedidos.find(x => x.id === seleccion);
  const error = p && elegibilidad(db,p);
  return <div className="columnas"><Panel titulo="Localizar compra"><BuscarPedido pedidos={db.pedidos} seleccionado={seleccion} elegir={id=>{elegir(id); contar('1');}}/></Panel>
    <Panel titulo="Validar devolución">{!p ? <p>Selecciona la compra que deseas revisar.</p> : <>
      <h3>{p.id}</h3><p>Audífonos A · {p.estado} · {p.cantidad} unidades</p>
      {p.entrega && <p>Devolución hasta {fecha(p.entrega + 30 * DIA)}</p>}
      {error ? <p className="error">{error}</p> : <Formulario key={p.id} boton="Registrar devolución" accion={a=>hacer('devolver',{...a,id:p.id})} fin={()=>ir('devoluciones')}>
        <Campo nombre="Unidades por devolver" name="cantidad" type="number" min="1" max={saldoDevolucion(db,p)} value={cantidad} onChange={e=>contar(e.target.value)}/>
        <Campo nombre="Motivo de devolución"><Opciones name="motivo" valores={motivos}/></Campo>
        <Campo nombre="Condición"><Opciones name="condicion" valores={condiciones} value={condicion} onChange={e=>cambiar(e.target.value)}/></Campo>
        <p>Destino · {condicion === 'Buen estado' ? 'Reingreso' : 'Cuarentena'}</p>
        <strong>Reembolso · {dinero(p.precio)} × {cantidad} = {dinero(p.precio * Number(cantidad))}</strong>
      </Formulario>}
    </>}</Panel></div>;
}
