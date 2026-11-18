import IconeLinkExterno from "../../components/IconeLinkExterno/IconeLinkExterno";
import { useIdioma } from "../../context/IdiomaContext";

function CardPessoa({ pessoa }) {
  const { nome, funcao, instituicao, foto, lattes } = pessoa;
  const { t } = useIdioma();

  return (
    <article className="pessoa-card">
      <div className="pessoa-foto">
        {foto && <img src={foto} alt={nome} />}
      </div>

      <div className="pessoa-informacoes">
        <h3>{nome}</h3>
        <p>{t(funcao)}</p>
        <small>{instituicao}</small>

        {lattes && (
          <a
            className="pessoa-lattes"
            href={lattes}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Abrir currículo Lattes de {nome} em nova aba", { nome })}
          >
            Lattes <IconeLinkExterno className="pessoa-lattes-seta" />
          </a>
        )}
      </div>
    </article>
  );
}

export default CardPessoa;
