import { nuevaBase } from '../dominio/modelo.js';
import { iniciarIntegracion } from '../integracion/canales.js';
import { despachar } from '../integracion/gateway.js';
import { endpoints, prefijo } from '../integracion/contratos.js';

export const secuencia=['leerEstado','reservar','pedido','mover','devolver','reembolsar','seller','revisarSeller','publicar','revisarProducto','ventaSeller','despachar'];
const vinculos={pedido:['id','reservar'],reembolsar:['id','devolver'],revisarSeller:['id','seller'],publicar:['seller','seller'],revisarProducto:['id','publicar'],ventaSeller:['id','publicar'],despachar:['id','ventaSeller']};
const json=contenido=>contenido?.content?.['application/json'];
function mismaForma(valor, esquema, api) {
  if (!esquema) return false;
  if (esquema.$ref) return mismaForma(valor,api.components.schemas[esquema.$ref.split('/').pop()],api);
  if (esquema.oneOf) return esquema.oneOf.filter(s=>mismaForma(valor,s,api)).length===1;
  if (esquema.type==='array') return Array.isArray(valor) && valor.every(v=>mismaForma(v,esquema.items,api));
  if (esquema.type==='object') {
    if (!valor || Array.isArray(valor) || typeof valor!=='object') return false;
    if (!(esquema.required||[]).every(k=>Object.hasOwn(valor,k))) return false;
    return Object.entries(valor).every(([k,v])=>{
      const sub=esquema.properties?.[k] ?? esquema.additionalProperties;
      return sub===undefined || sub===true || (!!sub && mismaForma(v,sub,api));
    });
  }
  if (esquema.type==='integer') return Number.isInteger(valor) && valor>=(esquema.minimum??-Infinity);
  return typeof valor===esquema.type && (!esquema.pattern || new RegExp(esquema.pattern).test(valor)) && (!esquema.maxLength || valor.length<=esquema.maxLength);
}
export function comprobarContratos(api) {
  const ahora=Date.now(), db=nuevaBase(ahora), ids={};
  iniciarIntegracion(db);
  return secuencia.map(tipo=>{
    const consulta=tipo==='leerEstado';
    const ruta=prefijo+(consulta?'estado':endpoints[tipo][0]);
    const metodo=consulta?'get':'post';
    try {
      const op=api.paths[ruta][metodo], clave=op.parameters[0].example;
      if (op.operationId!==tipo || !mismaForma(clave,op.parameters[0].schema,api)) throw Error('Operación o cabecera incompatible.');
      const medio=json(op.requestBody), datos=structuredClone(medio?.example);
      const vinculo=vinculos[tipo];
      if (vinculo) {
        const [campo,origen]=vinculo;
        if (!ids[origen] || datos[campo]!==ids[origen].ejemplo) throw Error('Referencia de ejemplo sin origen.');
        datos[campo]=ids[origen].real;
      }
      if (!consulta && !mismaForma(datos,medio.schema,api)) throw Error('Petición incompatible con su esquema.');
      const solicitud={metodo:metodo.toUpperCase(),ruta,clave,datos};
      const r=despachar(db,solicitud,ahora);
      const estado=consulta?200:201, respuesta=json(op.responses[estado]);
      if (r.estado!==estado || !mismaForma(r.cuerpo,respuesta.schema,api) || !mismaForma(respuesta.example,respuesta.schema,api) || r.cuerpo.correlacion!==clave) throw Error('Respuesta incompatible con el contrato.');
      if (consulta) {
        if (JSON.stringify(r.cuerpo)!==JSON.stringify(respuesta.example)) throw Error('La consulta difiere del ejemplo publicado.');
      } else {
        ids[tipo]={real:r.cuerpo.id,ejemplo:respuesta.example.id};
        if (r.cuerpo.repetida || !r.cuerpo.id || respuesta.example.repetida!==false || respuesta.example.correlacion!==clave) throw Error('Respuesta inicial incorrecta.');
        const repetida=despachar(db,solicitud,ahora);
        if (repetida.estado!==200 || repetida.cuerpo.id!==r.cuerpo.id || !repetida.cuerpo.repetida) throw Error('Falló la repetición idempotente.');
      }
      return {tipo,ruta,conforme:true,estado:r.estado,solicitud,respuesta:r.cuerpo};
    } catch(e) {return {tipo,ruta,conforme:false,error:e.message};}
  });
}
export function medirConsultas(cantidad){
  if (!Number.isInteger(cantidad) || cantidad<1 || cantidad>2000) throw Error('Elige entre 1 y 2000 consultas.');
  const db=nuevaBase(); iniciarIntegracion(db);
  const inicio=performance.now();
  let correctas=0;
  for(let i=0;i<cantidad;i++){
    const r=despachar(db,{metodo:'GET',ruta:prefijo+'estado',clave:i.toString(16).padStart(8,'0')},Date.now());
    if(r.estado===200) correctas++;
  }
  return {correctas,ms:performance.now()-inicio};
}
