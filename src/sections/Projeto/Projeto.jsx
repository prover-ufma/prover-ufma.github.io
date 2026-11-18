import { useEffect, useRef, useState } from "react";

import { useIdioma } from "../../context/IdiomaContext";
import Pesquisa from "../Pesquisa/Pesquisa";
import Sobre from "../Sobre/Sobre";
import Tecnologias from "../Tecnologias/Tecnologias";
import { EVENTO_ABRIR_ABA } from "./eventos";
import "./Projeto.css";

// Sobre, Como funciona e Tecnologias numa só seção com abas
const abas = [
  { id: "sobre", rotulo: "Sobre", Conteudo: Sobre },
  { id: "como-funciona", rotulo: "Como funciona", Conteudo: Pesquisa },
  { id: "tecnologias", rotulo: "Tecnologias", Conteudo: Tecnologias },
];

function abaInicial() {
  const hash = window.location.hash.slice(1);
  return abas.some((aba) => aba.id === hash) ? hash : "sobre";
}

function Projeto() {
  const { t } = useIdioma();
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);
  const botoesRef = useRef({});

  const secaoRef = useRef(null);
  useEffect(() => {
    if (abaInicial() !== "sobre") {
      secaoRef.current?.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    function abrirAba(evento) {
      if (abas.some((aba) => aba.id === evento.detail)) {
        setAbaAtiva(evento.detail);
      }
    }

    window.addEventListener(EVENTO_ABRIR_ABA, abrirAba);
    return () => window.removeEventListener(EVENTO_ABRIR_ABA, abrirAba);
  }, []);

  function navegarComTeclado(evento) {
    const indiceAtual = abas.findIndex((aba) => aba.id === abaAtiva);
    let proximo;

    if (evento.key === "ArrowRight") proximo = (indiceAtual + 1) % abas.length;
    else if (evento.key === "ArrowLeft") proximo = (indiceAtual - 1 + abas.length) % abas.length;
    else if (evento.key === "Home") proximo = 0;
    else if (evento.key === "End") proximo = abas.length - 1;
    else return;

    evento.preventDefault();
    const id = abas[proximo].id;
    setAbaAtiva(id);
    botoesRef.current[id]?.focus();
  }

  return (
    <section className="secao projeto" id="sobre" ref={secaoRef}>
      <div className="container">
        <h2 className="titulo-secao">{t("Sobre o projeto")}</h2>

        <div
          className="projeto-abas"
          role="tablist"
          aria-label={t("Sobre o projeto")}
          onKeyDown={navegarComTeclado}
        >
          {abas.map((aba) => {
            const ativa = aba.id === abaAtiva;
            return (
              <button
                key={aba.id}
                ref={(el) => (botoesRef.current[aba.id] = el)}
                type="button"
                role="tab"
                id={`aba-${aba.id}`}
                aria-selected={ativa}
                aria-controls={`painel-${aba.id}`}
                tabIndex={ativa ? 0 : -1}
                className={`projeto-aba ${ativa ? "ativa" : ""}`}
                onClick={() => setAbaAtiva(aba.id)}
              >
                {t(aba.rotulo)}
              </button>
            );
          })}
        </div>

        <div className="projeto-paineis">
          {abas.map(({ id, Conteudo }) => {
            const ativa = id === abaAtiva;
            return (
              <div
                key={id}
                role="tabpanel"
                id={`painel-${id}`}
                aria-labelledby={`aba-${id}`}
                className={`projeto-painel ${ativa ? "ativo" : ""}`}
                aria-hidden={!ativa}
                inert={!ativa}
              >
                <Conteudo />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Projeto;
