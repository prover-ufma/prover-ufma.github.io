// Gera src/data/estatisticas.json, só com totais agregados (sem dados de
// pacientes)

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  agregarImagensPorComunidadeDaCidade,
  agregarRetinografiasPorCidade,
  contarComunidadesAtendidas,
  contarDiagnosticosPorId,
} from "../src/utils/relatorios.js";
import { API_URL } from "../src/utils/api.js";
import { resolverNomeMunicipio } from "../src/utils/municipios.js";
import { normalizarIdPhelcom } from "../src/utils/texto.js";

const raiz = new URL("../", import.meta.url);
const caminhoRelatorios = process.argv[2] ?? fileURLToPath(new URL("dados-privados/reports.json", raiz));
const caminhoSaida = fileURLToPath(new URL("src/data/estatisticas.json", raiz));

async function lerRelatorios() {
  const relatorios = JSON.parse(await readFile(caminhoRelatorios, "utf8"));
  if (!Array.isArray(relatorios)) {
    throw new Error(`${caminhoRelatorios} não contém uma lista de exames.`);
  }
  return relatorios;
}

function lerToken() {
  const caminhoEnv = fileURLToPath(new URL(".env.local", raiz));
  if (existsSync(caminhoEnv)) {
    process.loadEnvFile(caminhoEnv);
  }
  const token = process.env.TOKEN_ESTATISTICAS?.trim();
  if (!token || token === "cole-aqui-o-token") {
    throw new Error(
      "TOKEN_ESTATISTICAS não configurado. Coloque no .env.local o mesmo valor " +
        "da propriedade TOKEN_ESTATISTICAS do Apps Script."
    );
  }
  return token;
}

// Busca na API a cidade e a comunidade de cada pessoa
async function buscarVinculos() {
  const url = new URL(API_URL);
  url.searchParams.set("token", lerToken());

  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Erro na API: ${resposta.status}`);
  }
  const dados = await resposta.json();
  for (const campo of ["cidadePorIdPhelcom", "comunidadePorIdPhelcom"]) {
    if (!dados?.[campo] || typeof dados[campo] !== "object") {
      throw new Error(
        `A API não retornou ${campo}. Confira se o TOKEN_ESTATISTICAS do .env.local ` +
          "é igual ao do Apps Script e se a nova versão do Apps Script foi implantada."
      );
    }
  }
  return dados;
}

const [relatorios, { cidadePorIdPhelcom, comunidadePorIdPhelcom }] = await Promise.all([
  lerRelatorios(),
  buscarVinculos(),
]);

const retinografias = agregarRetinografiasPorCidade(relatorios, cidadePorIdPhelcom);
const comunidades = contarComunidadesAtendidas(relatorios, comunidadePorIdPhelcom);

const estatisticas = {
  geradoEm: new Date().toISOString(),
  totalPacientes: retinografias.totalPacientes,
  totalCidades: Object.keys(retinografias.porCidade).length,
  totalComunidades: comunidades.total,
  retinografias: retinografias.total,
  retinografiasPorCidade: retinografias.porCidade,
  pessoasPorCidade: retinografias.pessoasPorCidade,
  comunidadesPorCidade: agregarImagensPorComunidadeDaCidade(
    relatorios,
    cidadePorIdPhelcom,
    comunidadePorIdPhelcom
  ),
  diagnosticos: contarDiagnosticosPorId(relatorios),
};

await writeFile(caminhoSaida, `${JSON.stringify(estatisticas, null, 2)}\n`);

console.log(`Gerado ${caminhoSaida}`);
console.log(
  `${relatorios.length} exames · ${estatisticas.totalPacientes} pacientes · ` +
    `${estatisticas.retinografias} imagens · ${estatisticas.totalCidades} cidades · ` +
    `${estatisticas.totalComunidades} comunidades`
);

// Avisos no terminal
const cidadesPorId = new Map(
  Object.entries(cidadePorIdPhelcom).map(([id, cidade]) => [normalizarIdPhelcom(id), cidade])
);
const nomesDaPlanilha = new Set(
  relatorios
    .map((relatorio) => cidadesPorId.get(normalizarIdPhelcom(relatorio?.id_phelcom)))
    .filter((cidade) => typeof cidade === "string" && cidade.trim())
    .map((cidade) => cidade.trim())
);
const alterados = [];
const naoEncontrados = [];
[...nomesDaPlanilha].sort((a, b) => a.localeCompare(b, "pt-BR")).forEach((nome) => {
  const oficial = resolverNomeMunicipio(nome);
  if (!oficial) naoEncontrados.push(nome);
  else if (oficial !== nome) alterados.push(`  ${nome} → ${oficial}`);
});
if (alterados.length > 0) {
  console.log(`Nomes padronizados (planilha → oficial):\n${alterados.join("\n")}`);
}
if (naoEncontrados.length > 0) {
  console.warn(
    `Aviso: cidades não encontradas no GeoJSON (aparecem na lista, mas não no mapa): ${naoEncontrados.join(", ")}`
  );
}
if (retinografias.relatoriosSemCidade > 0) {
  console.warn(
    `Aviso: ${retinografias.relatoriosSemCidade} exames (${retinografias.imagensSemCidade} imagens) sem cidade no Apps Script.`
  );
}
if (comunidades.pessoasSemComunidade > 0) {
  console.warn(
    `Aviso: ${comunidades.pessoasSemComunidade} pessoas sem comunidade no Apps Script.`
  );
}
