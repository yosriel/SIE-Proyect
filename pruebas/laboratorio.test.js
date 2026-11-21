import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comprobarContratos, medirConsultas } from '../src/revision/laboratorio.js';

const api=JSON.parse(readFileSync(new URL('../public/contrato-v1.json',import.meta.url)));
test('el banco reproduce los ejemplos encadenados de las doce rutas',()=>{
  const filas=comprobarContratos(api);
  assert.equal(filas.length,Object.keys(api.paths).length);
  assert.deepEqual(filas.filter(f=>!f.conforme),[]);
});
test('una referencia contractual rota queda identificada en la operación',()=>{
  const copia=structuredClone(api);
  copia.paths['/api/v1/pedidos/estado'].post.requestBody.content['application/json'].example.id='desconocido';
  assert.equal(comprobarContratos(copia).find(f=>f.tipo==='pedido').conforme,false);
});
test('la medición de línea base exige una carga dentro del rango',()=>{
  assert.equal(medirConsultas(25).correctas,25);
  for(const n of [0,1.5,2001]) assert.throws(()=>medirConsultas(n));
});
