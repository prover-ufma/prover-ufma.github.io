// Remove acentos, espaços repetidos e diferenças de maiúsculas para comparar
// nomes de cidades, comunidades e patologias escritos de formas diferentes.
export function normalizarTexto(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

// Padroniza IDs para que diferenças de acento, espaços, pontuação e zeros à
// esquerda não impeçam o cruzamento entre os exames e a resposta da API
export function normalizarIdPhelcom(id) {
  return String(id ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/\d+/g, (numero) => numero.replace(/^0+(?=\d)/, ""));
}
