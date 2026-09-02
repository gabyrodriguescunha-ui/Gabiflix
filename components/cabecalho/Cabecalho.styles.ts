// ESTILOS DO CABEÇALHO

// Importa a ferramenta de criação de estilos do React Native
import { StyleSheet } from 'react-native';

// Estilos utilizados exclusivamente pelo cabeçalho
export const styles = StyleSheet.create({
  // Organiza os elementos do cabeçalho em uma única linha
  container: {
    width: '100%',
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121212',
    borderBottomColor: '#242424',
    borderBottomWidth: 1,
    paddingHorizontal: 10,
  },

  // Define a área clicável dos ícones
  botaoIcone: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mantém o nome do aplicativo centralizado no cabeçalho
  areaLogo: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -51 }],
  },

  // Aparência do nome Gabiflix
  logo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 31,
  },

  // Mantém o espaço do texto usado dentro do degradê
  logoInvisivel: {
    opacity: 0,
  },

  // Organiza pesquisa e notificações lado a lado
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
