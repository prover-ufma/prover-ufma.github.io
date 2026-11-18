import { useEffect, useMemo, useState } from "react";
import { IdiomaContext } from "./IdiomaContext";
import { traducoes } from "./traducoes";

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    const idiomaSalvo = window.localStorage.getItem("idioma");
    return idiomaSalvo === "en" ? "en" : "pt-BR";
  });

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  function alterarIdioma(novoIdioma) {
    if (novoIdioma !== "pt-BR" && novoIdioma !== "en") {
      throw new Error(`Idioma não suportado: ${novoIdioma}`);
    }

    window.localStorage.setItem("idioma", novoIdioma);
    setIdioma(novoIdioma);
  }

  const valor = useMemo(() => {
    function t(texto, variaveis = {}) {
      const traducao = traducoes[idioma][texto] ?? texto;
      return traducao.replace(/\{(\w+)\}/g, (_, chave) =>
        String(variaveis[chave] ?? `{${chave}}`)
      );
    }

    return { idioma, alterarIdioma, t };
  }, [idioma]);

  return (
    <IdiomaContext.Provider value={valor}>
      {children}
    </IdiomaContext.Provider>
  );
}
