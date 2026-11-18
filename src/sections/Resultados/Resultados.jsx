import { useIdioma } from "../../context/IdiomaContext";
import ImpactoCientifico from "./ImpactoCientifico";
import ImpactoSocial from "./ImpactoSocial";
import "./Resultados.css";

function Resultados({ dados, carregando }) {
  const { t } = useIdioma();

  return (
    <section className="resultados-dashboard" id="resultados">
      <div className="container">
        <div className="dashboard-cabecalho">
          <h2>{t("Resultados")}</h2>
        </div>

        <ImpactoSocial dados={dados} carregando={carregando} />

        <ImpactoCientifico />
      </div>
    </section>
  );
}

export default Resultados;
