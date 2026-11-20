import test from 'node:test';
import assert from 'node:assert/strict';
import { DIA, disponible, nuevaBase } from '../src/dominio/modelo.js';
import { operaciones, vencerReservas } from '../src/dominio/operaciones.js';
import { marketplace } from '../src/dominio/marketplace.js';

const ctx = { clave:'ensayo', ahora:Date.now() };
function reservar(db, cantidad = 3) {
  return operaciones.reservar(db, {tienda:'Tienda A', cantidad, dni:'00000001'}, ctx);
}
test('reserva, preparación, validación de identidad y entrega única', () => {
  const db = nuevaBase();
  const id = reservar(db);
  const s = db.stock['Tienda A'];
  const paso = (accion, datos) => operaciones.pedido(db, {id, accion, ...datos}, ctx);
  assert.deepEqual([s.fisico,s.reservado,disponible(s)], [10,5,5]);
  assert.throws(()=>paso('entregar'), /listo/);
  paso('preparar'); paso('listo');
  const codigo = db.pedidos[0].codigo;
  assert.throws(()=>paso('entregar',{codigo:'INVÁLIDO'}), /inválido/);
  assert.throws(()=>paso('entregar',{codigo,dni:'00000002'}), /coincide/);
  paso('entregar',{codigo,dni:'00000001'});
  assert.throws(()=>paso('entregar',{codigo,dni:'00000001'}), /entregado/);
  assert.deepEqual([s.fisico,s.reservado,disponible(s)], [7,2,5]);
});
test('límites de existencias, cancelación y caducidad de reservas', () => {
  const db = nuevaBase();
  for (const n of [0,1.1,9]) assert.throws(()=>reservar(db,n));
  const id = reservar(db,8);
  assert.throws(()=>reservar(db,1), /insuficiente/);
  operaciones.pedido(db,{id,accion:'cancelar'},ctx);
  assert.equal(disponible(db.stock['Tienda A']),8);
  const otro = reservar(db,2);
  for (const accion of ['preparar','listo']) operaciones.pedido(db,{id:otro,accion},ctx);
  vencerReservas(db,{...ctx,ahora:ctx.ahora + 3*DIA});
  assert.equal(disponible(db.stock['Tienda A']),8);
  assert.equal(db.pedidos[0].estado,'Vencido');
});
test('traslado y ventas POS respetan la reserva', () => {
  const db = nuevaBase();
  const datos = {lugar:'Tienda A', destino:'Tienda B', cantidad:8, motivo:'Conteo'};
  operaciones.mover(db,{...datos,tipo:'Traslado'},ctx);
  assert.equal(disponible(db.stock['Tienda B']),8);
  assert.throws(()=>operaciones.mover(db,{...datos,tipo:'Venta POS'},ctx), /insuficiente/);
});
test('devolución parcial, cuarentena, reembolso único y plazo', () => {
  const db = nuevaBase(ctx.ahora);
  const a = {id:'PED-DEMO', cantidad:1, motivo:'Falla del producto', condicion:'Dañado'};
  const id = operaciones.devolver(db,a,ctx);
  assert.equal(db.devoluciones[0].importe,9990);
  assert.equal(db.stock['Tienda A'].cuarentena,1);
  assert.equal(disponible(db.stock['Tienda A']),8);
  operaciones.reembolsar(db,{id},ctx);
  assert.throws(()=>operaciones.reembolsar(db,{id},ctx),/procesado/);
  operaciones.devolver(db,{...a,condicion:'Buen estado'},ctx);
  assert.equal(disponible(db.stock['Tienda A']),9);
  assert.throws(()=>operaciones.devolver(db,a,ctx),/unidades/);
  assert.throws(()=>operaciones.devolver(db,{...a,id:'PED-VENCIDO'},ctx),/plazo/);
});
test('seller, corrección, revisión del producto, pedido y despacho', () => {
  const db = nuevaBase();
  const a = {nombre:'Audio Demo', ruc:'20000000001', documento:'EXP-A'};
  const seller = marketplace.seller(db,a,ctx);
  assert.throws(()=>marketplace.seller(db,a,ctx),/existe/);
  const producto = {seller, nombre:'Cable', precio:'10.50', cantidad:2, categoria:'Audio'};
  assert.throws(()=>marketplace.publicar(db,producto,ctx),/aprobado/);
  assert.throws(()=>marketplace.revisarSeller(db,{id:seller,estado:'Por corregir'},ctx),/observación/);
  marketplace.revisarSeller(db,{id:seller,estado:'Por corregir',observacion:'Revisar referencia'},ctx);
  marketplace.seller(db,{...a,id:seller, documento:'EXP-B'},ctx);
  marketplace.revisarSeller(db,{id:seller,estado:'Aprobado'},ctx);
  const id = marketplace.publicar(db,producto,ctx);
  assert.throws(()=>marketplace.ventaSeller(db,{id,cantidad:1},ctx),/publicadas/);
  marketplace.revisarProducto(db,{id,estado:'Publicado'},ctx);
  const envio = marketplace.ventaSeller(db,{id,cantidad:1},ctx);
  marketplace.despachar(db,{id:envio,guia:'G-001'},ctx);
  assert.equal(db.productos[0].cantidad,1);
  assert.throws(()=>marketplace.despachar(db,{id:envio,guia:'G-002'},ctx),/registró/);
});
