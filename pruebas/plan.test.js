import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {revisarBacklog,dependencias,intervalo,decisionPrioridad} from '../src/revision/plan.js';
const {historias,requisitos}=JSON.parse(readFileSync(new URL('../src/revision/backlog.json',import.meta.url)));
test('el backlog concilia requisitos, épicas, prioridades y los 94 puntos',()=>{
  assert.deepEqual(revisarBacklog(historias,requisitos,dependencias),{duplicados:0,sinHistoria:[],invalidas:[],sinOrigen:[],sinCriterio:[]});
  assert.equal(historias.reduce((s,h)=>s+h.puntos,0),94);
  assert.equal(new Set(historias.map(h=>h.epicas[0])).size,8);
  assert.ok(historias.every(h=>decisionPrioridad(h)===h.prioridad));
});
test('la revisión distingue una referencia rota, un hueco y un solape',()=>{
  assert.deepEqual(revisarBacklog(historias,requisitos,{HU01:['HU99']}).invalidas,['HU99']);
  assert.equal(intervalo('31/08','01/09'),0);
  assert.equal(intervalo('31/08','02/09'),1);
  assert.equal(intervalo('31/08','31/08'),-1);
});
