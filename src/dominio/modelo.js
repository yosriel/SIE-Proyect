export const PRECIO = 9990;
export const DIA = 86400000;
export const motivos = ['Falla del producto', 'Cambio de opinión', 'Producto incorrecto'];
export const condiciones = ['Buen estado', 'Dañado'];
export const ubicaciones = ['Tienda A', 'Tienda B', 'CD Lima'];
export const dinero = centimos => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(centimos / 100);
export const fecha = instante => new Date(instante).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });

export function exigir(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}
export function entero(valor) {
  const n = Number(valor);
  exigir(Number.isSafeInteger(n) && n > 0 && n <= 99999, 'La cantidad debe ser un entero entre 1 y 99999.');
  return n;
}
export function texto(valor, nombre, max = 100) {
  exigir(typeof valor === 'string' && valor.trim() && valor.trim().length <= max, 'Revisa el campo ' + nombre + '.');
  return valor.trim();
}
export function registro(lista, id) {
  const item = lista.find(x => x.id === id);
  exigir(item, 'No se encontró el registro.');
  return item;
}
export function uid() {
  return Array.from(crypto.getRandomValues(new Uint32Array(3)), n => n.toString(16).padStart(8, '0')).join('');
}
export const disponible = ubicacion => ubicacion.fisico - ubicacion.reservado;
export function nuevaBase(ahora = Date.now()) {
  const entregado = (id, dias) => ({
    id, dni: '00000001', tienda: 'Tienda A', cantidad: 2, precio: PRECIO, estado: 'Entregado',
    entrega: ahora - dias * DIA, creado: ahora - (dias + 1) * DIA
  });
  return {
    stock: Object.fromEntries(ubicaciones.map((lugar, i) => [lugar, { fisico: [10, 0, 18][i], reservado: [2, 0, 0][i], cuarentena: 0 }])),
    pedidos: [entregado('PED-DEMO', 2), entregado('PED-VENCIDO', 40)],
    devoluciones: [], sellers: [], productos: [], despachos: [], eventos: []
  };
}
export function evento(db, ctx, entidad, tipo, actor, detalle) {
  db.eventos.unshift({ id: uid(), correlacion: ctx.clave, entidad, tipo, actor, detalle, fecha: ctx.ahora });
}
