// TELA DE CADASTRO DE CONTA

// Hook utilizado para guardar os dados digitados
import { useState } from 'react';
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
// Cliente responsável pela autenticação no Supabase
import { supabase } from '../lib/supabase';
// Componentes utilizados para montar a tela
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
// Evita que o conteúdo fique atrás das barras do celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Permite navegar entre as telas
import { useRouter } from 'expo-router';
// Ícone do botão voltar
import { Ionicons } from '@expo/vector-icons';
// Cria o degradê do nome Gabiflix
import { LinearGradient } from 'expo-linear-gradient';
// Faz o degradê aparecer somente dentro das letras
import MaskedView from '@react-native-masked-view/masked-view';
// Importa os estilos da tela
import { styles } from '../styles/cadastro.styles';


// Tela responsável pela criação de uma conta
export default function Cadastro() {
  // Recurso utilizado para voltar ao login
  const router = useRouter();

  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
    aoFechar?: () => void;
  } | null>(null);

  function mostrarAviso(
    titulo: string,
    descricao: string,
    aoFechar?: () => void
  ) {
    setAviso({ titulo, descricao, aoFechar });
  }

  function fecharAviso() {
    const aoFechar = aviso?.aoFechar;
    setAviso(null);
    aoFechar?.();
  }

  // Guarda os valores digitados no formulário
const [nome, setNome] = useState('');
const [email, setEmail] = useState('');
const [senha, setSenha] = useState('');
const [confirmacaoSenha, setConfirmacaoSenha] = useState('');

// Controla a visibilidade das duas senhas
const [mostrarSenha, setMostrarSenha] = useState(false);
const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

// Indica quando o cadastro está sendo processado
const [carregando, setCarregando] = useState(false);


// Valida os dados antes de enviar o cadastro
async function validarCadastro() {
  // Remove espaços desnecessários do começo e do final
  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim();

  // Verifica se algum campo está vazio
  if (
    !nomeLimpo ||
    !emailLimpo ||
    !senha ||
    !confirmacaoSenha
  ) {
    mostrarAviso(
      'Campos obrigatórios',
      'Preencha todos os campos para continuar.'
    );

    return;
  }

  // Verifica se o e-mail possui um formato básico válido
  const emailValido = /\S+@\S+\.\S+/.test(emailLimpo);

  if (!emailValido) {
    mostrarAviso(
      'E-mail inválido',
      'Digite um endereço de e-mail válido.'
    );

    return;
  }

  // Verifica a quantidade mínima de caracteres
  if (senha.length < 6) {
    mostrarAviso(
      'Senha muito curta',
      'A senha precisa ter pelo menos 6 caracteres.'
    );

    return;
  }

  // Confere se as duas senhas são iguais
  if (senha !== confirmacaoSenha) {
    mostrarAviso(
      'Senhas diferentes',
      'A confirmação precisa ser igual à senha.'
    );

    return;
  }

// Ativa o carregamento antes de enviar os dados
setCarregando(true);

try {
  // Solicita ao Supabase a criação da conta
  const { error } = await supabase.auth.signUp({
    email: emailLimpo,
    password: senha,
    options: {
      // Guarda o nome nos metadados do usuário
      data: {
        nome: nomeLimpo,
      },
    },
  });

  // Interrompe o processo se o Supabase encontrar um erro
  if (error) {
    mostrarAviso(
      'Não foi possível criar a conta',
      error.message
    );

    return;
  }

  // Com a confirmação por e-mail desativada, a conta já pode entrar.
  mostrarAviso(
    'Conta criada! 💗',
    'Seu cadastro foi concluído. Você já pode entrar no Gabiflix.',
    () => router.replace('/')
  );
} catch {
  // Trata falhas de internet ou erros inesperados
  mostrarAviso(
    'Erro de conexão',
    'Não foi possível acessar o servidor. Tente novamente.'
  );
} finally {
  // Encerra o carregamento com sucesso ou erro
  setCarregando(false);
}
}

  return (
    <SafeAreaView style={styles.container}>
  {/* Ajusta o conteúdo quando o teclado aparece */}
  <KeyboardAvoidingView
    style={styles.areaTeclado}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
        {/* Área superior com o botão voltar */}
        <View style={styles.topo}>
          <TouchableOpacity
            style={styles.botaoVoltar}
            activeOpacity={0.7}
            onPress={() => router.back()}
            accessibilityLabel="Voltar para o login"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Logo do aplicativo */}
        <Image
          source={require('../assets/images/logo-gabiflix.png')}
          style={styles.logoImagem}
          resizeMode="contain"
        />

        {/* Nome Gabiflix com degradê */}
        <MaskedView
          maskElement={
            <Text style={styles.nomeAplicativo}>
              Gabiflix
            </Text>
          }
        >
          <LinearGradient
            colors={['#F48FB1', '#E91E63', '#C44C81']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {/* Determina o tamanho da área do degradê */}
            <Text
              style={[
                styles.nomeAplicativo,
                styles.nomeInvisivel,
              ]}
            >
              Gabiflix
            </Text>
          </LinearGradient>
        </MaskedView>

        {/* Apresentação da tela de cadastro */}
        <View style={styles.apresentacao}>
          <Text style={styles.titulo}>
            Crie sua conta
          </Text>

          <Text style={styles.subtitulo}>
            Organize suas séries e acompanhe cada episódio.
          </Text>
        </View>

{/* Formulário para criação da conta */}
<View style={styles.formulario}>
  {/* Nome da pessoa */}
  <View style={styles.campoContainer}>
    <Ionicons
      name="person-outline"
      size={19}
      color="#BDBDBD"
      style={styles.iconeCampo}
    />

    <TextInput
      style={styles.campo}
      placeholder="Seu nome"
      placeholderTextColor="#777777"
      value={nome}
      onChangeText={setNome}
      autoCapitalize="words"
    />
  </View>

  {/* E-mail da pessoa */}
  <View style={styles.campoContainer}>
    <Ionicons
      name="mail-outline"
      size={19}
      color="#BDBDBD"
      style={styles.iconeCampo}
    />

    <TextInput
      style={styles.campo}
      placeholder="seuemail@exemplo.com"
      placeholderTextColor="#777777"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>

  {/* Senha */}
  <View style={styles.campoContainer}>
    <Ionicons
      name="lock-closed-outline"
      size={19}
      color="#BDBDBD"
      style={styles.iconeCampo}
    />

    <TextInput
      style={styles.campo}
      placeholder="Crie uma senha"
      placeholderTextColor="#777777"
      value={senha}
      onChangeText={setSenha}
      secureTextEntry={!mostrarSenha}
      autoCapitalize="none"
    />

    <TouchableOpacity
      onPress={() => setMostrarSenha(!mostrarSenha)}
      accessibilityLabel="Mostrar ou esconder senha"
    >
      <Ionicons
        name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
        size={20}
        color="#BDBDBD"
      />
    </TouchableOpacity>
  </View>

  {/* Confirmação da senha */}
  <View style={styles.campoContainer}>
    <Ionicons
      name="shield-checkmark-outline"
      size={19}
      color="#BDBDBD"
      style={styles.iconeCampo}
    />

    <TextInput
      style={styles.campo}
      placeholder="Confirme sua senha"
      placeholderTextColor="#777777"
      value={confirmacaoSenha}
      onChangeText={setConfirmacaoSenha}
      secureTextEntry={!mostrarConfirmacao}
      autoCapitalize="none"
    />

    <TouchableOpacity
      onPress={() => setMostrarConfirmacao(!mostrarConfirmacao)}
      accessibilityLabel="Mostrar ou esconder confirmação da senha"
    >
      <Ionicons
        name={
          mostrarConfirmacao
            ? 'eye-off-outline'
            : 'eye-outline'
        }
        size={20}
        color="#BDBDBD"
      />
    </TouchableOpacity>
  </View>

  {/* Orientação para criação da senha */}
  <Text style={styles.avisoSenha}>
    Use pelo menos 6 caracteres para criar sua senha.
  </Text>
  </View>

  {/* Valida os campos antes de criar a conta */}
<TouchableOpacity
  style={styles.botaoCriarConta}
  activeOpacity={0.8}
  onPress={validarCadastro}
  disabled={carregando}
>
  <LinearGradient
    colors={['#F48FB1', '#E91E63', '#C44C81']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={styles.degradeBotao}
  >
    {carregando ? (
      <ActivityIndicator size="small" color="#FFFFFF" />
    ) : (
      <Text style={styles.textoBotao}>
        Criar conta
      </Text>
    )}
  </LinearGradient>
</TouchableOpacity>

{/* Permite voltar à tela de login */}
<View style={styles.areaLogin}>
  <Text style={styles.textoLogin}>
    Já tem uma conta?
  </Text>

  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => router.back()}
  >
    <Text style={styles.linkLogin}>
      Entrar
    </Text>
  </TouchableOpacity>
</View>

       </ScrollView>
  </KeyboardAvoidingView>

      <ModalConfirmacao
        visivel={Boolean(aviso)}
        titulo={aviso?.titulo ?? ''}
        descricao={aviso?.descricao ?? ''}
        onFechar={fecharAviso}
        acoes={[
          {
            texto: 'Entendi',
            tipo: 'principal',
            onPress: fecharAviso,
          },
        ]}
      />
</SafeAreaView>
  );
}
