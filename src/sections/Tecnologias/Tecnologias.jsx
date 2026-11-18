import { useIdioma } from "../../context/IdiomaContext";
import tecnologias from "./dadosTecnologias";
import "./Tecnologias.css";

// Conteúdo da aba "Tecnologias"
function Tecnologias() {
  const { t } = useIdioma();

  return (
    <div className="tecnologias-grid">
      {tecnologias.map((tecnologia) => (
        <article className="tecnologia-card" key={tecnologia.titulo}>
          <h3>{t(tecnologia.titulo)}</h3>
          <p>{t(tecnologia.descricao)}</p>
        </article>
      ))}
    </div>
  );
}

export default Tecnologias;
