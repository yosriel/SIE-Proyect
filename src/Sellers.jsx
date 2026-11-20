import { useState } from 'react';
import { categorias } from './dominio/marketplace.js';
import { dinero } from './dominio/modelo.js';
import { Campo, Formulario, Opciones, Panel } from './ui.jsx';

function Revision({ hacer, tipo, id, estados }) {
  const [estado, elegir] = useState(estados[0]);
  return <Formulario boton="Aplicar decisión" confirmar={'¿Registrar la decisión «' + estado + '»?'} accion={a=>hacer(tipo, { ...a, id, estado })}>
    <Campo nombre="Decisión"><Opciones valores={estados} value={estado} onChange={e=>elegir(e.target.value)}/></Campo>
    {['Por corregir','Rechazado'].includes(estado) && <Campo nombre="Observación" name="observacion" maxLength="100"/>}
  </Formulario>;
}
function Expediente({ hacer, seller }) {
  return <Formulario boton={seller ? 'Reenviar expediente' : 'Registrar seller'} accion={a=>hacer('seller',{...a,id:seller?.id})}>
    <Campo nombre="Razón social" name="nombre" defaultValue={seller?.nombre} maxLength="100"/>
    <Campo nombre="RUC ficticio (11 dígitos)" name="ruc" pattern="[0-9]{11}" maxLength="11" defaultValue={seller?.ruc}/>
    <Campo nombre="Referencia del expediente ficticio" name="documento" placeholder="EXP-001" defaultValue={seller?.documento}/>
  </Formulario>;
}
export default function Sellers({ db, vista, hacer }) {
  if (vista === 'sellers') return <div className="columnas"><Panel titulo="Alta de vendedor"><Expediente hacer={hacer}/></Panel>
    <Panel titulo="Revisión de expedientes">{!db.sellers.length && <p>Aún no se han recibido expedientes.</p>}
      {db.sellers.map(s=><article key={s.id}><h3>{s.nombre}</h3><p>{s.ruc} · {s.documento}</p><p className="estado">{s.estado}</p>
        {s.observacion && <p>{s.observacion}</p>}
        {s.estado === 'En revisión' && <Revision {...{hacer}} tipo="revisarSeller" id={s.id} estados={['Aprobado','Por corregir','Rechazado']}/>}
        {s.estado === 'Por corregir' && <Expediente hacer={hacer} seller={s}/>}</article>)}</Panel></div>;
  const aprobados = db.sellers.filter(s=>s.estado === 'Aprobado');
  return <><div className="columnas"><Panel titulo="Registrar producto">{aprobados.length ? <Formulario boton="Enviar a revisión" accion={a=>hacer('publicar',a)}>
    <Campo nombre="Seller"><select name="seller">{aprobados.map(s=><option key={s.id} value={s.id}>{s.nombre}</option>)}</select></Campo>
    <Campo nombre="Nombre del producto" name="nombre"/><Campo nombre="Categoría"><Opciones name="categoria" valores={categorias}/></Campo>
    <Campo nombre="Precio en soles" type="number" step=".01" min=".01" max="999999.99" name="precio"/>
    <Campo nombre="Unidades" type="number" min="1" max="99999" name="cantidad"/>
  </Formulario> : <p>Primero <a href="?vista=sellers">registra y aprueba un seller</a>.</p>}</Panel>
    <Panel titulo="Publicaciones">{!db.productos.length && <p>Aún no hay productos registrados.</p>}
      {db.productos.map(p=><article key={p.id}><h3>{p.nombre}</h3><p>{p.categoria} · {dinero(p.precio)} · {p.cantidad} unidades</p><p className="estado">{p.estado}</p>
        {p.observacion && <p>{p.observacion}</p>}
        {p.estado === 'En revisión' && <Revision {...{hacer}} tipo="revisarProducto" id={p.id} estados={['Publicado','Rechazado']}/>}
        {p.estado === 'Publicado' && <Formulario boton="Simular pedido de marketplace" accion={a=>hacer('ventaSeller',{...a,id:p.id})}>
          <Campo nombre="Unidades por despachar" type="number" min="1" name="cantidad" defaultValue="1"/></Formulario>}
      </article>)}</Panel></div><Panel titulo="Despachos">{!db.despachos.length && <p>Los pedidos del marketplace aparecerán aquí.</p>}
        {db.despachos.map(d=><article key={d.id}><h3>{d.id}</h3><p>{db.productos.find(p=>p.id===d.producto)?.nombre} · {d.cantidad} unidades · {d.estado}</p>
          {d.guia ? <p>Guía · {d.guia}</p> : <Formulario boton="Registrar despacho" accion={a=>hacer('despachar',{...a,id:d.id})}><Campo nombre="Número de guía" name="guia" maxLength="32"/></Formulario>}</article>)}</Panel></>;
}
