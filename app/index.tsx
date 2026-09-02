import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
// LOGIN

// Hook utilizado para controlar a visibilidade da senha
import { useState } from 'react';
// Componentes utilizados para criar e organizar a tela
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones dos campos de e-mail e senha
import { Ionicons } from '@expo/vector-icons';
// Evita que o conteúdo fique atrás da barra superior do celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Cria o degradê do nome Gabiflix
import { LinearGradient } from 'expo-linear-gradient';
// Limita o degradê ao formato das letras
import MaskedView from '@react-native-masked-view/masked-view';
// Importa os estilos da tela de login
import { styles } from '../styles/index.styles';
// Permite navegar entre as telas do aplicativo
import { useRouter } from 'expo-router';
// Cliente responsável pela autenticação
import { supabase } from '../lib/supabase';


// Tela inicial de login
export default function Login() {
  // Recurso utilizado para navegar entre as telas
  const router = useRouter();
  // Controla os avisos e erros com o mesmo design visual do Gabiflix
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
  } | null>(null);

  function mostrarAviso(titulo: string, descricao: string) {
    setAviso({ titulo, descricao });
  }

  function fecharAviso() {
    setAviso(null);
  }

  // Controla se a senha será exibida ou escondida
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Guarda os dados digitados no login
const [email, setEmail] = useState('');
const [senha, setSenha] = useState('');

// Controla o indicador do botão
const [carregando, setCarregando] = useState(false);

// Controla o envio do e-mail de recuperação
const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);

// Envia o e-mail de recuperação de senha
async function recuperarSenha() {
  const emailLimpo = email.trim();

  if (!emailLimpo) {
    mostrarAviso(
      'Informe seu e-mail',
      'Digite seu e-mail no campo acima para receber o link de recuperação.'
    );
    return;
  }

  const emailValido = /\S+@\S+\.\S+/.test(emailLimpo);

  if (!emailValido) {
    mostrarAviso(
      'E-mail inválido',
      'Digite um endereço de e-mail válido.'
    );
    return;
  }

  try {
    setEnviandoRecuperacao(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        emailLimpo,
        {
          redirectTo: 'gabiflix://redefinir-senha',
        }
      );

    if (error) {
      mostrarAviso(
        'Não foi possível enviar',
        error.message
      );
      return;
    }

    mostrarAviso(
      'E-mail enviado 💗',
      'Confira sua caixa de entrada e toque no link para criar uma nova senha.'
    );
  } catch {
    mostrarAviso(
      'Erro de conexão',
      'Não foi possível enviar o e-mail agora. Tente novamente.'
    );
  } finally {
    setEnviandoRecuperacao(false);
  }
}

// Valida a conta no Supabase e abre a página principal
async function entrar() {
  const emailLimpo = email.trim();

  // Impede o envio de campos vazios
  if (!emailLimpo || !senha) {
    mostrarAviso('Campos obrigatórios', 'Digite seu e-mail e sua senha.');

    return;
  }

  setCarregando(true);

  try {
    // Envia o e-mail e a senha para o Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
  email: emailLimpo,
  password: senha,
});

    // O acesso é interrompido se os dados estiverem incorretos
    if (error || !data.session) {
      mostrarAviso('Não foi possível entrar', 'Confira o e-mail e a senha informados.');

      return;
    }

    // Abre a página principal somente após autenticação
    router.replace('/inicio');
  } catch {
    mostrarAviso('Erro de conexão', 'Não foi possível acessar o servidor. Tente novamente.');
  } finally {
    setCarregando(false);
  }
}

  return (
    <SafeAreaView style={styles.container}>
      {/* Fundo cinematográfico construído no próprio código */}
      <View style={styles.fundoDecorativo} pointerEvents="none">
        <LinearGradient
          colors={[
            '#0B0B0D',
            '#170811',
            '#240713',
            '#0B0B0D',
            '#080808',
          ]}
          locations={[0, 0.18, 0.35, 0.58, 1]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.degradeFundo}
        />

        <View style={styles.brilhoRosaPrincipal} />
        <View style={styles.brilhoRosaSecundario} />

        {/* Faixas inspiradas em película de cinema */}
        <View style={[styles.faixaFilme, styles.faixaFilmeEsquerda]}>
          {Array.from({ length: 9 }).map((_, indice) => (
            <View
              key={`esquerda-${indice}`}
              style={styles.furoFilme}
            />
          ))}
        </View>

        <View style={[styles.faixaFilme, styles.faixaFilmeDireita]}>
          {Array.from({ length: 10 }).map((_, indice) => (
            <View
              key={`direita-${indice}`}
              style={styles.furoFilme}
            />
          ))}
        </View>

        <View style={styles.particula1} />
        <View style={styles.particula2} />
        <View style={styles.particula3} />
      </View>

      <KeyboardAvoidingView
        style={styles.areaTeclado}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Identidade do Gabiflix */}
          <View style={styles.areaMarca}>
            <View style={styles.haloLogo}>
              <Image
                source={require('../assets/images/logo-gabiflix.png')}
                style={styles.logoImagem}
                resizeMode="contain"
              />
            </View>

            <MaskedView
              maskElement={
                <Text style={styles.nomeAplicativo}>
                  Gabiflix
                </Text>
              }
            >
              <LinearGradient
                colors={[
                  '#F8A7C1',
                  '#F23C7D',
                  '#E91E63',
                  '#C44C81',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
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

            <View style={styles.areaSlogan}>
              <View style={styles.linhaSlogan} />
              <Text style={styles.slogan}>
                SEU MOMENTO, SUA SÉRIE
              </Text>
              <View style={styles.linhaSlogan} />
            </View>

            <Ionicons
              name="heart"
              size={13}
              color="#E91E63"
              style={styles.coracaoMarca}
            />
          </View>

          {/* Apresentação */}
          <View style={styles.apresentacao}>
            <Text style={styles.boasVindas}>
              Bem-vindo(a)!
            </Text>

            <Text style={styles.instrucao}>
              Entre para continuar
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formulario}>
            <Text style={styles.rotuloCampo}>
              E-mail
            </Text>

            <View style={styles.campoContainer}>
              <Ionicons
                name="mail-outline"
                size={19}
                color="#E91E63"
                style={styles.iconeCampo}
              />

              <TextInput
                style={styles.campo}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#727272"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <Text style={styles.rotuloCampo}>
              Senha
            </Text>

            <View style={styles.campoContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color="#E91E63"
                style={styles.iconeCampo}
              />

              <TextInput
                style={styles.campo}
                placeholder="Digite sua senha"
                placeholderTextColor="#727272"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoComplete="current-password"
              />

              <TouchableOpacity
                style={styles.botaoOlho}
                onPress={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                accessibilityLabel={
                  mostrarSenha
                    ? 'Esconder senha'
                    : 'Mostrar senha'
                }
              >
                <Ionicons
                  name={
                    mostrarSenha
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color="#E91E63"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.areaEsqueciSenha}
              activeOpacity={0.7}
              disabled={enviandoRecuperacao}
              onPress={recuperarSenha}
            >
              <Text style={styles.textoEsqueciSenha}>
                {enviandoRecuperacao
                  ? 'Enviando...'
                  : 'Esqueci minha senha'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoEntrar}
              activeOpacity={0.82}
              onPress={entrar}
              disabled={carregando}
            >
              <LinearGradient
                colors={[
                  '#F45A93',
                  '#E91E63',
                  '#C9185B',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.degradeBotao}
              >
                {carregando ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text style={styles.textoBotaoEntrar}>
                    Entrar
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

<View style={styles.areaCadastro}>
   <Text style={styles.textoCadastro}>
    Ainda não tem uma conta?
  </Text>
  
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => router.push('./cadastro')}
  >
    <Text style={styles.linkCadastro}>
      Criar conta
    </Text>
  </TouchableOpacity>
</View>
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
