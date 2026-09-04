// SERVIÇO RESPONSÁVEL POR GRAVAR A IMPORTAÇÃO DO TV TIME NO GABIFLIX

import { supabase } from '../lib/supabase';
import type { Serie } from '../types/serie';
import type {
  SerieIdentificadaTvTime,
} from './importacao-identificacao.service';
import type {
  StatusUsuario,
} from './minha-lista.service';
import {
  buscarDetalhesTemporada,
  buscarEpisodioPorTvdbId,
  type EpisodioEncontradoPorIdExterno,
} from './tmdb.service';

// Série escolhida manualmente durante a revisão
export type MapaResolvidasManualmente =
  Record<string, Serie>;

// Séries que o usuário decidiu não importar
export type MapaIgnoradas =
  Record<string, boolean>;

export interface ProgressoImportacaoTvTime {
  etapa:
    | 'series'
    | 'episodios'
    | 'salvando';
  atual: number;
  total: number;
  descricao: string;
}

export interface ResumoImportacaoFinal {
  seriesNovas: number;
  seriesJaExistentes: number;
  episodiosNovos: number;
  episodiosJaExistentes: number;
  episodiosNaoCorrespondidos: number;
  seriesIgnoradas: number;
}

// Registro que será salvo na tabela episodios_assistidos
interface RegistroEpisodioImportado {
  user_id: string;
  serie_id: number;
  temporada_numero: number;
  episodio_id: number;
  episodio_numero: number;
  episodio_nome: string;
  imagem_path: string | null;
  assistido_em: string;
}

// Converte o status do TV Time para os estados existentes no Gabiflix.
// "up_to_date" continua como assistindo: estar em dia não significa
// necessariamente que uma série já terminou.
function mapearStatusTvTime(
  status: string
): StatusUsuario {
  switch (status) {
    case 'stopped':
      return 'abandonada';

    case 'not_started_yet':
    case 'watch_later':
      return 'quero_assistir';

    case 'continuing':
    case 'up_to_date':
    default:
      return 'assistindo';
  }
}

// Obtém a série TMDB que será usada na importação.
// Uma escolha manual tem prioridade sobre a associação automática.
function obterSerieTmdbResolvida(
  item: SerieIdentificadaTvTime,
  resolvidasManualmente: MapaResolvidasManualmente
): Serie | null {
  const manual =
    resolvidasManualmente[
      item.serieTvTime.uuid
    ];

  if (manual) {
    return manual;
  }

  return item.serieTmdb as Serie | null;
}

// Divide arrays grandes em lotes menores para evitar payloads enormes
function dividirEmLotes<T>(
  itens: T[],
  tamanho: number
): T[][] {
  const lotes: T[][] = [];

  for (
    let inicio = 0;
    inicio < itens.length;
    inicio += tamanho
  ) {
    lotes.push(
      itens.slice(inicio, inicio + tamanho)
    );
  }

  return lotes;
}

// Converte a data do TV Time para ISO quando possível
function converterDataAssistida(
  data: string | null
): string {
  if (!data) {
    return new Date().toISOString();
  }

  // O TV Time exporta "YYYY-MM-DD HH:mm:ss".
  // Trocamos apenas o espaço para deixar o valor interpretável.
  const normalizada =
    data.replace(' ', 'T');

  const convertida =
    new Date(normalizada);

  if (
    Number.isNaN(convertida.getTime())
  ) {
    return new Date().toISOString();
  }

  return convertida.toISOString();
}

// Importa séries e episódios sem excluir dados existentes.
// A função só deve ser chamada depois da revisão automática/manual.
export async function importarTvTimeParaGabiflix(
  resultados: SerieIdentificadaTvTime[],
  resolvidasManualmente: MapaResolvidasManualmente,
  ignoradas: MapaIgnoradas,
  onProgresso?: (
    progresso: ProgressoImportacaoTvTime
  ) => void
): Promise<ResumoImportacaoFinal> {
  const {
    data: dadosUsuario,
    error: erroUsuario,
  } = await supabase.auth.getUser();

  if (
    erroUsuario ||
    !dadosUsuario.user
  ) {
    throw new Error(
      'Você precisa estar conectada para importar seus dados.'
    );
  }

  const usuario =
    dadosUsuario.user;

  // Remove da importação tudo que foi explicitamente ignorado
  // ou que ainda não possui uma correspondência TMDB.
  const itensImportaveis =
    resultados
      .map((item) => ({
        item,
        serieTmdb:
          obterSerieTmdbResolvida(
            item,
            resolvidasManualmente
          ),
      }))
      .filter(
        ({ item, serieTmdb }) =>
          Boolean(serieTmdb) &&
          !ignoradas[
            item.serieTvTime.uuid
          ]
      ) as Array<{
        item: SerieIdentificadaTvTime;
        serieTmdb: Serie;
      }>;

  // Carrega uma única vez o que já existe no Gabiflix
  const {
    data: listaExistente,
    error: erroListaExistente,
  } = await supabase
    .from('minha_lista')
    .select(
      'serie_id, status_usuario, favorita'
    )
    .eq('user_id', usuario.id);

  if (erroListaExistente) {
    throw erroListaExistente;
  }

  const idsExistentes =
    new Set(
      (listaExistente ?? []).map(
        (registro) => registro.serie_id
      )
    );

  let seriesNovas = 0;
  let seriesJaExistentes = 0;

  // ----------------------------------------------------------------
  // ETAPA 1 — Minha Lista
  // ----------------------------------------------------------------
  onProgresso?.({
    etapa: 'series',
    atual: 0,
    total: itensImportaveis.length,
    descricao:
      'Preparando séries da sua lista...',
  });

  const registrosNovos = [];

  for (
    let indice = 0;
    indice < itensImportaveis.length;
    indice += 1
  ) {
    const {
      item,
      serieTmdb,
    } = itensImportaveis[indice];

    const jaExiste =
      idsExistentes.has(
        serieTmdb.id
      );

    if (jaExiste) {
      seriesJaExistentes += 1;

      // Não sobrescrevemos status atual.
      // Só promovemos favorita para true quando ela era favorita no TV Time.
      if (item.serieTvTime.is_favorite) {
        const { error } =
          await supabase
            .from('minha_lista')
            .update({
              favorita: true,
            })
            .eq(
              'user_id',
              usuario.id
            )
            .eq(
              'serie_id',
              serieTmdb.id
            );

        if (error) {
          throw error;
        }
      }
    } else {
      seriesNovas += 1;

      registrosNovos.push({
        user_id: usuario.id,
        serie_id: serieTmdb.id,
        nome: serieTmdb.name,
        poster_path:
          serieTmdb.poster_path ?? null,
        nota:
          serieTmdb.vote_average ?? null,
        ano:
          serieTmdb.first_air_date
            ?.substring(0, 4) ?? null,
        status_usuario:
          mapearStatusTvTime(
            item.serieTvTime.status
          ),
        favorita:
          item.serieTvTime.is_favorite,
      });

      // IMPORTANTE:
      // A partir deste momento o ID já está reservado para este lote.
      // Isso impede que outra entrada do TV Time associada ao mesmo TMDB ID
      // seja adicionada novamente antes de o lote chegar ao Supabase.
      idsExistentes.add(
        serieTmdb.id
      );
    }

    onProgresso?.({
      etapa: 'series',
      atual: indice + 1,
      total: itensImportaveis.length,
      descricao:
        `Preparando ${item.serieTvTime.title}`,
    });
  }

  // Insere séries novas em lotes.
  // O upsert com ignoreDuplicates é uma segunda proteção contra a restrição
  // unique(user_id, serie_id), inclusive se a importação for executada de novo.
  for (
    const lote of dividirEmLotes(
      registrosNovos,
      100
    )
  ) {
    const { error } =
      await supabase
        .from('minha_lista')
        .upsert(lote, {
          onConflict:
            'user_id,serie_id',
          ignoreDuplicates: true,
        });

    if (error) {
      throw error;
    }
  }

  // ----------------------------------------------------------------
  // ETAPA 2 — Episódios assistidos
  // ----------------------------------------------------------------
  const {
    data: episodiosExistentes,
    error: erroEpisodiosExistentes,
  } = await supabase
    .from('episodios_assistidos')
    .select('episodio_id')
    .eq('user_id', usuario.id);

  if (erroEpisodiosExistentes) {
    throw erroEpisodiosExistentes;
  }

  const idsEpisodiosExistentes =
    new Set(
      (episodiosExistentes ?? []).map(
        (registro) =>
          registro.episodio_id
      )
    );

  // Só precisamos consultar temporadas que possuem episódios assistidos.
  const temporadasParaProcessar =
    itensImportaveis.flatMap(
      ({ item, serieTmdb }) =>
        item.serieTvTime.seasons
          .filter(
            (temporada) =>
              !temporada.is_specials &&
              temporada.number > 0 &&
              temporada.episodes.some(
                (episodio) =>
                  episodio.is_watched
              )
          )
          .map((temporada) => ({
            item,
            serieTmdb,
            temporada,
          }))
    );

  let episodiosNovos = 0;
  let episodiosJaExistentes = 0;
  let episodiosNaoCorrespondidos = 0;

  const registrosEpisodios:
    RegistroEpisodioImportado[] = [];

  for (
    let indice = 0;
    indice <
    temporadasParaProcessar.length;
    indice += 1
  ) {
    const {
      item,
      serieTmdb,
      temporada,
    } =
      temporadasParaProcessar[
        indice
      ];

    onProgresso?.({
      etapa: 'episodios',
      atual: indice,
      total:
        temporadasParaProcessar.length,
      descricao:
        `${item.serieTvTime.title} • T${temporada.number}`,
    });

    const episodiosAssistidos =
      temporada.episodes.filter(
        (episodio) =>
          episodio.is_watched
      );

    // A temporada equivalente só é carregada se precisarmos do fallback.
    // Isso preserva o comportamento antigo para episódios sem TVDB ID.
    let temporadaTmdb:
      Awaited<ReturnType<typeof buscarDetalhesTemporada>> | null = null;
    let tentouCarregarTemporada = false;

    async function obterTemporadaFallback() {
      if (tentouCarregarTemporada) {
        return temporadaTmdb;
      }

      tentouCarregarTemporada = true;

      try {
        temporadaTmdb =
          await buscarDetalhesTemporada(
            serieTmdb.id,
            temporada.number
          );
      } catch {
        temporadaTmdb = null;
      }

      return temporadaTmdb;
    }

    for (
      const episodioTvTime of
      episodiosAssistidos
    ) {
      let episodioTmdb:
        EpisodioEncontradoPorIdExterno | null = null;

      // Estratégia principal:
      // cada episódio do export do TV Time possui seu próprio TVDB ID.
      // Usamos esse identificador para obter a temporada e o número
      // oficiais do episódio no TMDB, o que resolve séries cuja divisão
      // de temporadas difere entre TV Time/TVDB e TMDB.
      const tvdbIdEpisodio =
        episodioTvTime.id?.tvdb;

      if (tvdbIdEpisodio) {
        try {
          episodioTmdb =
            await buscarEpisodioPorTvdbId(
              tvdbIdEpisodio,
              serieTmdb.id
            );
        } catch {
          // Uma falha isolada no /find não cancela a importação.
          // Abaixo ainda tentamos a correspondência antiga.
          episodioTmdb = null;
        }
      }

      // Fallback antigo:
      // usado quando o episódio não possui TVDB ID ou quando o TMDB
      // ainda não cadastrou esse identificador externo.
      if (!episodioTmdb) {
        const temporadaFallback =
          await obterTemporadaFallback();

        if (temporadaFallback) {
          const episodioFallback =
            temporadaFallback.episodes.find(
              (episodio) =>
                episodio.episode_number ===
                episodioTvTime.number
            );

          if (episodioFallback) {
            episodioTmdb = {
              id: episodioFallback.id,
              name: episodioFallback.name,
              air_date: episodioFallback.air_date,
              episode_number:
                episodioFallback.episode_number,
              season_number:
                temporadaFallback.season_number,
              show_id: serieTmdb.id,
              still_path:
                episodioFallback.still_path,
            };
          }
        }
      }

      if (!episodioTmdb) {
        episodiosNaoCorrespondidos += 1;
        continue;
      }

      if (
        idsEpisodiosExistentes.has(
          episodioTmdb.id
        )
      ) {
        episodiosJaExistentes += 1;
        continue;
      }

      idsEpisodiosExistentes.add(
        episodioTmdb.id
      );

      episodiosNovos += 1;

      registrosEpisodios.push({
        user_id: usuario.id,
        serie_id: serieTmdb.id,

        // IMPORTANTE:
        // salvamos a temporada e o número retornados pelo TMDB,
        // não os números do TV Time. Isso mantém o histórico alinhado
        // com as telas Detalhes, Home e Continuar assistindo.
        temporada_numero:
          episodioTmdb.season_number,
        episodio_id:
          episodioTmdb.id,
        episodio_numero:
          episodioTmdb.episode_number,
        episodio_nome:
          episodioTmdb.name ||
          episodioTvTime.name,
        imagem_path:
          episodioTmdb.still_path ??
          null,
        assistido_em:
          converterDataAssistida(
            episodioTvTime.watched_at
          ),
      });
    }
  }

  onProgresso?.({
    etapa: 'salvando',
    atual: 0,
    total:
      registrosEpisodios.length,
    descricao:
      'Salvando episódios assistidos...',
  });

  // O banco já possui unique(user_id, episodio_id).
  // Upsert + ignoreDuplicates torna a operação segura caso algo tenha
  // sido salvo entre a leitura inicial e este momento.
  const lotesEpisodios =
    dividirEmLotes(
      registrosEpisodios,
      400
    );

  let episodiosSalvos = 0;

  for (
    const lote of lotesEpisodios
  ) {
    const { error } =
      await supabase
        .from(
          'episodios_assistidos'
        )
        .upsert(lote, {
          onConflict:
            'user_id,episodio_id',
          ignoreDuplicates: true,
        });

    if (error) {
      throw error;
    }

    episodiosSalvos +=
      lote.length;

    onProgresso?.({
      etapa: 'salvando',
      atual: episodiosSalvos,
      total:
        registrosEpisodios.length,
      descricao:
        'Salvando episódios assistidos...',
    });
  }

  return {
    seriesNovas,
    seriesJaExistentes,
    episodiosNovos,
    episodiosJaExistentes,
    episodiosNaoCorrespondidos,
    seriesIgnoradas:
      Object.keys(ignoradas).length,
  };
}
