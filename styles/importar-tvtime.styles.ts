// ESTILOS DA TELA DE IMPORTAÇÃO DO TV TIME

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho no mesmo padrão das telas de Configurações
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

  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 42,
  },

  introducao: {
    alignItems: 'center',
    marginBottom: 24,
  },

  iconeDestaque: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: 'rgba(233, 30, 99, 0.10)',
  },

  tituloIntroducao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    marginTop: 12,
  },

  textoIntroducao: {
    maxWidth: 320,
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 6,
    textAlign: 'center',
  },

  // Caixa clicável que representa o ZIP selecionado
  areaArquivo: {
    minHeight: 145,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 15,
    borderStyle: 'dashed',
    paddingHorizontal: 20,
  },

  tituloArquivo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    marginTop: 10,
  },

  nomeArquivo: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 4,
    textAlign: 'center',
  },

  tituloSecao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginTop: 25,
    marginBottom: 9,
  },

  gradeResumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardResumo: {
    width: '48.5%',
    minHeight: 105,
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    marginBottom: 10,
    paddingHorizontal: 14,
  },

  valorResumo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    marginTop: 6,
  },

  rotuloResumo: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 1,
  },

  cardStatus: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    overflow: 'hidden',
  },

  linhaStatus: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#303030',
    paddingHorizontal: 14,
  },

  nomeStatus: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
  },

  quantidadeStatus: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  informacao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(233, 30, 99, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.20)',
    borderRadius: 12,
    marginTop: 18,
    padding: 12,
  },

  textoInformacao: {
    flex: 1,
    color: '#9E9E9E',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    lineHeight: 15,
    marginLeft: 8,
  },

  botaoContinuar: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 14,
    marginTop: 23,
  },

  textoBotaoContinuar: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    marginRight: 7,
  },

  botaoTrocar: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  textoBotaoTrocar: {
    color: '#888888',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  sobreposicaoRevisao: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalRevisao: {
    maxHeight: '78%',
    backgroundColor: '#242424',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    borderRadius: 18,
    padding: 18,
  },

  cabecalhoRevisao: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  titulosRevisao: {
    flex: 1,
    paddingRight: 10,
  },

  tituloModalRevisao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
  },

  serieOriginalRevisao: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    marginTop: 4,
  },

  botaoFecharRevisao: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  carregandoRevisao: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoCarregandoRevisao: {
    color: '#A0A0A0',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 9,
  },

  listaCandidatos: {
    maxHeight: 390,
  },

  cardCandidato: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 9,
    marginBottom: 9,
  },

  posterCandidato: {
    width: 48,
    height: 72,
    borderRadius: 7,
    backgroundColor: '#303030',
  },

  posterVazio: {
    width: 48,
    height: 72,
    borderRadius: 7,
    backgroundColor: '#303030',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dadosCandidato: {
    flex: 1,
    marginHorizontal: 11,
  },

  nomeCandidato: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  anoCandidato: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    marginTop: 3,
  },

  usarCandidato: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 9,
    marginTop: 7,
  },

  semCandidatos: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  textoSemCandidatos: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },

  botaoIgnorarRevisao: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3A3A3A',
    marginTop: 6,
    paddingTop: 13,
  },

  textoIgnorarRevisao: {
    color: '#F48FB1',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    marginLeft: 7,
  },


  // Card exibido enquanto as séries são identificadas no TMDB
  cardIdentificacao: {
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    marginTop: 22,
    padding: 16,
  },

  tituloIdentificacao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginTop: 9,
  },

  textoIdentificacao: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 3,
  },

  // Barra de progresso da identificação TV Time -> TMDB
  trilhoProgresso: {
    width: '100%',
    height: 5,
    backgroundColor: '#303030',
    borderRadius: 3,
    marginTop: 13,
    overflow: 'hidden',
  },

  barraProgresso: {
    height: '100%',
    backgroundColor: '#E91E63',
    borderRadius: 3,
  },

  percentualIdentificacao: {
    alignSelf: 'flex-end',
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    marginTop: 5,
  },

  // Contadores da revisão automática/manual
  quantidadeSucesso: {
    color: '#5DD39E',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  quantidadePendente: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  // Lista das séries que ainda precisam de revisão manual
  cardPendencias: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    overflow: 'hidden',
  },

  linhaPendencia: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#303030',
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  textosPendencia: {
    flex: 1,
    marginLeft: 9,
  },

  nomePendencia: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 10.5,
  },

  motivoPendencia: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 2,
  },

  botaoContinuarDesabilitado: {
    opacity: 0.65,
  },


  // Feedback exibido durante a gravação definitiva no Supabase
  cardImportacaoFinal: {
    alignItems: 'center',
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    borderRadius: 13,
    marginTop: 22,
    padding: 16,
  },

  tituloImportacaoFinal: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginTop: 9,
  },

  textoImportacaoFinal: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 4,
    textAlign: 'center',
  },

  contadorImportacaoFinal: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9.5,
    marginTop: 7,
  },

  botaoImportarFinal: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 14,
    marginTop: 22,
  },

  textoBotaoImportarFinal: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12.5,
    marginLeft: 8,
  },

  botaoVerMinhaLista: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E91E63',
    borderRadius: 14,
    marginTop: 22,
  },

  textoBotaoVerMinhaLista: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    marginRight: 7,
  },

});