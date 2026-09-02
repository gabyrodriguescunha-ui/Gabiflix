// ESTILOS DA PÁGINA DE DETALHES

// Importa a ferramenta de criação de estilos
import { StyleSheet } from 'react-native';

// Estilos exclusivos da página de detalhes
export const styles = StyleSheet.create({
  // Fundo principal da página
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Centraliza estados de carregamento e mensagens de erro
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 28,
  },

  // Texto utilizado nos carregamentos
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginTop: 10,
  },

  // Mensagem apresentada quando não for possível carregar a série
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },

  // Botão utilizado no estado de erro
  botaoVoltarErro: {
    borderColor: '#E91E63',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },

  textoBotaoVoltar: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },

  // Cabeçalho fixo visual localizado antes do conteúdo
  cabecalho: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
  },

  // Botão utilizado para retornar à página anterior
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nome da página apresentado no centro do cabeçalho
  tituloCabecalho: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },

  // Mantém o título centralizado mesmo sem utilizar o coração ainda
  espacoCabecalho: {
    width: 44,
    height: 44,
  },

  // Espaçamento geral do conteúdo rolável
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 42,
  },

  // Organiza a capa e as informações principais lado a lado
  apresentacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Capa vertical da série
  capa: {
    width: 122,
    height: 181,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#424242',
  },

  // Espaço exibido quando a série não possuir poster
  capaAusente: {
    width: 122,
    height: 181,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#424242',
  },

  // Agrupa as informações localizadas ao lado da capa
  informacoesPrincipais: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 4,
  },

  // Nome principal da série
  nome: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    lineHeight: 25,
    marginBottom: 7,
  },

  // Organiza nota, ano e gênero em uma única linha
  linhaInformacoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 6,
  },

  // Textos menores das informações da série
  informacao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
  },

  // Informações exibidas em linhas separadas
  informacaoMaior: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 16,
    marginBottom: 2,
  },

  separador: {
    color: '#777777',
    fontSize: 11,
    marginHorizontal: 5,
  },

  nota: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginLeft: 4,
  },

  // Etiqueta utilizada para informar a situação oficial da série
  statusSerie: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 18,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },

  // Texto da situação oficial
  textoStatusSerie: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    marginLeft: 4,
  },

  // Mantém canceladas dentro da mesma identidade do Gabiflix
  statusCancelada: {
    borderColor: '#F48FB1',
    backgroundColor: 'rgba(244, 143, 177, 0.08)',
  },

  textoStatusCancelada: {
    color: '#F48FB1',
  },

  // Renovadas continuam utilizando o rosa principal do aplicativo
  statusRenovada: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },

  // Produções planejadas utilizam uma borda mais discreta
  statusPlanejada: {
    borderColor: '#C44C81',
    backgroundColor: 'rgba(196, 76, 129, 0.08)',
  },

  // Lista horizontal de gêneros
  generos: {
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Etiqueta individual de gênero
  genero: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 18,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  textoGenero: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  // Título reutilizado nas diferentes partes da página
  tituloSecao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  // Texto da sinopse
  sinopse: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  // Seção horizontal do elenco principal
  secaoElenco: {
    marginTop: 24,
  },

  cabecalhoElenco: {
    marginBottom: 12,
  },

  listaElenco: {
    paddingRight: 8,
  },

  pessoaElenco: {
    width: 78,
    marginRight: 13,
    alignItems: 'center',
  },

  fotoElenco: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },

  fotoElencoAusente: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },

  nomeElenco: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 9.5,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 7,
  },

  personagemElenco: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 8.5,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 2,
  },

  // Botão responsável por adicionar ou remover a série da lista
  botaoMinhaLista: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 23,
    marginTop: 20,
  },

  // Aparência utilizada quando a série já pertence à lista
  botaoMinhaListaAtivo: {
    backgroundColor: '#C44C81',
  },

  textoBotaoMinhaLista: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginLeft: 6,
  },

  // Cria uma distância maior antes da seleção das temporadas
  tituloComEspaco: {
    marginTop: 27,
    marginBottom: 11,
  },

  // Espaçamento interno da lista horizontal de temporadas
  listaTemporadas: {
    paddingRight: 18,
    paddingBottom: 3,
  },

  // Card individual de uma temporada
  botaoTemporada: {
    width: 106,
    height: 67,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#353535',
    borderRadius: 12,
    marginRight: 9,
  },

  // Temporada selecionada utiliza o rosa principal
  botaoTemporadaAtivo: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },

  // Número da temporada
  numeroTemporada: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },

  // Texto localizado abaixo do número da temporada
  textoTemporada: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: -2,
  },

  textoTemporadaAtivo: {
    color: '#FFFFFF',
  },

  // Organiza Episódios e Temporada X na mesma linha
  cabecalhoEpisodios: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 11,
  },

  nomeTemporadaAtual: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },

  // Estado apresentado durante a troca de temporada
  carregandoTemporada: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Agrupa todos os cards de episódios
  listaEpisodios: {
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 14,
    overflow: 'hidden',
  },

  // Card horizontal de cada episódio
  cardEpisodio: {
    minHeight: 91,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 9,
    backgroundColor: '#151515',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },

  // Área utilizada para permitir elementos sobrepostos à imagem
  areaImagemEpisodio: {
    width: 110,
    height: 67,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#242424',
  },

  imagemEpisodio: {
    width: '100%',
    height: '100%',
  },

  imagemEpisodioAusente: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
  },

  // Círculo apresentado sobre a imagem do episódio
  iconeEpisodio: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -17,
    marginLeft: -17,
    backgroundColor: 'rgba(18,18,18,0.78)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 17,
  },

  // Pequena barra apresentada abaixo da imagem quando o episódio foi assistido
  barraAssistido: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '45%',
    height: 3,
    backgroundColor: '#E91E63',
  },

  // Informações textuais localizadas ao lado da imagem
  dadosEpisodio: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 11,
    marginRight: 6,
  },

  nomeEpisodio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    lineHeight: 17,
  },

  detalheEpisodio: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 3,
  },

  // Organiza o ícone e a data de episódios futuros
  dataEpisodio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  textoDataEpisodio: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginLeft: 4,
  },

  // Área localizada no lado direito de episódios já disponíveis
  estadoEpisodio: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listaTemporadasAcordeao: {
    gap: 10,
  },

  blocoTemporada: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    overflow: 'hidden',
  },

  // Destaca somente a temporada atualmente aberta/selecionada
  blocoTemporadaAtivo: {
    borderColor: '#E91E63',
  },

  cabecalhoTemporadaAcordeao: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 10,
  },

  areaAbrirTemporada: {
    flex: 1,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
  },

  textosCabecalhoTemporada: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },

  nomeTemporadaAcordeao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },

  resumoTemporada: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    marginTop: 2,
  },

  botaoMarcarTemporada: {
    width: 44,
    height: 44,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#202020',
  },

  botaoMarcarTemporadaAtivo: {
    borderColor: '#E91E63',
    backgroundColor: '#E91E63',
  },

  conteudoTemporadaExpandida: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    padding: 9,
    paddingTop: 10,
  },
});