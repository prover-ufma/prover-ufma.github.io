import VisibleScrollbar from "../../components/VisibleScrollbar/VisibleScrollbar";
import { useIdioma } from "../../context/IdiomaContext";
import GraficoRosca from "./GraficoRosca";
import KpiCard from "./KpiCard";

function ImpactoSocial({ dados, carregando }) {
  const { idioma, t } = useIdioma();

  const cidades = Object.entries(dados.pessoasPorCidade)
    .map(([nome, valor]) => ({ nome, valor: Number(valor) || 0 }))
    .sort((cidadeA, cidadeB) =>
      cidadeA.nome.localeCompare(cidadeB.nome, idioma, { sensitivity: "base" })
    );
  // O maior valor define a barra de 100%; as outras são proporcionais a ela
  const maiorCidade = Math.max(1, ...cidades.map(({ valor }) => valor));

  const doencas = Object.entries(dados.diagnosticos).map(([nome, quantidade]) => ({
    nome,
    quantidade,
  }));

  // Enquanto os dados carregam, os indicadores mostram 0.
  const valor = (numero) => (carregando ? 0 : Number(numero ?? 0));

  return (
    <div className="dashboard-painel dashboard-painel-social">
      <div className="dashboard-painel-titulo">
        <h3>{t("Impacto social")}</h3>
      </div>

      <div className="dashboard-conteudo">
        <div className="dashboard-kpis">
          <KpiCard valor={valor(dados.totalPacientes)} titulo={t("Pessoas atendidas")} />
          <KpiCard valor={valor(dados.totalCidades)} titulo={t("Cidades atendidas")} />
          <KpiCard valor={valor(dados.totalComunidades)} titulo={t("Comunidades atendidas")} />
          <KpiCard valor={valor(dados.retinografias)} titulo={t("Imagens adquiridas")} />
        </div>

        <div className="dashboard-graficos">
          {/* Barras: pessoas atendidas por cidade */}
          <article className="dashboard-grafico">
            <h4>{t("Pessoas atendidas por cidade")}</h4>

            <VisibleScrollbar
              className="grafico-barras-horizontal"
              label={t("Rolagem de pessoas atendidas por cidade")}
            >
              {cidades.map((cidade) => (
                <div className="barra-horizontal-linha" key={cidade.nome}>
                  <span className="barra-horizontal-nome">{cidade.nome}</span>

                  <div className="barra-horizontal-area">
                    <div
                      className="barra-horizontal"
                      style={{ width: `${(cidade.valor / maiorCidade) * 100}%` }}
                    ></div>
                  </div>

                  <strong>{cidade.valor}</strong>
                </div>
              ))}
            </VisibleScrollbar>
          </article>

          {/* Rosca: distribuição de alterações */}
          <article className="dashboard-grafico">
            <h4>{t("Panorama oftalmológico")}</h4>

            <GraficoRosca
              itens={doencas}
              rotuloCentro={t("alterações")}
              rotuloRolagem={t("Rolagem da distribuição de patologias")}
              carregando={carregando}
              mostrarPercentual
            />
          </article>
        </div>
      </div>
    </div>
  );
}

export default ImpactoSocial;
