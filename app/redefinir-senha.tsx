import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/redefinir-senha.styles';


function obterParametrosDaUrl(url: string) {
  const trecho = url.includes('#')
    ? url.split('#')[1]
    : url.includes('?')
      ? url.split('?')[1]
      : '';

  return new URLSearchParams(trecho);
}

export default function RedefinirSenha() {
  const router = useRouter();

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [preparando, setPreparando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [linkValido, setLinkValido] = useState(false);
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

  useEffect(() => {
    let ativo = true;

    async function processarUrl(url: string | null) {
      if (!url) {
        if (ativo) {
          setLinkValido(false);
          setPreparando(false);
        }
        return;
      }

      try {
        const parametros = obterParametrosDaUrl(url);
        const accessToken = parametros.get('access_token');
        const refreshToken = parametros.get('refresh_token');
        const codigo = parametros.get('code');

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (ativo) setLinkValido(true);
          return;
        }

        if (codigo) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(codigo);
          if (error) throw error;
          if (ativo) setLinkValido(true);
          return;
        }

        if (ativo) setLinkValido(false);
      } catch (erro) {
        console.log('Erro ao processar link de recuperação:', erro);
        if (ativo) setLinkValido(false);
      } finally {
        if (ativo) setPreparando(false);
      }
    }

    Linking.getInitialURL().then(processarUrl);

    const inscricao = Linking.addEventListener(
      'url',
      ({ url }) => {
        setPreparando(true);
        processarUrl(url);
      }
    );

    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);

  async function salvarNovaSenha() {
    if (senha.length < 6) {
      mostrarAviso('Senha muito curta', 'Use pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmacao) {
      mostrarAviso(
        'Senhas diferentes',
        'A confirmação precisa ser igual à nova senha.'
      );
      return;
    }

    try {
      setSalvando(true);

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        mostrarAviso('Não foi possível alterar', error.message);
        return;
      }

      mostrarAviso(
        'Senha alterada 💗',
        'Sua nova senha foi salva. Entre novamente no Gabiflix.',
        async () => {
          await supabase.auth.signOut();
          router.replace('/');
        }
      );
    } catch {
      mostrarAviso(
        'Erro de conexão',
        'Não foi possível alterar a senha agora. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (preparando) {
    return (
      <View style={styles.estadoCentralizado}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.textoEstado}>
          Preparando recuperação...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <View style={styles.iconeTopo}>
          <Ionicons name="key-outline" size={30} color="#E91E63" />
        </View>

        <Text style={styles.titulo}>Criar nova senha</Text>

        <Text style={styles.subtitulo}>
          {linkValido
            ? 'Escolha uma nova senha para sua conta.'
            : 'Este link de recuperação é inválido ou expirou.'}
        </Text>

        {linkValido && (
          <>
            <View style={styles.campoContainer}>
              <Ionicons name="lock-closed-outline" size={19} color="#BDBDBD" />
              <TextInput
                style={styles.campo}
                value={senha}
                onChangeText={setSenha}
                placeholder="Nova senha"
                placeholderTextColor="#777777"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setMostrarSenha((v) => !v)}>
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#BDBDBD"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.campoContainer}>
              <Ionicons name="shield-checkmark-outline" size={19} color="#BDBDBD" />
              <TextInput
                style={styles.campo}
                value={confirmacao}
                onChangeText={setConfirmacao}
                placeholder="Confirme a nova senha"
                placeholderTextColor="#777777"
                secureTextEntry={!mostrarConfirmacao}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmacao((v) => !v)}
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

            <TouchableOpacity
              style={styles.botaoSalvar}
              activeOpacity={0.8}
              disabled={salvando}
              onPress={salvarNovaSenha}
            >
              <LinearGradient
                colors={['#F48FB1', '#E91E63', '#C44C81']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.degradeBotao}
              >
                {salvando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.textoBotao}>
                    Salvar nova senha
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {!linkValido && (
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.textoVoltar}>Voltar ao login</Text>
          </TouchableOpacity>
        )}
      </View>

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
