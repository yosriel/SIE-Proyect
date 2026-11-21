# Omni-SI Falabella · Sprint 1

## Qué se hizo

El primer sprint definió el alcance del proyecto, sus requisitos iniciales y la organización del equipo. Para el punto 8 del APF3, esta rama presenta ese trabajo en un **cuaderno de planificación** que se puede consultar desde celular o PC.

- Se creó la base de la aplicación con React y Vite y se diseñó la vista **Planificación inicial** con la identidad visual de Omni-SI Falabella.
- Se incorporaron el periodo del 18 al 31 de agosto de 2026 y el alcance de los procesos de retiro, inventario, devoluciones y vendedores.
- Se implementó una lista desplegable con las diez actividades de la sección 17.1 del APF2. Cada fila muestra su código, la actividad y el responsable, desde el Project Charter hasta la validación de la planificación.

## Ejecutar esta versión

Requiere Node.js 22.12 o posterior y npm. Esta rama utiliza React 19.3.0 y Vite 8.3.4.

```sh
git switch Sprint1
npm ci
npm run dev
```

Abre la dirección que imprime Vite. Para comprobar la compilación estática, ejecuta `npm run build` y luego `npm run preview`.

## Cómo verificar el incremento

En **Planificación inicial**, abre **Actividades y responsables del sprint**. Comprueba que aparecen diez actividades, de `SP1-01` a `SP1-10`, cada una con su responsable. Cierra el detalle y repite el recorrido con un ancho de 390 px y otro de 1280 px. La verificación de esta rama es manual. [Vista en celular](evidencias/celular.png) · [Vista en PC](evidencias/pc.png)

En **Revisar la planificación** puedes consultar las doce historias, contrastar los requisitos, recalcular los 94 puntos y registrar la decisión y el acta del patrocinador para cada documento. El selector reproduce los diez casos del Sprint 1.

Ejecuta `npm test` para conciliar requisitos e historias y verificar los límites del cronograma.
