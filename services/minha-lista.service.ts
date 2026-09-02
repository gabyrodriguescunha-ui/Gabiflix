// SERVIÇO RESPONSÁVEL PELA LISTA PESSOAL DO USUÁRIO

// Cliente já configurado com a URL e a chave pública do Supabase
import { supabase } from '../lib/supabase';

// Tipo completo de uma série recebido do TMDB
import type { DetalhesSerie } from '../types/serie';

// Formato de cada registro recuperado da tabela minha_lista
export interface ItemMinhaLista {
  id: number;
  serie_id: number;
  nome: string;
  poster_path: string | null;
  nota: number | null;
  ano: string | null;
  criado_em: string;
  status_usuario: StatusUsuario;
  favorita: boolean;
  iniciada_em: string | null;
  concluida_em: string | null;
}

// Estados que podem ser escolhidos manualmente pelo usuário
export type StatusUsuario =
  | 'quero_assistir'
  | 'assistindo'
  | 'pausada'
  | 'finalizada'
  | 'abandonada'
  | 'reassistindo';

// Recupera o usuário autenticado antes de consultar ou alterar sua lista
async function obterUsuarioConectado() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error(
      'Você precisa estar conectado para usar a sua lista.'
    );
  }

  return data.user;
}

// Busca os dados salvos de uma série específica na lista do usuário
export async function buscarSerieNaLista(
  idSerie: number
): Promise<ItemMinhaLista | null> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('minha_lista')
    .select(
      'id, serie_id, nome, poster_path, nota, ano, criado_em, status_usuario, favorita, iniciada_em, concluida_em'
    )
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ItemMinhaLista | null;
}

// Verifica se determinada série já foi salva pelo usuário
export async function verificarSerieNaLista(
  idSerie: number
): Promise<boolean> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('minha_lista')
    .select('id')
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

// Busca todas as séries salvas pelo usuário, começando pela mais recente
export async function buscarMinhaLista(): Promise<ItemMinhaLista[]> {
  const usuario = await obterUsuarioConectado();

  const { data, error } = await supabase
    .from('minha_lista')
    .select(
      'id, serie_id, nome, poster_path, nota, ano, criado_em, status_usuario, favorita, iniciada_em, concluida_em'
    )
    .eq('user_id', usuario.id)
    .order('criado_em', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as ItemMinhaLista[];
}

// Atualiza o estado escolhido para uma série da lista
export async function atualizarStatusSerie(
  idSerie: number,
  status: StatusUsuario
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const agora = new Date().toISOString();

  const alteracoes: Record<
    string,
    string | null
  > = {
    status_usuario: status,
  };

  // Guarda a data em que a série começou ou foi reiniciada
  if (
    status === 'assistindo' ||
    status === 'reassistindo'
  ) {
    alteracoes.iniciada_em = agora;
  }

  // Guarda a data em que a série foi marcada como finalizada
  if (status === 'finalizada') {
    alteracoes.concluida_em = agora;
  } else {
    // Limpa a conclusão quando a série volta para outro status
    alteracoes.concluida_em = null;
  }

  const { error } = await supabase
    .from('minha_lista')
    .update(alteracoes)
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie);

  if (error) {
    throw error;
  }
}

// Salva as informações necessárias para reconstruir o card posteriormente
export async function adicionarSerieNaLista(
  serie: DetalhesSerie
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const { error } = await supabase
    .from('minha_lista')
    .insert({
      user_id: usuario.id,
      serie_id: serie.id,
      nome: serie.name,
      poster_path: serie.poster_path,
      nota: serie.vote_average,
      ano:
        serie.first_air_date?.substring(
          0,
          4
        ) || null,
      status_usuario: 'quero_assistir',
      favorita: false,
    });

  if (error) {
    throw error;
  }
}

// Remove a série apenas da lista pertencente ao usuário conectado
export async function removerSerieDaLista(
  idSerie: number
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const { error } = await supabase
    .from('minha_lista')
    .delete()
    .eq('user_id', usuario.id)
    .eq('serie_id', idSerie);

  if (error) {
    throw error;
  }
}

// Apaga a série da lista e todo o progresso salvo nos episódios
export async function excluirSerieCompletamente(
  idSerie: number
): Promise<void> {
  const usuario = await obterUsuarioConectado();

  const { error: erroEpisodios } =
    await supabase
      .from('episodios_assistidos')
      .delete()
      .eq('user_id', usuario.id)
      .eq('serie_id', idSerie);

  if (erroEpisodios) {
    throw erroEpisodios;
  }

  const { error: erroLista } =
    await supabase
      .from('minha_lista')
      .delete()
      .eq('user_id', usuario.id)
      .eq('serie_id', idSerie);

  if (erroLista) {
    throw erroLista;
  }
}