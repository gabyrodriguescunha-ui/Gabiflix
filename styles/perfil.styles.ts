// ESTILOS DA PÁGINA DE PERFIL

// Importa a ferramenta utilizada para criar os estilos
import { StyleSheet } from 'react-native';

// Estilos exclusivos da página de perfil
export const styles = StyleSheet.create({
  // Fundo principal da página
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho superior
  cabecalho: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  // Botões laterais do cabeçalho
  botaoCabecalho: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Título central da página
  tituloCabecalho: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  // Espaçamento geral da área rolável
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 36,
  },

  // Centraliza avatar e informações da conta
  perfilPrincipal: {
    alignItems: 'center',
  },

  // Cria o contorno rosa ao redor do avatar
  bordaAvatar: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#C44C81',
    backgroundColor: 'rgba(233, 30, 99, 0.10)',
    padding: 4,
  },

  // Imagem do usuário quando existir um avatar cadastrado
  avatarImagem: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },

  // Avatar utilizado quando não existir uma imagem cadastrada
  avatarPadrao: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: '#2A1721',
  },

  // Primeira letra do nome usada como avatar provisório
  inicialAvatar: {
    color: '#F48FB1',
    fontFamily: 'Poppins_700Bold',
    fontSize: 38,
  },

  // Nome principal do usuário
  nomeUsuario: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    marginTop: 12,
  },

  // Identificador simples montado a partir do e-mail
  nomePerfil: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 1,
  },

  // E-mail exibido discretamente abaixo do nome
  email: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 2,
  },

  // Etiqueta semelhante à referência visual
  seloMembro: {
    backgroundColor: 'rgba(196, 76, 129, 0.18)',
    borderRadius: 14,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  // Texto utilizado dentro da etiqueta
  textoSeloMembro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 9.5,
  },

  // Linha com os três números principais
  resumoRapido: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingBottom: 18,
  },

  // Coluna de cada número
  itemResumo: {
    flex: 1,
    alignItems: 'center',
  },

  // Número destacado
  numeroResumo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },

  // Legenda do número
  textoResumo: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 3,
    textAlign: 'center',
  },

  // Linha discreta entre os números
  divisorResumo: {
    width: 1,
    height: 34,
    backgroundColor: '#2A2A2A',
  },

  // Organiza o título Estatísticas e o link lateral
  cabecalhoEstatisticas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },

  // Título reutilizado nas seções do perfil
  tituloSecao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },

  // Organiza os cards em duas colunas
  gradeEstatisticas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Card individual de estatística
  cardEstatistica: {
    width: '48.5%',
    minHeight: 105,
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    marginBottom: 10,
    padding: 13,
  },

  // Pequeno espaço quadrado para o ícone
  iconeEstatistica: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    borderRadius: 10,
    marginBottom: 8,
  },

  // Nome da informação apresentada no card
  rotuloEstatistica: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
  },

  // Número principal do card
  valorEstatistica: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
    marginTop: 1,
  },

  // Card horizontal com uma informação complementar
  cardSecundario: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    paddingHorizontal: 14,
    marginTop: 2,
  },

  // Organiza ícone e texto do card horizontal
  cardSecundarioEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Texto do card complementar
  textoCardSecundario: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginLeft: 9,
  },

  // Valor exibido no lado direito
  valorCardSecundario: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },

  // Seção final com ações da conta
  acoesConta: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#242424',
    paddingTop: 12,
  },

  // Botão horizontal utilizado nas ações secundárias
  botaoConta: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 4,
  },

  // Texto dos botões da conta
  textoBotaoConta: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginLeft: 11,
  },

  // Remove a borda da última ação
  botaoSair: {
    borderBottomWidth: 0,
  },

  // Texto vermelho-rosa utilizado na saída da conta
  textoBotaoSair: {
    flex: 1,
    color: '#FF6B81',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    marginLeft: 11,
  },

  // Centraliza estados de carregamento e erro
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 30,
  },

  // Texto utilizado durante o carregamento
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 10,
  },

  // Mensagem apresentada em caso de falha
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },

  // Botão apresentado no estado de erro
  botaoVoltarErro: {
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 20,
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 9,
  },

  // Texto do botão utilizado para retornar
  textoBotaoVoltarErro: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
});