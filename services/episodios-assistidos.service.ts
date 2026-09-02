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

  return (data ?? []).map((registro) => registro.episodio_id);
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
    (registro) => registro.episodio_id
  );
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

  const { data, error } = await supabase
    .from('episodios_assistidos')
    .select(
      'id, serie_id, temporada_numero, episodio_id, episodio_numero, episodio_nome, imagem_path, assistido_em'
    )
    .eq('user_id', usuario.id)
    .order('assistido_em', { ascending: false });

  if (error) {
    throw error;
  }

  const resultado = (data ?? []) as RegistroEpisodioAssistido[];

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