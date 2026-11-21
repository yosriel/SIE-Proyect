export default function Marca({ href }) {
  return <a className="marca" href={href} aria-label="Omni-SI Falabella, inicio">
    <span className="simbolo" aria-hidden="true"><i/><i/><i/></span>
    <span>Omni-SI <small>Falabella</small></span>
  </a>;
}
