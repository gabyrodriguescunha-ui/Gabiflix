import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },

  botaoVoltar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },

  subtitulo: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: -2,
  },

  lista: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  listaVazia: {
    flexGrow: 1,
  },

  tituloGrupo: {
    color: '#F48FB1',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    marginTop: 12,
    marginBottom: 8,
  },

  card: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2C2C2C',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  iconeHistorico: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 211, 158, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dados: {
    flex: 1,
    paddingHorizontal: 12,
  },

  nomeEpisodio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  referencia: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 4,
  },

  data: {
    color: '#777777',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 5,
  },

  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
  },

  textoEstado: {
    color: '#A0A0A0',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },

  botaoTentar: {
    minHeight: 42,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E91E63',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  textoBotaoTentar: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  estadoVazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 70,
  },

  tituloVazio: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    marginTop: 14,
    textAlign: 'center',
  },

  textoVazio: {
    color: '#888888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
});
