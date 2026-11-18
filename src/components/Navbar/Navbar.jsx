import { useEffect, useRef, useState } from "react";
import logotipo from "../../assets/logotipo.png";
import { useIdioma } from "../../context/IdiomaContext";
import { EVENTO_ABRIR_ABA } from "../../sections/Projeto/eventos";
import "./Navbar.css";

// Idiomas do site, na ordem em que aparecem
const IDIOMAS = [
  { codigo: "pt-BR", sigla: "PT-BR", nome: "Português" },
  { codigo: "en", sigla: "EN", nome: "English" },
];

function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [seletorAberto, setSeletorAberto] = useState(false);
  const seletorRef = useRef(null);
  const navbarRef = useRef(null);
  const { idioma, alterarIdioma, t } = useIdioma();

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (!seletorRef.current?.contains(evento.target)) {
        setSeletorAberto(false);
      }
      if (!navbarRef.current?.contains(evento.target)) {
        setMenuAberto(false);
      }
    }

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setSeletorAberto(false);
        setMenuAberto(false);
      }
    }

    document.addEventListener("click", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("click", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  function fecharMenu() {
    setMenuAberto(false);
  }

  function navegarPara(event, id, aba) {
    event.preventDefault();
    fecharMenu();
    if (aba) {
      window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_ABA, { detail: aba }));
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="cabecalho">

      <nav className="navbar container" ref={navbarRef}>

        <div className="navbar-marca">
          <img src={logotipo} alt="" />
        </div>

        {/* Celular e tablet: botão de três linhas que abre os links abaixo
            do cabeçalho. No desktop ele fica escondido (Navbar.css). */}
        <button
          type="button"
          className={`botao-menu ${menuAberto ? "aberto" : ""}`}
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label={menuAberto ? t("Fechar menu") : t("Abrir menu")}
          aria-expanded={menuAberto}
          aria-controls="navbar-links"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div
          id="navbar-links"
          className={`navbar-links ${
            menuAberto ? "menu-aberto" : ""
          }`}
        >

          <a href="#inicio" onClick={(event) => navegarPara(event, "inicio")}>
            {t("Início")}
          </a>

          <a href="#resultados" onClick={(event) => navegarPara(event, "resultados")}>
            {t("Resultados")}
          </a>

          <a href="#sobre" onClick={(event) => navegarPara(event, "sobre", "sobre")}>
            {t("Sobre")}
          </a>

          <a href="#galeria" onClick={(event) => navegarPara(event, "galeria")}>
            {t("Galeria")}
          </a>

          <a href="#comunidades" onClick={(event) => navegarPara(event, "comunidades")}>
            {t("Cidades")}
          </a>

          <a href="#pessoas" onClick={(event) => navegarPara(event, "pessoas")}>
            {t("Equipe")}
          </a>

          <a href="#contato" onClick={(event) => navegarPara(event, "contato")}>
            {t("Contato")}
          </a>

          {/* Troca de idioma dentro do menu (só aparece no celular e tablet):
              as duas opções lado a lado, com a atual destacada. */}
          <div className="idioma-menu" role="group" aria-label={t("Idioma")}>
            <span className="idioma-menu-rotulo">{t("Idioma")}</span>
            {IDIOMAS.map(({ codigo, sigla, nome }) => (
              <button
                key={codigo}
                type="button"
                className={idioma === codigo ? "ativo" : ""}
                aria-pressed={idioma === codigo}
                aria-label={nome}
                onClick={() => {
                  alterarIdioma(codigo);
                  fecharMenu();
                }}
              >
                {sigla}
              </button>
            ))}
          </div>
        </div>

        <div className="seletor-idioma-container" ref={seletorRef}>
          <button
            type="button"
            className="seletor-idioma"
            aria-label={
              idioma === "en"
                ? "Current language: English"
                : "Idioma atual: português brasileiro"
            }
            aria-expanded={seletorAberto}
            aria-haspopup="listbox"
            onClick={() => setSeletorAberto((aberto) => !aberto)}
          >
            {idioma === "en" ? "EN" : "PT-BR"}
            <span
              className={`seta-idioma ${seletorAberto ? "aberta" : ""}`}
              aria-hidden="true"
            />
          </button>

          {seletorAberto && (
            <div
              className="opcoes-idioma"
              role="listbox"
              aria-label={idioma === "en" ? "Language" : "Idioma"}
            >
              {IDIOMAS.map(({ codigo, sigla, nome }) => (
                <button
                  key={codigo}
                  type="button"
                  role="option"
                  aria-selected={idioma === codigo}
                  className={idioma === codigo ? "ativa" : ""}
                  onClick={() => {
                    alterarIdioma(codigo);
                    setSeletorAberto(false);
                  }}
                >
                  <span className="opcao-idioma-sigla">{sigla}</span>
                  {nome}
                </button>
              ))}
            </div>
          )}
        </div>

      </nav>

    </header>
  );
}

export default Navbar;
