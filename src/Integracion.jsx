import { useState } from 'react';
import { Campo, Formulario, Panel } from './ui.jsx';
import { fecha, uid } from './dominio/modelo.js';
import { solicitar, transaccion } from './dominio/almacen.js';
import { canales, configurarCanal, reintentar } from './integracion/canales.js';
import { endpoints, prefijo } from './integracion/contratos.js';

export default function Integracion({ db, actualizar }) {
  const [filtro, filtrar] = useState('');
  const [respuesta, responder] = useState(null);
  const sistema = db.integracion;
  async function guardar(fn) {
    const {estado} = await transaccion(fn);
    actualizar(estado);
  }
  async function probar(solicitud) {
    const {estado,resultado} = await solicitar(solicitud);
    responder(resultado); actualizar(estado);
    if (resultado.estado >= 400) throw new Error(resultado.cuerpo.mensaje);
  }
  const ultima = Object.entries(sistema.solicitudes).sort((a,b)=>b[1].fecha - a[1].fecha)[0];
  const consulta = filtro.trim().toLowerCase();
  const eventos = sistema.cola.filter(e=>[e.entidad,e.correlacion,e.tipo].some(s=>s.toLowerCase().includes(consulta))).toReversed();
  return <><div className="columnas"><Panel titulo="Stock por canal">
    {canales.map(nombre=>{
      const c = sistema.canales[nombre];
      const pendientes = sistema.cola.filter(e=>e.entregas[nombre].estado!=='Entregado');
      return <article key={nombre}><h3>{nombre}</h3><p>{c.conectado ? 'Conectado' : 'Desconectado'} · {pendientes.length} por entregar · Secuencia {c.cursor}</p>
        <dl>{Object.entries(c.vista.stock).map(([l,n])=><div key={l}><dt>{l}</dt><dd>{n}</dd></div>)}</dl>
        <Formulario boton={(c.conectado?'Desconectar ':'Reconectar ')+nombre} accion={()=>guardar(d=>configurarCanal(d,nombre,!c.conectado))}/>
        {pendientes.length>0 && !c.conectado && <p>Reconecta el canal para enviar los cambios pendientes.</p>}
        {pendientes.length>0 && c.conectado && <Formulario boton={'Reintentar '+nombre} accion={()=>guardar(d=>reintentar(d,nombre))}/>}
      </article>;
    })}</Panel><Panel titulo="Simular una venta en caja">
      <p>Desconecta el canal POS y registra una venta en Tienda A. Podrás ver cuánto stock muestra la web mientras la caja está sin conexión.</p>
      <Formulario mensaje="Consulta completada." boton="Leer estado integrado" accion={()=>probar({metodo:'GET',ruta:prefijo+'estado',clave:uid()})}/>
      <Formulario boton="Registrar venta POS de prueba" accion={()=>probar({metodo:'POST',ruta:prefijo+endpoints.mover[0],clave:uid(),datos:{lugar:'Tienda A',tipo:'Venta POS',cantidad:1,motivo:'Prueba de integración'}})}/>
      {ultima && <><p>Última operación · <code>{ultima[1].ruta}</code></p>
        <Formulario boton="Repetir última solicitud" accion={()=>probar({metodo:'POST',ruta:ultima[1].ruta,clave:ultima[0],datos:ultima[1].datos})}/></>}
      {respuesta && <div className="resultado-canal">
        <p role="status">{respuesta.cuerpo.repetida ? 'Esta operación ya estaba registrada. El stock sigue igual.' : respuesta.estado===201 ? 'Venta registrada. Ya puedes comparar las existencias.' : respuesta.estado===200 ? 'La consulta está lista.' : respuesta.cuerpo.mensaje}</p>
        <details><summary>Ver respuesta técnica ({respuesta.estado})</summary><pre>{JSON.stringify(respuesta.cuerpo,null,2)}</pre></details>
      </div>}
      <a href={import.meta.env.BASE_URL+'contrato-v1.json'} download>Descargar contrato OpenAPI v1</a>
    </Panel></div><Panel titulo="Historial de sincronización">
      <Campo nombre="Filtrar por entidad, operación o correlación" required={false} value={filtro} onChange={e=>filtrar(e.target.value)}/>
      {!eventos.length && <p>No hay eventos que coincidan.</p>}
      <ol className="historial">{eventos.map(e=><li key={e.secuencia}><strong>{e.tipo} · {e.entidad}</strong>
        <small>Correlación {e.correlacion}</small>
        {canales.map(c=><span key={c}>{c} · {e.entregas[c].estado} · intentos {e.entregas[c].intentos}
          {e.entregas[c].error && ' · '+e.entregas[c].error}{e.entregas[c].fecha && ' · '+fecha(e.entregas[c].fecha)}</span>)}
      </li>)}</ol></Panel></>;
}
