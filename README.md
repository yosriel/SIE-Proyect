# Omni-SI Falabella

Web responsiva del proyecto académico SIE Proyect para el punto 8 del APF3. Los tres sprints usan React en el navegador. Vite ejecuta el servidor de desarrollo y compila la aplicación estática.

## Ejecutar desde una copia limpia

Versiones probadas: Node.js 26.13.1, npm 11.20.0, React y React DOM 19.3.0, Vite 8.3.4. El proyecto requiere Node.js 22.12 o posterior. Las dependencias están fijadas en el archivo de bloqueo.

```sh
npm ci
npm run dev
```

Abrir la dirección local que imprime Vite. Para probar desde un celular conectado a la misma red de confianza, ejecutar `npm run dev -- --host 0.0.0.0` y abrir la dirección de red que imprime Vite.

## Compilar y verificar

```sh
npm run build
npm run preview
```

El resultado está en `dist/`. Abrir la dirección que imprime la vista previa y comprobar el incremento en celular y en PC. Con acceso al registro de npm, ejecutar `npm audit` para revisar dependencias directas y transitivas.

## Trabajar por sprint

| Rama | Propósito |
| --- | --- |
| main | Entregas aceptadas. |
| dev | Base común e integración de los incrementos revisados. |
| Sprint1 | Inicio y planificación del proyecto. |
| Sprint2 | Modelado de procesos omnicanal y demostración de sus flujos. |
| Sprint3 | Arquitectura e integración. |

Usar `git switch Sprint1`, `git switch Sprint2` o `git switch Sprint3` para abrir una rama. Cada incremento parte del anterior y se conserva en su rama para la exposición. Tras la revisión, integrar en dev. Actualizar las ramas reservadas desde dev antes de continuar su implementación. La fuente académica es APF2, secciones 16, 17 y 21.
