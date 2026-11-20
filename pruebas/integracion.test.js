import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nuevaBase } from '../src/dominio/modelo.js';
import { despachar } from '../src/integracion/gateway.js';
import { endpoints,prefijo } from '../src/integracion/contratos.js';
import { iniciarIntegracion, encolar, propagar, configurarCanal, reintentar, aplicarCanal } from '../src/integracion/canales.js';

function escenario() {
  const db = nuevaBase();
  iniciarIntegracion(db);
  const solicitud = {metodo:'POST',ruta:'/api/v1/pedidos',clave:'0000abcd',datos:{dni:'00000001',tienda:'Tienda A',cantidad:2}};
  return {db,solicitud};
}
test('contrato publicado coincide con las once acciones y la consulta',()=>{
  const api = JSON.parse(readFileSync(new URL('../public/contrato-v1.json',import.meta.url)));
  assert.equal(Object.keys(api.paths).length,Object.keys(endpoints).length+1);
  for (const [tipo,[ruta,campos]] of Object.entries(endpoints)) {
    const op = api.paths[prefijo+ruta].post;
    assert.equal(op.operationId,tipo);
    assert.deepEqual(op.requestBody.content['application/json'].schema.required,campos);
  }
});
test('gateway valida método, ruta, clave, campos y respuesta idempotente',()=>{
  const {db,solicitud:s}=escenario();
  for (const [cambio,estado] of [[{metodo:'PUT'},405],[{ruta:'/api/v2/x'},404],[{clave:'?'},400],[{datos:{...s.datos,rol:'admin'}},400]]) {
    assert.equal(despachar(db,{...s,...cambio},100).estado,estado);
  }
  const r=despachar(db,s,100);
  assert.equal(r.estado,201);
  for(let i=0;i<5;i++) {
    const duplicada=despachar(db,s,102);
    assert.equal(duplicada.estado,200); assert.equal(duplicada.cuerpo.id,r.cuerpo.id);
  }
  assert.equal(db.stock['Tienda A'].reservado,4);
  assert.equal(despachar(db,{...s,datos:{...s.datos,cantidad:1}},103).estado,409);
  assert.equal(db.eventos.length,2);
});
test('desconexión, espera creciente, cola de errores y reproceso sin doble efecto',()=>{
  const {db,solicitud}=escenario();
  configurarCanal(db,'POS',false);
  despachar(db,solicitud,0); encolar(db,0); propagar(db,0);
  const s=db.integracion, m=s.cola[0];
  assert.equal(s.canales.Web.vista.stock['Tienda A'],6);
  assert.equal(s.canales.POS.vista.stock['Tienda A'],8);
  propagar(db,999); assert.equal(m.entregas.POS.intentos,1);
  propagar(db,1000); assert.equal(m.entregas.POS.intentos,2);
  propagar(db,2999); assert.equal(m.entregas.POS.intentos,2);
  propagar(db,3000); assert.equal(m.entregas.POS.estado,'Fallido');
  assert.throws(()=>reintentar(db,'POS'), /reconecta/);
  configurarCanal(db,'POS',true); reintentar(db,'POS'); propagar(db,4000);
  assert.equal(s.canales.POS.cursor,2);
  assert.deepEqual(s.canales.POS.vista,s.canales.Web.vista);
  assert.equal(aplicarCanal(s.canales.POS,m),false);
  assert.equal(db.stock['Tienda A'].reservado,4);
});
test('migrar una base del Sprint2 conserva el inventario y sus pedidos',()=>{
  const db=nuevaBase();
  db.stock['Tienda A'].fisico=12;
  iniciarIntegracion(db);
  assert.equal(db.integracion.canales.Web.vista.stock['Tienda A'],10);
  assert.equal(iniciarIntegracion(db),false);
  assert.equal(db.pedidos[0].id,'PED-DEMO');
});
