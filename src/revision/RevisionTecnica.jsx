import { useEffect, useState } from 'react';
import Cuaderno, { Tabla } from './Cuaderno.jsx';
import casos from './casos3.json';
import { comprobarContratos, medirConsultas } from './laboratorio.js';

const componentes=[
  ['Retiro','Retiro','operaciones · reservar, pedido','Equipo de tienda','pedidos'],
  ['Inventario','Inventario','operaciones · mover','Inventario','stock'],
  ['Devoluciones','Devoluciones','operaciones · devolver, reembolsar','Atención y finanzas','devoluciones'],
  ['Marketplace','Sellers','marketplace · seller, revisarSeller, publicar, revisarProducto, ventaSeller, despachar','Marketplace','sellers, productos, despachos'],
  ['Integración','Integracion','gateway, canales, almacen · leerEstado y distribución de eventos','Equipo de integración','integracion']
];
const conexiones=[
  ['Pantallas React','Gateway local','Request / Response con JSON','Cada consulta u operación'],
  ['Gateway','Servicio de dominio','Llamada JavaScript dentro de la transacción','Cada operación válida'],
  ['Servicios','Estado y registro de eventos','Transacción IndexedDB','Al confirmar el cambio'],
  ['Cola de eventos','Web y POS simulados','Entrega ordenada por secuencia','Al confirmar y al reintentar'],
  ['Pestaña emisora','Otras pestañas del mismo origen','BroadcastChannel y relectura de IndexedDB','Después de un cambio']
];
const campos={
  leerEstado:'stock → ubicación y cantidades; pedidos → id y estado',
  reservar:'tienda, cantidad y dni → pedidos',
  pedido:'id → pedidos.id; accion cambia estado; codigo y dni verifican la entrega',
  mover:'lugar, destino y cantidad → stock por ubicación; tipo y motivo → evento de movimiento',
  devolver:'id → pedido; cantidad, motivo y condicion → devolución',
  reembolsar:'id → devoluciones.id; actualiza el estado de reembolso',
  seller:'id opcional, nombre, ruc y documento → sellers',
  revisarSeller:'id, estado y observacion → sellers',
  publicar:'seller, nombre, categoria, cantidad y precio → productos; el precio se guarda en céntimos',
  revisarProducto:'id, estado y observacion → productos',
  ventaSeller:'id → producto del despacho; cantidad → despachos y saldo del producto',
  despachar:'id y guia → despachos'
};
function Carga(){
  const [n,poner]=useState(100), [resultado,medir]=useState('');
  return <><p>El APF2 deja el pico de campaña por definir. Mide consultas secuenciales en tu dispositivo como línea base del simulador.</p>
    <form onSubmit={e=>{e.preventDefault();const r=medirConsultas(Number(n));medir(r.correctas+' consultas correctas en '+r.ms.toFixed(2)+' ms.');}}><label>Consultas (1 a 2000)<input type="number" min="1" max="2000" required value={n} onChange={e=>poner(e.target.value)}/></label><button>Medir consultas</button></form><p role="status">{resultado}</p></>;
}
function Contratos({api,ensayar}){
  const [filas,poner]=useState(null);
  return <><p>Contrato OpenAPI {api.openapi} · versión {api.info.version}. Los identificadores creados por una operación se reutilizan en las siguientes.</p>
    {ensayar && <><p>Banco de pruebas local. Cada ejecución abre una tienda de prueba en memoria y contrasta peticiones y respuestas con el contrato publicado. El piloto externo requiere su propio ambiente de QA.</p>
      <button onClick={()=>poner(comprobarContratos(api))}>Probar las 12 operaciones</button>
      {filas && <p role="status">{filas.filter(f=>f.conforme).length} de {filas.length} operaciones conformes en el simulador.</p>}</>}
    {Object.entries(api.paths).map(([ruta,metodos])=>{
      const [metodo,op]=Object.entries(metodos)[0];
      const resultado=filas?.find(f=>f.tipo===op.operationId);
      return <details key={ruta}><summary>{metodo.toUpperCase()} {ruta} {resultado && (resultado.conforme?' · '+resultado.estado:' · Revisar')}</summary>
        <p>Cabecera Idempotency-Key: {op.parameters[0].example}. Respuestas declaradas: {Object.keys(op.responses).join(', ')}.</p>
        {op.requestBody && <><h4>Petición de ejemplo</h4><pre>{JSON.stringify(op.requestBody.content['application/json'].example,null,2)}</pre></>}
        <h4>Respuesta de ejemplo</h4><pre>{JSON.stringify((op.responses[201] || op.responses[200]).content['application/json'].example,null,2)}</pre>
        {resultado && <><h4>Resultado observado</h4><pre>{JSON.stringify(resultado.error || resultado.respuesta,null,2)}</pre></>}
      </details>;
    })}</>;
}
function Tecnica({n,api}){
  const ops=api && Object.values(api.paths).map(x=>Object.values(x)[0]);
  switch(n){
    case 1:return <><p>Inventario técnico del incremento APF3 · 20/11/2026 · contrato v1.0.0.</p><Tabla columnas={['Entregable','Dónde revisarlo']} filas={[
      ['Módulos','Retiro, inventario, devoluciones, marketplace e integración (caso 07)'],['Arquitectura lógica','React → gateway → dominio → cola → canales'],['Arquitectura física','Navegador por dispositivo con persistencia IndexedDB'],['Microservicios','Funciones de dominio agrupadas por servicio en este prototipo (caso 07)'],['Componentes','Mapa de pantallas, servicios y responsables (caso 07)'],['APIs principales','Doce ejemplos de entrada y salida (caso 02)'],['API Gateway','Rutas y política local por operación (caso 09)'],['Escalabilidad','Medición de línea base en el navegador (caso 04)'],['Documentación','Contrato OpenAPI y matriz de conexiones (casos 02 y 06)']
    ]}/></>;
    case 2:case 5:return api && <Contratos api={api} ensayar={n===5}/>;
    case 3:return <><p>Cada evento lleva secuencia, entidad y correlación. Web y POS procesan la cola en orden. Cada canal conserva su cursor y descarta una secuencia ya aplicada.</p>
      <Tabla columnas={['Productor','Eventos','Consumidores']} filas={[
        ['Pedidos','Reserva, preparación, aviso, entrega, cancelación y vencimiento','Web y POS'],['Inventario','Ingreso, venta POS, traslado y actualización de disponibilidad','Web y POS'],['Devoluciones','Registro, movimiento de existencias y reembolso','Web y POS'],['Marketplace','Expediente, revisión, publicación, venta y despacho','Web y POS']
      ]}/><a href="?vista=integracion">Observar los eventos y sus reintentos</a></>;
    case 4:return <Carga/>;
    case 6:return <><p>Recorrido principal: pantallas → gateway → servicios → estado y cola → Web / POS. Las pestañas abiertas reciben además una notificación de cambio.</p><Tabla columnas={['Origen','Destino','Protocolo','Frecuencia']} filas={conexiones}/></>;
    case 7:return <Tabla columnas={['Módulo','Componente React','Servicio local','Responsable funcional','Datos']} filas={componentes}/>;
    case 8:return ops && <><p>La respuesta de una escritura publica el identificador, la correlación y la marca de repetición. La consulta de estado proyecta existencias y estados de pedidos. Documentos de identidad, expedientes y códigos de retiro quedan fuera de esa consulta.</p><Tabla columnas={['Operación','Campos de entrada','Destino o transformación']} filas={ops.map(op=>[op.operationId,Object.keys(op.requestBody?.content['application/json'].schema.properties || {}).join(', ') || 'Sólo cabecera',campos[op.operationId]])}/></>;
    case 9:return api && <><p>La clave de idempotencia identifica una solicitud. El prototipo se ejecuta en un navegador con datos de demostración. Autenticación de usuarios y cuotas de servicio quedan pendientes del piloto.</p><Tabla columnas={['Operación','Método y ruta','Política de acceso y tasa']} filas={Object.entries(api.paths).map(([ruta,v])=>{const [m,op]=Object.entries(v)[0];return [op.operationId,m.toUpperCase()+' '+ruta,op['x-politica-local']];})}/></>;
    case 10:return <><Tabla columnas={['Tramo','Falla','Recuperación']} filas={[
      ['Llamada síncrona local','Ruta, método o cuerpo inválido','Rechazo inmediato. El adaptador informa 400, 404 o 405. La llamada en memoria carece de temporizador de red.'],
      ['Escritura','Error de dominio o clave repetida con otro contenido','La transacción aborta ante el error de negocio. Repetir una escritura exitosa con la misma clave y cuerpo devuelve el resultado original.'],
      ['Web y POS','Canal desconectado','Tres intentos con esperas de uno y dos segundos. La entrega fallida bloquea la secuencia hasta reconectar y reprocesar.']
    ]}/><a href="?vista=integracion">Simular la desconexión y recuperar el canal</a></>;
  }
}
export default function RevisionTecnica(){
  const [api,poner]=useState(null),[error,fallar]=useState('');
  useEffect(()=>{
    const ctrl=new AbortController();
    async function cargar(){
      try{
        const incluido=document.getElementById('contrato-offline');
        if(incluido){poner(JSON.parse(incluido.textContent));return;}
        const r=await fetch('./contrato-v1.json',{signal:ctrl.signal});
        if(!r.ok)throw Error();
        poner(await r.json());
      }catch(e){if(!ctrl.signal.aborted)fallar('No se pudo cargar el contrato. Vuelve a abrir la demostración.');}
    }
    cargar();return ()=>ctrl.abort();
  },[]);
  return <Cuaderno titulo="Laboratorio de integración" casos={casos}>{n=><>{[2,5,8,9].includes(n) && !api && <p role="status">{error || 'Cargando contrato…'}</p>}<Tecnica n={n} api={api}/></>}</Cuaderno>;
}
