// SERVIÇO RESPONSÁVEL POR LER O ARQUIVO DE EXPORTAÇÃO DO TV TIME

import JSZip from 'jszip';


// Identificador fornecido pelo TV Time para série ou episódio
export interface IdTvTime {
  tvdb: number | null;
  imdb: string | null;
}

// Episódio presente dentro do JSON exportado pelo TV Time
export interface EpisodioTvTime {
  id: IdTvTime;
  number: number;
  name: string;
  special: boolean;
  is_watched: boolean;
  watched_at: string | null;
  rewatch_count: number;
  watched_count: number;
}

// Temporada presente dentro de cada série
export interface TemporadaTvTime {
  number: number;
  is_specials: boolean;
  episodes: EpisodioTvTime[];
}

// Estrutura de uma série do arquivo tvtime-series-AAAA-MM-DD.json
export interface SerieTvTime {
  uuid: string;
  id: IdTvTime;
  created_at: string;
  title: string;
  status: string;
  is_favorite: boolean;
  _noEpisodeData: boolean;
  seasons: TemporadaTvTime[];
}

// Resumo calculado antes de qualquer dado ser importado
export interface ResumoImportacaoTvTime {
  nomeArquivoJson: string;
  totalSeries: number;
  totalFavoritas: number;
  totalEpisodios: number;
  episodiosAssistidos: number;
  seriesComProgresso: number;
  seriesSemEpisodios: number;
  statusEncontrados: Record<string, number>;
}

// Resultado completo utilizado pela tela de revisão
export interface LeituraTvTime {
  series: SerieTvTime[];
  resumo: ResumoImportacaoTvTime;
}

// Confere minimamente se o conteúdo possui o formato esperado
function validarSerieTvTime(valor: unknown): valor is SerieTvTime {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const serie = valor as Partial<SerieTvTime>;

  return (
    typeof serie.title === 'string' &&
    typeof serie.status === 'string' &&
    typeof serie.is_favorite === 'boolean' &&
    Array.isArray(serie.seasons)
  );
}

// Procura dentro do ZIP o JSON de séries.
// O export real enviado possui um arquivo como tvtime-series-2026-07-03.json.
function encontrarArquivoSeries(zip: JSZip): string | null {
  const nomes = Object.keys(zip.files);

  return (
    nomes.find((nome) =>
      /^tvtime-series-\d{4}-\d{2}-\d{2}\.json$/i.test(nome)
    ) ??
    nomes.find((nome) =>
      /tvtime-series.*\.json$/i.test(nome)
    ) ??
    null
  );
}

// Calcula informações úteis para a prévia antes da importação
function montarResumo(
  series: SerieTvTime[],
  nomeArquivoJson: string
): ResumoImportacaoTvTime {
  let totalEpisodios = 0;
  let episodiosAssistidos = 0;
  let seriesComProgresso = 0;
  let seriesSemEpisodios = 0;

  const statusEncontrados: Record<string, number> = {};

  for (const serie of series) {
    statusEncontrados[serie.status] =
      (statusEncontrados[serie.status] ?? 0) + 1;

    let assistidosDaSerie = 0;
    let episodiosDaSerie = 0;

    for (const temporada of serie.seasons) {
      episodiosDaSerie += temporada.episodes.length;

      for (const episodio of temporada.episodes) {
        if (episodio.is_watched) {
          assistidosDaSerie += 1;
        }
      }
    }

    totalEpisodios += episodiosDaSerie;
    episodiosAssistidos += assistidosDaSerie;

    if (assistidosDaSerie > 0) {
      seriesComProgresso += 1;
    }

    if (serie._noEpisodeData || episodiosDaSerie === 0) {
      seriesSemEpisodios += 1;
    }
  }

  return {
    nomeArquivoJson,
    totalSeries: series.length,
    totalFavoritas: series.filter(
      (serie) => serie.is_favorite
    ).length,
    totalEpisodios,
    episodiosAssistidos,
    seriesComProgresso,
    seriesSemEpisodios,
    statusEncontrados,
  };
}

// Valida o conteúdo JSON e monta o resultado usado pela tela.
function processarConteudoJson(
  textoJson: string,
  nomeArquivoJson: string
): LeituraTvTime {
  let conteudo: unknown;

  try {
    conteudo = JSON.parse(textoJson);
  } catch {
    throw new Error(
      'O JSON de séries do TV Time está inválido.'
    );
  }

  if (!Array.isArray(conteudo)) {
    throw new Error(
      'O arquivo de séries não possui o formato esperado.'
    );
  }

  const series =
    conteudo.filter(validarSerieTvTime);

  if (series.length === 0) {
    throw new Error(
      'Nenhuma série válida foi encontrada no arquivo.'
    );
  }

  return {
    series,
    resumo: montarResumo(
      series,
      nomeArquivoJson
    ),
  };
}

// Recebe a URI escolhida pelo DocumentPicker.
// Aceita tanto o JSON de séries diretamente quanto um ZIP do TV Time.
// Nesta primeira etapa nada é enviado ao Supabase.
export async function lerExportacaoTvTime(
  uriArquivo: string,
  nomeArquivo?: string
): Promise<LeituraTvTime> {
  const resposta = await fetch(uriArquivo);

  if (!resposta.ok) {
    throw new Error(
      'Não foi possível abrir o arquivo selecionado.'
    );
  }

  const nome =
    nomeArquivo?.toLowerCase() ?? '';

  // Caso mais simples: o usuário selecionou diretamente
  // tvtime-series-AAAA-MM-DD.json.
  if (nome.endsWith('.json')) {
    const textoJson = await resposta.text();

    return processarConteudoJson(
      textoJson,
      nomeArquivo ?? 'tvtime-series.json'
    );
  }

  // Mantemos compatibilidade com exportações compactadas em ZIP.
  if (nome.endsWith('.zip')) {
    const bytes = await resposta.arrayBuffer();
    const zip = await JSZip.loadAsync(bytes);

    const nomeArquivoJson =
      encontrarArquivoSeries(zip);

    if (!nomeArquivoJson) {
      throw new Error(
        'O ZIP não possui um arquivo de séries reconhecido do TV Time.'
      );
    }

    const arquivoSeries =
      zip.file(nomeArquivoJson);

    if (!arquivoSeries) {
      throw new Error(
        'Não foi possível ler o JSON de séries do TV Time.'
      );
    }

    const textoJson =
      await arquivoSeries.async('string');

    return processarConteudoJson(
      textoJson,
      nomeArquivoJson
    );
  }

  throw new Error(
    'Formato não reconhecido. Selecione um arquivo JSON ou ZIP do TV Time.'
  );
}