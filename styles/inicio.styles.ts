// ESTILOS DA PÁGINA PRINCIPAL

// Importa a ferramenta de criação de estilos do React Native
import { StyleSheet } from 'react-native';

// Estilos utilizados pela página principal
export const styles = StyleSheet.create({
  // Ocupa toda a tela e aplica o tema escuro
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Área que recebe as seções e os conteúdos da página
  conteudo: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Acrescenta espaço no final da rolagem
  scrollConteudo: {
    paddingBottom: 32,
  },

  // Organiza a saudação apresentada antes das seções
  boasVindas: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },

  // Nome do usuário apresentado na saudação
  saudacao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 21,
  },

  // Texto complementar exibido abaixo da saudação
  subtituloSaudacao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginTop: 2,
  },

  // Organiza o título da seção e o link Ver tudo
  cabecalhoSecao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
  },

  // Título utilizado nas diferentes seções da página
  tituloSecao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  // Link localizado no lado direito das seções
  verTudo: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },

  // Carrossel pessoal com as séries que possuem episódio disponível.
  listaContinuar: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 28,
  },

  cardContinuar: {
    width: 122,
    marginRight: 12,
  },

  capaContinuar: {
    width: 122,
    height: 178,
    borderRadius: 12,
    backgroundColor: '#242424',
  },

  semCapaContinuar: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  nomeContinuar: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    marginTop: 8,
  },

  episodioContinuar: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginTop: 2,
  },

  trilhoContinuar: {
    height: 4,
    backgroundColor: '#303030',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 7,
  },

  barraContinuar: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 2,
  },

  continuarVazio: {
    minHeight: 58,
    marginHorizontal: 20,
    marginBottom: 28,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#242424',
    borderRadius: 14,
  },

  textoContinuarVazio: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginLeft: 9,
  },

  // Card horizontal utilizado para destacar uma série em alta
  destaque: {
    height: 245,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#303030',
    backgroundColor: '#1A1A1A',
  },

  // Área horizontal dos cards em alta
  carrosselDestaque: {
    paddingHorizontal: 20,
  },

  // Pontos que indicam a posição atual do carrossel
  indicadoresDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },

  indicadorDestaque: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#555555',
    marginHorizontal: 3,
  },

  indicadorDestaqueAtivo: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E91E63',
  },

  // Faz a imagem horizontal ocupar todo o card de destaque
  imagemDestaque: {
    flex: 1,
  },

  // Mantém as bordas da imagem acompanhando o formato do card
  imagemDestaqueInterna: {
    borderRadius: 16,
  },

  // Escurece a parte inferior da imagem e organiza os elementos internos
  gradienteDestaque: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },

  // Pequeno indicador apresentado sobre a imagem de destaque
  seloEmAlta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,18,18,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.45)',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  // Texto utilizado dentro do indicador Em alta
  textoSeloEmAlta: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.7,
    marginLeft: 4,
  },

  // Mantém as informações da série na parte inferior da imagem
  conteudoDestaque: {
    marginTop: 'auto',
  },

  // Substitui a imagem por um fundo simples quando não existir backdrop
  conteudoSemDestaque: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },

  // Nome da série exibida no destaque
  tituloDestaque: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    lineHeight: 27,
  },

  // Organiza a avaliação e o ano na mesma linha
  metaDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  // Agrupa a estrela e a nota da série
  avaliacaoDestaque: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Aparência da nota apresentada no destaque
  notaDestaque: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    marginLeft: 4,
  },

  // Pequeno separador entre a avaliação e o ano
  ponto: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#777777',
    marginHorizontal: 7,
  },

  // Aparência do ano de lançamento apresentado no destaque
  anoDestaque: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
  },

  // Sinopse apresentada sobre a imagem da série
  sinopseDestaque: {
    color: '#D0D0D0',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 7,
    maxWidth: '92%',
  },

  // Botão rosa localizado na parte inferior do destaque
  botaoDetalhes: {
    alignSelf: 'flex-start',
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 10,
    paddingHorizontal: 13,
    marginTop: 11,
  },

  // Texto apresentado dentro do botão Ver detalhes
  textoBotaoDetalhes: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    marginLeft: 5,
  },

  // Centraliza as mensagens de carregamento e erro
  estadoCarregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // Texto utilizado durante o carregamento
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },

  // Mensagem apresentada quando a API retorna um erro
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 9,
  },

  // Centraliza o indicador de verificação da sessão
  carregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },

  // Mensagem apresentada durante a verificação
  textoCarregamento: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 12,
  },
});