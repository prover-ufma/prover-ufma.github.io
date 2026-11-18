// A lista de nomes oficiais está em src/data/municipios.json
import NOMES_OFICIAIS from "../data/municipios.json" with { type: "json" };

// Gera uma chave de comparação que ignora acentos, maiúsculas, espaços e pontuação:
// "Peri Mirim" e "Perimirim", ou "Olho d'Água" e "Olho Dagua", resultam na mesma chave
function chaveMunicipio(nome) {
  return String(nome ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Formas abreviadas que a comparação acima não reconhece sozinha.
// Chave: forma abreviada; valor: nome oficial.
const ALIASES = {
  Amarante: "Amarante do Maranhão",
  "Santa Quitéria": "Santa Quitéria do Maranhão",
  "Santo Amaro": "Santo Amaro do Maranhão",
  "São Mateus": "São Mateus do Maranhão",
};

const OFICIAL_POR_CHAVE = new Map(NOMES_OFICIAIS.map((nome) => [chaveMunicipio(nome), nome]));
const ALIAS_POR_CHAVE = new Map(
  Object.entries(ALIASES).map(([apelido, oficial]) => [chaveMunicipio(apelido), oficial])
);

// Devolve o nome oficial do município ou null se não encontrar
export function resolverNomeMunicipio(nome) {
  const chave = chaveMunicipio(nome);
  if (!chave) return null;
  return (
    ALIAS_POR_CHAVE.get(chave) ??
    OFICIAL_POR_CHAVE.get(chave) ??
    OFICIAL_POR_CHAVE.get(`${chave}domaranhao`) ??
    null
  );
}

const avisados = new Set();

// Devolve o nome oficial. Se o município não for encontrado, devolve o nome original
export function nomeOficialOuOriginal(nome) {
  const original = String(nome ?? "").trim();
  const oficial = resolverNomeMunicipio(original);
  if (oficial) return oficial;
  if (original && !avisados.has(original)) {
    avisados.add(original);
    console.warn(`Município não encontrado no GeoJSON: "${original}"`);
  }
  return original;
}

// Troca as chaves de um objeto { cidade: valor } pelos nomes oficiais. Se
// duas grafias corresponderem ao mesmo município, mantém o primeiro valor.
export function padronizarChavesDeCidade(valoresPorCidade) {
  const resultado = {};
  Object.entries(valoresPorCidade ?? {}).forEach(([nome, valor]) => {
    const oficial = nomeOficialOuOriginal(nome);
    if (!(oficial in resultado)) resultado[oficial] = valor;
  });
  return resultado;
}
