import { useState } from 'react';
import './retiro.css';

const stockPorTienda = { A: 8, B: 0 };

function ConsultaStock() {
  const [resultado, setResultado] = useState(null);

  function consultar(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const tienda = datos.get('tienda');
    const cantidad = Number(datos.get('cantidad'));
    const stock = stockPorTienda[tienda];
    const disponible = cantidad <= stock;
    let mensaje = `Disponible para retiro en Tienda ${tienda}. Stock actual: ${stock} unidades.`;
    if (stock === 0) {
      mensaje = `Tienda ${tienda} está sin stock para retiro.`;
    } else if (!disponible) {
      mensaje = `Stock insuficiente en Tienda ${tienda}. Puedes solicitar hasta ${stock} unidades.`;
    }
    setResultado({ mensaje, disponible });
  }

  return (
    <form onSubmit={consultar} onChange={() => setResultado(null)}>
      <h2>Consulta el stock para retiro</h2>
      <div className="campos">
        <label>Tienda de retiro
          <select name="tienda" defaultValue="A">
            {Object.keys(stockPorTienda).map(id => <option key={id} value={id}>Tienda {id}</option>)}
          </select>
        </label>
        <label>Cantidad
          <input name="cantidad" type="number" min="1" step="1" defaultValue="1" required />
        </label>
      </div>
      <button>Consultar disponibilidad</button>
      <output role="status" data-estado={resultado && !resultado.disponible ? 'insuficiente' : undefined}>
        {resultado?.mensaje}
      </output>
    </form>
  );
}

export default function Retiro() {
  return (
    <div className="retiro">
      <header>
        <div className="barra">
          <strong className="marca">Omni<span>-</span>SI <small>Falabella</small></strong>
          <span className="canal">Retiro en tienda</span>
        </div>
      </header>
      <main>
        <p className="ruta">Catálogo <span>/</span> Audio <span>/</span> Audífonos</p>
        <article>
          <figure aria-label="Ilustración de los Audífonos A en color grafito">
            <div className="audifonos" aria-hidden="true">
              <div className="diadema"></div>
              <div className="copa izquierda"></div>
              <div className="copa derecha"></div>
            </div>
            <figcaption><i></i> Grafito</figcaption>
          </figure>
          <section aria-labelledby="producto">
            <p className="categoria">Audio inalámbrico</p>
            <h1 id="producto">Audífonos A</h1>
            <p className="precio">S/ 99.90</p>
            <ConsultaStock />
          </section>
        </article>
      </main>
      <footer>Prototipo académico · Stock y precios de demostración</footer>
    </div>
  );
}
