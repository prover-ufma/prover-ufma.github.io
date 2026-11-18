import { DOENCAS_CONTABILIZADAS } from "../sections/Resultados/doencas.js";
import { nomeOficialOuOriginal } from "./municipios.js";
import { normalizarIdPhelcom, normalizarTexto } from "./texto.js";

// Funções que transformam a lista de exames nos totais exibidos no site
// Cada pessoa é contada pelo seu identificador, e o site recebe só os totais
// Os nomes de cidade são convertidos para o nome oficial do município antes
// da soma, então grafias diferentes do mesmo município entram no mesmo total.

// Converte um objeto { id: valor } em um Map com os identificadores
// padronizados, para que a busca por id funcione mesmo com grafias diferentes
function mapearPorIdNormalizado(valoresPorId) {
  return new Map(
    Object.entries(valoresPorId ?? {}).map(([id, valor]) => [
      normalizarIdPhelcom(id),
      valor,
    ])
  );
}

// Soma uma quantidade ao total de um nome, ignorando diferenças de escrita.
// Guarda a primeira forma do nome que apareceu, para exibição.
function somarPorNome(totais, nome, quantidade) {
  const chave = normalizarTexto(nome);
  const existente = totais.get(chave);
  totais.set(chave, {
    nome: existente?.nome ?? nome,
    quantidade: (existente?.quantidade ?? 0) + quantidade,
  });
}

// Converte os totais em um objeto
function totaisParaObjeto(totais) {
  return Object.fromEntries(
    [...totais.values()].map(({ nome, quantidade }) => [nome, quantidade])
  );
}

// Calcula o total de imagens e de pessoas, no geral e por cidade
export function agregarRetinografiasPorCidade(relatorios, cidadePorId) {
  const cidades = mapearPorIdNormalizado(cidadePorId);
  const imagensPorCidade = new Map();
  const pessoasPorCidade = new Map();
  const idsPorCidade = new Map();
  const idsPhelcom = new Set();
  let total = 0;
  let relatoriosSemCidade = 0;
  let imagensSemCidade = 0;

  relatorios.forEach((relatorio) => {
    const quantidadeImagens = Array.isArray(relatorio?.images)
      ? relatorio.images.length
      : 0;
    total += quantidadeImagens;

    const id = normalizarIdPhelcom(relatorio?.id_phelcom);
    if (id) {
      idsPhelcom.add(id);
    }

    const cidade = cidades.get(id);
    if (!id || typeof cidade !== "string" || !cidade.trim()) {
      relatoriosSemCidade++;
      imagensSemCidade += quantidadeImagens;
      return;
    }

    const nomeCidade = nomeOficialOuOriginal(cidade);
    somarPorNome(imagensPorCidade, nomeCidade, quantidadeImagens);

    const chaveCidade = normalizarTexto(nomeCidade);
    const idsDaCidade = idsPorCidade.get(chaveCidade) ?? new Set();
    if (!idsDaCidade.has(id)) {
      idsDaCidade.add(id);
      idsPorCidade.set(chaveCidade, idsDaCidade);
      somarPorNome(pessoasPorCidade, nomeCidade, 1);
    }
  });

  return {
    total,
    totalPacientes: idsPhelcom.size,
    relatoriosSemCidade,
    imagensSemCidade,
    porCidade: totaisParaObjeto(imagensPorCidade),
    pessoasPorCidade: totaisParaObjeto(pessoasPorCidade),
  };
}

// Nome exibido no lugar da comunidade quando ela não foi informada na
// planilha, a partir da coluna TERRITÓRIO. Os textos são traduzidos no site.
export const LOCALIDADE_NAO_INFORMADA = "Comunidade não informada";

export function rotuloDoTerritorio(territorio) {
  const texto = normalizarTexto(territorio);
  if (texto.includes("quilomb")) return "Localidade quilombola";
  if (texto.includes("ribeirinh")) return "Comunidade ribeirinha";
  if (texto.includes("indigena") || texto.includes("aldeia")) return "Aldeia indígena";
  return LOCALIDADE_NAO_INFORMADA;
}

// Soma as imagens de cada comunidade dentro de cada cidade. Sem comunidade
// informada, as imagens entram no rótulo do território (ex.: "Localidade quilombola").
export function agregarImagensPorComunidadeDaCidade(
  relatorios,
  cidadePorId,
  comunidadePorId,
  territorioPorId
) {
  const cidades = mapearPorIdNormalizado(cidadePorId);
  const comunidades = mapearPorIdNormalizado(comunidadePorId);
  const territorios = mapearPorIdNormalizado(territorioPorId);
  const totaisPorCidade = new Map();

  relatorios.forEach((relatorio) => {
    const quantidadeImagens = Array.isArray(relatorio?.images)
      ? relatorio.images.length
      : 0;
    const id = normalizarIdPhelcom(relatorio?.id_phelcom);
    const cidade = cidades.get(id);
    if (!id || typeof cidade !== "string" || !cidade.trim()) {
      return;
    }

    const nomeCidade = nomeOficialOuOriginal(cidade);
    const chaveCidade = normalizarTexto(nomeCidade);
    const cidadeExistente = totaisPorCidade.get(chaveCidade) ?? {
      nome: nomeCidade,
      comunidades: new Map(),
    };
    totaisPorCidade.set(chaveCidade, cidadeExistente);

    const comunidade = comunidades.get(id);
    const nomeComunidade =
      (typeof comunidade === "string" && comunidade.trim()) ||
      rotuloDoTerritorio(territorios.get(id));
    somarPorNome(cidadeExistente.comunidades, nomeComunidade, quantidadeImagens);
  });

  return Object.fromEntries(
    [...totaisPorCidade.values()].map(({ nome, comunidades: totais }) => [
      nome,
      totaisParaObjeto(totais),
    ])
  );
}

// Conta quantas comunidades diferentes foram atendidas
export function contarComunidadesAtendidas(relatorios, comunidadePorId) {
  const comunidades = mapearPorIdNormalizado(comunidadePorId);
  const idsContabilizados = new Set();
  const comunidadesAtendidas = new Set();
  let pessoasSemComunidade = 0;

  relatorios.forEach((relatorio) => {
    const id = normalizarIdPhelcom(relatorio?.id_phelcom);
    if (!id || idsContabilizados.has(id)) {
      return;
    }

    idsContabilizados.add(id);
    const comunidade = comunidades.get(id);
    if (typeof comunidade !== "string" || !comunidade.trim()) {
      pessoasSemComunidade++;
      return;
    }

    comunidadesAtendidas.add(normalizarTexto(comunidade));
  });

  return {
    total: comunidadesAtendidas.size,
    pessoasSemComunidade,
  };
}

// Relaciona cada diagnóstico registrado no exame às alterações exibidas no site.
// Um mesmo diagnóstico pode contar para mais de uma doença
const DOENCAS_POR_PATOLOGIA = Object.entries(DOENCAS_CONTABILIZADAS).reduce(
  (mapa, [doenca, patologias]) => {
    patologias.forEach((patologia) => {
      const chave = normalizarTexto(patologia);
      mapa.set(chave, [...(mapa.get(chave) ?? []), doenca]);
    });
    return mapa;
  },
  new Map()
);

// Conta quantas pessoas têm cada doença, se a mesma pessoa tiver a doença em vários exames,
//  ela conta uma vez só.
export function contarDiagnosticosPorId(relatorios) {
  const doencasPorId = new Map();

  relatorios.forEach((relatorio) => {
    const id = normalizarIdPhelcom(relatorio?.id_phelcom);
    const patologias = relatorio?.diagnosis?.pathologies;
    if (!id || !Array.isArray(patologias)) {
      return;
    }

    const doencasDoId = doencasPorId.get(id) ?? new Set();
    patologias.forEach((patologia) => {
      if (typeof patologia !== "string") {
        return;
      }

      DOENCAS_POR_PATOLOGIA.get(normalizarTexto(patologia))?.forEach(
        (doenca) => doencasDoId.add(doenca)
      );
    });
    doencasPorId.set(id, doencasDoId);
  });

  const contagens = {};
  doencasPorId.forEach((doencas) => {
    doencas.forEach((doenca) => {
      contagens[doenca] = (contagens[doenca] ?? 0) + 1;
    });
  });
  return contagens;
}
