// PÁGINA QUE RESUME O PROGRESSO DAS SÉRIES E PERMITE CONTINUAR DE ONDE PAROU

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Histórico salvo pelo usuário no Supabase
import {
  buscarHistoricoAssistido,
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


// Informações prontas para serem exibidas em cada card
interface ItemContinuarAssistindo {
  serieId: number;
  nome: string;
  posterPath: string | null;
  temporadaNumero: number;
  proximoEpisodioNumero: number | null;
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

  // Recarrega o progresso sempre que a página volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarProgresso() {
        try {
          setCarregando(true);
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
              .map((item) => item.serie_id)
          );

          const registrosPorSerie = new Map<
            number,
            RegistroEpisodioAssistido[]
          >();

          historico.forEach((registro) => {
            if (!idsSeriesAcompanhadas.has(registro.serie_id)) {
              return;
            }

            const registrosAtuais =
              registrosPorSerie.get(registro.serie_id) ?? [];

            registrosAtuais.push(registro);
            registrosPorSerie.set(
              registro.serie_id,
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

                  const idsAssistidos = new Set(
                    registros.map(
                      (registro) => registro.episodio_id
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

                  let temporadaDestino =
                    temporadasRegulares[0]
                      ?.season_number ?? 1;

                  let proximoEpisodioNumero:
                    | number
                    | null = null;

                  let proximoEpisodioNome =
                    'Tudo assistido até agora';

                  let proximoEpisodioData:
                    | string
                    | null = null;

                  let aguardandoEstreia = false;
                  let totalEpisodios = 0;
                  let quantidadeAssistida = 0;
                  let episodiosPendentesLancados = 0;

                  // Caso não exista nenhum episódio lançado pendente,
                  // guardamos o primeiro episódio futuro encontrado.
                  let primeiroFuturo:
                    | {
                        temporadaNumero: number;
                        episodioNumero: number;
                        episodioNome: string;
                        episodioData: string | null;
                        totalEpisodios: number;
                        quantidadeAssistida: number;
                      }
                    | null = null;

                  // Guarda a última temporada real para séries em dia que
                  // ainda estão ativas, mas sem próximo episódio cadastrado.
                  let ultimaTemporadaReal:
                    | {
                        numero: number;
                        totalEpisodios: number;
                        quantidadeAssistida: number;
                      }
                    | null = null;

                  let encontrouLancadoPendente = false;

                  for (
                    const resumoTemporada
                    of temporadasRegulares
                  ) {
                    const detalhesTemporada =
                      await buscarDetalhesTemporada(
                        serieId,
                        resumoTemporada.season_number
                      );

                    if (
                      detalhesTemporada.episodes.length === 0
                    ) {
                      continue;
                    }

                    const assistidosNaTemporada =
                      registros.filter(
                        (registro) =>
                          registro.temporada_numero ===
                          resumoTemporada.season_number
                      ).length;

                    ultimaTemporadaReal = {
                      numero:
                        resumoTemporada.season_number,
                      totalEpisodios:
                        detalhesTemporada.episodes.length,
                      quantidadeAssistida:
                        assistidosNaTemporada,
                    };

                    const pendentesLancados =
                      detalhesTemporada.episodes.filter(
                        (episodio) =>
                          !idsAssistidos.has(episodio.id) &&
                          episodioFoiLancado(
                            episodio.air_date
                          )
                      );

                    // Sempre prioriza o episódio lançado mais antigo ainda não
                    // visto, inclusive quando houve algum episódio pulado.
                    if (pendentesLancados.length > 0) {
                      const proximo =
                        pendentesLancados[0];

                      temporadaDestino =
                        resumoTemporada.season_number;
                      proximoEpisodioNumero =
                        proximo.episode_number;
                      proximoEpisodioNome =
                        proximo.name;
                      proximoEpisodioData =
                        proximo.air_date;
                      aguardandoEstreia = false;
                      totalEpisodios =
                        detalhesTemporada.episodes.length;
                      quantidadeAssistida =
                        assistidosNaTemporada;
                      episodiosPendentesLancados =
                        pendentesLancados.length;
                      encontrouLancadoPendente = true;
                      break;
                    }

                    if (!primeiroFuturo) {
                      const futuro =
                        detalhesTemporada.episodes.find(
                          (episodio) =>
                            !idsAssistidos.has(
                              episodio.id
                            ) &&
                            !episodioFoiLancado(
                              episodio.air_date
                            )
                        );

                      if (futuro) {
                        primeiroFuturo = {
                          temporadaNumero:
                            resumoTemporada.season_number,
                          episodioNumero:
                            futuro.episode_number,
                          episodioNome:
                            futuro.name,
                          episodioData:
                            futuro.air_date,
                          totalEpisodios:
                            detalhesTemporada.episodes.length,
                          quantidadeAssistida:
                            assistidosNaTemporada,
                        };
                      }
                    }
                  }

                  if (
                    !encontrouLancadoPendente &&
                    primeiroFuturo
                  ) {
                    temporadaDestino =
                      primeiroFuturo.temporadaNumero;
                    proximoEpisodioNumero =
                      primeiroFuturo.episodioNumero;
                    proximoEpisodioNome =
                      primeiroFuturo.episodioNome;
                    proximoEpisodioData =
                      primeiroFuturo.episodioData;
                    aguardandoEstreia = true;
                    totalEpisodios =
                      primeiroFuturo.totalEpisodios;
                    quantidadeAssistida =
                      primeiroFuturo.quantidadeAssistida;
                  }

                  if (
                    proximoEpisodioNumero === null &&
                    ultimaTemporadaReal
                  ) {
                    temporadaDestino =
                      ultimaTemporadaReal.numero;
                    totalEpisodios =
                      ultimaTemporadaReal.totalEpisodios;
                    quantidadeAssistida =
                      ultimaTemporadaReal.quantidadeAssistida;
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
            setCarregando(false);
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
  // "Em breve": o próximo episódio é futuro OU a série continua ativa,
  // mas o TMDB ainda não cadastrou um próximo episódio.
  const itensFiltrados = itens
    .filter((item) => {
      if (filtroSelecionado === 'para_assistir') {
        return (
          item.proximoEpisodioNumero !== null &&
          !item.aguardandoEstreia
        );
      }

      return (
        item.aguardandoEstreia ||
        item.aguardandoNovosEpisodios
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

      // Em breve: datas conhecidas primeiro, da mais próxima para
      // a mais distante. Séries sem data divulgada ficam no final.
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
            pathname: '/temporadas/[id]',
            params: {
              id: String(item.serieId),
              temporada: String(item.temporadaNumero),
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
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.cabecalho}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
                  : 'Quando uma série estiver aguardando um novo episódio ou temporada, ela aparecerá aqui.'}
              </Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}