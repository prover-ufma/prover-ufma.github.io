import IconeLinkExterno from "../../components/IconeLinkExterno/IconeLinkExterno";
import VisibleScrollbar from "../../components/VisibleScrollbar/VisibleScrollbar";
import { useIdioma } from "../../context/IdiomaContext";
import GraficoRosca from "./GraficoRosca";
import KpiCard from "./KpiCard";
import {
  areasDePesquisa,
  indicadoresCientificos,
  publicacoes,
} from "./dadosCientificos";

const publicacoesOrdenadas = [...publicacoes].sort((a, b) => b.ano - a.ano);

function ImpactoCientifico() {
  const { t } = useIdioma();

  return (
    <div className="dashboard-painel dashboard-painel-cientifico">
      <div className="dashboard-painel-titulo">
        <h3>{t("Impacto científico")}</h3>
      </div>

      <div className="dashboard-conteudo">
        <div className="dashboard-kpis">
          <KpiCard valor={indicadoresCientificos.artigos} titulo={t("Artigos publicados")} />
          <KpiCard valor={indicadoresCientificos.trabalhosDeConclusao} titulo={t("Trabalhos de conclusão")} />
          <KpiCard valor={indicadoresCientificos.trabalhosEmEventos} titulo={t("Trabalhos apresentados em eventos")} />
          <KpiCard valor={indicadoresCientificos.ModelosIA} titulo={t("Modelos de IA desenvolvidos")} />
        </div>

        <div className="dashboard-graficos">
          {/* Lista: publicações com link para o trabalho */}
          <article className="dashboard-grafico">
            <h4>{t("Publicações")}</h4>

            <VisibleScrollbar
              className="lista-publicacoes"
              label={t("Rolagem das publicações")}
            >
              {publicacoesOrdenadas.map((publicacao) => (
                <a
                  className="publicacao"
                  key={publicacao.link}
                  href={publicacao.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="publicacao-ano">{publicacao.ano}</span>

                  <span className="publicacao-texto">
                    <span className="publicacao-titulo">{publicacao.titulo}</span>
                    <span className="publicacao-local">
                      {t(publicacao.tipo)} · {publicacao.local}
                    </span>
                  </span>

                  <IconeLinkExterno className="publicacao-seta" />
                  <span className="visualmente-oculto">{t("(abre em nova aba)")}</span>
                </a>
              ))}
            </VisibleScrollbar>
          </article>

          {/* Rosca: áreas de pesquisa */}
          <article className="dashboard-grafico">
            <h4>{t("Áreas de pesquisa")}</h4>

            <GraficoRosca
              itens={areasDePesquisa}
              rotuloCentro={t("áreas")}
              mostrarPercentual={false}
            />
          </article>
        </div>
      </div>
    </div>
  );
}

export default ImpactoCientifico;
