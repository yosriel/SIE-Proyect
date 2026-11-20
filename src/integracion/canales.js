import { disponible, exigir } from '../dominio/modelo.js';

export const canales = ['Web', 'POS'];
function proyeccion(db) {
  return {
    stock: Object.fromEntries(Object.entries(db.stock).map(([lugar,s])=>[lugar, disponible(s)])),
    pedidos: Object.fromEntries(db.pedidos.map(p=>[p.id,p.estado]))
  };
}
export function iniciarIntegracion(db) {
  if (db.integracion) return false;
  const inicial = proyeccion(db);
  db.integracion = { secuencia:0, cola:[], solicitudes:{}, canales:Object.fromEntries(canales.map(c=>[c,{conectado:true, cursor:0, vista:inicial}])) };
  return true;
}
export function encolar(db, previos) {
  const nuevos = db.eventos.slice(0, db.eventos.length - previos).reverse();
  const sistema = db.integracion;
  for (const e of nuevos) {
    sistema.cola.push({
      secuencia:++sistema.secuencia, evento:e.id, correlacion:e.correlacion, entidad:e.entidad, tipo:e.tipo,
      vista:proyeccion(db), entregas:Object.fromEntries(canales.map(c=>[c,{estado:'Pendiente', intentos:0, siguiente:0}]))
    });
  }
}
export function aplicarCanal(canal, mensaje) {
  if (mensaje.secuencia <= canal.cursor) return false;
  canal.vista = mensaje.vista;
  canal.cursor = mensaje.secuencia;
  return true;
}
export function propagar(db, ahora) {
  let cambio = false;
  for (const nombre of canales) {
    const canal = db.integracion.canales[nombre];
    for (const m of db.integracion.cola) {
      const entrega = m.entregas[nombre];
      if (entrega.estado === 'Entregado') continue;
      if (entrega.estado === 'Fallido' || entrega.siguiente > ahora) break;
      cambio = true;
      entrega.intentos++;
      if (!canal.conectado) {
        entrega.estado = entrega.intentos >= 3 ? 'Fallido' : 'Pendiente';
        entrega.siguiente = ahora + 1000 * 2 ** (entrega.intentos - 1);
        entrega.error = 'Canal desconectado';
        break;
      }
      aplicarCanal(canal,m);
      entrega.estado = 'Entregado';
      entrega.error = '';
      entrega.fecha = ahora;
    }
  }
  return cambio;
}
export function configurarCanal(db, nombre, conectado) {
  exigir(canales.includes(nombre) && typeof conectado === 'boolean','Canal inválido.');
  db.integracion.canales[nombre].conectado = conectado;
}
export function reintentar(db, nombre) {
  exigir(canales.includes(nombre),'Canal inválido.');
  exigir(db.integracion.canales[nombre].conectado,'Primero reconecta el canal.');
  for (const m of db.integracion.cola) {
    const e = m.entregas[nombre];
    if (e.estado !== 'Entregado') Object.assign(e,{estado:'Pendiente',intentos:0,siguiente:0,error:''});
  }
}
