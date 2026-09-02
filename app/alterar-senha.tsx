// PÁGINA RESPONSÁVEL POR ALTERAR A SENHA DO USUÁRIO

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/alterar-senha.styles';

// Tela utilizada dentro de Configurações para atualizar a senha da conta
export default function AlterarSenha() {
  // Controla o retorno para a tela anterior
  const router = useRouter();

  // Guarda os valores digitados nos dois campos
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Controla se cada senha está visível ou escondida
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  // Impede que o usuário envie várias alterações ao mesmo tempo
  const [salvando, setSalvando] = useState(false);

  // Modal utilizado para erros de validação e confirmação de sucesso
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
    voltarAoFechar?: boolean;
  } | null>(null);

  // Valida os campos e envia a nova senha para o Supabase
  async function salvarNovaSenha() {
    if (!novaSenha || !confirmarSenha) {
      setAviso({
        titulo: 'Preencha os campos',
        descricao:
          'Digite a nova senha e repita a senha para confirmar.',
      });
      return;
    }

    if (novaSenha.length < 6) {
      setAviso({
        titulo: 'Senha muito curta',
        descricao:
          'Sua nova senha precisa ter pelo menos 6 caracteres.',
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setAviso({
        titulo: 'As senhas não coincidem',
        descricao:
          'Digite a mesma senha nos dois campos.',
      });
      return;
    }

    try {
      setSalvando(true);

      // Atualiza diretamente a senha da sessão autenticada
      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        throw error;
      }

      // Limpa os campos após uma atualização concluída
      setNovaSenha('');
      setConfirmarSenha('');

      setAviso({
        titulo: 'Senha atualizada',
        descricao:
          'Sua nova senha foi salva com sucesso.',
        voltarAoFechar: true,
      });
    } catch (erro) {
      console.log(
        'Erro ao alterar senha:',
        erro
      );

      setAviso({
        titulo: 'Não foi possível alterar',
        descricao:
          'Tente novamente em alguns instantes.',
      });
    } finally {
      setSalvando(false);
    }
  }

  // Fecha o aviso e retorna para Configurações após o sucesso
  function fecharAviso() {
    const deveVoltar =
      aviso?.voltarAoFechar === true;

    setAviso(null);

    if (deveVoltar) {
      router.back();
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Cabeçalho seguindo o padrão das telas do Gabiflix */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={router.back}
          accessibilityLabel="Voltar"
          disabled={salvando}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#E91E63"
          />
        </TouchableOpacity>

        <Text style={styles.tituloCabecalho}>
          Alterar senha
        </Text>

        <View style={styles.botaoCabecalho} />
      </View>

      <KeyboardAvoidingView
        style={styles.areaFlexivel}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conteudo}
        >
          {/* Explicação curta antes do formulário */}
          <View style={styles.introducao}>
            <View style={styles.iconeDestaque}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#E91E63"
              />
            </View>

            <Text style={styles.tituloIntroducao}>
              Crie uma nova senha
            </Text>

            <Text style={styles.textoIntroducao}>
              Escolha uma senha que você ainda não utiliza em outros serviços.
            </Text>
          </View>

          {/* Primeiro campo de senha */}
          <Text style={styles.rotuloCampo}>
            Nova senha
          </Text>

          <View style={styles.campo}>
            <Ionicons
              name="key-outline"
              size={19}
              color="#F48FB1"
            />

            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="Digite a nova senha"
              placeholderTextColor="#666666"
              secureTextEntry={!mostrarNovaSenha}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!salvando}
              returnKeyType="next"
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setMostrarNovaSenha(
                  (valorAtual) => !valorAtual
                )
              }
              accessibilityLabel={
                mostrarNovaSenha
                  ? 'Esconder nova senha'
                  : 'Mostrar nova senha'
              }
            >
              <Ionicons
                name={
                  mostrarNovaSenha
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={20}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          {/* Segundo campo usado apenas para evitar erro de digitação */}
          <Text style={styles.rotuloCampoSecundario}>
            Confirmar nova senha
          </Text>

          <View style={styles.campo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#F48FB1"
            />

            <TextInput
              style={styles.input}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              placeholder="Repita a nova senha"
              placeholderTextColor="#666666"
              secureTextEntry={!mostrarConfirmacao}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!salvando}
              returnKeyType="done"
              onSubmitEditing={salvarNovaSenha}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setMostrarConfirmacao(
                  (valorAtual) => !valorAtual
                )
              }
              accessibilityLabel={
                mostrarConfirmacao
                  ? 'Esconder confirmação'
                  : 'Mostrar confirmação'
              }
            >
              <Ionicons
                name={
                  mostrarConfirmacao
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={20}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          {/* Regra mínima apresentada diretamente na página */}
          <View style={styles.regraSenha}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#777777"
            />

            <Text style={styles.textoRegra}>
              Use pelo menos 6 caracteres.
            </Text>
          </View>

          {/* Envia a nova senha para o Supabase */}
          <TouchableOpacity
            style={[
              styles.botaoSalvar,
              salvando &&
                styles.botaoSalvarDesabilitado,
            ]}
            activeOpacity={0.8}
            onPress={salvarNovaSenha}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.textoBotaoSalvar}>
                  Salvar nova senha
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Todos os avisos usam o modal personalizado do Gabiflix */}
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
