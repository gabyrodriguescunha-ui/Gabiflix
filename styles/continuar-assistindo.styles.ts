// ESTILOS DA PÁGINA CONTINUAR ASSISTINDO

import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  cabecalho: {
    height: 76,
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
    marginRight: 8,
  },

  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 19,
  },

  subtitulo: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },

  lista: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 32,
  },

  listaVazia: {
    flexGrow: 0,
  },

  card: {
    minHeight: 174,
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },

  capa: { 
    width: 112, 
    height: 174, 
    backgroundColor: '#242424' 
  },

  semCapa: {
    width: 112,
    height: 174,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#242424',
  },

  dadosCard: { flex: 1, padding: 14, paddingRight: 58 },

  botaoMarcarAssistido: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },

  nomeSerie: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 21,
  },

  ultimoEpisodio: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 7,
  },

  seloNovoEpisodio: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 12,
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  textoSeloNovoEpisodio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    marginLeft: 5,
  },

  avisoEstreia: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  textoEstreia: {
    flex: 1,
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    marginLeft: 4,
  },

  textoProgresso: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginTop: 12,
  },

  trilhoProgresso: {
    height: 4,
    backgroundColor: '#303030',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },

  barraProgresso: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 2,
  },

  acaoContinuar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  acaoConcluida: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(93, 211, 158, 0.10)',
    borderColor: 'rgba(93, 211, 158, 0.40)',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  textoContinuar: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginLeft: 5,
  },

  textoConcluido: {
    color: '#5DD39E',
  },

  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 12,
  },

  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },

  estadoVazio: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2B2B2B',
    borderRadius: 18,
    marginTop: 4,
    paddingHorizontal: 26,
    paddingVertical: 30,
  },

  tituloVazio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginTop: 12,
  },

  textoVazio: {
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 285,
    textAlign: 'center',
  },

  // Dois filtros compactos para separar episódios disponíveis e próximos lançamentos
  filtros: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  filtro: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#343434',
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 9,
  },

  filtroAtivo: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },

  textoFiltro: {
    color: '#A0A0A0',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
    marginLeft: 6,
  },

  textoFiltroAtivo: {
    color: '#FFFFFF',
  },

});