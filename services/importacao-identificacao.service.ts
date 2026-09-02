// SERVIÇO RESPONSÁVEL POR ASSOCIAR SÉRIES DO TV TIME AO TMDB

import type { Serie } from '../types/serie';
import type {
  SerieTvTime,
} from './importacao-tvtime.service';
import {
  buscarSeriePorTvdbId,
  buscarSeries,
  type SerieEncontradaPorIdExterno,
} from './tmdb.service';

// Resultado individual usado na tela de revisão
export type StatusIdentificacao =
  | 'encontrada_tvdb'
  | 'encontrada_titulo'
  | 'nao_encontrada'
  | 'sem_tvdb'
  | 'erro';

export interface SerieIdentificadaTvTime {
  serieTvTime: SerieTvTime;
  serieTmdb: SerieEncontradaPorIdExterno | Serie | null;
  status: StatusIdentificacao;
  mensagem?: string;
}

// Resumo mostrado ao usuário antes de qualquer importação
export interface ResumoIdentificacaoTvTime {
  total: number;
  encontradasTvdb: number;
  encontradasTitulo: number;
  encontradasTotal: number;
  naoEncontradas: number;
  semTvdb: number;
  comErro: number;
}

// Atualização usada para mostrar a barra/contador de progresso na tela
export interface ProgressoIdentificacao {
  processadas: number;
  total: number;
}

// Número de requisições paralelas.
// Mantemos baixo para não sobrecarregar a API e o aparelho.
const TAMANHO_LOTE = 6;

// Remove acentos, pontuação, ano entre parênteses e diferenças de caixa
// para comparar os títulos do TV Time e do TMDB.
function normalizarTitulo(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(\s*\d{4}\s*\)\s*$/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}

// Extrai um ano explícito do título, como "Monster (2022)".
function extrairAnoDoTitulo(
  titulo: string
): string | null {
  const correspondencia =
    titulo.match(/\((\d{4})\)\s*$/);

  return correspondencia?.[1] ?? null;
}

// Tenta encontrar uma correspondência segura entre os resultados da busca.
// Não escolhemos simplesmente o primeiro resultado: exigimos título exato
// após normalização e, quando o TV Time fornece ano no título, o ano também.
function escolherCorrespondenciaPorTitulo(
  tituloTvTime: string,
  resultados: Serie[]
): Serie | null {
  const tituloNormalizado =
    normalizarTitulo(tituloTvTime);

  const anoEsperado =
    extrairAnoDoTitulo(tituloTvTime);

 const exatas = resultados.filter(
  (serie) => {
    const nome =
      normalizarTitulo(serie.name ?? '');

    return nome === tituloNormalizado;
  }
);

  // Se o título contém ano, usamos esse dado para desempatar.
  if (anoEsperado) {
    const comAno = exatas.filter(
      (serie) =>
        serie.first_air_date
          ?.substring(0, 4) === anoEsperado
    );

    if (comAno.length === 1) {
      return comAno[0];
    }

    return null;
  }

  // Sem ano explícito, aceitamos apenas uma única correspondência exata.
  if (exatas.length === 1) {
    return exatas[0];
  }

  return null;
}

// Segunda estratégia: pesquisa pelo título somente quando o TVDB falhar.
async function identificarPorTitulo(
  serie: SerieTvTime
): Promise<SerieIdentificadaTvTime | null> {
  try {
    // Remove somente o ano final para melhorar a busca no TMDB,
    // mas a validação posterior ainda usa esse ano quando existir.
    const termoPesquisa =
      serie.title.replace(
        /\s*\(\d{4}\)\s*$/,
        ''
      );

    const resposta =
      await buscarSeries(termoPesquisa);

    const correspondencia =
      escolherCorrespondenciaPorTitulo(
        serie.title,
        resposta.results
      );

    if (!correspondencia) {
      return null;
    }

    return {
      serieTvTime: serie,
      serieTmdb: correspondencia,
      status: 'encontrada_titulo',
      mensagem:
        'Identificada pelo título após o TVDB não retornar correspondência.',
    };
  } catch {
    // A falha no fallback não transforma uma série que apenas não foi
    // encontrada em erro global; ela continuará para revisão manual.
    return null;
  }
}

// Identifica uma única série usando primeiro o TVDB ID fornecido pelo TV Time
// e, se necessário, tenta uma busca segura pelo título.
async function identificarSerie(
  serie: SerieTvTime
): Promise<SerieIdentificadaTvTime> {
  const tvdbId = serie.id?.tvdb;

  if (!tvdbId) {
    const porTitulo =
      await identificarPorTitulo(serie);

    if (porTitulo) {
      return porTitulo;
    }

    return {
      serieTvTime: serie,
      serieTmdb: null,
      status: 'sem_tvdb',
      mensagem:
        'A série não possui TVDB ID e não foi identificada com segurança pelo título.',
    };
  }

  try {
    const serieTmdb =
      await buscarSeriePorTvdbId(tvdbId);

    if (serieTmdb) {
      return {
        serieTvTime: serie,
        serieTmdb,
        status: 'encontrada_tvdb',
      };
    }

    // TVDB não retornou nada: tenta o título antes de mandar para revisão.
    const porTitulo =
      await identificarPorTitulo(serie);

    if (porTitulo) {
      return porTitulo;
    }

    return {
      serieTvTime: serie,
      serieTmdb: null,
      status: 'nao_encontrada',
      mensagem:
        'TVDB e busca segura por título não encontraram correspondência.',
    };
  } catch (erro) {
    return {
      serieTvTime: serie,
      serieTmdb: null,
      status: 'erro',
      mensagem:
        erro instanceof Error
          ? erro.message
          : 'Falha ao consultar o TMDB.',
    };
  }
}

// Processa todas as séries em pequenos lotes.
// Ainda não salva absolutamente nada no Supabase.
export async function identificarSeriesTvTimeNoTmdb(
  series: SerieTvTime[],
  onProgresso?: (
    progresso: ProgressoIdentificacao
  ) => void
): Promise<{
  resultados: SerieIdentificadaTvTime[];
  resumo: ResumoIdentificacaoTvTime;
}> {
  const resultados: SerieIdentificadaTvTime[] = [];
  let processadas = 0;

  for (
    let inicio = 0;
    inicio < series.length;
    inicio += TAMANHO_LOTE
  ) {
    const lote =
      series.slice(inicio, inicio + TAMANHO_LOTE);

    const resultadosLote =
      await Promise.all(
        lote.map(identificarSerie)
      );

    resultados.push(...resultadosLote);

    processadas += resultadosLote.length;

    onProgresso?.({
      processadas,
      total: series.length,
    });
  }

  const encontradasTvdb =
    resultados.filter(
      (item) =>
        item.status === 'encontrada_tvdb'
    ).length;

  const encontradasTitulo =
    resultados.filter(
      (item) =>
        item.status === 'encontrada_titulo'
    ).length;

  const resumo: ResumoIdentificacaoTvTime = {
    total: resultados.length,
    encontradasTvdb,
    encontradasTitulo,
    encontradasTotal:
      encontradasTvdb + encontradasTitulo,
    naoEncontradas: resultados.filter(
      (item) => item.status === 'nao_encontrada'
    ).length,
    semTvdb: resultados.filter(
      (item) => item.status === 'sem_tvdb'
    ).length,
    comErro: resultados.filter(
      (item) => item.status === 'erro'
    ).length,
  };

  return {
    resultados,
    resumo,
  };
}

// Busca candidatos para a revisão manual.
// Diferente da associação automática, aqui devolvemos os resultados ao usuário
// para que ele escolha conscientemente a correspondência correta.
export async function buscarCandidatosRevisaoManual(
  tituloTvTime: string
): Promise<Serie[]> {
  const termoPesquisa =
    tituloTvTime.replace(/\s*\(\d{4}\)\s*$/, '');

  const resposta = await buscarSeries(termoPesquisa);

  return resposta.results.slice(0, 8);
}