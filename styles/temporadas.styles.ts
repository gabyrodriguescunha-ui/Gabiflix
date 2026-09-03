// ESTILOS DA PÁGINA DE TEMPORADAS

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  cabecalho: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#242424',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },

  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulos: {
    flex: 1,
    marginLeft: 8,
  },

  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 19,
  },

  nomeSerie: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },

  listaTemporadas: {
    flexGrow: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  botaoTemporada: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#424242',
    borderRadius: 19,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 17,
  },

  botaoTemporadaAtivo: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },

  textoTemporada: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  textoTemporadaAtivo: {
    color: '#FFFFFF',
  },

  areaConteudoTemporada: {
    flex: 1,
  },

  listaEpisodios: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 30,
  },

  tituloTemporada: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },

  cabecalhoTemporada: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  infoTemporada: {
    flex: 1,
    paddingRight: 12,
  },

  progressoTemporada: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 3,
  },

  cardEpisodio: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
  },

  imagemEpisodio: {
    width: 112,
    height: 96,
    backgroundColor: '#242424',
  },

  imagemAusente: {
    width: 112,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
  },


  logoImagemAusente: {
    width: 58,
    height: 58,
    opacity: 0.92,
  },

  dadosEpisodio: {
    flex: 1,
    justifyContent: 'center',
    padding: 11,
  },

  linhaSuperiorEpisodio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoAssistido: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E91E63',
    borderRadius: 14,
    borderWidth: 1,
  },

  botaoAssistidoAtivo: {
    backgroundColor: '#E91E63',
  },

  numeroEpisodio: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },

  nomeEpisodio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    lineHeight: 17,
    marginTop: 2,
  },

  dataEpisodio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  textoDataEpisodio: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    marginLeft: 4,
  },

  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    paddingHorizontal: 24,
  },

  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 10,
  },

  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
});
