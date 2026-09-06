// PÁGINA DE TEMPORADAS E EPISÓDIOS

// Hooks utilizados para controlar a temporada selecionada
import { useEffect, useState } from 'react';
// Componentes visuais utilizados na página
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones utilizados na navegação e nos cards
import { Ionicons } from '@expo/vector-icons';
// Recupera o ID da rota e permite voltar
import { useLocalSearchParams, useRouter } from 'expo-router';
import { voltarOuInicio } from '../../utils/navegacao';
// Protege o conteúdo das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Funções responsáveis pelas requisições e imagens
import {
  buscarDetalhesSerie,
  buscarDetalhesTemporada,
  obterUrlEpisodio,
} from '../../services/tmdb.service';
// Funções responsáveis por consultar e alterar o progresso do usuário
import {
  buscarEpisodiosAssistidos,
  buscarTodosEpisodiosAssistidosDaSerie,
  desmarcarEpisodioAssistido,
  marcarEpisodiosAssistidos,
} from '../../services/episodios-assistidos.service';
// Tipos utilizados pelos estados da página
import type {
  DetalhesSerie,
  DetalhesTemporada,
  Episodio,
} from '../../types/serie';
// Atualiza automaticamente o status da série quando todo o conteúdo foi assistido
import {
  atualizarStatusSerie,
  buscarSerieNaLista,
} from '../../services/minha-lista.service';
// Estilos exclusivos da página
import { styles } from '../../styles/temporadas.styles';



function ImagemEpisodioComFallback({
  uri,
}: {
  uri: string | null;
}) {
  const [falhou, setFalhou] = useState(false);

  if (!uri || falhou) {
    return (
      <View style={styles.imagemAusente}>
        <Image
          source={require('../../assets/images/logo-gabiflix.png')}
          style={styles.logoImagemAusente}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.imagemEpisodio}
      resizeMode="cover"
      onError={() => setFalhou(true)}
    />
  );
}

// Página que apresenta as temporadas e seus episódios
export default function Temporadas() {
  const { id, temporada: temporadaParametro } = useLocalSearchParams<{
    id: string;
    temporada?: string;
  }>();
  const router = useRouter();
  const idSerie = Number(id);

  // Guarda a série, a temporada selecionada e os estados da tela
  const [serie, setSerie] = useState<DetalhesSerie | null>(null);
  const [temporada, setTemporada] = useState<DetalhesTemporada | null>(null);
  const [numeroSelecionado, setNumeroSelecionado] = useState(1);
  // Mantém a lista de episódios fechada ao entrar na tela.
  const [temporadaAberta, setTemporadaAberta] = useState(false);
  const [carregandoSerie, setCarregandoSerie] = useState(true);
  const [carregandoTemporada, setCarregandoTemporada] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativaTemporada, setTentativaTemporada] = useState(0);
  const [episodiosAssistidos, setEpisodiosAssistidos] = useState<Set<number>>(
    new Set()
  );
  const [episodioSendoAlterado, setEpisodioSendoAlterado] = useState<
    number | null
  >(null);

  // Carrega a lista de temporadas ao abrir a página
  useEffect(() => {
    let telaAtiva = true;

    async function carregarSerie() {
      if (!idSerie) {
        setMensagemErro('O código da série é inválido.');
        setCarregandoSerie(false);
        return;
      }

      try {
        const resultado = await buscarDetalhesSerie(idSerie);

        if (telaAtiva) {
          setSerie(resultado);

          // Usa a temporada recebida pela rota ou seleciona a primeira comum
          const primeiraTemporada = resultado.seasons.find(
            (item) =>
              item.season_number > 0 &&
              item.episode_count > 0
          );
          const numeroRecebido = Number(temporadaParametro);
          const temporadaRecebidaExiste = resultado.seasons.some(
            (item) =>
              item.season_number === numeroRecebido &&
              item.season_number > 0 &&
              item.episode_count > 0
          );

          if (numeroRecebido > 0 && temporadaRecebidaExiste) {
            setNumeroSelecionado(numeroRecebido);
          } else if (primeiraTemporada) {
            setNumeroSelecionado(primeiraTemporada.season_number);
          }
        }
      } catch (erro) {
        console.log('Erro ao buscar temporadas:', erro);

        if (telaAtiva) {
          setMensagemErro('Não foi possível carregar as temporadas.');
        }
      } finally {
        if (telaAtiva) {
          setCarregandoSerie(false);
        }
      }
    }

    carregarSerie();

    return () => {
      telaAtiva = false;
    };
  }, [idSerie, temporadaParametro]);

  // Busca os episódios sempre que outra temporada for selecionada
  useEffect(() => {
    if (!idSerie || !serie) {
      return;
    }

    let telaAtiva = true;

    async function carregarEpisodios() {
      try {
        setCarregandoTemporada(true);
        setMensagemErro('');
        setTemporada(null);
        setEpisodiosAssistidos(new Set());

        // Carrega os episódios do TMDB e o progresso do Supabase juntos
        const [resultado, idsAssistidos] = await Promise.all([
          buscarDetalhesTemporada(idSerie, numeroSelecionado),
          buscarEpisodiosAssistidos(idSerie, numeroSelecionado),
        ]);

        if (telaAtiva) {
          setTemporada(resultado);
          setEpisodiosAssistidos(new Set(idsAssistidos));
        }
      } catch (erro) {
        console.log('Erro ao buscar episódios:', erro);

        if (telaAtiva) {
          setMensagemErro('Não foi possível carregar os episódios.');
        }
      } finally {
        if (telaAtiva) {
          setCarregandoTemporada(false);
        }
      }
    }

    carregarEpisodios();

    return () => {
      telaAtiva = false;
    };
  }, [
    idSerie,
    numeroSelecionado,
    serie,
    tentativaTemporada,
  ]);

  // Confere se uma série encerrada teve todos os episódios já lançados assistidos.
  // Séries ainda em produção não são finalizadas automaticamente só porque
  // o usuário está em dia com os episódios disponíveis.
  async function verificarFinalizacaoAutomatica() {
    if (
      !serie ||
      (serie.status !== 'Ended' &&
        serie.status !== 'Canceled')
    ) {
      return;
    }

    const temporadasComEpisodios =
      serie.seasons.filter(
        (item) =>
          item.season_number > 0 &&
          item.episode_count > 0
      );

    if (temporadasComEpisodios.length === 0) {
      return;
    }

    const [detalhesTemporadas, idsAssistidos] =
      await Promise.all([
        Promise.all(
          temporadasComEpisodios.map((item) =>
            buscarDetalhesTemporada(
              idSerie,
              item.season_number
            )
          )
        ),
        buscarTodosEpisodiosAssistidosDaSerie(
          idSerie
        ),
      ]);

    const idsAssistidosSet =
      new Set(idsAssistidos);

    const episodiosLancados =
      detalhesTemporadas.flatMap(
        (detalhes) =>
          detalhes.episodes.filter(
            (episodio) =>
              episodioFoiLancado(
                episodio.air_date
              )
          )
      );

    if (episodiosLancados.length === 0) {
      return;
    }

    const todosAssistidos =
      episodiosLancados.every(
        (episodio) =>
          idsAssistidosSet.has(episodio.id)
      );

    if (!todosAssistidos) {
      return;
    }

    await atualizarStatusSerie(
      idSerie,
      'finalizada'
    );
  }

  // Se um episódio for desmarcado de uma série que estava finalizada,
  // ela volta para "Assistindo" para manter a Minha Lista coerente.
  async function sincronizarStatusAposDesmarcar() {
    const itemNaLista =
      await buscarSerieNaLista(idSerie);

    if (
      itemNaLista?.status_usuario ===
      'finalizada'
    ) {
      await atualizarStatusSerie(
        idSerie,
        'assistindo'
      );
    }
  }

  // Salva um ou vários episódios e atualiza os círculos da interface
  async function salvarEpisodiosComoAssistidos(episodios: Episodio[]) {
    if (episodios.length === 0) {
      return;
    }

    try {
      setEpisodioSendoAlterado(
        episodios[episodios.length - 1].id
      );
      await marcarEpisodiosAssistidos(
        idSerie,
        numeroSelecionado,
        episodios
      );

      // Depois de salvar o progresso, verifica se uma série já encerrada
      // teve todos os episódios lançados concluídos.
      try {
        await verificarFinalizacaoAutomatica();
      } catch (erro) {
        console.log(
          'Erro ao verificar finalização automática:',
          erro
        );
      }

      setEpisodiosAssistidos((estadoAtual) => {
        const novoEstado = new Set(estadoAtual);
        episodios.forEach((item) => novoEstado.add(item.id));

        return novoEstado;
      });
    } catch (erro) {
      console.log('Erro ao alterar episódio assistido:', erro);
      Alert.alert(
        'Não foi possível salvar',
        'Verifique sua conexão e tente novamente.'
      );
    } finally {
      setEpisodioSendoAlterado(null);
    }
  }

  // Marca, desmarca ou pergunta se os episódios anteriores também serão salvos
  async function alternarEpisodio(episodio: Episodio) {
    if (episodioSendoAlterado !== null) {
      return;
    }

    if (episodiosAssistidos.has(episodio.id)) {
      try {
        setEpisodioSendoAlterado(episodio.id);
        await desmarcarEpisodioAssistido(episodio.id);

        try {
          await sincronizarStatusAposDesmarcar();
        } catch (erro) {
          console.log(
            'Erro ao sincronizar status após desmarcar:',
            erro
          );
        }

        setEpisodiosAssistidos((estadoAtual) => {
          const novoEstado = new Set(estadoAtual);
          novoEstado.delete(episodio.id);
          return novoEstado;
        });
      } catch (erro) {
        console.log('Erro ao desmarcar episódio:', erro);
        Alert.alert('Não foi possível desmarcar', 'Tente novamente.');
      } finally {
        setEpisodioSendoAlterado(null);
      }

      return;
    }

    // Seleciona somente episódios anteriores que ainda não foram assistidos
    const anterioresNaoAssistidos = (temporada?.episodes ?? []).filter(
      (item) =>
        item.episode_number < episodio.episode_number &&
        episodioFoiLancado(item.air_date) &&
        !episodiosAssistidos.has(item.id)
    );

    if (anterioresNaoAssistidos.length === 0) {
      await salvarEpisodiosComoAssistidos([episodio]);
      return;
    }

    Alert.alert(
      'Marcar episódios anteriores?',
      `Você está marcando o episódio ${episodio.episode_number}. Deseja marcar os anteriores também?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Só este',
          onPress: () => salvarEpisodiosComoAssistidos([episodio]),
        },
        {
          text: 'Marcar anteriores',
          onPress: () =>
            salvarEpisodiosComoAssistidos([
              ...anterioresNaoAssistidos,
              episodio,
            ]),
        },
      ]
    );
  }

  // Informa se a data do episódio já chegou
  function episodioFoiLancado(data: string | null): boolean {
    if (!data) {
      return false;
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const dataEpisodio = new Date(ano, mes - 1, dia);

    if (
      !Number.isFinite(ano) ||
      !Number.isFinite(mes) ||
      !Number.isFinite(dia) ||
      dataEpisodio.getFullYear() !== ano ||
      dataEpisodio.getMonth() !== mes - 1 ||
      dataEpisodio.getDate() !== dia
    ) {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return dataEpisodio <= hoje;
  }

  // Converte a data futura do TMDB para o formato usado no Brasil
  function formatarDataEpisodio(data: string | null): string {
    if (!data) {
      return 'Data ainda não divulgada';
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const dataEpisodio = new Date(ano, mes - 1, dia);

    if (
      !Number.isFinite(ano) ||
      !Number.isFinite(mes) ||
      !Number.isFinite(dia) ||
      dataEpisodio.getFullYear() !== ano ||
      dataEpisodio.getMonth() !== mes - 1 ||
      dataEpisodio.getDate() !== dia
    ) {
      return 'Data ainda não divulgada';
    }

    const dataFormatada =
      dataEpisodio.toLocaleDateString('pt-BR');

    return `Estreia em ${dataFormatada}`;
  }

  // Estado inicial enquanto os dados da série são carregados
  if (carregandoSerie) {
    return (
      <View style={styles.estadoCentralizado}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.textoEstado}>Carregando temporadas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity style={styles.botaoVoltar} onPress={voltarOuInicio}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titulos}>
          <Text style={styles.titulo}>Temporadas</Text>
          <Text style={styles.nomeSerie} numberOfLines={1}>
            {serie?.name}
          </Text>
        </View>
      </View>

      {/* Botões horizontais para selecionar a temporada */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listaTemporadas}
      >
        {serie?.seasons
          .filter(
            (item) =>
              item.season_number > 0 &&
              item.episode_count > 0
          )
          .map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.botaoTemporada,
                numeroSelecionado === item.season_number &&
                  styles.botaoTemporadaAtivo,
              ]}
              onPress={() => {
                setNumeroSelecionado(item.season_number);
                setTemporadaAberta(false);
              }}
            >
              <Text
                style={[
                  styles.textoTemporada,
                  numeroSelecionado === item.season_number &&
                    styles.textoTemporadaAtivo,
                ]}
              >
                T{item.season_number}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {/* Lista vertical dos episódios da temporada escolhida */}
      {carregandoTemporada ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator size="small" color="#E91E63" />
          <Text style={styles.textoEstado}>Carregando episódios...</Text>
        </View>
      ) : mensagemErro ? (
        <View style={styles.estadoCentralizado}>
          <Text style={styles.textoErro}>{mensagemErro}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setTentativaTemporada(
                (valorAtual) => valorAtual + 1
              )
            }
            style={{
              minHeight: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E91E63',
              borderRadius: 19,
              marginTop: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: '#E91E63',
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.areaConteudoTemporada}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaEpisodios}
        >
          <TouchableOpacity
            style={styles.cabecalhoTemporada}
            activeOpacity={0.8}
            onPress={() => setTemporadaAberta((aberta) => !aberta)}
          >
            <View style={styles.infoTemporada}>
              <Text style={styles.tituloTemporada}>{temporada?.name}</Text>
              <Text style={styles.progressoTemporada}>
                {episodiosAssistidos.size} de {temporada?.episodes.length ?? 0}{' '}
                assistidos
              </Text>
            </View>

            <Ionicons
              name={temporadaAberta ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#BDBDBD"
            />
          </TouchableOpacity>

          {temporadaAberta &&
            temporada?.episodes.map((episodio) => {
            const urlImagem = obterUrlEpisodio(episodio.still_path);
            const episodioDisponivel = episodioFoiLancado(episodio.air_date);

            return (
              <View key={episodio.id} style={styles.cardEpisodio}>
                <ImagemEpisodioComFallback uri={urlImagem} />

                <View style={styles.dadosEpisodio}>
                  <View style={styles.linhaSuperiorEpisodio}>
                    <Text style={styles.numeroEpisodio}>
                      Episódio {episodio.episode_number}
                    </Text>

                    {/* A bolinha aparece somente após o lançamento */}
                    {episodioDisponivel && (
                      <TouchableOpacity
                        style={[
                          styles.botaoAssistido,
                          episodiosAssistidos.has(episodio.id) &&
                            styles.botaoAssistidoAtivo,
                        ]}
                        activeOpacity={0.7}
                        disabled={episodioSendoAlterado !== null}
                        onPress={() => alternarEpisodio(episodio)}
                        accessibilityLabel="Marcar episódio como assistido"
                      >
                        {episodioSendoAlterado === episodio.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons
                            name="checkmark"
                            size={15}
                            color={
                              episodiosAssistidos.has(episodio.id)
                                ? '#FFFFFF'
                                : '#E91E63'
                            }
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.nomeEpisodio} numberOfLines={2}>
                    {episodio.name}
                  </Text>

                  {/* Episódios futuros exibem a data no lugar da bolinha */}
                  {!episodioDisponivel && (
                    <View style={styles.dataEpisodio}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color="#F48FB1"
                      />
                      <Text style={styles.textoDataEpisodio}>
                        {formatarDataEpisodio(episodio.air_date)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
