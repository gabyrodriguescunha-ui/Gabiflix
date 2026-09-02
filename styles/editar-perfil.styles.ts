// ESTILOS DA PÁGINA EDITAR PERFIL

import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  // Fundo principal
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  areaFlexivel: {
    flex: 1,
  },

  // Cabeçalho no mesmo padrão do Perfil
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

  // Conteúdo do formulário
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },

  areaAvatar: {
    alignItems: 'center',
    marginBottom: 30,
  },

  // Contorno rosa do avatar
  bordaAvatar: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#C44C81',
    backgroundColor: 'rgba(233, 30, 99, 0.10)',
    padding: 4,
  },

  avatarPadrao: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 46,
    backgroundColor: '#2A1721',
  },

  // Foto escolhida pelo usuário
  imagemAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },

  // Selo de câmera sobre o avatar
  botaoCamera: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#E91E63',
    borderWidth: 2,
    borderColor: '#121212',
  },

  // Ação principal logo abaixo da foto
  textoTrocarFoto: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginTop: 12,
  },

  // Ação secundária para voltar ao avatar com inicial
  textoRemoverFoto: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 5,
  },

  inicialAvatar: {
    color: '#F48FB1',
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
  },


  // Rótulo e caixa do campo de nome
  rotuloCampo: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginBottom: 7,
    marginLeft: 2,
  },

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
    paddingVertical: 0,
  },

  ajudaCampo: {
    color: '#666666',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 7,
    marginLeft: 2,
  },

  // Botão principal
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

  // Loading inicial
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 10,
  },
});