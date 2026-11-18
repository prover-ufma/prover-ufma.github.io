import { useIdioma } from "../../context/IdiomaContext";

// Quadro que é exibido junto ao marcador da cidade com as comunidades atendidas e
// a quantidade de imagens de cada uma
function PopupComunidades({ cidade, fixo }) {
  const { idioma, t } = useIdioma();
  const { x, y } = cidade.coordenadas;

  const comunidades = Object.entries(cidade.comunidades)
    .map(([nome, imagens]) => ({ nome, imagens }))
    .sort((comunidadeA, comunidadeB) => comunidadeB.imagens - comunidadeA.imagens);

  const classes = [
    "popup-comunidades",
    x > 50 ? "popup-comunidades-esquerda" : "popup-comunidades-direita",
    y > 55 ? "popup-comunidades-acima" : "popup-comunidades-abaixo",
    fixo ? "popup-comunidades-fixo" : "",
  ].join(" ");

  return (
    <div
      className={classes}
      style={{ left: `${x}%`, top: `${y}%` }}
      role="dialog"
      aria-label={t("Comunidades de {nome}", { nome: cidade.nome })}
    >
      <div className="popup-comunidades-cabecalho">
        <h3>{cidade.nome}</h3>
      </div>

      <span className="popup-comunidades-rotulo">{t("Comunidades")}</span>

      {comunidades.length === 0 ? (
        <p className="popup-comunidades-vazio">{t("Nenhuma comunidade registrada")}</p>
      ) : (
        <ul>
          {comunidades.map(({ nome, imagens }) => (
            <li key={nome || "sem-comunidade"}>
              <span>{nome || t("Localidade quilombola")}</span>
              <strong>
                {imagens.toLocaleString(idioma)} <small>{t("Imagens")}</small>
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PopupComunidades;
