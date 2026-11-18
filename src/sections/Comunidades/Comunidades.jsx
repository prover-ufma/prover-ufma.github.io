import { useMemo, useRef, useState } from "react";

import mapaMaranhao from "../../assets/mapa-maranhao.svg";
import VisibleScrollbar from "../../components/VisibleScrollbar/VisibleScrollbar";
import { useIdioma } from "../../context/IdiomaContext";
import { normalizarTexto } from "../../utils/texto";
import CardCidade from "./CardCidade";
import coordenadasMunicipios from "../../data/coordenadasMunicipios.json";
import ajustesCoordenadas from "./ajustesCoordenadas";
import PopupComunidades from "./PopupComunidades";
import "./Comunidades.css";

function buscarPorNome(valoresPorNome, nome) {
  const nomeNormalizado = normalizarTexto(nome);
  return Object.entries(valoresPorNome).find(
    ([chave]) => normalizarTexto(chave) === nomeNormalizado
  )?.[1];
}

const avisadasSemPosicao = new Set();
function buscarCoordenadas(nome) {
  const coordenadas =
    buscarPorNome(ajustesCoordenadas, nome) ?? buscarPorNome(coordenadasMunicipios, nome);
  if (!coordenadas && !avisadasSemPosicao.has(nome)) {
    avisadasSemPosicao.add(nome);
    console.warn(`Cidade sem posição no mapa (não encontrada no GeoJSON): "${nome}"`);
  }
  return coordenadas;
}

function estaDentroDoMapa(coordenadas) {
  return [coordenadas?.x, coordenadas?.y].every(
    (valor) => Number.isFinite(valor) && valor >= 0 && valor <= 100
  );
}

function Comunidades({ dados }) {
  const { idioma, t } = useIdioma();
  const { periodosPorCidade, retinografiasPorCidade, comunidadesPorCidade } = dados;
  const [nomeEscolhido, setNomeEscolhido] = useState(null);
  // Popup de comunidades: aparece ao passar o mouse e, após um clique, fica
  // aberto até outra cidade ser clicada.
  const [nomeComMouse, setNomeComMouse] = useState(null);
  const [nomePopupFixo, setNomePopupFixo] = useState(null);
  // Cards da lista lateral, para rolar até a cidade clicada no mapa
  const cardsPorNome = useRef(new Map());

  const cidades = useMemo(
    () =>
      Object.entries(retinografiasPorCidade)
        .map(([nome, retinografias]) => ({
          nome,
          periodo: buscarPorNome(periodosPorCidade, nome) ?? "—",
          retinografias: Number(retinografias) || 0,
          coordenadas: buscarCoordenadas(nome),
          comunidades: buscarPorNome(comunidadesPorCidade ?? {}, nome) ?? {},
        }))
        .sort((cidadeA, cidadeB) =>
          cidadeA.nome.localeCompare(cidadeB.nome, idioma, { sensitivity: "base" })
        ),
    [periodosPorCidade, retinografiasPorCidade, comunidadesPorCidade, idioma]
  );
  const cidadesNoMapa = cidades.filter(({ coordenadas }) =>
    estaDentroDoMapa(coordenadas)
  );
  // Até alguém clicar em uma cidade, a primeira da lista fica selecionada.
  const nomeSelecionado = nomeEscolhido ?? cidades[0]?.nome;
  
  const nomeDestacadoNoMapa = nomeComMouse ?? nomeSelecionado;
  const nomeDoPopup = nomeComMouse ?? nomePopupFixo;
  const cidadeDoPopup = cidadesNoMapa.find(({ nome }) => nome === nomeDoPopup);

  function selecionarCidade(nome) {
    setNomeEscolhido(nome);
    setNomePopupFixo(nome);
  }

  // Ao clicar num marcador, rola só a lista lateral até o card da cidade
  function mostrarCardNaLista(nome) {
    const card = cardsPorNome.current.get(nome);
    const lista = card?.parentElement;
    if (!card || !lista) return;

    const topoCard = card.getBoundingClientRect().top - lista.getBoundingClientRect().top;
    const fimCard = topoCard + card.offsetHeight;
    if (topoCard >= 0 && fimCard <= lista.clientHeight) return;

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.scrollTo({
      top: lista.scrollTop + topoCard - (lista.clientHeight - card.offsetHeight) / 2,
      behavior: reduzirMovimento ? "auto" : "smooth",
    });
  }

  return (
    <section className="secao comunidades" id="comunidades">
      <div className="container">
        <h2>{t("Cidades atendidas")}</h2>

        <div className="indicadores-grid">
          <div className="indicador-card">
            <strong>{dados.totalCidades}</strong>
            <p>{t("Cidades")}</p>
          </div>

          <div className="indicador-card">
            <strong>{dados.totalComunidades}</strong>
            <p>{t("Comunidades")}</p>
          </div>

          <div className="indicador-card">
            <strong>{dados.retinografias.toLocaleString(idioma)}</strong>
            <p>{t("Imagens adquiridas")}</p>
          </div>

          <div className="indicador-card">
            <strong>{dados.totalPacientes}</strong>
            <p>{t("Pessoas atendidas")}</p>
          </div>
        </div>

        <div className="mapa-area">
          <div className="mapa-card">
            <span className="mapa-titulo">{t("MAPA — ESTADO DO MARANHÃO")}</span>

            <div className="mapa-interativo">
              {/* Imagem + marcadores numa caixa do tamanho exato do mapa: os
                  marcadores usam % dela, então nada fora do mapa os desloca. */}
              <div className="mapa-desenho">
                <img
                  src={mapaMaranhao}
                  alt={t("Mapa do Maranhão")}
                  className="imagem-mapa"
                />

                {cidadesNoMapa.map((cidade) => (
                  <button
                    key={cidade.nome}
                    type="button"
                    className={`marcador-cidade ${
                      nomeDestacadoNoMapa === cidade.nome ? "marcador-cidade-selecionado" : ""
                    }`}
                    style={{
                      left: `${cidade.coordenadas.x}%`,
                      top: `${cidade.coordenadas.y}%`,
                    }}
                    aria-label={cidade.nome}
                    onClick={() => {
                      selecionarCidade(cidade.nome);
                      mostrarCardNaLista(cidade.nome);
                    }}
                    // Só o mouse abre o popup por hover; no toque, vale o clique.
                    onPointerEnter={(evento) =>
                      evento.pointerType === "mouse" && setNomeComMouse(cidade.nome)
                    }
                    onPointerLeave={() => setNomeComMouse(null)}
                  />
                ))}
              </div>

              {cidadeDoPopup && (
                <PopupComunidades
                  cidade={cidadeDoPopup}
                  fixo={!nomeComMouse && nomePopupFixo === cidadeDoPopup.nome}
                />
              )}
            </div>
          </div>

          <div className="lista-comunidades">
            <span className="lista-titulo">{t("CIDADES ATENDIDAS")}</span>

            <VisibleScrollbar
              className="lista-comunidades-scroll"
              label={t("Rolagem das cidades atendidas")}
            >
              {cidades.map((cidade) => (
                <CardCidade
                  key={cidade.nome}
                  ref={(card) => {
                    if (card) cardsPorNome.current.set(cidade.nome, card);
                    else cardsPorNome.current.delete(cidade.nome);
                  }}
                  cidade={cidade}
                  selecionada={nomeSelecionado === cidade.nome}
                  aoSelecionar={() => selecionarCidade(cidade.nome)}
                  aoPassarMouse={() => setNomeComMouse(cidade.nome)}
                  aoTirarMouse={() => setNomeComMouse(null)}
                />
              ))}
            </VisibleScrollbar>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Comunidades;
