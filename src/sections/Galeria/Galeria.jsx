import { useRef, useState } from "react";

import { useIdioma } from "../../context/IdiomaContext";
import "./Galeria.css";

const fotos = Object.entries(
  import.meta.glob("../../assets/Fotos das Ações/*.jpg", {
    eager: true,
    import: "default",
  })
)
  .sort(([caminhoA], [caminhoB]) => caminhoA.localeCompare(caminhoB))
  .map(([, src]) => src);

function IconeSeta({ direcao }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direcao === "anterior" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Galeria() {
  const { t } = useIdioma();
  const janelaRef = useRef(null);
  const trilhoRef = useRef(null);
  const [fotoAberta, setFotoAberta] = useState(null);

  function abrirFoto(indice) {
    setFotoAberta(indice);
    janelaRef.current?.showModal();
  }

  function fecharFoto() {
    janelaRef.current?.close();
  }

  // Avança (+1) ou volta (-1); da última foto volta para a primeira
  function mudarFoto(passo) {
    setFotoAberta((atual) => (atual + passo + fotos.length) % fotos.length);
  }

  function rolarCarrossel(direcao) {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    trilho.scrollBy({ left: direcao * trilho.clientWidth * 0.8, behavior: "smooth" });
  }

  function navegarComTeclado(evento) {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      mudarFoto(1);
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      mudarFoto(-1);
    }
  }

  return (
    <section className="secao galeria" id="galeria">
      <div className="container">
        <h2 className="titulo-secao">{t("Galeria de imagens")}</h2>

        {/* Carrossel: arraste/deslize para o lado ou use as setas. */}
        <div className="galeria-carrossel">
          <button
            type="button"
            className="galeria-seta galeria-seta-anterior"
            onClick={() => rolarCarrossel(-1)}
            aria-label={t("Fotos anteriores")}
          >
            <IconeSeta direcao="anterior" />
          </button>

          <div className="galeria-trilho" ref={trilhoRef}>
            {fotos.map((src, indice) => (
              <button
                key={src}
                type="button"
                className="galeria-item"
                onClick={() => abrirFoto(indice)}
                aria-label={t("Ampliar foto {numero}", { numero: indice + 1 })}
              >
                <img
                  src={src}
                  alt={t("Foto {numero} das ações do projeto", { numero: indice + 1 })}
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="galeria-seta galeria-seta-proxima"
            onClick={() => rolarCarrossel(1)}
            aria-label={t("Próximas fotos")}
          >
            <IconeSeta direcao="proxima" />
          </button>
        </div>
      </div>

      {/* Foto ampliada. As setas ← → do teclado trocam de foto; Esc ou clicar
          fora fecha. */}
      <dialog
        ref={janelaRef}
        className="galeria-ampliada"
        onClose={() => setFotoAberta(null)}
        onKeyDown={navegarComTeclado}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fecharFoto();
        }}
      >
        {fotoAberta !== null && (
          <>
            <img
              src={fotos[fotoAberta]}
              alt={t("Foto {numero} das ações do projeto", { numero: fotoAberta + 1 })}
            />
            <button
              type="button"
              className="galeria-fechar"
              onClick={fecharFoto}
              aria-label={t("Fechar foto")}
            >
              ×
            </button>
            <button
              type="button"
              className="galeria-seta galeria-seta-anterior"
              onClick={() => mudarFoto(-1)}
              aria-label={t("Foto anterior")}
            >
              <IconeSeta direcao="anterior" />
            </button>
            <button
              type="button"
              className="galeria-seta galeria-seta-proxima"
              onClick={() => mudarFoto(1)}
              aria-label={t("Próxima foto")}
            >
              <IconeSeta direcao="proxima" />
            </button>
          </>
        )}
      </dialog>
    </section>
  );
}

export default Galeria;
