import { useIdioma } from "../../context/IdiomaContext";

function CardCidade({ ref, cidade, selecionada, aoSelecionar, aoPassarMouse, aoTirarMouse }) {
  const { t } = useIdioma();

  return (
    <button
      ref={ref}
      className={`comunidade-card ${selecionada ? "comunidade-selecionada" : ""}`}
      onClick={aoSelecionar}
      onPointerEnter={(evento) => evento.pointerType === "mouse" && aoPassarMouse()}
      onPointerLeave={aoTirarMouse}
    >
      <div>
        <h3>{cidade.nome}</h3>
        <span>{cidade.periodo}</span>
      </div>

      <div className="comunidade-numero">
        <strong>{cidade.retinografias}</strong>
        <small>{t("Imagens")}</small>
      </div>
    </button>
  );
}

export default CardCidade;
