// PÁGINA UTILIZADA PARA BUSCAR E EXPLORAR SÉRIES

// Hooks utilizados para controlar a busca e os resultados
import { useEffect, useState } from 'react';
// Componentes visuais utilizados na página
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones utilizados no campo e nos resultados
import { Ionicons } from '@expo/vector-icons';
// Recurso utilizado para navegar entre as páginas
import { useRouter } from 'expo-router';
// Mantém o conteúdo distante das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Serviço responsável por pesquisar séries no TMDB
import {
  buscarProvedoresStreamingBrasil,
  buscarSeries,
  buscarSeriesPorGeneroPeriodo,
  obterUrlCapaPequena,
  obterUrlLogoProvedor,
  type ProvedorStreaming,
} from '../services/tmdb.service';
// Tipo utilizado para representar cada série
import type { Serie } from '../types/serie';
// Estilos exclusivos da página
import { styles } from '../styles/busca.styles';


interface GeneroBusca {
  id: number | null;
  titulo: string;
  paisOrigem?: string;
}

const generos: GeneroBusca[] = [
  { id: null, titulo: 'Todos' },
  { id: 99, titulo: 'Documentários' },
  { id: 35, titulo: 'Comédia' },
  { id: 18, titulo: 'Drama' },
  { id: 80, titulo: 'Crime' },
  { id: 9648, titulo: 'Mistério' },
  { id: 10759, titulo: 'Ação e aventura' },
  { id: 10765, titulo: 'Sci-fi & fantasia' },
  { id: 16, titulo: 'Animação' },
  { id: 16, titulo: 'Anime', paisOrigem: 'JP' },
  { id: 10764, titulo: 'Reality' },
];


type OrdenacaoExplorar =
  | 'recentes'
  | 'populares'
  | 'avaliados'
  | 'em_breve';

const opcoesOrdenacao: {
  valor: OrdenacaoExplorar;
  titulo: string;
}[] = [
  { valor: 'recentes', titulo: 'Mais recentes' },
  { valor: 'populares', titulo: 'Mais populares' },
  { valor: 'avaliados', titulo: 'Melhor avaliados' },
  { valor: 'em_breve', titulo: 'Em breve' },
];

// Mantém na barra apenas os streamings mais úteis no Brasil.
// Os IDs continuam vindo dinamicamente do TMDB.
function provedorPrincipal(nome: string): boolean {
  const normalizado = nome
    .toLocaleLowerCase('pt-BR')
    .replace('+', ' plus');

  return (
    normalizado.includes('netflix') ||
    normalizado.includes('prime video') ||
    normalizado.includes('amazon prime') ||
    normalizado.includes('max') ||
    normalizado.includes('disney') ||
    normalizado.includes('apple tv') ||
    normalizado.includes('globoplay') ||
    normalizado.includes('paramount') ||
    normalizado.includes('crunchyroll')
  );
}

// Página responsável pela busca e descoberta do catálogo
export default function Busca() {
  // Permite abrir os detalhes da série selecionada
  const router = useRouter();

  // Guarda o texto digitado pelo usuário
  const [termo, setTermo] = useState('');

  // Guarda os resultados recebidos do TMDB
  const [resultados, setResultados] =
    useState<Serie[]>([]);

  // Descoberta por gênero quando não existe texto digitado.
  const [generoSelecionado, setGeneroSelecionado] =
    useState<GeneroBusca>(generos[0]);

  const [provedores, setProvedores] =
    useState<ProvedorStreaming[]>([]);

  const [provedorSelecionado, setProvedorSelecionado] =
    useState<number | null>(null);

  const [ordenacaoSelecionada, setOrdenacaoSelecionada] =
    useState<OrdenacaoExplorar>('recentes');

  const [menuOrdenacaoVisivel, setMenuOrdenacaoVisivel] =
    useState(false);

  const [resultadosDescoberta, setResultadosDescoberta] =
    useState<Serie[]>([]);

  // Controla o carregamento da pesquisa
  const [carregando, setCarregando] =
    useState(false);

  // Guarda uma mensagem caso a busca apresente erro
  const [mensagemErro, setMensagemErro] =
    useState('');

  const [tentativaCarregamento, setTentativaCarregamento] =
    useState(0);

  // Carrega os streamings disponíveis no Brasil uma vez.
  useEffect(() => {
    let ativo = true;

    async function carregarProvedores() {
      try {
        const todos =
          await buscarProvedoresStreamingBrasil();

        if (!ativo) {
          return;
        }

        // Evita logos duplicados/variações pouco úteis e mantém a barra enxuta.
        const principais = todos.filter((provedor) =>
          provedorPrincipal(provedor.provider_name)
        );

        const vistos = new Set<string>();
        const unicos = principais.filter((provedor) => {
          const nome = provedor.provider_name
            .toLocaleLowerCase('pt-BR')
            .replace('amazon ', '')
            .replace('hbo ', '');

          if (vistos.has(nome)) {
            return false;
          }

          vistos.add(nome);
          return true;
        });

        setProvedores(unicos.slice(0, 10));
      } catch (erro) {
        console.log(
          'Erro ao carregar streamings:',
          erro
        );

        // A falha dos logos não bloqueia a descoberta por gênero.
        if (ativo) {
          setProvedores([]);
        }
      }
    }

    carregarProvedores();

    return () => {
      ativo = false;
    };
  }, []);

  // Centraliza a consulta dos resultados para impedir que uma resposta
  // antiga sobrescreva uma pesquisa ou combinação de filtros mais recente.
  useEffect(() => {
    const termoLimpo = termo.trim();
    const pesquisaAtiva = termoLimpo.length >= 2;

    // Com apenas uma letra, aguarda o usuário continuar digitando e evita
    // uma requisição desnecessária ao TMDB.
    if (termoLimpo.length === 1) {
      setCarregando(false);
      setMensagemErro('');
      return;
    }

    let ativo = true;

    const temporizador = setTimeout(
      async () => {
        try {
          setCarregando(true);
          setMensagemErro('');

          if (pesquisaAtiva) {
            const resposta =
              await buscarSeries(termoLimpo);

            if (!ativo) {
              return;
            }

            setResultados(resposta.results);
            return;
          }

          // Todos os filtros, inclusive "Em breve", usam a mesma função.
          // O tmdb.service é responsável por aplicar a regra específica de cada
          // ordenação, preservando gênero, país de origem e streaming.
          const resultadosTratados = (
            await buscarSeriesPorGeneroPeriodo(
              generoSelecionado.id,
              'todos',
              provedorSelecionado,
              generoSelecionado.paisOrigem ?? null,
              ordenacaoSelecionada
            )
          ).results;

          if (!ativo) {
            return;
          }

          setResultadosDescoberta(resultadosTratados);
          setResultados([]);
        } catch (erro) {
          console.log(
            pesquisaAtiva
              ? 'Erro ao pesquisar séries:'
              : 'Erro ao explorar catálogo:',
            erro
          );

          if (!ativo) {
            return;
          }

          if (pesquisaAtiva) {
            setResultados([]);
            setMensagemErro(
              'Não foi possível realizar a busca.'
            );
          } else {
            setResultadosDescoberta([]);
            setMensagemErro(
              'Não foi possível carregar esta seleção.'
            );
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      },
      pesquisaAtiva ? 450 : 0
    );

    return () => {
      ativo = false;
      clearTimeout(temporizador);
    };
  }, [
    termo,
    generoSelecionado,
    provedorSelecionado,
    ordenacaoSelecionada,
    tentativaCarregamento,
  ]);

  const termoLimpo = termo.trim();
  const pesquisaAtiva =
    termoLimpo.length >= 2;

  // Abre a página de detalhes da série escolhida
  function abrirSerie(serie: Serie) {
    router.push({
      pathname: '/serie/[id]',
      params: {
        id: String(serie.id),
      },
    });
  }

  function renderizarCardSerie(serie: Serie) {
    const urlCapa =
      obterUrlCapaPequena(serie.poster_path);

    const ano =
      serie.first_air_date
        ?.substring(0, 4) || '—';

    const nota =
      serie.vote_average > 0
        ? serie.vote_average.toFixed(1)
        : '—';

    const dataEstreia =
      serie.first_air_date
        ? new Date(`${serie.first_air_date}T00:00:00`).toLocaleDateString(
            'pt-BR'
          )
        : null;

    return (
      <TouchableOpacity
        key={serie.id}
        style={styles.card}
        activeOpacity={0.82}
        onPress={() => abrirSerie(serie)}
      >
        {urlCapa ? (
          <Image
            source={{ uri: urlCapa }}
            style={styles.capa}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.semCapa}>
            <Ionicons
              name="image-outline"
              size={28}
              color="#777777"
            />
          </View>
        )}

        <View style={styles.dadosSerie}>
          <Text
            style={styles.nomeSerie}
            numberOfLines={2}
          >
            {serie.name}
          </Text>

          <View style={styles.informacoes}>
            {ordenacaoSelecionada === 'em_breve' ? (
              <>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color="#E91E63"
                />
                <Text style={styles.ano}>
                  {dataEstreia
                    ? `Estreia em ${dataEstreia}`
                    : `Prevista para ${ano}`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.ano}>
                  {ano}
                </Text>

                <View style={styles.separador} />

                <View style={styles.avaliacao}>
                  <Ionicons
                    name="star"
                    size={13}
                    color="#E91E63"
                  />

                  <Text style={styles.nota}>
                    {nota}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text
            style={styles.sinopse}
            numberOfLines={3}
          >
            {serie.overview ||
              'Sinopse não disponível em português.'}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#E91E63"
        />
      </TouchableOpacity>
    );
  }

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
            size={26}
            color="#E91E63"
          />
        </TouchableOpacity>

        <Text style={styles.titulo}>
          Explorar
        </Text>

        {/* Mantém o título centralizado */}
        <View style={styles.espacoCabecalho} />
      </View>

      {/* Campo de pesquisa por nome */}
      <View style={styles.areaPesquisa}>
        <View style={styles.campoPesquisa}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#E91E63"
          />

          <TextInput
            value={termo}
            onChangeText={setTermo}
            placeholder="Buscar série ou anime..."
            placeholderTextColor="#777777"
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {/* Permite limpar rapidamente o texto digitado */}
          {termo.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setTermo('')}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#777777"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Descoberta por gênero quando não há uma pesquisa ativa */}
      {!pesquisaAtiva && termoLimpo.length !== 1 && (
        <View style={styles.areaDescoberta}>
          <Text style={styles.tituloDescoberta}>
            Explorar por gênero
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaGeneros}
          >
            {generos.map((genero) => {
              const selecionado =
                generoSelecionado.id === genero.id &&
                generoSelecionado.paisOrigem ===
                  genero.paisOrigem;

              return (
                <TouchableOpacity
                  key={`${genero.id ?? 'todos'}-${genero.paisOrigem ?? 'geral'}`}
                  style={[
                    styles.genero,
                    selecionado && styles.generoAtivo,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setGeneroSelecionado(genero)
                  }
                >
                  <Text
                    style={[
                      styles.textoGenero,
                      selecionado &&
                        styles.textoGeneroAtivo,
                    ]}
                  >
                    {genero.titulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.tituloStreaming}>
            Onde assistir
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaStreamings}
          >
            <TouchableOpacity
              style={[
                styles.streamingTodos,
                provedorSelecionado === null &&
                  styles.streamingTodosAtivo,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                setProvedorSelecionado(null)
              }
            >
              <Text
                style={[
                  styles.textoStreamingTodos,
                  provedorSelecionado === null &&
                    styles.textoStreamingTodosAtivo,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {provedores.map((provedor) => {
              const selecionado =
                provedorSelecionado ===
                provedor.provider_id;

              const logo =
                obterUrlLogoProvedor(
                  provedor.logo_path
                );

              return (
                <TouchableOpacity
                  key={provedor.provider_id}
                  style={[
                    styles.streaming,
                    selecionado &&
                      styles.streamingAtivo,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setProvedorSelecionado(
                      provedor.provider_id
                    )
                  }
                  accessibilityLabel={
                    provedor.provider_name
                  }
                >
                  {logo ? (
                    <Image
                      source={{ uri: logo }}
                      style={styles.logoStreaming}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name="play-outline"
                      size={20}
                      color="#BDBDBD"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.areaOrdenacao}>
            <TouchableOpacity
              style={styles.botaoOrdenacao}
              activeOpacity={0.8}
              onPress={() =>
                setMenuOrdenacaoVisivel(
                  (valorAtual) => !valorAtual
                )
              }
            >
              <Ionicons
                name="filter-outline"
                size={16}
                color="#BDBDBD"
              />

              <Text style={styles.textoOrdenacao}>
                {
                  opcoesOrdenacao.find(
                    (opcao) =>
                      opcao.valor === ordenacaoSelecionada
                  )?.titulo
                }
              </Text>

              <Ionicons
                name={
                  menuOrdenacaoVisivel
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={15}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          {menuOrdenacaoVisivel && (
            <View style={styles.menuOrdenacao}>
              {opcoesOrdenacao.map((opcao) => {
                const ativa =
                  opcao.valor === ordenacaoSelecionada;

                return (
                  <TouchableOpacity
                    key={opcao.valor}
                    style={[
                      styles.opcaoOrdenacao,
                      ativa &&
                        styles.opcaoOrdenacaoAtiva,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setOrdenacaoSelecionada(
                        opcao.valor
                      );
                      setMenuOrdenacaoVisivel(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.textoOpcaoOrdenacao,
                        ativa &&
                          styles.textoOpcaoOrdenacaoAtiva,
                      ]}
                    >
                      {opcao.titulo}
                    </Text>

                    {ativa && (
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#E91E63"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Área principal dos resultados */}
      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator
            size="large"
            color="#E91E63"
          />

          <Text style={styles.textoEstado}>
            {pesquisaAtiva
              ? 'Procurando...'
              : 'Carregando catálogo...'}
          </Text>
        </View>
      ) : mensagemErro ? (
        <View style={styles.estadoCentralizado}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#F48FB1"
          />

          <Text style={styles.textoErro}>
            {mensagemErro}
          </Text>

          {/* Repete a última pesquisa quando ocorrer uma falha de conexão */}
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
              setTentativaCarregamento(
                (valorAtual) => valorAtual + 1
              )
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
      ) : !pesquisaAtiva ? (
        termoLimpo.length === 1 ? (
          <View style={styles.estadoCentralizado}>
            <Ionicons
              name="search-outline"
              size={48}
              color="#E91E63"
            />

            <Text style={styles.tituloEstado}>
              Continue digitando
            </Text>

            <Text style={styles.textoEstado}>
              Digite pelo menos duas letras para pesquisar.
            </Text>
          </View>
        ) : resultadosDescoberta.length === 0 ? (
          <View style={styles.estadoCentralizado}>
            <Ionicons
              name="albums-outline"
              size={48}
              color="#E91E63"
            />

            <Text style={styles.tituloEstado}>
              Nada encontrado neste filtro
            </Text>

            <Text style={styles.textoEstado}>
              Tente outro gênero, streaming ou ordenação.
            </Text>
          </View>
        ) : (
          <FlatList
            data={resultadosDescoberta}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => renderizarCardSerie(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lista}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={7}
            removeClippedSubviews
            ListHeaderComponent={
              <Text style={styles.tituloResultados}>Descobrir</Text>
            }
          />
        )
      ) : resultados.length === 0 ? (
        <View style={styles.estadoCentralizado}>
          <Ionicons
            name="tv-outline"
            size={48}
            color="#E91E63"
          />

          <Text style={styles.tituloEstado}>
            Nenhum resultado encontrado
          </Text>

          <Text style={styles.textoEstado}>
            Tente pesquisar usando outro nome.
          </Text>
        </View>
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderizarCardSerie(item)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={
            <Text style={styles.tituloResultados}>Resultados</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}