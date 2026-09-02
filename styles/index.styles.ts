// ESTILO TELA LOGIN

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },

  areaTeclado: {
    flex: 1,
  },

  fundoDecorativo: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  degradeFundo: {
    ...StyleSheet.absoluteFillObject,
  },

  brilhoRosaPrincipal: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: 'rgba(233, 30, 99, 0.13)',
  },

  brilhoRosaSecundario: {
    position: 'absolute',
    top: 145,
    right: -80,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(196, 76, 129, 0.08)',
  },

  faixaFilme: {
    position: 'absolute',
    width: 32,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.18)',
    backgroundColor: 'rgba(10,10,10,0.28)',
  },

  faixaFilmeEsquerda: {
    top: 65,
    left: -8,
    transform: [{ rotate: '-31deg' }],
  },

  faixaFilmeDireita: {
    top: 80,
    right: 4,
    transform: [{ rotate: '29deg' }],
  },

  furoFilme: {
    width: 15,
    height: 8,
    marginVertical: 5,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.22)',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },

  particula1: {
    position: 'absolute',
    top: 130,
    left: 74,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E91E63',
    opacity: 0.55,
  },

  particula2: {
    position: 'absolute',
    top: 235,
    right: 62,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F48FB1',
    opacity: 0.45,
  },

  particula3: {
    position: 'absolute',
    top: 315,
    left: 38,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E91E63',
    opacity: 0.4,
  },

  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },

  areaMarca: {
    alignItems: 'center',
    paddingTop: 12,
  },

  haloLogo: {
    width: 145,
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 56,
    backgroundColor: 'rgba(233,30,99,0.035)',
  },

  logoImagem: {
    width: 132,
    height: 132,
  },

  nomeAplicativo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 39,
    lineHeight: 47,
    textAlign: 'center',
    letterSpacing: 1.8,
  },

  nomeInvisivel: {
    opacity: 0,
  },

  areaSlogan: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },

  linhaSlogan: {
    width: 24,
    height: 1,
    backgroundColor: 'rgba(233,30,99,0.6)',
  },

  slogan: {
    color: '#D3D3D3',
    fontFamily: 'Poppins_400Regular',
    fontSize: 8.5,
    letterSpacing: 1.25,
    marginHorizontal: 8,
  },

  coracaoMarca: {
    marginTop: 7,
  },

  apresentacao: {
    width: '100%',
    marginTop: 30,
  },

  boasVindas: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },

  instrucao: {
    color: '#9D9D9D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12.5,
    marginTop: 3,
  },

  formulario: {
    width: '100%',
    marginTop: 27,
  },

  rotuloCampo: {
    color: '#E7E7E7',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11.5,
    marginBottom: 7,
  },

  campoContainer: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24,24,24,0.90)',
    borderColor: 'rgba(115,115,115,0.42)',
    borderRadius: 13,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
  },

  iconeCampo: {
    marginRight: 11,
  },

  campo: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },

  botaoOlho: {
    width: 34,
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  areaEsqueciSenha: {
    alignSelf: 'flex-end',
    marginTop: -7,
  },

  textoEsqueciSenha: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },

  botaoEntrar: {
    width: '100%',
    marginTop: 22,
    borderRadius: 27,
    overflow: 'hidden',
  },

  degradeBotao: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
  },

  textoBotaoEntrar: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },

  separadorCadastro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 29,
  },

  linhaSeparador: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },

  textoSeparador: {
    color: '#676767',
    fontFamily: 'Poppins_500Medium',
    fontSize: 8.5,
    letterSpacing: 0.8,
    marginHorizontal: 11,
  },

areaCadastro: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 18,
  marginBottom: 4,
},

textoCadastro: {
  color: '#A7A7A7',
  fontFamily: 'Poppins_400Regular',
  fontSize: 11.5,
},

linkCadastro: {
  color: '#E91E63',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 11.5,
  marginLeft: 6,
},
})