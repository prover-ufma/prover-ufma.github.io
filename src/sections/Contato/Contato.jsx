import { useIdioma } from "../../context/IdiomaContext";
import "./Contato.css";

const EMAIL = "prover@nca.ufma.br";

function Contato() {
  const { t } = useIdioma();

  return (
    <section className="secao contato" id="contato">
      <div className="container">
        <div className="contato-grid">
          <div className="contato-bloco">
            <h2 className="rodape-titulo">{t("Instituição")}</h2>
            <p>{t("Universidade Federal do Maranhão")}</p>
            <p>{t("São Luís - Maranhão")}</p>
          </div>

          <div className="contato-bloco">
            <h2 className="rodape-titulo">{t("Contato")}</h2>
            <p>
              {t("E-mail")}:{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>
            <p>
              {t("Instagram")}:{" "}
              <a
                href="https://www.instagram.com/proverdm/"
                target="_blank"
                rel="noreferrer"
              >
                @proverdm
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contato;
