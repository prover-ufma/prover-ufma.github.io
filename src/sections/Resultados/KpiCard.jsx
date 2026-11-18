import { useIdioma } from "../../context/IdiomaContext";

// Indicador numérico usado nos painéis de impacto social e científico
function KpiCard({ valor, titulo }) {
  const { idioma } = useIdioma();

  return (
    <article className="dashboard-kpi">
      <strong className="dashboard-kpi-valor">
        {valor.toLocaleString(idioma)}
      </strong>

      <div className="dashboard-kpi-texto">
        <span className="dashboard-kpi-titulo">{titulo}</span>
      </div>
    </article>
  );
}

export default KpiCard;
