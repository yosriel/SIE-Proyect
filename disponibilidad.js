const stockPorTienda = { A: 8, B: 0 };
const consulta = document.querySelector('#consulta');
const tienda = document.querySelector('#tienda');
const cantidad = document.querySelector('#cantidad');
const resultado = document.querySelector('#resultado');

consulta.addEventListener('input', () => {
  resultado.textContent = '';
  delete resultado.dataset.estado;
});

consulta.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const stock = stockPorTienda[tienda.value];
  const disponible = cantidad.valueAsNumber <= stock;
  const nombre = tienda.selectedOptions[0].textContent;
  resultado.dataset.estado = disponible ? 'disponible' : 'insuficiente';

  if (stock === 0) {
    resultado.textContent = nombre + ' está sin stock para retiro.';
  } else if (disponible) {
    resultado.textContent = 'Disponible para retiro en ' + nombre + '. Stock actual: ' + stock + ' unidades.';
  } else {
    resultado.textContent = 'Stock insuficiente en ' + nombre + '. Puedes solicitar hasta ' + stock + ' unidades.';
  }
});
