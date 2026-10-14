// Mantém a conclusão coerente com os episódios disponíveis, inclusive importados.
import { buscarHistoricoAssistido, registroCorrespondeEpisodio, type RegistroEpisodioAssistido } from './episodios-assistidos.service';
import { atualizarStatusSerie, buscarSerieNaLista, type ItemMinhaLista } from './minha-lista.service';
import { buscarDetalhesSerie, buscarDetalhesTemporada } from './tmdb.service';

export async function verificarFinalizacaoSerie(
  idSerie: number,
  historico?: RegistroEpisodioAssistido[]
): Promise<boolean> {
  const [serie, registros] = await Promise.all([
    buscarDetalhesSerie(idSerie),
    historico ? Promise.resolve(historico) : buscarHistoricoAssistido(),
  ]);
  const assistidos = registros.filter((item) => Number(item.serie_id) === Number(idSerie));
  if (assistidos.length === 0) return false;

  const hoje = new Date();
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  let quantidade = 0;
  // Temporada zero contém especiais e não impede a conclusão da série.
  for (const resumo of serie.seasons.filter((item) => item.season_number > 0 && item.episode_count > 0)) {
    const temporada = await buscarDetalhesTemporada(idSerie, resumo.season_number);
    // Uma resposta incompleta não deve resultar em conclusão por engano.
    if (temporada.episodes.length < resumo.episode_count) return false;
    for (const episodio of temporada.episodes) {
      if (episodio.air_date && episodio.air_date > dataHoje) continue;
      quantidade += 1;
      if (!assistidos.some((registro) => registroCorrespondeEpisodio(
        registro, idSerie, resumo.season_number, episodio.id, episodio.episode_number
      ))) return false;
    }
  }
  if (quantidade === 0) return false;

  // Reconsulta o status após a conferência para respeitar alterações manuais.
  const item = await buscarSerieNaLista(idSerie);
  if (!item || (item.status_usuario !== 'assistindo' && item.status_usuario !== 'quero_assistir')) return false;
  await atualizarStatusSerie(idSerie, 'finalizada');
  return true;
}

export async function sincronizarFinalizadasDaLista(
  lista: ItemMinhaLista[],
  aoFinalizar: (idSerie: number) => void,
  estaAtiva: () => boolean
): Promise<void> {
  const candidatas = lista.filter((item) => item.status_usuario === 'assistindo');
  if (candidatas.length === 0) return;
  const historico = await buscarHistoricoAssistido();
  for (const item of candidatas) {
    if (!estaAtiva()) return;
    try {
      if (await verificarFinalizacaoSerie(Number(item.serie_id), historico)) {
        if (estaAtiva()) aoFinalizar(item.serie_id);
      }
    } catch (erro) {
      // Uma falha de rede não impede a conferência das demais séries.
      console.log('Erro ao conferir conclusão da série:', item.serie_id, erro);
    }
  }
}
