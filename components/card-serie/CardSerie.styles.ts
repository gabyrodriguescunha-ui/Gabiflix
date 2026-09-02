// ESTILOS DO CARD DE SÉRIE

// Importa a ferramenta de criação de estilos
import { StyleSheet } from 'react-native';

// Estilos utilizados exclusivamente pelo card
export const styles = StyleSheet.create({
  // Define a largura e o espaçamento de cada card
  card: {
    width: 124,
    marginRight: 14,
  },

  // Agrupa a capa e os elementos que ficam sobre a imagem
  areaCapa: {
    width: 124,
    height: 180,
    backgroundColor: '#1A1A1A',
    borderColor: '#303030',
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Define o tamanho da capa dentro do espaço reservado
  capa: {
    width: '100%',
    height: '100%',
  },

  // Espaço exibido quando a série não possui uma capa
  semCapa: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },

  // Pequeno indicador de avaliação colocado sobre a capa
  seloNota: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,18,18,0.88)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },

  // Aparência da nota da série
  nota: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 9,
    marginLeft: 3,
  },

  // Nome localizado abaixo da imagem
  nome: {
    minHeight: 38,
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  // Organiza o ano e o tipo do conteúdo na mesma linha
  informacoes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },

  // Aparência do ano de lançamento
  ano: {
    color: '#8D8D8D',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },

  // Pequeno separador visual entre o ano e o tipo
  ponto: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#555555',
    marginHorizontal: 6,
  },

  // Identifica o conteúdo apresentado pelo card
  tipo: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
  },
});