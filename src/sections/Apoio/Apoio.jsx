import ufma from "../../assets/ufma.png";
import capes from "../../assets/capes.png";
import cnpq from "../../assets/cnpq.png";
import fapema from "../../assets/fapema.png";
import dsei from "../../assets/dsei.png";
import espma from "../../assets/espma.png";
import nca from "../../assets/nca.jpeg";
import { useIdioma } from "../../context/IdiomaContext";
import "./Apoio.css";

// escala: opcional, compensa logos com muita margem vazia na imagem (1 = normal)
const logos = [
  { src: ufma, alt: "Universidade Federal do Maranhão", escala: 1.50 },
  { src: cnpq, alt: "CNPq" },
  { src: capes, alt: "CAPES", escala: 1.40 },
  { src: fapema, alt: "FAPEMA", escala: 1.5 },
  { src: dsei, alt: "DSEI", escala: 1.5 },
  { src: espma, alt: "ESPMA", escala: 1.35 },
  { src: nca, alt: "NCA", escala: 1.6 },
];

// ultimaAtualizacao: { mes, ano } da última atualização dos dados
function Apoio({ ultimaAtualizacao }) {
  const { idioma, t } = useIdioma();

  const mesAno = ultimaAtualizacao
    ? new Date(Date.UTC(ultimaAtualizacao.ano, ultimaAtualizacao.mes - 1, 1, 12))
        .toLocaleDateString(idioma, { month: "long", year: "numeric", timeZone: "UTC" })
    : null;

  return (
    <section className="apoio" aria-labelledby="apoio-titulo">
      <div className="container">
        <hr className="rodape-divisor" />

        <h2 id="apoio-titulo" className="rodape-titulo">
          {t("Apoio institucional e financeiro")}
        </h2>

        <div className="apoio-painel">
          <ul className="logos-apoio">
            {logos.map(({ src, alt, escala }) => (
              <li className="logo-apoio" key={alt}>
                <div className="logo-apoio-item">
                  <img
                    src={src}
                    alt={t(alt)}
                    loading="lazy"
                    style={escala ? { "--escala": escala } : undefined}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {mesAno && (
          <p className="apoio-atualizacao">
            {t("Última atualização: {data}", { data: mesAno })}
          </p>
        )}
      </div>
    </section>
  );
}

export default Apoio;
