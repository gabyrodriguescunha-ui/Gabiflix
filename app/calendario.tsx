// PÁGINA QUE EXIBE OS PRÓXIMOS EPISÓDIOS DAS SÉRIES EM ACOMPANHAMENTO

// Hooks utilizados para carregar os dados quando a página recebe foco
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
// Componentes visuais utilizados na página
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones utilizados na interface
import { Ionicons } from '@expo/vector-icons';
// Navegação e evento disparado ao entrar novamente na página
import { useFocusEffect, useRouter } from 'expo-router';
// Mantém o conteúdo distante das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Recupera as séries pertencentes à lista do usuário
import {
  buscarMinhaLista,
  type ItemMinhaLista,
} from '../services/minha-lista.service';
// Busca o próximo episódio oficial de cada série no TMDB
import {
  buscarProximoEpisodioSerie,
  obterUrlEpisodio,
  type ProximoEpisodioSerie,
} from '../services/tmdb.service';
// Estilos exclusivos da página
import { styles } from '../styles/calendario.styles';



// Junta os dados salvos da série com o próximo episódio recebido do TMDB
interface ItemCalendario {
  serie: ItemMinhaLista;
  episodio: ProximoEpisodioSerie & {
    air_date: string;
  };
}

interface GrupoCalendario {
  data: string;
  episodios: ItemCalendario[];
}

// Converte YYYY-MM-DD do TMDB para data local sem deslocamento de fuso.
// Retorna null se a API enviar uma data inválida.
function criarDataLocal(data: string): Date | null {
  const partes = data.split('-').map(Number);

  if (
    partes.length !== 3 ||
    partes.some((valor) => !Number.isFinite(valor))
  ) {
    return null;
  }

  const [ano, mes, dia] = partes;
  const resultado = new Date(ano, mes - 1, dia);

  if (
    resultado.getFullYear() !== ano ||
    resultado.getMonth() !== mes - 1 ||
    resultado.getDate() !== dia
  ) {
    return null;
  }

  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function hojeLocal(): Date {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

// Formata a data para o cabeçalho de cada grupo
function formatarTituloData(data: string): string {
  const dataEpisodio = criarDataLocal(data);

  if (!dataEpisodio) {
    return 'Data não disponível';
  }

  const hoje = hojeLocal();

  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  if (dataEpisodio.getTime() === hoje.getTime()) {
    return 'Hoje';
  }

  if (dataEpisodio.getTime() === amanha.getTime()) {
    return 'Amanhã';
  }

  return dataEpisodio
    .toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    })
    .replace('.', '');
}

// Formata somente o dia e o mês
function formatarDataCurta(data: string): string {
  const dataLocal = criarDataLocal(data);

  if (!dataLocal) {
    return '—';
  }

  return dataLocal
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
    .replace('.', '')
    .toUpperCase();
}

// Página responsável por organizar os próximos episódios por data
export default function Calendario() {
  // Permite retornar ou abrir os detalhes da série
  const router = useRouter();

  // Guarda os episódios que ainda serão lançados
  const [itens, setItens] =
    useState<ItemCalendario[]>([]);

  // Controla os estados da consulta
  const [carregando, setCarregando] =
    useState(true);
  const [mensagemErro, setMensagemErro] =
    useState('');

  // Permite refazer o calendário quando ocorrer uma falha geral
  const [tentativaCarregamento, setTentativaCarregamento] =
    useState(0);

  // Busca a lista e consulta o próximo episódio de cada série
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarCalendario() {
        try {
          setCarregando(true);
          setMensagemErro('');

          const lista =
            await buscarMinhaLista();

          // O calendário acompanha apenas séries que o usuário está vendo
          // ou reassistindo no momento.
          const seriesAcompanhadas =
            lista.filter(
              (serie) =>
                serie.status_usuario === 'assistindo' ||
                serie.status_usuario === 'reassistindo'
            );

          const hoje = hojeLocal();

          // Cada série é consultada isoladamente. Uma falha específica do
          // TMDB não impede que as demais apareçam no calendário.
          const resultados = await Promise.all(
            seriesAcompanhadas.map(
              async (serie): Promise<ItemCalendario | null> => {
                try {
                  const episodio =
                    await buscarProximoEpisodioSerie(
                      serie.serie_id
                    );

                  if (!episodio?.air_date) {
                    return null;
                  }

                  const dataEstreia =
                    criarDataLocal(episodio.air_date);

                  if (
                    !dataEstreia ||
                    dataEstreia < hoje
                  ) {
                    return null;
                  }

                  return {
                    serie,
                    episodio: {
                      ...episodio,
                      air_date: episodio.air_date,
                    },
                  };
                } catch (erro) {
                  console.log(
                    `Erro ao buscar próximo episódio de ${serie.nome}:`,
                    erro
                  );

                  return null;
                }
              }
            )
          );

          if (!paginaAtiva) {
            return;
          }

          const proximos = resultados
            .filter(
              (
                item
              ): item is ItemCalendario =>
                item !== null
            )
            .sort((a, b) => {
              const dataA =
                criarDataLocal(
                  a.episodio.air_date
                )?.getTime() ?? 0;

              const dataB =
                criarDataLocal(
                  b.episodio.air_date
                )?.getTime() ?? 0;

              if (dataA !== dataB) {
                return dataA - dataB;
              }

              // Mantém uma ordem previsível quando duas séries estreiam
              // no mesmo dia.
              return a.serie.nome.localeCompare(
                b.serie.nome,
                'pt-BR'
              );
            });

          setItens(proximos);
        } catch (erro) {
          console.log(
            'Erro ao carregar calendário:',
            erro
          );

          if (paginaAtiva) {
            setItens([]);
            setMensagemErro(
              'Não foi possível carregar seus próximos episódios.'
            );
          }
        } finally {
          if (paginaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarCalendario();

      return () => {
        paginaAtiva = false;
      };
    }, [tentativaCarregamento])
  );

  // Agrupa os episódios somente quando a lista realmente muda.
  const grupos = useMemo<GrupoCalendario[]>(() => {
    const mapa = itens.reduce<Record<string, ItemCalendario[]>>(
      (acumulador, item) => {
        const data = item.episodio.air_date;

        if (!acumulador[data]) {
          acumulador[data] = [];
        }

        acumulador[data].push(item);
        return acumulador;
      },
      {}
    );

    return Object.entries(mapa).map(([data, episodios]) => ({
      data,
      episodios,
    }));
  }, [itens]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={router.back}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#E91E63"
          />
        </TouchableOpacity>

        <View style={styles.areaTitulo}>
          <Text style={styles.titulo}>
            Calendário
          </Text>

          <Text style={styles.subtitulo}>
            Próximos episódios
          </Text>
        </View>

        <View
          style={
            styles.iconeCabecalho
          }
        >
          <Ionicons
            name="calendar-outline"
            size={21}
            color="#F48FB1"
          />
        </View>
      </View>

      {/* Carregamento, erro ou calendário */}
      {carregando ? (
        <View
          style={
            styles.estadoCentralizado
          }
        >
          <ActivityIndicator
            size="large"
            color="#E91E63"
          />

          <Text
            style={styles.textoEstado}
          >
            Organizando seus episódios...
          </Text>
        </View>
      ) : mensagemErro ? (
        <View
          style={
            styles.estadoCentralizado
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color="#F48FB1"
          />

          <Text
            style={styles.textoErro}
          >
            {mensagemErro}
          </Text>

          {/* Refaz a busca da lista e dos próximos episódios */}
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
      ) : itens.length === 0 ? (
        <View
          style={
            styles.estadoCentralizado
          }
        >
          <View
            style={
              styles.iconeEstadoVazio
            }
          >
            <Ionicons
              name="calendar-clear-outline"
              size={40}
              color="#E91E63"
            />
          </View>

          <Text
            style={styles.tituloVazio}
          >
            Nada marcado por enquanto
          </Text>

          <Text
            style={styles.textoEstado}
          >
            Quando uma série que você está acompanhando tiver um próximo episódio com data anunciada, ele aparecerá aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={grupos}
          keyExtractor={(grupo) => grupo.data}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conteudo}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews
          ListHeaderComponent={
            <View style={styles.resumo}>
              <Ionicons
                name="notifications-outline"
                size={19}
                color="#E91E63"
              />

              <Text style={styles.textoResumo}>
                {itens.length}{' '}
                {itens.length === 1
                  ? 'série possui'
                  : 'séries possuem'}{' '}
                próximo episódio anunciado
              </Text>
            </View>
          }
          renderItem={({ item: grupo }) => (
            <View style={styles.grupoData}>
              <View style={styles.cabecalhoData}>
                <Text style={styles.tituloData}>
                  {formatarTituloData(grupo.data)}
                </Text>

                <Text style={styles.dataCurta}>
                  {formatarDataCurta(grupo.data)}
                </Text>
              </View>

              {grupo.episodios.map(({ serie, episodio }) => {
                const imagem = obterUrlEpisodio(episodio.still_path);

                return (
                  <TouchableOpacity
                    key={`${serie.serie_id}-${episodio.id}`}
                    style={styles.card}
                    activeOpacity={0.82}
                    onPress={() =>
                      router.push({
                        pathname: '/serie/[id]',
                        params: {
                          id: String(serie.serie_id),
                        },
                      })
                    }
                  >
                    {imagem ? (
                      <Image
                        source={{ uri: imagem }}
                        style={styles.imagem}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.semImagem}>
                        <Ionicons
                          name="tv-outline"
                          size={27}
                          color="#777777"
                        />
                      </View>
                    )}

                    <View style={styles.dadosCard}>
                      <Text style={styles.nomeSerie} numberOfLines={1}>
                        {serie.nome}
                      </Text>

                      <Text style={styles.numeroEpisodio}>
                        T{episodio.season_number} • E{episodio.episode_number}
                      </Text>

                      <Text style={styles.nomeEpisodio} numberOfLines={2}>
                        {episodio.name}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#E91E63"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}