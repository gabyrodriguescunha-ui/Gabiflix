// ESTILOS DA PÁGINA DE CALENDÁRIO

// Importa a ferramenta utilizada para criar os estilos
import { StyleSheet } from 'react-native';


// Estilos exclusivos da página
export const styles = StyleSheet.create({
  // Fundo principal da tela
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho superior
  cabecalho: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  // Botão utilizado para retornar
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Área central com os títulos
  areaTitulo: {
    flex: 1,
    marginLeft: 4,
  },

  // Nome da página
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 19,
  },

  // Explicação exibida abaixo do título
  subtitulo: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 1,
  },

  // Ícone localizado no lado direito do cabeçalho
  iconeCabecalho: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Espaçamento geral da rolagem
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 34,
  },

  // Pequeno resumo antes da lista de datas
  resumo: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233,30,99,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.22)',
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 22,
  },

  // Texto do resumo
  textoResumo: {
    flex: 1,
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 16,
    marginLeft: 9,
  },

  // Cada conjunto de episódios pertencentes ao mesmo dia
  grupoData: {
    marginBottom: 24,
  },

  // Linha superior com Hoje/Data
  cabecalhoData: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  // Nome da data, como Hoje ou Segunda-feira
  tituloData: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    textTransform: 'capitalize',
  },

  // Dia e mês apresentados ao lado
  dataCurta: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5,
    marginLeft: 8,
  },

  // Card horizontal de cada próximo episódio
  card: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    marginBottom: 9,
    padding: 9,
  },

  // Imagem horizontal do episódio
  imagem: {
    width: 104,
    height: 68,
    borderRadius: 8,
    backgroundColor: '#242424',
  },

  // Estado utilizado quando o episódio não possuir imagem
  semImagem: {
    width: 104,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#242424',
  },


  // Logo Gabiflix exibida quando o TMDB não possui imagem do episódio
  // ou quando a imagem remota falha ao carregar.
  logoSemImagem: {
    width: 48,
    height: 48,
    opacity: 0.92,
  },

  // Informações localizadas ao lado da imagem
  dadosCard: {
    flex: 1,
    marginHorizontal: 11,
  },

  // Nome da série
  nomeSerie: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
  },

  // Temporada e episódio
  numeroEpisodio: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginTop: 3,
  },

  // Nome oficial do episódio
  nomeEpisodio: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  // Centraliza carregamento, erro e estado vazio
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  // Ícone maior usado no estado sem episódios
  iconeEstadoVazio: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233,30,99,0.08)',
    borderRadius: 38,
  },

  // Título do estado vazio
  tituloVazio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginTop: 15,
    textAlign: 'center',
  },

  // Texto utilizado durante carregamento e estado vazio
  textoEstado: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },

  // Mensagem exibida quando a consulta falhar
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },
});