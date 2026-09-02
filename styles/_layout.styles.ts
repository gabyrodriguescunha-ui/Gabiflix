// Estilos do layout principal e da navegação inferior

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  carregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },

  // O Stack ocupa todo o espaço disponível acima da barra.
  areaNavegacao: {
    flex: 1,
  },

  barraInferior: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#151515',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 8,
    paddingHorizontal: 4,
  },

  itemBarra: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoBarra: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    marginTop: 3,
  },

  textoBarraAtivo: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
  },
});
