import { useIdioma } from "../../context/IdiomaContext";
import "./Pesquisa.css";

// Etapas exibidas em "Como o projeto funciona".
const etapas = [
  {
    numero: "01",
    titulo: "Comunidade",
    descricao:
      "Realização dos atendimentos nas localidades atendidas.",
  },
  {
    numero: "02",
    titulo: "Retinografia",
    descricao:
      "Captura de imagens da retina com equipamentos portáteis.",
  },
  {
    numero: "03",
    titulo: "Análise",
    descricao:
      "Processamento e classificação das imagens adquiridas.",
  },
  {
    numero: "04",
    titulo: "Avaliação médica",
    descricao:
      "As retinografias são avaliadas por um profissional médico especializado.",
  },
  {
    numero: "05",
    titulo: "Tratamento",
    descricao:
      "Encaminhamento dos pacientes para o tratamento adequado, conforme a avaliação médica.",
  },
];

// Conteúdo da aba "Como funciona"
function Pesquisa() {
  const { t } = useIdioma();

  return (
    <div className="pesquisa-quadro">
      <div className="etapas-grid">
        {etapas.map((etapa) => (
          <article className="etapa-card" key={etapa.numero}>
            <span className="numero-etapa">{etapa.numero}</span>
            <h3>{t(etapa.titulo)}</h3>
            <p>{t(etapa.descricao)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Pesquisa;
