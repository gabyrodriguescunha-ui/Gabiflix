// SERVIÇO RESPONSÁVEL PELO PROGRESSO DOS EPISÓDIOS

// Cliente configurado para acessar o Supabase
import { supabase } from '../lib/supabase';
// Tipo de episódio recebido da API do TMDB
import type { Episodio } from '../types/serie';

// Registro usado para montar a página Continuar assistindo
export interface RegistroEpisodioAssistido {
  id: number;
  serie_id: number;
  temporada_numero: number;
  episodio_id: number;
  episodio_numero: number;
  episodio_nome: string;
  imagem_path: string | null;
  assistido_em: string;
}

// Normaliza os campos numéricos vindos do Supabase.
// Isso evita falhas de comparação caso algum valor seja retornado como string.
function normalizarRegistroEpisodio(
  registro: RegistroEpisodioAssistido
): RegistroEpisodioAssistido {
  return {
    ...registro,
    id: Number(registro.id),
    serie_id: Number(registro.serie_id),
    temporada_numero: Number(registro.temporada_numero),
    episodio_id: Number(registro.episodio_id),
    episodio_numero: Number(registro.episodio_numero),
  };
}

// Confere um episódio por duas chaves:
// 1) ID real do TMDB;
// 2) série + temporada + número do episódio.
// A segunda chave protege históricos importados caso o ID tenha mudado
// ou tenha sido salvo por uma correspondência antiga.
export function registroCorrespondeEpisodio(
  registro: RegistroEpisodioAssistido,
  idSerie: number,
  numeroTemporada: number,
  idEpisodio: number,
  numeroEpisodio: number
): boolean {
  const mesmaSerie =
    Number(registro.serie_id) === Number(idSerie);

  if (!mesmaSerie) {
    return false;
  }

  if (
    Number(registro.episodio_id) ===
    Number(idEpisodio)
  ) {
    return true;
  }

  return (
    Number(registro.temporada_numero) ===
      Number(numeroTemporada) &&
    Number(registro.episodio_numero) ===
      Number(numeroEpisodio)
  );
}


// Cache curto do histórico por usuário. É invalidado imediatamente sempre
// que um episódio é marcado ou desmarcado.
const CACHE_HISTORICO_MS = 60 * 1000;
const cacheHistorico = new Map<
  string,
  { dados: RegistroEpisodioAssistido[]; expiraEm: number }
>();

function invalidarCacheHistorico(userId?: string) {
  if (userId) {
    cacheHistorico.delete(userId);
    return;
  }

  cacheHistorico.clear();
}

// Recupera o usuário autenticado antes de acessar seu progresso
async function obterUsuarioConectado() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Você precisa estar conectado para salvar o progresso.');
  }

  return data.user;
}

// Busca os IDs dos episódios assistidos de uma temporada
export async function buscarEpisodiosAssistidos(
  idSerie: number,
  numeroTemporada: number
): Promise<number[]> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select('episodio_id')
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie)
    .eq('temporada_numero', numeroTemporada);

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (registro) => Number(registro.episodio_id)
  );
}

// Busca os IDs de todos os episódios assistidos de uma série,
// independentemente da temporada. É usado para conferir conclusão automática.
export async function buscarTodosEpisodiosAssistidosDaSerie(
  idSerie: number
): Promise<number[]> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select('episodio_id')
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie);

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    (registro) => Number(registro.episodio_id)
  );
}


// Busca somente os episódios mais recentes para o primeiro carregamento.
// A tela pode exibir conteúdo quase imediatamente e completar o histórico
// inteiro em segundo plano logo depois.
export interface PaginaHistoricoAssistido {
  dados: RegistroEpisodioAssistido[];
  temMais: boolean;
}

// Busca apenas uma página do histórico. Diferente de buscarHistoricoAssistido(),
// esta função nunca baixa o histórico inteiro em segundo plano.
export async function buscarPaginaHistoricoAssistido(
  pagina: number,
  tamanhoPagina: number = 100
): Promise<PaginaHistoricoAssistido> {
  const usuario = await obterUsuarioConectado();

  const paginaSegura = Math.max(0, pagina);
  const tamanhoSeguro = Math.max(1, tamanhoPagina);
  const inicio = paginaSegura * tamanhoSeguro;

  // Busca um registro extra apenas para descobrir se existe próxima página.
  const fim = inicio + tamanhoSeguro;

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select(
      'id, serie_id, temporada_numero, episodio_id, episodio_numero, episodio_nome, imagem_path, assistido_em'
    )
    .eq('user_id', usuario.id)
    .order('assistido_em', { ascending: false })
    .range(inicio, fim);

  if (error) {
    throw error;
  }

  const registros = ((data ?? []) as RegistroEpisodioAssistido[])
    .map(normalizarRegistroEpisodio);

  return {
    dados: registros.slice(0, tamanhoSeguro),
    temMais: registros.length > tamanhoSeguro,
  };
}


export async function buscarHistoricoAssistidoRecente(
  limite: number = 200
): Promise<RegistroEpisodioAssistido[]> {
  const usuario = await obterUsuarioConectado();

  // Se o histórico completo já estiver em cache, reaproveitamos os primeiros
  // registros sem fazer uma nova consulta ao Supabase.
  const salvo = cacheHistorico.get(usuario.id);
  if (salvo && salvo.expiraEm > Date.now()) {
    return salvo.dados.slice(0, limite);
  }

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select(
      'id, serie_id, temporada_numero, episodio_id, episodio_numero, episodio_nome, imagem_path, assistido_em'
    )
    .eq('user_id', usuario.id)
    .order('assistido_em', { ascending: false })
    .limit(limite);

  if (error) {
    throw error;
  }

  return ((data ?? []) as RegistroEpisodioAssistido[])
    .map(normalizarRegistroEpisodio);
}


// Conta quantos episódios o usuário marcou como assistidos sem baixar
// todos os registros. É usado em telas que precisam apenas da quantidade,
// como o Perfil.
export async function contarEpisodiosAssistidos(): Promise<number> {
  const usuario = await obterUsuarioConectado();

  const { count, error } = await supabase
    .from('episodios_assistidos')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('user_id', usuario.id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}


// Busca todo o histórico necessário para montar o resumo de cada série
export async function buscarHistoricoAssistido(): Promise<
  RegistroEpisodioAssistido[]
> {
  const usuario = await obterUsuarioConectado();

  const salvo = cacheHistorico.get(usuario.id);
  if (salvo && salvo.expiraEm > Date.now()) {
    return salvo.dados;
  }

  // O Supabase limita a quantidade de linhas retornadas por consulta.
  // Como uma importação pode possuir milhares de episódios, buscamos o
  // histórico em páginas para não perder registros antigos.
  const TAMANHO_PAGINA = 1000;
  const todosRegistros: RegistroEpisodioAssistido[] = [];

  for (let inicio = 0; ; inicio += TAMANHO_PAGINA) {
    const fim = inicio + TAMANHO_PAGINA - 1;

    const { data, error } = await supabase
      .from('episodios_assistidos')
      .select(
        'id, serie_id, temporada_numero, episodio_id, episodio_numero, episodio_nome, imagem_path, assistido_em'
      )
      .eq('user_id', usuario.id)
      .order('assistido_em', { ascending: false })
      .range(inicio, fim);

    if (error) {
      throw error;
    }

    const pagina =
      ((data ?? []) as RegistroEpisodioAssistido[])
        .map(normalizarRegistroEpisodio);

    todosRegistros.push(...pagina);

    if (pagina.length < TAMANHO_PAGINA) {
      break;
    }
  }

  const resultado = todosRegistros;

  cacheHistorico.set(usuario.id, {
    dados: resultado,
    expiraEm: Date.now() + CACHE_HISTORICO_MS,
  });

  return resultado;
}

// Registra que um episódio foi assistido pelo usuário
export async function marcarEpisodiosAssistidos(
  idSerie: number,
  numeroTemporada: number,
  episodios: Episodio[]
): Promise<void> {
  if (episodios.length === 0) {
    return;
  }

  const usuario = await obterUsuarioConectado();

  // Transforma cada episódio em um registro da tabela
  const registros = episodios.map((episodio) => ({
    user_id: usuario.id,
    serie_id: idSerie,
    temporada_numero: numeroTemporada,
    episodio_id: episodio.id,
    episodio_numero: episodio.episode_number,
    episodio_nome: episodio.name,
    imagem_path: episodio.still_path,
  }));

  // Usa upsert com ignoreDuplicates para respeitar a restrição
  // unique (user_id, episodio_id) sem gerar erro caso algum episódio
  // já esteja salvo para o usuário.
  const { error } = await supabase
    .from('episodios_assistidos')
    .upsert(registros, {
      onConflict: 'user_id,episodio_id',
      ignoreDuplicates: true,
    });

  if (error) {
    throw error;
  }

  invalidarCacheHistorico(usuario.id);
}

// Remove a marcação de assistido de um episódio
export async function desmarcarEpisodioAssistido(
  idEpisodio: number
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const { error } = await supabase
    .from('episodios_assistidos')
    .delete()
    .eq('user_id', usuario.id)
    .eq('episodio_id', idEpisodio);

  if (error) {
    throw error;
  }

  invalidarCacheHistorico(usuario.id);
}

// Desmarca o episódio selecionado e todos os episódios seguintes da temporada
export async function desmarcarEpisodiosSeguintes(
  idSerie: number,
  numeroTemporada: number,
  numeroEpisodioInicial: number
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const { error } = await supabase
    .from('episodios_assistidos')
    .delete()
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie)
    .eq('temporada_numero', numeroTemporada)
    .gte('episodio_numero', numeroEpisodioInicial);

  if (error) {
    throw error;
  }

  invalidarCacheHistorico(usuario.id);
}


// Verifica se ainda existe pelo menos um episódio assistido da série
export async function seriePossuiEpisodiosAssistidos(
  idSerie: number
): Promise<boolean> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select('id')
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data ?? []).length > 0;
}