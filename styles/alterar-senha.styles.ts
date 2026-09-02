// ESTILOS DA PÁGINA ALTERAR SENHA

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Fundo principal da página
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Permite que o formulário ocupe toda a altura disponível
  areaFlexivel: {
    flex: 1,
  },

  // Cabeçalho igual ao utilizado no Perfil e em Configurações
  cabecalho: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  botaoCabecalho: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloCabecalho: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  // Espaçamento da área rolável
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // Apresentação da função da página
  introducao: {
    alignItems: 'center',
    marginBottom: 30,
  },

  iconeDestaque: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor:
      'rgba(233, 30, 99, 0.10)',
    marginBottom: 13,
  },

  tituloIntroducao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },

  textoIntroducao: {
    maxWidth: 290,
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 5,
  },

  // Títulos utilizados acima dos campos
  rotuloCampo: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginBottom: 7,
    marginLeft: 2,
  },

  rotuloCampoSecundario: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginBottom: 7,
    marginLeft: 2,
    marginTop: 17,
  },

  // Caixa utilizada nos dois campos de senha
  campo: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginLeft: 10,
    marginRight: 8,
    paddingVertical: 0,
  },

  // Regra mínima mostrada abaixo dos campos
  regraSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
    marginLeft: 2,
  },

  textoRegra: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginLeft: 5,
  },

  // Botão principal da página
  botaoSalvar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 14,
    marginTop: 28,
    paddingHorizontal: 18,
  },

  botaoSalvarDesabilitado: {
    opacity: 0.65,
  },

  textoBotaoSalvar: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    marginLeft: 7,
  },
});
