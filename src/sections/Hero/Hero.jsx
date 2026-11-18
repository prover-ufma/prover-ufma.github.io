import imagemHero from "../../assets/Phelcom.jpg";
import { useIdioma } from "../../context/IdiomaContext";
import "./Hero.css";

function Hero() {
  const { t } = useIdioma();

  function navegarParaSobre(event) {
    event.preventDefault();
    document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero" id="inicio">

      <div className="container hero-container">

        <div className="hero-texto">

          <span className="titulo-pequeno">
            {t("UNIVERSIDADE FEDERAL DO MARANHÃO")}
          </span>

          <h1>
            {t("Novas tecnologias aplicadas à prevenção de cegueira associada à retinopatia diabética em comunidades tradicionais do Maranhão")}
          </h1>

          <p>
            {t("Retinografia portátil, Inteligência Artificial e telessaúde aproximando a saúde ocular das comunidades tradicionais do Maranhão.")}
          </p>

          <a
            href="#sobre"
            className="botao-principal"
            onClick={navegarParaSobre}
          >
            {t("Saiba mais")}
          </a>

        </div>

        <div className="hero-imagem">
          <img
            src={imagemHero}
            alt={t("Retinografia portátil")}
          />
        </div>

      </div>

    </section>
  );
}

export default Hero;
