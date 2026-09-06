// PÁGINA QUE RESUME O PROGRESSO DAS SÉRIES E PERMITE CONTINUAR DE ONDE PAROU

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { voltarOuInicio } from '../utils/navegacao';
// Histórico salvo pelo usuário no Supabase
import {
  buscarHistoricoAssistido,
  marcarEpisodiosAssistidos,
  registroCorrespondeEpisodio,
  type RegistroEpisodioAssistido,
} from '../services/episodios-assistidos.service';
import {
  buscarMinhaLista,
} from '../services/minha-lista.service';
// Dados complementares e capas fornecidos pelo TMDB
import {
  buscarDetalhesSerie,
  buscarDetalhesTemporada,
  obterUrlCapa,
} from '../services/tmdb.service';
import { styles } from '../styles/continuar-assistindo.styles';
import type { Episodio } from '../types/serie';


// Informações prontas para serem exibidas em cada card
interface ItemContinuarAssistindo {
  serieId: number;
  nome: string;
  posterPath: string | null;
  temporadaNumero: number;
  proximoEpisodioNumero: number | null;
  proximoEpisodio: Episodio | null;
  proximoEpisodioNome: string;
  proximoEpisodioData: string | null;
  aguardandoEstreia: boolean;
  // True quando a série continua ativa/renovada, mas o TMDB ainda
  // não cadastrou um próximo episódio com data.
  aguardandoNovosEpisodios: boolean;
  quantidadeAssistida: number;
  totalEpisodios: number;
  episodiosPendentesLancados: number;
}

// Verifica se um episódio já está disponível na data atual
function episodioFoiLancado(data: string | null): boolean {
  if (!data) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEpisodio = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return dataEpisodio <= hoje;
}

// Formata a data futura no padrão brasileiro
function formatarData(data: string | null): string {
  if (!data) {
    return 'Data ainda não divulgada';
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
}

// Considera "novo" um episódio lançado hoje ou nos últimos 7 dias.
function episodioEhNovo(data: string | null): boolean {
  if (!data) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEpisodio = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  dataEpisodio.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  const diferencaDias =
    Math.floor(
      (hoje.getTime() - dataEpisodio.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  return diferencaDias >= 0 && diferencaDias <= 7;
}

type FiltroContinuar =
  | 'para_assistir'
  | 'em_breve';

export default function ContinuarAssistindo() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemContinuarAssistindo[]>([]);

  // A tela começa mostrando somente o que já pode ser assistido.
  const [filtroSelecionado, setFiltroSelecionado] =
    useState<FiltroContinuar>('para_assistir');

  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  // Permite refazer o carregamento quando ocorrer uma falha
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);
  const [atualizando, setAtualizando] = useState(false);
  const [episodioSendoMarcado, setEpisodioSendoMarcado] = useState<number | null>(null);

  // Depois do primeiro carregamento, mantemos os cards atuais na tela enquanto
  // os dados são revalidados em segundo plano. Isso evita voltar para uma tela
  // vazia com spinner toda vez que o usuário retorna ao Continuar assistindo.
  const primeiroCarregamentoConcluido = useRef(false);

  // Recarrega o progresso sempre que a página volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarProgresso() {
        try {
          if (!primeiroCarregamentoConcluido.current) {
            setCarregando(true);
          }

          setMensagemErro('');

          const [historico, minhaLista] = await Promise.all([
            buscarHistoricoAssistido(),
            buscarMinhaLista(),
          ]);

          // O Continuar assistindo pertence somente a séries que estão
          // efetivamente em acompanhamento. Isso também impede que uma série
          // removida da Minha lista reapareça apenas porque o histórico ficou salvo.
          const idsSeriesAcompanhadas = new Set(
            minhaLista
              .filter(
                (item) =>
                  item.status_usuario === 'assistindo' ||
                  item.status_usuario === 'reassistindo'
              )
              .map((item) => Number(item.serie_id))
          );

          const registrosPorSerie = new Map<
            number,
            RegistroEpisodioAssistido[]
          >();

          // Inclui também séries recém-adicionadas, mesmo sem histórico ainda.
          idsSeriesAcompanhadas.forEach((serieId) => {
            registrosPorSerie.set(serieId, []);
          });

          historico.forEach((registro) => {
            const serieIdRegistro =
              Number(registro.serie_id);

            if (!idsSeriesAcompanhadas.has(serieIdRegistro)) {
              return;
            }

            const registrosAtuais =
              registrosPorSerie.get(serieIdRegistro) ?? [];

            registrosAtuais.push(registro);
            registrosPorSerie.set(
              serieIdRegistro,
              registrosAtuais
            );
          });

          // Cada série é protegida individualmente. Se o TMDB falhar em uma,
          // as demais continuam sendo exibidas.
          const resultados = await Promise.all(
            Array.from(registrosPorSerie.entries()).map(
              async ([serieId, registros]) => {
                try {
                  const detalhes =
                    await buscarDetalhesSerie(serieId);

                  // O histórico é conferido tanto pelo ID do episódio quanto
                  // por temporada + número. Isso mantém compatibilidade com
                  // episódios importados e com episódios marcados no próprio app.
                  const foiAssistido = (
                    numeroTemporada: number,
                    episodio: Episodio
                  ) =>
                    registros.some((registro) =>
                      registroCorrespondeEpisodio(
                        registro,
                        serieId,
                        numeroTemporada,
                        episodio.id,
                        episodio.episode_number
                      )
                    );

                  const temporadasRegulares =
                    detalhes.seasons
                      .filter(
                        (temporada) =>
                          temporada.season_number > 0 &&
                          temporada.episode_count > 0
                      )
                      .sort(
                        (a, b) =>
                          a.season_number -
                          b.season_number
                      );

                  // Não precisamos baixar todas as temporadas antigas para descobrir
                  // onde o usuário deve continuar. O histórico já informa a temporada
                  // mais avançada que possui progresso; carregamos essa temporada e
                  // somente as posteriores. Em séries longas, como One Piece, isso
                  // reduz dezenas de chamadas ao TMDB para apenas as temporadas atuais.
                  const maiorTemporadaNoHistorico =
                    registros.reduce(
                      (maior, registro) =>
                        Math.max(
                          maior,
                          Number(registro.temporada_numero) || 0
                        ),
                      0
                    );

                  const primeiraTemporadaDisponivel =
                    temporadasRegulares[0]
                      ?.season_number ?? 1;

                  const temporadaInicialBusca =
                    maiorTemporadaNoHistorico > 0
                      ? maiorTemporadaNoHistorico
                      : primeiraTemporadaDisponivel;

                  const temporadasParaConsultar =
                    temporadasRegulares.filter(
                      (temporada) =>
                        temporada.season_number >=
                        temporadaInicialBusca
                    );

                  // Se o histórico antigo apontar para uma temporada que não exista
                  // mais no resumo atual do TMDB, usamos a primeira temporada válida
                  // em vez de deixar a série sem dados.
                  const temporadasEfetivas =
                    temporadasParaConsultar.length > 0
                      ? temporadasParaConsultar
                      : temporadasRegulares;

                  const temporadasDetalhadas =
                    await Promise.all(
                      temporadasEfetivas.map(
                        async (resumoTemporada) => ({
                          numero:
                            resumoTemporada.season_number,
                          dados:
                            await buscarDetalhesTemporada(
                              serieId,
                              resumoTemporada.season_number
                            ),
                        })
                      )
                    );

                  const episodiosOrdenados =
                    temporadasDetalhadas.flatMap(
                      (temporadaDetalhada) =>
                        temporadaDetalhada.dados.episodes
                          .slice()
                          .sort(
                            (a, b) =>
                              a.episode_number -
                              b.episode_number
                          )
                          .map((episodio) => ({
                            temporadaNumero:
                              temporadaDetalhada.numero,
                            episodio,
                          }))
                    );

                  // O ponto de continuidade é o episódio assistido mais avançado.
                  // Assim uma falha antiga em T1 não faz uma série longa voltar
                  // para o começo quando o usuário já está em temporadas atuais.
                  let indiceUltimoAssistido = -1;

                  episodiosOrdenados.forEach(
                    (item, indice) => {
                      if (
                        foiAssistido(
                          item.temporadaNumero,
                          item.episodio
                        )
                      ) {
                        indiceUltimoAssistido = indice;
                      }
                    }
                  );

                  const candidatos =
                    indiceUltimoAssistido >= 0
                      ? episodiosOrdenados.slice(
                          indiceUltimoAssistido + 1
                        )
                      : episodiosOrdenados;

                  const proximoLancado =
                    candidatos.find(
                      (item) =>
                        !foiAssistido(
                          item.temporadaNumero,
                          item.episodio
                        ) &&
                        episodioFoiLancado(
                          item.episodio.air_date
                        )
                    );

                  const proximoFuturo =
                    candidatos.find(
                      (item) =>
                        !foiAssistido(
                          item.temporadaNumero,
                          item.episodio
                        ) &&
                        Boolean(
                          item.episodio.air_date
                        ) &&
                        !episodioFoiLancado(
                          item.episodio.air_date
                        )
                    );

                  let temporadaDestino =
                    temporadasEfetivas[0]
                      ?.season_number ??
                    temporadasRegulares[0]
                      ?.season_number ??
                    1;

                  let proximoEpisodioNumero:
                    | number
                    | null = null;
                  let proximoEpisodio: Episodio | null = null;

                  let proximoEpisodioNome =
                    'Tudo assistido até agora';

                  let proximoEpisodioData:
                    | string
                    | null = null;

                  let aguardandoEstreia = false;
                  let totalEpisodios = 0;
                  let quantidadeAssistida = 0;
                  let episodiosPendentesLancados = 0;

                  const aplicarProgressoTemporada = (
                    numeroTemporada: number
                  ) => {
                    const temporadaSelecionada =
                      temporadasDetalhadas.find(
                        (item) =>
                          item.numero ===
                          numeroTemporada
                      );

                    if (!temporadaSelecionada) {
                      return;
                    }

                    const lancados =
                      temporadaSelecionada.dados.episodes.filter(
                        (episodio) =>
                          episodioFoiLancado(
                            episodio.air_date
                          )
                      );

                    quantidadeAssistida =
                      lancados.filter((episodio) =>
                        foiAssistido(
                          numeroTemporada,
                          episodio
                        )
                      ).length;

                    totalEpisodios =
                      lancados.length;

                    episodiosPendentesLancados =
                      lancados.filter(
                        (episodio) =>
                          !foiAssistido(
                            numeroTemporada,
                            episodio
                          )
                      ).length;
                  };

                  if (proximoLancado) {
                    temporadaDestino =
                      proximoLancado.temporadaNumero;
                    proximoEpisodioNumero =
                      proximoLancado.episodio.episode_number;
                    proximoEpisodio =
                      proximoLancado.episodio;
                    proximoEpisodioNome =
                      proximoLancado.episodio.name;
                    proximoEpisodioData =
                      proximoLancado.episodio.air_date;
                    aguardandoEstreia = false;

                    aplicarProgressoTemporada(
                      temporadaDestino
                    );
                  } else if (proximoFuturo) {
                    temporadaDestino =
                      proximoFuturo.temporadaNumero;
                    proximoEpisodioNumero =
                      proximoFuturo.episodio.episode_number;
                    // Episódios futuros não podem ser marcados como assistidos.
                    proximoEpisodio = null;
                    proximoEpisodioNome =
                      proximoFuturo.episodio.name;
                    proximoEpisodioData =
                      proximoFuturo.episodio.air_date;
                    aguardandoEstreia = true;

                    aplicarProgressoTemporada(
                      temporadaDestino
                    );
                  } else {
                    // Se não existe próximo episódio cadastrado, mantém o
                    // progresso da temporada mais recente com episódios lançados.
                    const ultimaComLancados =
                      [...temporadasDetalhadas]
                        .reverse()
                        .find((item) =>
                          item.dados.episodes.some(
                            (episodio) =>
                              episodioFoiLancado(
                                episodio.air_date
                              )
                          )
                        );

                    if (ultimaComLancados) {
                      temporadaDestino =
                        ultimaComLancados.numero;

                      aplicarProgressoTemporada(
                        temporadaDestino
                      );
                    }
                  }

                  const serieEncerrada =
                    detalhes.status === 'Ended' ||
                    detalhes.status === 'Canceled';

                  // Série encerrada/cancelada e sem nenhum episódio pendente
                  // não pertence mais ao Continuar assistindo.
                  if (
                    serieEncerrada &&
                    proximoEpisodioNumero === null
                  ) {
                    return null;
                  }

                  const aguardandoNovosEpisodios =
                    proximoEpisodioNumero === null &&
                    (
                      detalhes.status ===
                        'Returning Series' ||
                      detalhes.status ===
                        'In Production' ||
                      detalhes.status === 'Planned' ||
                      detalhes.status === 'Pilot'
                    );

                  // Se a série não tem episódio pendente e também não está
                  // oficialmente aguardando novos episódios, não há ação aqui.
                  if (
                    proximoEpisodioNumero === null &&
                    !aguardandoNovosEpisodios
                  ) {
                    return null;
                  }

                  return {
                    serieId,
                    nome: detalhes.name,
                    posterPath:
                      detalhes.poster_path,
                    temporadaNumero:
                      temporadaDestino,
                    proximoEpisodioNumero,
                    proximoEpisodio,
                    proximoEpisodioNome,
                    proximoEpisodioData,
                    aguardandoEstreia,
                    aguardandoNovosEpisodios,
                    quantidadeAssistida,
                    totalEpisodios,
                    episodiosPendentesLancados,
                  } satisfies ItemContinuarAssistindo;
                } catch (erro) {
                  console.log(
                    `Erro ao preparar Continuar assistindo da série ${serieId}:`,
                    erro
                  );

                  return null;
                }
              }
            )
          );

          const itensValidos =
            resultados.filter(
              (
                item
              ): item is ItemContinuarAssistindo =>
                item !== null
            );

          if (paginaAtiva) {
            setItens(itensValidos);
          }
        } catch (erro) {
          console.log('Erro ao carregar Continuar assistindo:', erro);

          if (paginaAtiva) {
            setMensagemErro('Não foi possível carregar seu progresso.');
          }
        } finally {
          if (paginaAtiva) {
            primeiroCarregamentoConcluido.current = true;
            setCarregando(false);
            setAtualizando(false);
          }
        }
      }

      carregarProgresso();

      return () => {
        paginaAtiva = false;
      };
    }, [tentativaCarregamento])
  );

  // "Para assistir": existe um episódio já lançado e ainda não visto.
  // "Em breve": somente quando o TMDB cadastrou um próximo episódio
  // com uma data futura confirmada.
  const itensFiltrados = itens
    .filter((item) => {
      if (filtroSelecionado === 'para_assistir') {
        return (
          item.proximoEpisodioNumero !== null &&
          !item.aguardandoEstreia
        );
      }

      return (
        item.aguardandoEstreia &&
        item.proximoEpisodioNumero !== null &&
        Boolean(item.proximoEpisodioData)
      );
    })
    .sort((a, b) => {
      if (filtroSelecionado === 'para_assistir') {
        // Prioriza séries com mais episódios pendentes na temporada.
        const pendentesA =
          a.episodiosPendentesLancados;
        const pendentesB =
          b.episodiosPendentesLancados;

        if (pendentesA !== pendentesB) {
          return pendentesB - pendentesA;
        }

        return a.nome.localeCompare(b.nome, 'pt-BR');
      }

      // Em breve: todas possuem data confirmada; ordena da estreia
      // mais próxima para a mais distante.
      if (a.proximoEpisodioData && b.proximoEpisodioData) {
        const dataA = new Date(
          `${a.proximoEpisodioData}T00:00:00`
        ).getTime();
        const dataB = new Date(
          `${b.proximoEpisodioData}T00:00:00`
        ).getTime();

        if (dataA !== dataB) {
          return dataA - dataB;
        }
      } else if (a.proximoEpisodioData) {
        return -1;
      } else if (b.proximoEpisodioData) {
        return 1;
      }

      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

  async function marcarProximoComoAssistido(item: ItemContinuarAssistindo) {
    if (!item.proximoEpisodio || episodioSendoMarcado !== null) return;

    try {
      setEpisodioSendoMarcado(item.proximoEpisodio.id);
      await marcarEpisodiosAssistidos(
        item.serieId,
        item.temporadaNumero,
        [item.proximoEpisodio]
      );

      // Revalida o progresso para o card avançar ao próximo episódio.
      // Como já houve o primeiro carregamento, os cards permanecem visíveis
      // durante essa atualização em segundo plano.
      setTentativaCarregamento((valorAtual) => valorAtual + 1);
    } catch (erro) {
      console.log('Erro ao marcar episódio pelo Continuar assistindo:', erro);
      setMensagemErro('Não foi possível marcar o episódio como assistido.');
    } finally {
      setEpisodioSendoMarcado(null);
    }
  }

  function atualizarLista() {
    setAtualizando(true);
    setTentativaCarregamento((valorAtual) => valorAtual + 1);
  }

  function renderizarItem({ item }: { item: ItemContinuarAssistindo }) {
    const urlCapa = obterUrlCapa(item.posterPath);
    const percentual = item.totalEpisodios
      ? Math.min((item.quantidadeAssistida / item.totalEpisodios) * 100, 100)
      : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '/serie/[id]',
            params: {
              id: String(item.serieId),
            },
          })
        }
      >
        {urlCapa ? (
          <Image source={{ uri: urlCapa }} style={styles.capa} />
        ) : (
          <View style={styles.semCapa}>
            <Ionicons name="image-outline" size={28} color="#777777" />
          </View>
        )}

        <View style={styles.dadosCard}>
          <Text style={styles.nomeSerie} numberOfLines={2}>
            {item.nome}
          </Text>

          {filtroSelecionado === 'para_assistir' &&
            episodioEhNovo(item.proximoEpisodioData) && (
              <View style={styles.seloNovoEpisodio}>
                <Ionicons
                  name="sparkles"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.textoSeloNovoEpisodio}>
                  Novo episódio disponível
                </Text>
              </View>
            )}

          <Text style={styles.ultimoEpisodio} numberOfLines={2}>
            {item.aguardandoNovosEpisodios
              ? 'Você está em dia • aguardando novos episódios'
              : item.proximoEpisodioNumero === null
              ? item.proximoEpisodioNome
              : `Próximo: T${item.temporadaNumero} • E${item.proximoEpisodioNumero} — ${item.proximoEpisodioNome}`}
          </Text>

          {item.aguardandoEstreia && (
            <View style={styles.avisoEstreia}>
              <Ionicons name="calendar-outline" size={12} color="#F48FB1" />
              <Text style={styles.textoEstreia}>
                {item.proximoEpisodioData
                  ? `Aguardando estreia em ${formatarData(item.proximoEpisodioData)}`
                  : 'Data ainda não divulgada'}
              </Text>
            </View>
          )}
          <Text style={styles.textoProgresso}>
            {item.totalEpisodios > 0
              ? `${item.quantidadeAssistida} de ${item.totalEpisodios} assistidos`
              : 'Progresso em dia'}
          </Text>

          <View style={styles.trilhoProgresso}>
            <View
              style={[
                styles.barraProgresso,
                { width: `${percentual}%` as `${number}%` },
              ]}
            />
          </View>

          <View style={styles.acaoContinuar}>
            <Ionicons
              name={
                item.aguardandoEstreia ||
                item.aguardandoNovosEpisodios
                  ? 'time-outline'
                  : 'play-circle'
              }
              size={18}
              color="#E91E63"
            />
            <Text
              style={styles.textoContinuar}
            >
              {item.aguardandoEstreia ||
              item.aguardandoNovosEpisodios
                ? 'Em breve'
                : 'Continuar temporada'}
            </Text>
          </View>
        </View>

        {filtroSelecionado === 'para_assistir' && item.proximoEpisodio && (
          <TouchableOpacity
            style={styles.botaoMarcarAssistido}
            activeOpacity={0.75}
            disabled={episodioSendoMarcado !== null}
            onPress={(evento) => {
              evento.stopPropagation();
              marcarProximoComoAssistido(item);
            }}
          >
            {episodioSendoMarcado === item.proximoEpisodio.id ? (
              <ActivityIndicator size="small" color="#E91E63" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#E91E63" />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.cabecalho}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={voltarOuInicio}>
          <Ionicons name="chevron-back" size={26} color="#E91E63" />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Continuar assistindo</Text>
          <Text style={styles.subtitulo}>Seu progresso por série</Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.textoEstado}>Carregando seu progresso...</Text>
        </View>
      ) : mensagemErro ? (
        <View style={styles.estadoCentralizado}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#F48FB1"
          />

          <Text style={styles.textoErro}>{mensagemErro}</Text>

          {/* Permite tentar novamente sem precisar voltar para outra tela */}
          <TouchableOpacity
            style={{
                marginTop: 18,
                minHeight: 42,
                paddingHorizontal: 20,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#E91E63',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            activeOpacity={0.8}
            onPress={() =>
              setTentativaCarregamento((valorAtual) => valorAtual + 1)
            }
          >
            <Text
              style={{
                  color: '#E91E63',
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 12,
                }}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={(item) => String(item.serieId)}
          renderItem={renderizarItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={atualizarLista}
              tintColor="#E91E63"
              colors={["#E91E63"]}
            />
          }
          contentContainerStyle={[
            styles.lista,
            itensFiltrados.length === 0 && styles.listaVazia,
          ]}
          ListHeaderComponent={
            <View style={styles.filtros}>
              <TouchableOpacity
                style={[
                  styles.filtro,
                  filtroSelecionado === 'para_assistir' &&
                    styles.filtroAtivo,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  setFiltroSelecionado('para_assistir')
                }
              >
                <Ionicons
                  name="play-circle-outline"
                  size={16}
                  color={
                    filtroSelecionado === 'para_assistir'
                      ? '#FFFFFF'
                      : '#A0A0A0'
                  }
                />
                <Text
                  style={[
                    styles.textoFiltro,
                    filtroSelecionado === 'para_assistir' &&
                      styles.textoFiltroAtivo,
                  ]}
                >
                  Para assistir
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtro,
                  filtroSelecionado === 'em_breve' &&
                    styles.filtroAtivo,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  setFiltroSelecionado('em_breve')
                }
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={
                    filtroSelecionado === 'em_breve'
                      ? '#FFFFFF'
                      : '#A0A0A0'
                  }
                />
                <Text
                  style={[
                    styles.textoFiltro,
                    filtroSelecionado === 'em_breve' &&
                      styles.textoFiltroAtivo,
                  ]}
                >
                  Em breve
                </Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.estadoVazio}>
              <Ionicons
                name={
                  filtroSelecionado === 'para_assistir'
                    ? 'checkmark-circle-outline'
                    : 'time-outline'
                }
                size={54}
                color="#E91E63"
              />

              <Text style={styles.tituloVazio}>
                {filtroSelecionado === 'para_assistir'
                  ? 'Você está em dia'
                  : 'Nenhuma estreia aguardada'}
              </Text>

              <Text style={styles.textoVazio}>
                {filtroSelecionado === 'para_assistir'
                  ? 'Não há episódios já lançados esperando para serem assistidos.'
                  : 'Quando houver um próximo episódio com data de estreia confirmada, ele aparecerá aqui.'}
              </Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}
