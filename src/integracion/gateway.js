import { marketplace } from '../dominio/marketplace.js';
import { operaciones } from '../dominio/operaciones.js';
import { endpoints, normalizar, prefijo } from './contratos.js';

const servicios = { ...operaciones, ...marketplace };
function fallo(estado, codigo, mensaje, correlacion) {
  return { estado, cuerpo:{codigo,mensaje,correlacion} };
}
export function despachar(db, solicitud, ahora) {
  const {metodo, ruta, clave, datos} = solicitud;
  if (typeof clave !== 'string' || !/^[a-f0-9-]{8,64}$/i.test(clave)) return fallo(400,'CLAVE_INVALIDA','Se requiere una clave de correlación hexadecimal.',null);
  const rutaEstado = ruta === prefijo + 'estado';
  const tipo = Object.keys(endpoints).find(k=>ruta === prefijo + endpoints[k][0]);
  if (!rutaEstado && !tipo) return fallo(404,'RUTA_DESCONOCIDA','Ruta desconocida.',clave);
  if (metodo !== (rutaEstado ? 'GET' : 'POST')) return fallo(405,'METODO_INVALIDO','Método no admitido.',clave);
  if (rutaEstado) return {estado:200,cuerpo:{correlacion:clave, stock:structuredClone(db.stock), pedidos:db.pedidos.map(({id,estado})=>({id,estado}))}};
  let cuerpo;
  try { cuerpo = normalizar(tipo,datos); }
  catch (e) { return fallo(400,'DATOS_INVALIDOS',e.message,clave); }
  const firma = JSON.stringify([ruta,cuerpo]);
  const previo = db.integracion.solicitudes[clave];
  if (previo) {
    if (previo.firma !== firma) return fallo(409,'CLAVE_REUTILIZADA','La clave ya identifica otra solicitud.',clave);
    return {estado:200,cuerpo:{id:previo.id, correlacion:clave, repetida:true}};
  }
  // Una transacción descartada conserva el estado completo ante errores de dominio.
  const id = servicios[tipo](db,cuerpo,{ahora, clave});
  db.integracion.solicitudes[clave] = {id, firma, ruta, datos:cuerpo, fecha:ahora};
  return {estado:201,cuerpo:{id,correlacion:clave,repetida:false}};
}
