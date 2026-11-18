// Gera o mapa da seção "Cidades atendidas" e as posições dos marcadores a
// partir de dados geográficos reais

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { geoArea, geoContains, geoMercator, geoPath } from "d3-geo";

const raiz = new URL("../", import.meta.url);
const caminho = (relativo) => fileURLToPath(new URL(relativo, raiz));

// Estados vizinhos que aparecem no enquadramento: PA, TO, PI e um canto da BA
// Os números são os códigos de UF do IBGE
const VIZINHOS = ["15", "17", "22", "29"];
const URL_IBGE = (uf) =>
  `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${uf}?formato=application/vnd.geo%2Bjson&qualidade=maxima`;

// Cores e espessuras copiadas do SVG anterior.
const ESTILO = {
  mar: "#cbeaf1",
  vizinhos: "#fbe9bd",
  municipios: "#fefee9",
  borda: "#646464",
  bordaMunicipio: 0.5,
  bordaEstado: 1,
};

// Mesmo enquadramento do SVG anterior: 800 px de largura e o Maranhão
// ocupando quase todo o quadro, com uma faixa estreita dos vizinhos em volta.
const LARGURA = 800;
const MARGEM_X = 16;
const MARGEM_Y = 18;

async function lerJson(relativo) {
  return JSON.parse(await readFile(caminho(relativo), "utf8"));
}

// Lê o contorno do estado salvo em scripts/dados/, se ainda não existir,
// baixa do IBGE e salva para as próximas execuções
async function lerVizinho(uf) {
  const relativo = `scripts/dados/ibge-uf-${uf}.json`;
  try {
    return await lerJson(relativo);
  } catch (erro) {
    if (erro.code !== "ENOENT") throw erro;
    console.log(`Baixando contorno da UF ${uf} do IBGE...`);
    const resposta = await fetch(URL_IBGE(uf));
    if (!resposta.ok) {
      throw new Error(`IBGE respondeu ${resposta.status} para a UF ${uf}`, { cause: erro });
    }
    const texto = await resposta.text();
    await writeFile(caminho(relativo), texto);
    return JSON.parse(texto);
  }
}

const arredondar = (valor) => Math.round(valor * 100) / 100;

function corrigirSentido(colecao) {
  colecao.features.forEach((feature) => {
    const { geometry } = feature;
    const poligonos = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    poligonos.forEach((aneis) => {
      if (geoArea({ type: "Polygon", coordinates: aneis }) > 2 * Math.PI) {
        aneis.forEach((anel) => anel.reverse());
      }
    });
  });
  return colecao;
}

const municipios = corrigirSentido(await lerJson("scripts/dados/geojs-21-mun.json"));
const vizinhos = (await Promise.all(VIZINHOS.map(lerVizinho))).map(corrigirSentido);

// Projeção: Mercator ajustada à largura do quadro
const projecao = geoMercator().fitWidth(LARGURA - 2 * MARGEM_X, municipios);
const [[x0, y0], [, y1]] = geoPath(projecao).bounds(municipios);
projecao.translate([
  projecao.translate()[0] + MARGEM_X - x0,
  projecao.translate()[1] + MARGEM_Y - y0,
]);
const ALTURA = Math.ceil(y1 - y0 + 2 * MARGEM_Y);
projecao.clipExtent([[0, 0], [LARGURA, ALTURA]]);

const caminhoSvg = geoPath(projecao).digits(1);

// Contornos dos estados vizinhos
const pathsVizinhos = vizinhos
  .flatMap((colecao) => colecao.features)
  .map((feature) => caminhoSvg(feature))
  .filter(Boolean)
  .map((d) => `    <path d="${d}"/>`);

// Contornos dos municípios
const pathsMunicipios = municipios.features.map(
  (feature) => `    <path d="${caminhoSvg(feature)}"><title>${feature.properties.name}</title></path>`
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA}" height="${ALTURA}" viewBox="0 0 ${LARGURA} ${ALTURA}" stroke-linecap="round" stroke-linejoin="round">
  <!-- Gerado por scripts/gerar-mapa.js (npm run mapa). Não edite à mão. -->
  <rect width="${LARGURA}" height="${ALTURA}" fill="${ESTILO.mar}"/>
  <g id="vizinhos" fill="${ESTILO.vizinhos}" stroke="${ESTILO.borda}" stroke-width="${ESTILO.bordaEstado}">
${pathsVizinhos.join("\n")}
  </g>
  <g id="municipios" fill="${ESTILO.municipios}" stroke="${ESTILO.borda}" stroke-width="${ESTILO.bordaMunicipio}">
${pathsMunicipios.join("\n")}
  </g>
</svg>
`;

// Centro de cada município na mesma projeção
const coordenadas = {};
const centrosFora = [];
for (const feature of municipios.features) {
  const nome = feature.properties.name;
  const [cx, cy] = geoPath(projecao).centroid(feature);
  coordenadas[nome] = {
    x: arredondar((cx / LARGURA) * 100),
    y: arredondar((cy / ALTURA) * 100),
  };

  if (!geoContains(feature, projecao.invert([cx, cy]))) {
    centrosFora.push(nome);
  }
}

// Lista dos nomes em ordem alfabética
const nomes = municipios.features
  .map((feature) => feature.properties.name)
  .sort((a, b) => a.localeCompare(b, "pt-BR"));

await writeFile(caminho("src/assets/mapa-maranhao.svg"), svg);
await writeFile(
  caminho("src/data/coordenadasMunicipios.json"),
  `${JSON.stringify(coordenadas, null, 2)}\n`
);
await writeFile(caminho("src/data/municipios.json"), `${JSON.stringify(nomes, null, 2)}\n`);

console.log(`Mapa ${LARGURA}x${ALTURA} · ${nomes.length} municípios · ${pathsVizinhos.length} estados vizinhos`);
console.log(`SVG: ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB`);
if (centrosFora.length > 0) {
  console.warn(
    `Aviso: centro fora do contorno em ${centrosFora.join(", ")}. ` +
      "Se o marcador ficar ruim, ajuste em src/sections/Comunidades/ajustesCoordenadas.js."
  );
}
