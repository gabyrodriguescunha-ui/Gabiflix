// PÁGINA QUE EXIBE AS SÉRIES SALVAS PELO USUÁRIO

// Hooks utilizados para carregar novamente a lista ao retornar para a página
import { useCallback, useMemo, useState } from 'react';
// Componentes visuais do React Native
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones usados no cabeçalho, avaliação e estado sem capa
import { Ionicons } from '@expo/vector-icons';
// Navegação e evento disparado quando a página recebe foco
import { useFocusEffect, useRouter } from 'expo-router';
// Mantém o conteúdo distante das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Recupera os registros salvos no Supabase
import {
  atualizarStatusSerie,
  buscarMinhaLista,
  excluirSerieCompletamente,
  type ItemMinhaLista,
  type StatusUsuario,
} from '../services/minha-lista.service';
// Monta a URL completa de cada capa do TMDB
import { obterUrlCapaPequena } from '../services/tmdb.service';
// Modal personalizado utilizado nas confirmações do Gabiflix
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
// Estilos exclusivos desta página
import { styles } from '../styles/minha-lista.styles';


// Representa os filtros disponíveis no topo da página
type FiltroLista =
  | 'assistindo'
  | 'quero_assistir'
  | 'pausada'
  | 'finalizada'
  | 'abandonada'
  | 'reassistindo';

// Representa as opções disponíveis para ordenar a lista
type OrdenacaoLista =
  | 'recentes'
  | 'antigas'
  | 'nome_az'
  | 'nome_za'
  | 'nota_maior'
  | 'nota_menor';

// Página acessada pela opção Minha lista do menu lateral
export default function MinhaLista() {
  const router = useRouter();
  // Controla os avisos e erros com o mesmo design visual do Gabiflix
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
  } | null>(null);

  function mostrarAviso(titulo: string, descricao: string) {
    setAviso({ titulo, descricao });
  }

  function fecharAviso() {
    setAviso(null);
  }

  const [series, setSeries] = useState<ItemMinhaLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  // Permite repetir a consulta quando o carregamento da lista falhar
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);
  const [serieSelecionada, setSerieSelecionada] =
    useState<ItemMinhaLista | null>(null);

  // Guarda a série escolhida enquanto o modal de remoção está aberto
  const [serieParaRemover, setSerieParaRemover] =
    useState<ItemMinhaLista | null>(null);

  const [salvandoAcao, setSalvandoAcao] = useState(false);

  // Controla qual grupo de séries será apresentado na página
  const [filtroSelecionado, setFiltroSelecionado] =
    useState<FiltroLista>('assistindo');

  // Pesquisa pelo nome dentro da categoria selecionada.
  const [textoBusca, setTextoBusca] = useState('');

  // Controla a abertura do menu de ordenação
  const [modalOrdenacaoVisivel, setModalOrdenacaoVisivel] =
    useState(false);

  // Guarda a forma escolhida para ordenar as séries
  const [ordenacaoSelecionada, setOrdenacaoSelecionada] =
    useState<OrdenacaoLista>('recentes');

  // Nomes amigáveis exibidos no card e no menu
  const nomesStatus: Record<StatusUsuario, string> = {
    quero_assistir: 'Quero assistir',
    assistindo: 'Assistindo',
    pausada: 'Pausada',
    finalizada: 'Finalizada',
    abandonada: 'Abandonada',
    reassistindo: 'Assistindo novamente',
  };

  // Opções exibidas na barra horizontal de filtros
  const filtros: {
    valor: FiltroLista;
    titulo: string;
  }[] = [
    { valor: 'assistindo', titulo: 'Assistindo' },
    { valor: 'quero_assistir', titulo: 'Quero assistir' },
    { valor: 'pausada', titulo: 'Pausadas' },
    { valor: 'finalizada', titulo: 'Finalizadas' },
    { valor: 'abandonada', titulo: 'Abandonadas' },
    { valor: 'reassistindo', titulo: 'Reassistindo' },
  ];

  // Quantidade de séries em cada categoria.
  // O contador considera toda a lista, independentemente do texto pesquisado.
  const contagemPorFiltro = useMemo(
    () =>
      filtros.reduce(
        (acumulador, filtro) => {
          acumulador[filtro.valor] = series.filter(
            (item) => item.status_usuario === filtro.valor
          ).length;
          return acumulador;
        },
        {} as Record<FiltroLista, number>
      ),
    [series]
  );

  // Opções apresentadas no menu de ordenação
  const opcoesOrdenacao: {
    valor: OrdenacaoLista;
    titulo: string;
  }[] = [
    { valor: 'recentes', titulo: 'Adicionadas recentemente' },
    { valor: 'antigas', titulo: 'Adicionadas há mais tempo' },
    { valor: 'nome_az', titulo: 'Nome A–Z' },
    { valor: 'nome_za', titulo: 'Nome Z–A' },
    { valor: 'nota_maior', titulo: 'Melhor avaliação' },
    { valor: 'nota_menor', titulo: 'Pior avaliação' },
  ];

  // Normaliza textos para a busca funcionar mesmo sem acentos.
  function normalizarTexto(valor: string) {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  const termoBusca = normalizarTexto(textoBusca);

  // Filtragem e ordenação só são recalculadas quando algo relevante muda.
  const seriesOrdenadas = useMemo(() => {
    const filtradas = series.filter((item) => {
      if (item.status_usuario !== filtroSelecionado) return false;
      if (!termoBusca) return true;
      return normalizarTexto(item.nome).includes(termoBusca);
    });

    return [...filtradas].sort((serieA, serieB) => {
      switch (ordenacaoSelecionada) {
        case 'antigas':
          return new Date(serieA.criado_em).getTime() - new Date(serieB.criado_em).getTime();
        case 'nome_az':
          return serieA.nome.localeCompare(serieB.nome, 'pt-BR');
        case 'nome_za':
          return serieB.nome.localeCompare(serieA.nome, 'pt-BR');
        case 'nota_maior':
          return (serieB.nota ?? -1) - (serieA.nota ?? -1);
        case 'nota_menor':
          return (serieA.nota ?? Number.POSITIVE_INFINITY) - (serieB.nota ?? Number.POSITIVE_INFINITY);
        case 'recentes':
        default:
          return new Date(serieB.criado_em).getTime() - new Date(serieA.criado_em).getTime();
      }
    });
  }, [series, filtroSelecionado, termoBusca, ordenacaoSelecionada]);

  // Altera o status no Supabase e atualiza o card sem recarregar a página
  async function alterarStatus(status: StatusUsuario) {
    if (!serieSelecionada || salvandoAcao) {
      return;
    }

    if (serieSelecionada.status_usuario === status) {
      setSerieSelecionada(null);
      return;
    }

    try {
      setSalvandoAcao(true);
      await atualizarStatusSerie(serieSelecionada.serie_id, status);
      setSeries((listaAtual) =>
        listaAtual.map((item) =>
          item.serie_id === serieSelecionada.serie_id
            ? { ...item, status_usuario: status }
            : item
        )
      );
      setSerieSelecionada(null);
    } catch (erro) {
      console.log('Erro ao atualizar status:', erro);
      mostrarAviso('Não foi possível alterar', 'Tente novamente.');
    } finally {
      setSalvandoAcao(false);
    }
  }

  // Abre o modal personalizado antes da exclusão definitiva
  function confirmarExclusao() {
    if (!serieSelecionada || salvandoAcao) {
      return;
    }

    // Fecha o menu inferior antes de mostrar a confirmação
    setSerieParaRemover(serieSelecionada);
    setSerieSelecionada(null);
  }

  // Fecha somente o modal de confirmação
  function fecharModalRemocao() {
    if (salvandoAcao) {
      return;
    }

    setSerieParaRemover(null);
  }

  // Remove a série e todo o progresso somente depois da confirmação
  async function removerSerieConfirmada() {
    if (!serieParaRemover || salvandoAcao) {
      return;
    }

    const serie = serieParaRemover;

    try {
      setSalvandoAcao(true);

      await excluirSerieCompletamente(
        serie.serie_id
      );

      setSeries((listaAtual) =>
        listaAtual.filter(
          (item) =>
            item.serie_id !== serie.serie_id
        )
      );

      setSerieParaRemover(null);
    } catch (erro) {
      console.log(
        'Erro ao remover série:',
        erro
      );

      mostrarAviso('Não foi possível remover', 'Tente novamente.');
    } finally {
      setSalvandoAcao(false);
    }
  }

  // Carrega os registros sempre que o usuário entrar ou retornar à página
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarLista() {
        try {
          setCarregando(true);
          setMensagemErro('');
          const resultado = await buscarMinhaLista();

          if (paginaAtiva) {
            setSeries(resultado);
          }
        } catch (erro) {
          console.log('Erro ao carregar Minha lista:', erro);

          if (paginaAtiva) {
            setMensagemErro('Não foi possível carregar sua lista.');
          }
        } finally {
          if (paginaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarLista();

      return () => {
        paginaAtiva = false;
      };
    }, [tentativaCarregamento])
  );

  // Cria um card horizontal para cada registro retornado pelo Supabase
  function renderizarSerie(item: ItemMinhaLista) {
    const urlCapa = obterUrlCapaPequena(item.poster_path);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.82}
        onPress={() =>
          router.push({
            pathname: '/serie/[id]',
            params: {
              id: String(item.serie_id),
            },
          })
        }
      >
        {/* Exibe a capa ou um estado visual quando a imagem não estiver disponível */}
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
              size={30}
              color="#777777"
            />
          </View>
        )}

        {/* Agrupa as informações principais da série */}
        <View style={styles.conteudoCard}>
          <View style={styles.topoCard}>
            <View style={styles.areaTituloCard}>
              <Text
                style={styles.nomeSerie}
                numberOfLines={2}
              >
                {item.nome}
              </Text>

              {/* Status escolhido pelo usuário para organizar a lista */}
              <View style={styles.statusContainer}>
                <View style={styles.pontoStatus} />

                <Text style={styles.statusUsuario}>
                  {nomesStatus[item.status_usuario] ??
                    'Quero assistir'}
                </Text>
              </View>
            </View>

            {/* Abre o menu de organização da série */}
            <TouchableOpacity
              style={styles.botaoMenu}
              activeOpacity={0.7}
              onPress={(evento) => {
                evento.stopPropagation();
                setSerieSelecionada(item);
              }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={21}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Ano e avaliação recebidos dos dados já salvos */}
          <View style={styles.informacoes}>
            <Text style={styles.ano}>
              {item.ano || '—'}
            </Text>

            <View style={styles.separadorInformacoes} />

            <View style={styles.avaliacao}>
              <Ionicons
                name="star"
                size={13}
                color="#E91E63"
              />

              <Text style={styles.nota}>
                {item.nota !== null &&
                Number(item.nota) > 0
                  ? Number(item.nota).toFixed(1)
                  : '—'}
              </Text>
            </View>
          </View>

          {/* Indica que o card pode ser aberto para acessar detalhes e episódios */}
          <View style={styles.rodapeCard}>
            <Text style={styles.textoAbrir}>
              Ver detalhes
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#E91E63"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={router.back}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.titulos}>
          <Text style={styles.titulo}>Minha lista</Text>
          <Text style={styles.subtitulo}>
            {series.length} {series.length === 1 ? 'série salva' : 'séries salvas'}
          </Text>
        </View>

        {/* Abre o menu responsável por ordenar as séries */}
        {!carregando && !mensagemErro && series.length > 0 ? (
          <TouchableOpacity
            style={styles.botaoOrdenar}
            activeOpacity={0.7}
            onPress={() => setModalOrdenacaoVisivel(true)}
            accessibilityLabel="Ordenar séries"
          >
            <Ionicons
              name="swap-vertical-outline"
              size={23}
              color="#E91E63"
            />
          </TouchableOpacity>
        ) : (
          // Mantém o título centralizado mesmo quando não existe ordenação disponível
          <View style={styles.espacoCabecalho} />
        )}
      </View>

      {/* Busca somente entre as séries já salvas na Minha lista */}
      {!carregando && !mensagemErro && series.length > 0 && (
        <View style={styles.areaBusca}>
          <View style={styles.campoBusca}>
            <Ionicons
              name="search-outline"
              size={19}
              color="#8D8D8D"
            />

            <TextInput
              style={styles.inputBusca}
              value={textoBusca}
              onChangeText={setTextoBusca}
              placeholder="Buscar nesta categoria..."
              placeholderTextColor="#6F6F6F"
              selectionColor="#E91E63"
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {textoBusca.length > 0 && (
              <TouchableOpacity
                style={styles.botaoLimparBusca}
                activeOpacity={0.7}
                onPress={() => setTextoBusca('')}
                accessibilityLabel="Limpar busca"
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#777777"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filtros utilizados para organizar visualmente as séries da lista */}
      {!carregando && !mensagemErro && series.length > 0 && (
        <View style={styles.areaFiltros}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaFiltros}
          >
            {filtros.map((filtro) => {
              const selecionado =
                filtroSelecionado === filtro.valor;

              return (
                <TouchableOpacity
                  key={filtro.valor}
                  style={[
                    styles.filtro,
                    selecionado && styles.filtroAtivo,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setFiltroSelecionado(filtro.valor);
                    setTextoBusca('');
                  }}
                >
                  <Text
                    style={[
                      styles.textoFiltro,
                      selecionado &&
                        styles.textoFiltroAtivo,
                    ]}
                  >
                    {filtro.titulo}
                  </Text>

                  <View
                    style={[
                      styles.contadorFiltro,
                      selecionado &&
                        styles.contadorFiltroAtivo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoContadorFiltro,
                        selecionado &&
                          styles.textoContadorFiltroAtivo,
                      ]}
                    >
                      {contagemPorFiltro[filtro.valor]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Carregamento, erro ou lista de séries */}
      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator
            size="large"
            color="#E91E63"
          />

          <Text style={styles.textoEstado}>
            Carregando sua lista...
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

          {/* Repete a consulta ao Supabase sem precisar sair da página */}
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
      ) : series.length === 0 ? (
        <View style={styles.estadoCentralizado}>
          <View style={styles.estadoVazio}>
            <Ionicons
              name="heart-outline"
              size={52}
              color="#E91E63"
            />

            <Text style={styles.tituloVazio}>
              Sua lista está vazia
            </Text>

            <Text style={styles.textoVazio}>
              Explore o catálogo e adicione as séries que você quer acompanhar.
            </Text>

            {/* Leva o usuário diretamente para o Explorar para descobrir séries */}
            <TouchableOpacity
              style={styles.botaoExplorar}
              activeOpacity={0.8}
              onPress={() => router.push('/busca')}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.textoBotaoExplorar}>
                Explorar catálogo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : seriesOrdenadas.length === 0 ? (
        <View style={styles.estadoCentralizado}>
          <View style={styles.estadoVazio}>
            <Ionicons
              name="albums-outline"
              size={48}
              color="#E91E63"
            />

            <Text style={styles.tituloVazio}>
              {termoBusca
                ? 'Nenhuma série encontrada'
                : 'Nenhuma série nesta categoria'}
            </Text>

            <Text style={styles.textoVazio}>
              {termoBusca
                ? `Não encontramos “${textoBusca.trim()}” nesta categoria.`
                : 'Altere o status de uma série ou escolha outro filtro.'}
            </Text>

            {termoBusca && (
              <TouchableOpacity
                style={styles.botaoLimparResultado}
                activeOpacity={0.8}
                onPress={() => setTextoBusca('')}
              >
                <Text style={styles.textoLimparResultado}>
                  Limpar busca
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={seriesOrdenadas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderizarSerie(item)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      {/* Menu inferior utilizado para escolher a ordenação da lista */}
      <Modal
        visible={modalOrdenacaoVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOrdenacaoVisivel(false)}
      >
        <Pressable
          style={styles.fundoModal}
          onPress={() => setModalOrdenacaoVisivel(false)}
        >
          <Pressable
            style={styles.menuOrdenacao}
            onPress={() => {}}
          >
            <View style={styles.cabecalhoMenu}>
              <Text style={styles.tituloMenu}>
                Ordenar por
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setModalOrdenacaoVisivel(false)
                }
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Cada opção altera somente a ordem visual da lista */}
            {opcoesOrdenacao.map((opcao) => {
              const selecionada =
                ordenacaoSelecionada === opcao.valor;

              return (
                <TouchableOpacity
                  key={opcao.valor}
                  style={styles.itemOrdenacao}
                  activeOpacity={0.75}
                  onPress={() => {
                    setOrdenacaoSelecionada(opcao.valor);
                    setModalOrdenacaoVisivel(false);
                  }}
                >
                  <View
                    style={[
                      styles.radioOrdenacao,
                      selecionada &&
                        styles.radioOrdenacaoAtivo,
                    ]}
                  >
                    {selecionada && (
                      <View
                        style={
                          styles.radioOrdenacaoCentro
                        }
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.textoItemOrdenacao,
                      selecionada &&
                        styles.textoItemOrdenacaoAtivo,
                    ]}
                  >
                    {opcao.titulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Menu inferior com as ações disponíveis para a série */}
      <Modal
        visible={serieSelecionada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSerieSelecionada(null)}
      >
        <Pressable
          style={styles.fundoModal}
          onPress={() => setSerieSelecionada(null)}
        >
          <Pressable style={styles.menuAcoes} onPress={() => {}}>
            <View style={styles.cabecalhoMenu}>
              <Text style={styles.tituloMenu} numberOfLines={1}>
                {serieSelecionada?.nome}
              </Text>
              <TouchableOpacity onPress={() => setSerieSelecionada(null)}>
                <Ionicons name="close" size={25} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {(
              [
                {
                  status: 'quero_assistir',
                  icone: 'bookmark-outline',
                  titulo: 'Quero assistir',
                },
                {
                  status: 'assistindo',
                  icone: 'play-circle-outline',
                  titulo: 'Continuar assistindo',
                },
                {
                  status: 'pausada',
                  icone: 'pause-circle-outline',
                  titulo: 'Pausar série',
                },
                {
                  status: 'finalizada',
                  icone: 'checkmark-circle-outline',
                  titulo: 'Finalizar série',
                },
                {
                  status: 'abandonada',
                  icone: 'close-circle-outline',
                  titulo: 'Abandonar série',
                },
                {
                  status: 'reassistindo',
                  icone: 'refresh-outline',
                  titulo: 'Assistir novamente',
                },
              ] as {
                status: StatusUsuario;
                icone:
                  | 'bookmark-outline'
                  | 'play-circle-outline'
                  | 'pause-circle-outline'
                  | 'checkmark-circle-outline'
                  | 'close-circle-outline'
                  | 'refresh-outline';
                titulo: string;
              }[]
            )
              .filter(
                (acao) =>
                  acao.status !==
                  serieSelecionada?.status_usuario
              )
              .map((acao) => (
                <TouchableOpacity
                  key={acao.status}
                  style={styles.itemMenu}
                  activeOpacity={0.75}
                  disabled={salvandoAcao}
                  onPress={() =>
                    alterarStatus(acao.status)
                  }
                >
                  <Ionicons
                    name={acao.icone}
                    size={21}
                    color="#F48FB1"
                  />

                  <Text style={styles.textoItemMenu}>
                    {acao.titulo}
                  </Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              style={[
                styles.itemMenu,
                styles.itemExcluir,
              ]}
              activeOpacity={0.75}
              disabled={salvandoAcao}
              onPress={confirmarExclusao}
            >
              <Ionicons name="trash-outline" size={21} color="#FF6B81" />
              <Text style={styles.textoExcluir}>Remover completamente</Text>
            </TouchableOpacity>

            {salvandoAcao && (
              <ActivityIndicator style={styles.carregandoMenu} color="#E91E63" />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmação personalizada para remover a série e todo o progresso */}
      <ModalConfirmacao
        visivel={Boolean(serieParaRemover)}
        titulo="Remover completamente?"
        descricao={
          serieParaRemover
            ? `Todo o progresso de ${serieParaRemover.nome} será apagado. Essa ação não pode ser desfeita.`
            : ''
        }
        onFechar={fecharModalRemocao}
        acoes={[
          {
            texto: salvandoAcao
              ? 'Removendo...'
              : 'Remover',
            tipo: 'principal',
            onPress:
              removerSerieConfirmada,
          },
          {
            texto: 'Cancelar',
            tipo: 'cancelar',
            onPress:
              fecharModalRemocao,
          },
        ]}
      />
    
      {/* Avisos e erros seguem o mesmo padrão visual das confirmações */}
      <ModalConfirmacao
        visivel={Boolean(aviso)}
        titulo={aviso?.titulo ?? ''}
        descricao={aviso?.descricao ?? ''}
        onFechar={fecharAviso}
        acoes={[
          {
            texto: 'Entendi',
            tipo: 'principal',
            onPress: fecharAviso,
          },
        ]}
      />
</SafeAreaView>
  );
}