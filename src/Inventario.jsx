import { useState } from 'react';
import { disponible, ubicaciones } from './dominio/modelo.js';
import { Campo, Formulario, Historial, Opciones, Panel } from './ui.jsx';

export default function Inventario({ db, vista, hacer }) {
  const [lugar, elegir] = useState('Tienda A');
  const [tipo, cambiar] = useState('Ingreso');
  const [cantidad, contar] = useState('1');
  const s = db.stock[lugar];
  if (vista === 'existencias') return <Panel titulo="Existencias de Audífonos A">
    <div className="tarjetas">{ubicaciones.map(l => <article key={l}><h3>{l}</h3>
      <dl>{Object.entries({Físico: db.stock[l].fisico, Reservado: db.stock[l].reservado, Disponible: disponible(db.stock[l]), Cuarentena: db.stock[l].cuarentena}).map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></article>)}</div>
    <a href="?vista=movimientos">Registrar o consultar movimientos</a></Panel>;
  return <div className="columnas"><Panel titulo="Registrar movimiento">
    <Formulario boton="Registrar movimiento" mensaje="El inventario ya refleja este movimiento." accion={a => hacer('mover', a)}>
      <Campo nombre="Ubicación"><Opciones name="lugar" valores={ubicaciones} value={lugar} onChange={e=>elegir(e.target.value)}/></Campo>
      <Campo nombre="Tipo"><Opciones name="tipo" valores={['Ingreso','Venta POS','Traslado']} value={tipo} onChange={e=>cambiar(e.target.value)}/></Campo>
      {tipo === 'Traslado' && <Campo nombre="Destino"><Opciones key={lugar} name="destino" valores={ubicaciones.filter(l => l !== lugar)}/></Campo>}
      <Campo nombre="Cantidad" name="cantidad" type="number" min="1" max="99999" value={cantidad} onChange={e=>contar(e.target.value)}/>
      <Campo nombre="Motivo del movimiento" name="motivo" maxLength="100"/>
      <p>Disponible en origen · {disponible(s)} → {disponible(s) + (tipo === 'Ingreso' ? 1 : -1) * Number(cantidad)}</p>
    </Formulario></Panel><Panel titulo="Historial de inventario">{db.integracion && <p><a href="?vista=integracion">Revisar sincronización y reintentar eventos</a></p>}<Historial eventos={db.eventos.filter(e=>e.actor === 'Inventario')}/></Panel></div>;
}
