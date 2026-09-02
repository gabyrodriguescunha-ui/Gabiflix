// ESTILOS DA PÁGINA DE CONFIGURAÇÕES

import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  // Fundo principal da página
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Barra superior da tela
  cabecalho: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  // Área clicável utilizada pelo botão de voltar
  botaoCabecalho: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Título central da barra superior
  tituloCabecalho: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  // Espaçamento interno da área rolável
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },

  // Pequenos títulos que separam Conta, Dados e Aplicativo
  tituloSecao: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 10,
    textTransform: 'uppercase',
  },

  // Card que agrupa opções relacionadas
  grupo: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 14,
    marginBottom: 18,
    overflow: 'hidden',
  },

  // Linha individual de uma configuração
  item: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // Retira o divisor inferior do último item do grupo
  ultimoItem: {
    borderBottomWidth: 0,
  },

  // Fundo arredondado utilizado atrás dos ícones
  iconeItem: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    borderRadius: 11,
    marginRight: 12,
  },

  // Área que ocupa o espaço restante entre ícone e seta
  textosItem: {
    flex: 1,
    paddingRight: 10,
  },

  // Nome principal da configuração
  tituloItem: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12.5,
  },

  // Informação secundária apresentada abaixo do nome
  descricaoItem: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 2,
  },

  // Botão destacado para encerrar a sessão
  botaoSair: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 129, 0.35)',
    borderRadius: 14,
    marginTop: 4,
    backgroundColor: 'rgba(255, 107, 129, 0.05)',
  },

  // Texto do botão de logout
  textoSair: {
    color: '#FF6B81',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    marginLeft: 9,
  },

  // Centraliza o loading enquanto a conta é consultada
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  // Mensagem exibida abaixo do indicador de carregamento
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 10,
  },
});
