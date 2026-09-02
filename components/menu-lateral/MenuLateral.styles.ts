// ESTILOS DO MENU LATERAL

// Importa a ferramenta de criação de estilos do React Native
import { StyleSheet } from 'react-native';

// Estilos utilizados exclusivamente pelo menu lateral
export const styles = StyleSheet.create({
  // Ocupa toda a tela e cria o fundo semitransparente
  sobreposicao: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },

  // Painel principal do menu
  painel: {
    width: '82%',
    height: '100%',
    backgroundColor: '#101010',
    borderRightColor: '#2B2B2B',
    borderRightWidth: 1,
  },

  // Área transparente restante da tela
  areaExterna: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '82%',
  },

  // Mantém os elementos longe das barras do celular
  areaSegura: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  // Define a área clicável do botão de fechar
  botaoFechar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Organiza o avatar e os dados do usuário
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
    paddingHorizontal: 8,
  },

  // Círculo utilizado como avatar provisório
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525',
    borderColor: '#666666',
    borderRadius: 32,
    borderWidth: 1,
  },

  // Imagem real do usuário quando existir avatar_url
  avatarImagem: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },

  // Agrupa o nome e o link do perfil
  dadosPerfil: {
    flex: 1,
    marginLeft: 14,
  },

  // Nome da pessoa conectada
  nomeUsuario: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },

  // Link localizado abaixo do nome
  linkPerfil: {
    color: '#E91E63',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginTop: 2,
  },

  // Agrupa as opções principais
  listaOpcoes: {
    flex: 1,
  },

  // Aparência padrão de uma opção
  opcao: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 3,
    paddingHorizontal: 16,
  },

  // Destaque aplicado à opção selecionada
  opcaoAtiva: {
    backgroundColor: 'rgba(233, 30, 99, 0.12)',
    borderColor: 'rgba(233, 30, 99, 0.45)',
    borderWidth: 1,
  },

  // Texto padrão das opções
  textoOpcao: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    marginLeft: 14,
  },

  // Texto rosa da opção selecionada
  textoOpcaoAtiva: {
    color: '#E91E63',
    fontFamily: 'Poppins_600SemiBold',
  },

  // Botão de sair separado por uma linha
  botaoSair: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#303030',
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // Texto do botão de sair
  textoSair: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    marginLeft: 14,
  },
});