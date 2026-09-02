// ESTILOS DAS PÁGINAS DE LISTAGEM DE SÉRIES

import { StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
  // Fundo principal
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Cabeçalho superior
  cabecalho: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#242424',
    paddingHorizontal: 12,
  },

  // Botão de retorno
  botaoVoltar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Área central do cabeçalho
  areaTitulo: {
    flex: 1,
    alignItems: 'center',
  },

  // Título principal
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },

  // Texto complementar
  subtitulo: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    marginTop: 1,
  },

  // Mantém o título centralizado
  espacoCabecalho: {
    width: 44,
  },

  // Área rolável
  conteudo: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 32,
  },

  // Organiza os cards em duas colunas
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Espaço reservado para cada card
  itemGrade: {
    width: '48%',
    marginBottom: 18,
  },

  // Estados de carregamento e erro
  estadoCentralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  // Texto do carregamento
  textoEstado: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginTop: 10,
  },

  // Texto de erro
  textoErro: {
    color: '#F48FB1',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    textAlign: 'center',
  },
});
