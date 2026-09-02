// ESTILOS DA PÁGINA DE BUSCA

// Importa a ferramenta utilizada para criar os estilos
import { StyleSheet } from 'react-native';

// Estilos exclusivos da página
export const styles = StyleSheet.create({
  // Fundo principal da tela
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho da página
  cabecalho: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  // Botão localizado no lado esquerdo do cabeçalho
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nome da página
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },

  // Mantém o título centralizado
  espacoCabecalho: {
    width: 44,
    height: 44,
  },

  // Área externa do campo de pesquisa
  areaPesquisa: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },

  // Campo de pesquisa escuro com borda discreta
  campoPesquisa: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  // Área onde o texto é digitado
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginHorizontal: 10,
    paddingVertical: 0,
  },

  // Área de descoberta exibida quando o campo de busca está vazio
  areaDescoberta: {
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingBottom: 12,
  },

  tituloDescoberta: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    paddingHorizontal: 18,
    marginBottom: 9,
  },

  listaGeneros: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },

  genero: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 18,
    marginRight: 8,
    paddingHorizontal: 13,
  },

  generoAtivo: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },

  textoGenero: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  textoGeneroAtivo: {
    color: '#FFFFFF',
  },

  tituloStreaming: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  listaStreamings: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  streamingTodos: {
    minWidth: 62,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 21,
    marginRight: 9,
    paddingHorizontal: 13,
  },

  streamingTodosAtivo: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
  },

  textoStreamingTodos: {
    color: '#A0A0A0',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
  },

  textoStreamingTodosAtivo: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
  },

  streaming: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#303030',
    borderRadius: 23,
    marginRight: 9,
    overflow: 'hidden',
    padding: 3,
  },

  streamingAtivo: {
    borderColor: '#E91E63',
  },

  logoStreaming: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },

  tituloPeriodo: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  listaPeriodos: {
    paddingHorizontal: 18,
  },

  periodo: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 12,
  },

  periodoAtivo: {
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    borderColor: '#E91E63',
  },

  textoPeriodo: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_500Medium',
    fontSize: 9.5,
  },

  textoPeriodoAtivo: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
  },

  areaOrdenacao: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    marginTop: 14,
  },

  botaoOrdenacao: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 18,
    paddingHorizontal: 11,
  },

  textoOrdenacao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginHorizontal: 6,
  },

  menuOrdenacao: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 13,
    marginHorizontal: 18,
    marginTop: 8,
    overflow: 'hidden',
  },

  opcaoOrdenacao: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
    paddingHorizontal: 14,
  },

  opcaoOrdenacaoAtiva: {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
  },

  textoOpcaoOrdenacao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },

  textoOpcaoOrdenacaoAtiva: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
  },

  // Espaçamento da lista de resultados
  lista: {
    paddingHorizontal: 18,
    paddingTop: 5,
    paddingBottom: 32,
  },

  // Identifica o início dos resultados
  tituloResultados: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginBottom: 12,
  },

  // Card horizontal de cada resultado
  card: {
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    marginBottom: 12,
    padding: 10,
  },

  // Capa vertical do resultado
  capa: {
    width: 74,
    height: 110,
    borderRadius: 9,
    backgroundColor: '#242424',
  },

  // Estado visual utilizado quando não existir capa
  semCapa: {
    width: 74,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
    borderRadius: 9,
  },

  // Área central do card
  dadosSerie: {
    flex: 1,
    marginHorizontal: 12,
  },

  // Nome da série
  nomeSerie: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
  },

  // Linha com ano e avaliação
  informacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  // Ano de estreia
  ano: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
  },

  // Pequeno separador visual
  separador: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#555555',
    marginHorizontal: 8,
  },

  // Agrupa estrela e nota
  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Nota recebida do TMDB
  nota: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    marginLeft: 4,
  },

  // Pequena prévia da sinopse
  sinopse: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 7,
  },

  // Centraliza os estados sem conteúdo
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  // Título utilizado nos estados vazios
  tituloEstado: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginTop: 14,
    textAlign: 'center',
  },

  // Texto de carregamento ou orientação
  textoEstado: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },

  // Mensagem exibida em caso de falha
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },
});