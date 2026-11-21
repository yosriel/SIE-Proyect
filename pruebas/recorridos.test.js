import test from 'node:test';
import assert from 'node:assert/strict';
import { recorrer } from '../src/revision/escenarios.js';

test('los cuatro procesos tienen un camino de éxito y tres excepciones reproducibles',()=>{
  const resultados=recorrer();
  for(const id of ['HU01','HU02','HU03','HU04']){
    assert.equal(resultados.filter(r=>r.historia===id).length,4);
  }
  assert.deepEqual(resultados.filter(r=>!r.conforme),[]);
});
