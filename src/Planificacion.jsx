const actividades = [
  ['SP1-01', 'Elaborar el Project Charter', 'Saul Aguilar'],
  ['SP1-02', 'Identificar a los interesados', 'Saul Aguilar'],
  ['SP1-03', 'Definir el alcance del proyecto', 'Franco Vallejos'],
  ['SP1-04', 'Levantar los requerimientos iniciales', 'Equipo Scrum'],
  ['SP1-05', 'Elaborar el Product Backlog', 'Fernando Fernandez'],
  ['SP1-06', 'Priorizar las historias de usuario', 'Product Owner'],
  ['SP1-07', 'Estimar el esfuerzo en Story Points', 'Equipo Scrum'],
  ['SP1-08', 'Elaborar el cronograma de sprints', 'Elmer Diego Falla'],
  ['SP1-09', 'Definir los roles Scrum', 'Elmer Diego Falla'],
  ['SP1-10', 'Validar la planificación inicial', 'Equipo Scrum'],
];

export default function Planificacion() {
  return (
    <main className="pagina">
      <p className="rotulo">Cuaderno de proyecto · Sprint 1</p>
      <h1>Planificación inicial</h1>
      <p className="periodo">Del 18 al 31 de agosto de 2026</p>
      <section aria-labelledby="alcance">
        <h2 id="alcance">Alcance del proyecto</h2>
        <p>Seguimos el recorrido de una compra con retiro en tienda y su relación con el inventario,
          las devoluciones y la gestión de vendedores de Falabella Retail Perú.</p>
      </section>
      <details>
        <summary>Actividades y responsables del sprint</summary>
        <p>El equipo completó estas diez actividades durante el primer sprint (APF2, sección 17.1).</p>
        <ul className="backlog">
          {actividades.map(([id, nombre, responsable]) => (
            <li key={id}>
              <span className="codigo">{id}</span>
              <strong>{nombre}</strong>
              <span>{responsable}</span>
            </li>
          ))}
        </ul>
      </details>
    </main>
  );
}
