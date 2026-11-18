import { createContext, useContext } from "react";

export const IdiomaContext = createContext(null);

export function useIdioma() {
  const contexto = useContext(IdiomaContext);

  if (!contexto) {
    throw new Error("useIdioma precisa ser usado dentro de IdiomaProvider.");
  }

  return contexto;
}
