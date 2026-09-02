// ESTILO TELA CADASTRO DE CONTA

// Importa a ferramenta de criação de estilos do React Native
import { StyleSheet } from 'react-native';

// Estilos exclusivos da tela de criação de conta
export const styles = StyleSheet.create({
  // Ocupa a tela inteira e aplica o tema escuro
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Permite que a tela se ajuste quando o teclado aparece
areaTeclado: {
  flex: 1,
},

  // Organiza o conteúdo e permite preencher toda a tela
  conteudo: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // Posiciona o botão voltar no começo da tela
  topo: {
    width: '100%',
    alignItems: 'flex-start',
  },

  // Cria a área circular do botão voltar
  botaoVoltar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderRadius: 21,
    borderWidth: 1,
  },

  // Define o tamanho da logo
  logoImagem: {
    width: 62,
    height: 62,
    marginTop: 10,
    marginBottom: 2,
  },

  // Define a aparência do nome Gabiflix
  nomeAplicativo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
  },

  // Mantém o tamanho do texto usado no degradê
  nomeInvisivel: {
    opacity: 0,
  },

  // Agrupa os textos de apresentação do cadastro
  apresentacao: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
  },

  // Título principal da tela
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    textAlign: 'center',
  },

  // Explicação apresentada abaixo do título
  subtitulo: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },

  // Agrupa todos os campos do formulário
formulario: {
  width: '100%',
  marginTop: 28,
},

// Cria a borda e organiza o conteúdo de cada campo
campoContainer: {
  width: '100%',
  height: 52,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#181818',
  borderColor: '#424242',
  borderRadius: 10,
  borderWidth: 1,
  marginBottom: 14,
  paddingHorizontal: 14,
},

// Cria um espaço entre o ícone e o campo
iconeCampo: {
  marginRight: 10,
},

// Aparência do texto digitado
campo: {
  flex: 1,
  height: '100%',
  color: '#FFFFFF',
  fontFamily: 'Poppins_400Regular',
  fontSize: 13,
},

// Orientação apresentada abaixo dos campos
avisoSenha: {
  color: '#8E8E8E',
  fontFamily: 'Poppins_400Regular',
  fontSize: 10,
  lineHeight: 15,
  marginTop: -3,
},

// Espaçamento externo e bordas do botão
botaoCriarConta: {
  width: '100%',
  marginTop: 22,
  borderRadius: 26,
  overflow: 'hidden',
},

// Define o tamanho e o alinhamento do degradê
degradeBotao: {
  width: '100%',
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 26,
},

// Aparência do texto dentro do botão
textoBotao: {
  color: '#FFFFFF',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 15,
},

// Organiza a mensagem e o link de login lado a lado
areaLogin: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 24,
},

// Texto “Já tem uma conta?”
textoLogin: {
  color: '#BDBDBD',
  fontFamily: 'Poppins_400Regular',
  fontSize: 12,
},

// Link que retorna para a tela de login
linkLogin: {
  color: '#E91E63',
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 12,
  marginLeft: 6,
},

});