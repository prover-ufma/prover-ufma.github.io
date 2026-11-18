import VisibleScrollbar from "../../components/VisibleScrollbar/VisibleScrollbar";
import { useIdioma } from "../../context/IdiomaContext";

// Cores das fatias, na ordem da maior para a menor
const CORES_FATIAS = [
  "#E05F07",
  "#FFCC00",
  "#00363F",
  "#00CCFF",
  "#dd7530",
  "#fad84f",
  "#0c4c57",
  "#56dbfc",
];

const COR_GRAFICO_VAZIO = "#e9e4d5";

// Ordena os itens do maior para o menor e calcula a fatia de cada um
function calcularFatias(itens, idioma) {
  const validos = itens
    .map(({ nome, quantidade }) => ({ nome, quantidade: Number(quantidade) }))
    .filter(({ quantidade }) => Number.isFinite(quantidade) && quantidade > 0)
    .sort((itemA, itemB) =>
      itemB.quantidade - itemA.quantidade ||
      itemA.nome.localeCompare(itemB.nome, idioma, { sensitivity: "base" })
    );
  const total = validos.reduce((soma, { quantidade }) => soma + quantidade, 0);

  let inicio = 0;
  return validos.map((item, indice) => {
    const percentual = (item.quantidade / total) * 100;
    const fatia = {
      ...item,
      cor: CORES_FATIAS[indice % CORES_FATIAS.length],
      percentual,
      inicio,
      fim: inicio + percentual,
    };
    inicio = fatia.fim;
    return fatia;
  });
}

// Rosca com o número de itens no centro e a legenda (nome + %) ao lado
function GraficoRosca({
  itens,
  rotuloCentro,
  rotuloRolagem,
  carregando = false,
  mostrarPercentual = false,
}) {
  const { idioma, t } = useIdioma();
  const fatias = calcularFatias(itens, idioma);
  const gradiente = fatias.length
    ? `conic-gradient(${fatias
        .map(({ cor, inicio, fim }) => `${cor} ${inicio}% ${fim}%`)
        .join(", ")})`
    : `conic-gradient(${COR_GRAFICO_VAZIO} 0% 100%)`;

  const legenda = fatias.map((fatia) => (
    <div key={fatia.nome}>
      <span className="legenda-cor" style={{ backgroundColor: fatia.cor }}></span>
      <span className="grafico-rosca-nome" title={t(fatia.nome)}>
        {t(fatia.nome)}
      </span>
      {mostrarPercentual && (
        <strong>
          {fatia.percentual.toLocaleString(idioma, { maximumFractionDigits: 1 })}%
        </strong>
      )}
    </div>
  ));

  return (
    <div className="grafico-rosca-area">
      <div className="grafico-rosca" style={{ background: gradiente }}>
        <div className="grafico-rosca-centro">
          <strong>{carregando ? 0 : fatias.length.toLocaleString(idioma)}</strong>
          <span>{rotuloCentro}</span>
        </div>
      </div>

      {rotuloRolagem ? (
        <VisibleScrollbar
          className="grafico-legenda grafico-rosca-legenda"
          label={rotuloRolagem}
        >
          {legenda}
        </VisibleScrollbar>
      ) : (
        <div className="grafico-legenda">{legenda}</div>
      )}
    </div>
  );
}

export default GraficoRosca;
