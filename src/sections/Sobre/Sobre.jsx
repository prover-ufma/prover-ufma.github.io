import { useIdioma } from "../../context/IdiomaContext";
import "./Sobre.css";

// Conteúdo da aba "Sobre"
function Sobre() {
  const { t } = useIdioma();

  return (
    <div className="sobre-grid">
      <div className="sobre-texto">
        <p>
          {t("O projeto desenvolve e aplica novas tecnologias voltadas à prevenção da cegueira associada à retinopatia diabética em comunidades tradicionais do Maranhão.")}
        </p>

        <p>
          {t("A proposta combina saúde, ciência e tecnologia para ampliar o acesso à avaliação da saúde ocular, especialmente em regiões com menor acesso aos serviços especializados.")}
        </p>
      </div>

      <div className="objetivo-card">
        <h3>{t("Objetivo")}</h3>

        <p>
          {t("Utilizar novas tecnologias e modelos de Inteligência Artificial para apoiar a detecção de doenças oftalmológicas e ampliar o cuidado em saúde ocular no Estado do Maranhão.")}
        </p>
      </div>
    </div>
  );
}

export default Sobre;
