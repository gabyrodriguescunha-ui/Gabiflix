// ESTILOS DA PÁGINA MINHA LISTA

// Importa a ferramenta utilizada para criar os estilos
import { StyleSheet } from 'react-native';

// Estilos exclusivos da página Minha lista
export const styles = StyleSheet.create({
  // Fundo principal da página
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho apresentado no topo da página
  cabecalho: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#242424',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },

  // Botão utilizado para retornar à página anterior
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Agrupa o título e a quantidade de séries salvas
  titulos: {
    flex: 1,
    marginLeft: 8,
  },

  // Botão localizado no lado direito do cabeçalho
  botaoOrdenar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 22,
  },

  // Reserva o mesmo espaço do botão de ordenação quando a lista estiver vazia
  espacoCabecalho: {
    width: 44,
    height: 44,
  },

  // Título principal da página
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },

  // Quantidade de séries presentes na lista
  subtitulo: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 1,
  },

  // Área de pesquisa dentro da Minha lista
  areaBusca: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 2,
  },

  campoBusca: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 22,
    paddingHorizontal: 14,
  },

  inputBusca: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },

  botaoLimparBusca: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botaoLimparResultado: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 20,
    marginTop: 16,
    paddingHorizontal: 18,
  },

  textoLimparResultado: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  // Área que separa visualmente os filtros do cabeçalho
  areaFiltros: {
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },

  // Espaçamento interno da barra horizontal de filtros
  listaFiltros: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // Aparência padrão das opções de filtro
  filtro: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 18,
    marginRight: 8,
    paddingHorizontal: 12,
  },

  // Destaca o filtro selecionado com a cor principal do Gabiflix
  filtroAtivo: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },

  // Texto das opções que ainda não foram selecionadas
  textoFiltro: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  // Texto branco apresentado no filtro selecionado
  textoFiltroAtivo: {
    color: '#FFFFFF',
  },

  contadorFiltro: {
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 11,
    marginLeft: 7,
    paddingHorizontal: 6,
  },

  contadorFiltroAtivo: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },

  textoContadorFiltro: {
    color: '#AFAFAF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5,
  },

  textoContadorFiltroAtivo: {
    color: '#FFFFFF',
  },

  // Espaçamento da lista vertical de séries
  lista: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },

  // Card horizontal utilizado para cada série salva
  card: {
    minHeight: 146,
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    marginBottom: 14,
    padding: 10,
  },

  // Capa vertical apresentada no lado esquerdo do card
  capa: {
    width: 82,
    height: 124,
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 10,
    borderWidth: 1,
  },

  // Espaço utilizado quando a série não possuir capa
  semCapa: {
    width: 82,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 10,
    borderWidth: 1,
  },

  // Ocupa o restante do card ao lado da capa
  conteudoCard: {
    flex: 1,
    minHeight: 124,
    marginLeft: 13,
  },

  // Organiza o nome da série e o menu de ações
  topoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // Mantém o título distante do botão de três pontos
  areaTituloCard: {
    flex: 1,
    paddingRight: 8,
  },

  // Nome principal da série
  nomeSerie: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },

  // Botão responsável por abrir as opções da série
  botaoMenu: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    borderRadius: 17,
  },

  // Agrupa o pequeno ponto rosa e o status escolhido pelo usuário
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  // Pequeno indicador visual utilizado ao lado do status
  pontoStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E91E63',
    marginRight: 6,
  },

  // Nome amigável do status da série
  statusUsuario: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  // Agrupa ano e avaliação
  informacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },

  // Ano salvo junto aos dados da série
  ano: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },

  // Pequeno separador entre o ano e a avaliação
  separadorInformacoes: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#555555',
    marginHorizontal: 8,
  },

  // Agrupa a estrela e a nota
  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Nota armazenada para a série
  nota: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginLeft: 4,
  },

  // Mantém o atalho visual na parte inferior do card
  rodapeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
  },

  // Texto exibido antes da seta para detalhes
  textoAbrir: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    marginRight: 2,
  },

  // Menu utilizado exclusivamente para escolher a ordenação
  menuOrdenacao: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 34,
  },

  // Linha individual apresentada no menu de ordenação
  itemOrdenacao: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#292929',
    borderBottomWidth: 1,
  },

  // Círculo externo que indica a opção escolhida
  radioOrdenacao: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6B6B6B',
    borderRadius: 10,
  },

  // Borda rosa da opção selecionada
  radioOrdenacaoAtivo: {
    borderColor: '#E91E63',
  },

  // Pequeno círculo apresentado dentro da opção selecionada
  radioOrdenacaoCentro: {
    width: 10,
    height: 10,
    backgroundColor: '#E91E63',
    borderRadius: 5,
  },

  // Texto padrão das opções de ordenação
  textoItemOrdenacao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginLeft: 13,
  },

  // Texto da opção selecionada
  textoItemOrdenacaoAtivo: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
  },

  // Fundo escuro apresentado atrás do menu de ações
  fundoModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },

  // Menu que sobe da parte inferior da tela
  menuAcoes: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 34,
  },

  // Cabeçalho do menu de ações
  cabecalhoMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#303030',
    borderBottomWidth: 1,
    paddingBottom: 14,
  },

  // Nome da série exibido dentro do menu
  tituloMenu: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginRight: 12,
  },

  // Opção individual do menu de ações
  itemMenu: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#292929',
    borderBottomWidth: 1,
  },

  // Texto das opções comuns do menu
  textoItemMenu: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginLeft: 13,
  },

  // Remove a borda inferior da última ação
  itemExcluir: {
    borderBottomWidth: 0,
  },

  // Texto utilizado exclusivamente na ação de exclusão
  textoExcluir: {
    color: '#FF6B81',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    marginLeft: 13,
  },

  // Indicador apresentado enquanto uma alteração é salva
  carregandoMenu: {
    marginTop: 10,
  },

  // Centraliza carregamento, erro e estados sem resultados
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  // Texto mostrado durante o carregamento
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 12,
  },

  // Texto utilizado quando a consulta apresenta erro
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },

  // Conteúdo utilizado quando não existem séries para apresentar
  estadoVazio: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  // Título do estado vazio
  tituloVazio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    marginTop: 14,
    textAlign: 'center',
  },

  // Explicação apresentada abaixo do título do estado vazio
  textoVazio: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    textAlign: 'center',
  },

  // Ação principal apresentada somente quando o usuário ainda não salvou nenhuma série
  botaoExplorar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 23,
    marginTop: 22,
    paddingHorizontal: 22,
  },

  // Texto branco do botão que leva de volta à descoberta de séries
  textoBotaoExplorar: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginLeft: 7,
  },
});