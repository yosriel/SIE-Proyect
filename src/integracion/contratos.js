export const endpoints = {
  reservar: ['pedidos', ['tienda','cantidad','dni']],
  pedido: ['pedidos/estado', ['id','accion'], ['codigo','dni']],
  mover: ['inventario/movimientos', ['lugar','tipo','cantidad','motivo'], ['destino']],
  devolver: ['devoluciones', ['id','cantidad','motivo','condicion']],
  reembolsar: ['devoluciones/reembolso', ['id']],
  seller: ['sellers', ['nombre','ruc','documento'], ['id']],
  revisarSeller: ['sellers/revision', ['id','estado'], ['observacion']],
  publicar: ['marketplace/productos', ['seller','nombre','categoria','precio','cantidad']],
  revisarProducto: ['marketplace/revision', ['id','estado'], ['observacion']],
  ventaSeller: ['marketplace/pedidos', ['id','cantidad']],
  despachar: ['marketplace/despachos', ['id','guia']]
};
export const prefijo = '/api/v1/';
export function normalizar(tipo, datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw new Error('Se esperaba un objeto JSON.');
  const [, requeridos, opcionales = []] = endpoints[tipo];
  const campos = [...requeridos,...opcionales];
  if (Object.keys(datos).some(k=>!campos.includes(k))) throw new Error('El cuerpo contiene campos desconocidos.');
  const cuerpo = {};
  for (const k of campos) {
    const v = datos[k];
    if (v === undefined && opcionales.includes(k)) continue;
    const tipos = ['precio','cantidad'].includes(k) ? ['number','string'] : ['string'];
    if (!tipos.includes(typeof v) || String(v).length > 150 || !String(v).trim()) throw new Error('Campo inválido: ' + k);
    cuerpo[k] = v;
  }
  return cuerpo;
}
