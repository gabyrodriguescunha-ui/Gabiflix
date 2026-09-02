// ESTILOS DO MODAL DE CONFIRMAÇÃO

// Importa a ferramenta de criação de estilos
import { StyleSheet } from 'react-native';


// Estilos exclusivos do modal
export const styles = StyleSheet.create({
  // Fundo escurecido que cobre toda a tela
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
    paddingHorizontal: 28,
  },

  // Caixa principal apresentada no centro da tela
  modal: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#242424',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#393939',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
  },

  // Título principal da confirmação
  titulo: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Texto apresentado abaixo do título
  descricao: {
    color: '#BDBDBD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },

  // Área que agrupa os botões
  acoes: {
    width: '100%',
  },

  // Configuração comum a todos os botões
  botao: {
    width: '100%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    marginBottom: 8,
    paddingHorizontal: 14,
  },

  // Ação de maior destaque do modal
  botaoPrincipal: {
    backgroundColor: '#E91E63',
  },

  // Ação alternativa apresentada apenas com borda
  botaoSecundario: {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    borderWidth: 1,
    borderColor: '#E91E63',
  },

  // Botão utilizado somente para fechar o modal
  botaoCancelar: {
    backgroundColor: 'transparent',
  },

  // Configuração comum aos textos dos botões
  textoBotao: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },

  // Texto branco no botão principal
  textoBotaoPrincipal: {
    color: '#FFFFFF',
  },

  // Texto rosa no botão secundário
  textoBotaoSecundario: {
    color: '#F48FB1',
  },

  // Texto cinza para cancelar
  textoBotaoCancelar: {
    color: '#A0A0A0',
  },
});
