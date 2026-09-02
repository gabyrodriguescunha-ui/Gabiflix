// SERVIÇO RESPONSÁVEL PELA COMUNICAÇÃO COM O TMDB

// Importa o tipo da resposta para manter os dados seguros no TypeScript
import type {
  DetalhesSerie,
  DetalhesTemporada,
  RespostaSeries,
} from '../types/serie';


// Representa o próximo episódio programado de uma série
export interface ProximoEpisodioSerie {
  id: number;
  name: string;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  still_path: string | null;
}

// Provedor de streaming retornado pelo TMDB para a região escolhida
export interface ProvedorStreaming {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

interface RespostaProvedoresStreaming {
  results: ProvedorStreaming[];
}


// Pessoa exibida na seção de elenco principal dos detalhes.
export interface PessoaElenco {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface RespostaCreditosSerie {
  cast: PessoaElenco[];
}

// Estrutura mínima retornada pelo TMDB para localizar o próximo episódio
interface RespostaProximoEpisodio {
  next_episode_to_air: ProximoEpisodioSerie | null;
}


// Estrutura mínima de uma série encontrada pelo endpoint /find do TMDB
export interface SerieEncontradaPorIdExterno {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  overview: string;
}

// Estrutura retornada pelo TMDB ao pesquisar um identificador externo
interface RespostaBuscaIdExterno {
  tv_results: SerieEncontradaPorIdExterno[];
}

// Endereço principal utilizado pelas requisições da API
const URL_BASE = 'https://api.themoviedb.org/3';

// Endereço principal utilizado para carregar as imagens
const URL_IMAGEM = 'https://image.tmdb.org/t/p';

// Recupera o Token de Leitura configurado no arquivo .env
const TOKEN_TMDB = process.env.EXPO_PUBLIC_TMDB_TOKEN;

// Configuração compartilhada pelas requisições ao TMDB
const opcoesRequisicao = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TOKEN_TMDB}`,
  },
};


// Busca as séries que estão em tendência durante a semana
export async function buscarSeriesEmAlta(): Promise<RespostaSeries> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/trending/tv/week?language=pt-BR`,
    opcoesRequisicao
  );

  // Transforma respostas de erro da API em erros do aplicativo
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<RespostaSeries>;
}


// Busca séries que estrearam recentemente e possuem disponibilidade registrada no Brasil
export async function buscarLancamentosRecentes(
  pagina: number = 1
): Promise<RespostaSeries> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  // Utiliza os últimos 30 dias como período de lançamentos recentes
  const hoje = new Date();
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(hoje.getDate() - 30);

  // Converte as datas para o formato YYYY-MM-DD esperado pelo TMDB
  const formatarData = (data: Date) =>
    data.toISOString().split('T')[0];

  const dataInicial = formatarData(trintaDiasAtras);
  const dataFinal = formatarData(hoje);

  const resposta = await fetch(
    `${URL_BASE}/discover/tv?language=pt-BR&page=${pagina}` +
      `&sort_by=first_air_date.desc` +
      `&first_air_date.gte=${dataInicial}` +
      `&first_air_date.lte=${dataFinal}` +
      `&watch_region=BR` +
      `&with_watch_monetization_types=flatrate|free|ads` +
      `&include_null_first_air_dates=false`,
    opcoesRequisicao
  );

  // Transforma respostas de erro da API em erros do aplicativo
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<RespostaSeries>;
}


// Busca as séries populares e solicita os textos em português do Brasil
export async function buscarSeriesPopulares(): Promise<RespostaSeries> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/tv/popular?language=pt-BR&page=1`,
    opcoesRequisicao
  );

  // Transforma respostas de erro da API em erros do aplicativo
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<RespostaSeries>;
}


// Busca os provedores de streaming disponíveis para séries no Brasil
export async function buscarProvedoresStreamingBrasil(): Promise<
  ProvedorStreaming[]
> {
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/watch/providers/tv?language=pt-BR&watch_region=BR`,
    opcoesRequisicao
  );

  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  const dados =
    (await resposta.json()) as RespostaProvedoresStreaming;

  return (dados.results ?? []).sort(
    (a, b) =>
      a.display_priority - b.display_priority
  );
}


// Períodos utilizados na descoberta por gênero
export type PeriodoDescoberta =
  | 'hoje'
  | 'semana'
  | 'mes'
  | 'todos';

// Descobre séries por gênero, período, streaming, país de origem e ordenação
export async function buscarSeriesPorGeneroPeriodo(
  generoId: number | null,
  periodo: PeriodoDescoberta,
  provedorId: number | null = null,
  paisOrigem: string | null = null,
  ordenacao:
    | 'recentes'
    | 'populares'
    | 'avaliados' = 'recentes',
  pagina: number = 1
): Promise<RespostaSeries> {
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const formatarData = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  };

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let dataInicial: string | null = null;
  let dataFinal: string | null = null;

  if (periodo === 'hoje') {
    dataInicial = formatarData(hoje);
    dataFinal = formatarData(hoje);
  }

  if (periodo === 'semana') {
    const inicioSemana = new Date(hoje);
    const diaSemana = inicioSemana.getDay();

    // Semana iniciando na segunda-feira
    const deslocamento =
      diaSemana === 0 ? -6 : 1 - diaSemana;

    inicioSemana.setDate(
      inicioSemana.getDate() + deslocamento
    );

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(
      fimSemana.getDate() + 6
    );

    dataInicial = formatarData(inicioSemana);
    dataFinal = formatarData(fimSemana);
  }

  if (periodo === 'mes') {
    const inicioMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      1
    );

    const fimMes = new Date(
      hoje.getFullYear(),
      hoje.getMonth() + 1,
      0
    );

    dataInicial = formatarData(inicioMes);
    dataFinal = formatarData(fimMes);
  }

  let url =
    `${URL_BASE}/discover/tv?language=pt-BR` +
    `&page=${pagina}` +
    `&watch_region=BR` +
    `&with_watch_monetization_types=flatrate|free|ads` +
    `&include_null_first_air_dates=false`;

  // "Todos" não envia with_genres, permitindo descobrir qualquer gênero.
  if (generoId !== null) {
    url += `&with_genres=${generoId}`;
  }

  // Usado pela categoria Anime: animação com origem japonesa.
  if (paisOrigem) {
    url += `&with_origin_country=${encodeURIComponent(paisOrigem)}`;
  }

  // Quando um streaming é escolhido, restringe a descoberta ao catálogo
  // que o TMDB registra para esse provedor no Brasil.
  if (provedorId !== null) {
    url += `&with_watch_providers=${provedorId}`;
  }

  const ordenarPor =
    ordenacao === 'avaliados'
      ? 'vote_average.desc'
      : ordenacao === 'populares'
        ? 'popularity.desc'
        : 'first_air_date.desc';

  url += `&sort_by=${ordenarPor}`;

  if (ordenacao === 'avaliados') {
    url += '&vote_count.gte=50';
  }

  if (
    periodo !== 'todos' &&
    dataInicial &&
    dataFinal
  ) {
    url +=
      `&first_air_date.gte=${dataInicial}` +
      `&first_air_date.lte=${dataFinal}`;
  }

  const resposta = await fetch(
    url,
    opcoesRequisicao
  );

  if (!resposta.ok) {
    throw new Error(
      `Erro do TMDB: ${resposta.status}`
    );
  }

  return resposta.json() as Promise<RespostaSeries>;
}


// Busca séries pelo nome informado pelo usuário
export async function buscarSeries(
  termo: string
): Promise<RespostaSeries> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  // Remove espaços desnecessários antes de realizar a pesquisa
  const termoPesquisa = termo.trim();

  // Evita enviar uma pesquisa vazia para o TMDB
  if (!termoPesquisa) {
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const resposta = await fetch(
    `${URL_BASE}/search/tv?query=${encodeURIComponent(
      termoPesquisa
    )}&language=pt-BR&page=1`,
    opcoesRequisicao
  );

  // Transforma respostas de erro da API em erros do aplicativo
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<RespostaSeries>;
}


// Localiza uma série do TMDB utilizando o ID da série no TVDB.
// O export do TV Time fornece esse ID, então esta é a forma mais segura
// de associar os registros sem depender somente do nome da série.
export async function buscarSeriePorTvdbId(
  tvdbId: number
): Promise<SerieEncontradaPorIdExterno | null> {
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/find/${tvdbId}?external_source=tvdb_id&language=pt-BR`,
    opcoesRequisicao
  );

  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  const dados =
    (await resposta.json()) as RespostaBuscaIdExterno;

  return dados.tv_results?.[0] ?? null;
}


// Busca somente o próximo episódio programado de uma série
export async function buscarProximoEpisodioSerie(
  idSerie: number
): Promise<ProximoEpisodioSerie | null> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/tv/${idSerie}?language=pt-BR`,
    opcoesRequisicao
  );

  // Transforma respostas de erro da API em erros do aplicativo
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  const dados =
    (await resposta.json()) as RespostaProximoEpisodio;

  return dados.next_episode_to_air ?? null;
}

// Busca todas as informações da série selecionada pelo usuário
export async function buscarDetalhesSerie(
  idSerie: number
): Promise<DetalhesSerie> {
  // Impede uma requisição sem o token configurado
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/tv/${idSerie}?language=pt-BR`,
    opcoesRequisicao
  );

  // Informa quando a série não pôde ser carregada
  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<DetalhesSerie>;
}

// Busca os primeiros nomes do elenco principal de uma série.
export async function buscarElencoPrincipal(
  idSerie: number,
  limite: number = 8
): Promise<PessoaElenco[]> {
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/tv/${idSerie}/credits?language=pt-BR`,
    opcoesRequisicao
  );

  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  const dados =
    (await resposta.json()) as RespostaCreditosSerie;

  return (dados.cast ?? [])
    .filter((pessoa) => pessoa.name)
    .sort((a, b) => a.order - b.order)
    .slice(0, limite);
}

// Busca os episódios de uma temporada específica
export async function buscarDetalhesTemporada(
  idSerie: number,
  numeroTemporada: number
): Promise<DetalhesTemporada> {
  if (!TOKEN_TMDB) {
    throw new Error('O Token de Leitura do TMDB não foi configurado.');
  }

  const resposta = await fetch(
    `${URL_BASE}/tv/${idSerie}/season/${numeroTemporada}?language=pt-BR`,
    opcoesRequisicao
  );

  if (!resposta.ok) {
    throw new Error(`Erro do TMDB: ${resposta.status}`);
  }

  return resposta.json() as Promise<DetalhesTemporada>;
}

// Monta a URL do logo de um provedor de streaming
export function obterUrlLogoProvedor(
  caminho: string | null
): string | null {
  if (!caminho) {
    return null;
  }

  return `${URL_IMAGEM}/w185${caminho}`;
}


// Monta a URL da imagem horizontal de um episódio
// Monta a foto vertical utilizada no elenco principal.
export function obterUrlPerfil(
  caminho: string | null
): string | null {
  if (!caminho) {
    return null;
  }

  return `${URL_IMAGEM}/w185${caminho}`;
}

export function obterUrlEpisodio(caminho: string | null): string | null {
  if (!caminho) {
    return null;
  }

  return `${URL_IMAGEM}/w500${caminho}`;
}

// Monta a URL completa de uma capa recebida da API
export function obterUrlCapa(caminho: string | null): string | null {
  if (!caminho) {
    return null;
  }

  return `${URL_IMAGEM}/w500${caminho}`;
}

// Monta a URL completa de uma imagem de fundo recebida da API
export function obterUrlFundo(caminho: string | null): string | null {
  if (!caminho) {
    return null;
  }

  return `${URL_IMAGEM}/w780${caminho}`;
}