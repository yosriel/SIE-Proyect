import { nuevaBase, uid } from './modelo.js';
import { operaciones, vencerReservas } from './operaciones.js';
import { marketplace } from './marketplace.js';

const acciones = { ...operaciones, ...marketplace };
let conexion;
function abrir() {
  if (!conexion) {
    conexion = new Promise((resolve, reject) => {
      const peticion = indexedDB.open('omni-si-apf3', 1);
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
        const antes = estado.eventos.length;
        vencerReservas(estado, { ahora: Date.now(), clave: uid() });
        const resultado = cambiar?.(estado);
        if (!lectura.result || cambiar || antes !== estado.eventos.length) tabla.put(estado, 'estado');
        salida = { estado, resultado };
      } catch (error) { fallo = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve(salida);
    tx.onabort = () => reject(fallo || tx.error || new Error('No se pudo guardar la operación.'));
    tx.onerror = () => reject(tx.error);
  });
}

export async function ejecutar(tipo, datos, clave = uid()) {
  return transaccion(db => {
    if (!Object.hasOwn(acciones, tipo)) throw new Error('Operación desconocida.');
    return acciones[tipo](db, datos, { ahora: Date.now(), clave });
  });
}
