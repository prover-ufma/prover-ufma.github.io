import { useEffect, useMemo, useState } from "react";

import estatisticas from "../data/estatisticas.json";
import { API_URL } from "../utils/api";
import { padronizarChavesDeCidade } from "../utils/municipios";

// Nomes usados para guardar os dados no navegador (localStorage).
const CHAVE_CACHE = "periodosPorCidade";
const CHAVE_CACHE_ATUALIZACAO = "ultimaAtualizacao";

// Lê o que foi guardado na última visita, para a página já abrir com esses
// dados enquanto a API é consultada
function lerCache(chave) {
  try {
    const cache = JSON.parse(localStorage.getItem(chave));
    return cache && typeof cache === "object" ? cache : null;
  } catch {
    return null;
  }
}

// Guarda um valor no navegador para a próxima visita.
function salvarCache(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível (ex.: janela anônima)
  }
}

// Aceita só datas no formato { mes: 11, ano: 2026 }, com mês de 1 a 12
function validarAtualizacao(valor) {
  const mes = Number(valor?.mes);
  const ano = Number(valor?.ano);
  return Number.isInteger(mes) && mes >= 1 && mes <= 12 && Number.isInteger(ano)
    ? { mes, ano }
    : null;
}

// Busca na API as informações que podem mudar sem republicar o site: o
// período de atuação em cada cidade e o mês/ano da última atualização
async function buscarDadosPublicos() {
  const resposta = await fetch(API_URL, { cache: "no-store" });
  if (!resposta.ok) {
    throw new Error(`Erro na API: ${resposta.status}`);
  }
  const dados = await resposta.json();
  return {
    periodosPorCidade: dados?.periodosPorCidade ?? {},
    ultimaAtualizacao: validarAtualizacao(dados?.ultimaAtualizacao),
  };
}

// Reúne todos os dados que as seções do site usam
//
// Os totais (pessoas, cidades, comunidades, imagens e diagnósticos) vêm de
// src/data/estatisticas.json. Esse arquivo é gerado antes da publicação por
// npm run estatisticas e contém só números agregados, sem dados de pacientes.
// Para atualizar esses totais, é preciso gerar o arquivo de novo e republicar.
export function useDadosDoProjeto() {
  // Começa com o que estava guardado no navegador (ou vazio na primeira visita).
  const [periodosPorCidade, setPeriodosPorCidade] = useState(
    () => lerCache(CHAVE_CACHE) ?? {}
  );
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(() =>
    validarAtualizacao(lerCache(CHAVE_CACHE_ATUALIZACAO))
  );

  // Ao abrir a página, consulta a API uma vez e troca os dados guardados pelos
  // atuais. Se a API falhar, a página continua com os dados guardados.
  useEffect(() => {
    buscarDadosPublicos()
      .then(({ periodosPorCidade: periodos, ultimaAtualizacao: atualizacao }) => {
        setPeriodosPorCidade(periodos);
        salvarCache(CHAVE_CACHE, periodos);
        if (atualizacao) {
          setUltimaAtualizacao(atualizacao);
          salvarCache(CHAVE_CACHE_ATUALIZACAO, atualizacao);
        }
      })
      .catch((erro) => console.error("Erro ao buscar dados da planilha:", erro));
  }, []);

  // Os nomes de cidade da API podem estar escritos de formas diferentes, mas os
  // totais usam o nome oficial do município
  const periodosPadronizados = useMemo(
    () => padronizarChavesDeCidade(periodosPorCidade),
    [periodosPorCidade]
  );

  const dados = {
    periodosPorCidade: periodosPadronizados,
    ultimaAtualizacao,
    totalPacientes: estatisticas.totalPacientes,
    totalCidades: estatisticas.totalCidades,
    totalComunidades: estatisticas.totalComunidades,
    retinografias: estatisticas.retinografias,
    retinografiasPorCidade: estatisticas.retinografiasPorCidade,
    pessoasPorCidade: estatisticas.pessoasPorCidade,
    comunidadesPorCidade: estatisticas.comunidadesPorCidade,
    diagnosticos: estatisticas.diagnosticos,
  };

  return { dados, carregando: false };
}
