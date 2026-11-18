import { useIdioma } from "../../context/IdiomaContext";
import CardPessoa from "./CardPessoa";
import equipe from "./dadosEquipe";
import "./Equipe.css";

function Equipe() {
  const { t } = useIdioma();

  return (
    <section className="secao equipe" id="pessoas">
      <div className="container">
        <h2 className="titulo-secao">{t("Equipe do projeto")}</h2>

        <div className="equipe-grid">
          {equipe.map((pessoa) => (
            <CardPessoa key={pessoa.id} pessoa={pessoa} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Equipe;
