import { nuevaBase, uid } from './modelo.js';
import { vencerReservas } from './operaciones.js';
import { encolar, iniciarIntegracion, propagar } from '../integracion/canales.js';
import { despachar } from '../integracion/gateway.js';
import { endpoints, prefijo } from '../integracion/contratos.js';


let conexion;
function abrir() {
  if (!conexion) {
    conexion = new Promise((resolve, reject) => {
      const carpeta = new URL('.', window.location.href).pathname;
      const nombre = carpeta === '/' ? 'omni-si-apf3' : 'omni-si-apf3:' + carpeta;
      const peticion = indexedDB.open(nombre, 1);
      peticion.onupgradeneeded = () => peticion.result.createObjectStore('demo');
      peticion.onsuccess = () => resolve(peticion.result);
      peticion.onerror = () => { conexion = null; reject(peticion.error); };
    });
  }
  return conexion;
}

export async function transaccion(cambiar) {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('demo', 'readwrite');
    const tabla = tx.objectStore('demo');
    const lectura = tabla.get('estado');
    let salida, fallo;
    lectura.onsuccess = () => {
      try {
        const estado = lectura.result ?? nuevaBase();
        const inicial = iniciarIntegracion(estado);
        const antes = estado.eventos.length;
        vencerReservas(estado, { ahora: Date.now(), clave: uid() });
        const resultado = cambiar?.(estado);
        encolar(estado, antes);
        const propagado = propagar(estado, Date.now());
        if (inicial || cambiar || propagado || antes !== estado.eventos.length) tabla.put(estado, 'estado');
        salida = { estado, resultado };
      } catch (error) { fallo = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve(salida);
    tx.onabort = () => reject(fallo || tx.error || new Error('No se pudo guardar la operación.'));
    tx.onerror = () => reject(tx.error);
  });
}

export async function procesarRequest(request) {
  const clave = request.headers.get('Idempotency-Key');
  const solicitud = {metodo:request.method, ruta:new URL(request.url).pathname, clave};
  if (request.method === 'POST') {
    try { solicitud.datos = await request.json(); }
    catch { return Response.json({codigo:'JSON_INVALIDO',mensaje:'El cuerpo debe ser JSON.',correlacion:clave},{status:400}); }
  }
  try {
    const {resultado} = await transaccion(db => despachar(db, solicitud, Date.now()));
    return Response.json(resultado.cuerpo,{status:resultado.estado});
  } catch (error) {
    if (error instanceof DOMException) throw error;
    return Response.json({codigo:'REGLA_DE_NEGOCIO',mensaje:error.message,correlacion:clave},{status:422});
  }
}

export async function solicitar({metodo,ruta,clave,datos}) {
  const request = new Request(new URL(ruta, window.location.href), {
    method:metodo, headers:{'Idempotency-Key':clave,'Content-Type':'application/json'},
    body:metodo === 'POST' ? JSON.stringify(datos) : undefined
  });
  const response = await procesarRequest(request);
  const { estado } = await transaccion();
  return {estado, resultado:{estado:response.status, cuerpo:await response.json()}};
}

export async function ejecutar(tipo, datos, clave = uid()) {
  const { estado, resultado } = await solicitar({metodo:'POST', ruta:prefijo+endpoints[tipo][0], clave, datos});
  if (resultado.estado >= 400) throw new Error(resultado.cuerpo.mensaje);
  return {estado, resultado:resultado.cuerpo.id};
}
