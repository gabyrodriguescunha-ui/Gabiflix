// PÁGINA DE EDIÇÃO DO PERFIL DO USUÁRIO

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/editar-perfil.styles';


// Tela responsável por editar os dados básicos exibidos no Perfil
export default function EditarPerfil() {
  // Controla a navegação da página
  const router = useRouter();

  // Nome digitado e nome atualmente salvo no Supabase
  const [nome, setNome] = useState('');
  const [nomeOriginal, setNomeOriginal] = useState('');

  // URL pública do avatar salvo no Supabase Storage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Indica quando uma foto está sendo enviada ou removida
  const [alterandoAvatar, setAlterandoAvatar] = useState(false);

  // Estados utilizados durante leitura e gravação dos dados
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Avisos usam o modal personalizado do Gabiflix
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
    voltarAoFechar?: boolean;
  } | null>(null);

  // Atualiza os dados sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarPerfil() {
        try {
          setCarregando(true);

          const { data, error } = await supabase.auth.getUser();

          if (error || !data.user) {
            throw new Error('Não foi possível carregar sua conta.');
          }

          const nomeMetadata = data.user.user_metadata?.nome;
          const nomeEmail =
            data.user.email?.split('@')[0] ?? 'Usuária';

          const nomeAtual =
            typeof nomeMetadata === 'string' && nomeMetadata.trim()
              ? nomeMetadata.trim()
              : nomeEmail;

          // Recupera também a foto salva anteriormente no perfil
          const avatarMetadata =
            data.user.user_metadata?.avatar_url;

          if (paginaAtiva) {
            setNome(nomeAtual);
            setNomeOriginal(nomeAtual);
            setAvatarUrl(
              typeof avatarMetadata === 'string' && avatarMetadata.trim()
                ? avatarMetadata
                : null
            );
          }
        } catch (erro) {
          console.log('Erro ao carregar dados do perfil:', erro);

          if (paginaAtiva) {
            setAviso({
              titulo: 'Não foi possível carregar',
              descricao: 'Tente abrir esta página novamente.',
            });
          }
        } finally {
          if (paginaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarPerfil();

      return () => {
        paginaAtiva = false;
      };
    }, [])
  );

  // Abre a galeria, envia a imagem ao bucket avatars e salva a URL no perfil
  async function escolherAvatar() {
    try {
      // Solicita acesso à biblioteca de fotos somente quando o usuário tocar no avatar
      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        setAviso({
          titulo: 'Permissão necessária',
          descricao:
            'Permita o acesso às suas fotos para escolher uma imagem de perfil.',
        });
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      // O usuário pode fechar a galeria sem escolher nenhuma imagem
      if (resultado.canceled) {
        return;
      }

      const imagem = resultado.assets[0];

      if (!imagem?.uri) {
        throw new Error('Imagem selecionada sem endereço válido.');
      }

      setAlterandoAvatar(true);

      const { data: dadosUsuario, error: erroUsuario } =
        await supabase.auth.getUser();

      if (erroUsuario || !dadosUsuario.user) {
        throw new Error('Não foi possível identificar sua conta.');
      }

      const usuario = dadosUsuario.user;

      // Mantemos um arquivo fixo por usuário. O "upsert" substitui o avatar anterior.
      const extensao =
        imagem.mimeType === 'image/png'
          ? 'png'
          : imagem.mimeType === 'image/webp'
            ? 'webp'
            : 'jpg';

      const caminhoAvatar =
        `${usuario.id}/avatar.${extensao}`;

      // Converte o arquivo local escolhido em ArrayBuffer para enviar ao Storage
      const respostaImagem = await fetch(imagem.uri);
      const arquivo = await respostaImagem.arrayBuffer();

      const { error: erroUpload } = await supabase.storage
        .from('avatars')
        .upload(caminhoAvatar, arquivo, {
          contentType: imagem.mimeType ?? 'image/jpeg',
          upsert: true,
        });

      if (erroUpload) {
        throw erroUpload;
      }

      // Como o bucket é público, podemos gerar a URL diretamente
      const { data: dadosUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(caminhoAvatar);

      // Acrescenta um parâmetro para evitar que o celular mantenha a foto antiga em cache
      const novaUrl =
        `${dadosUrl.publicUrl}?v=${Date.now()}`;

      // Preserva os outros metadados e altera somente avatar_url
      const { error: erroPerfil } =
        await supabase.auth.updateUser({
          data: {
            avatar_url: novaUrl,
          },
        });

      if (erroPerfil) {
        throw erroPerfil;
      }

      setAvatarUrl(novaUrl);

      setAviso({
        titulo: 'Foto atualizada',
        descricao:
          'Sua nova foto de perfil foi salva com sucesso.',
      });
    } catch (erro) {
      console.log('Erro ao atualizar avatar:', erro);

      setAviso({
        titulo: 'Não foi possível atualizar',
        descricao:
          'Confira sua conexão e tente escolher a foto novamente.',
      });
    } finally {
      setAlterandoAvatar(false);
    }
  }

  // Remove a foto do Storage e volta a exibir somente a inicial do nome
  async function removerAvatar() {
    if (!avatarUrl) {
      return;
    }

    try {
      setAlterandoAvatar(true);

      const { data: dadosUsuario, error: erroUsuario } =
        await supabase.auth.getUser();

      if (erroUsuario || !dadosUsuario.user) {
        throw new Error('Não foi possível identificar sua conta.');
      }

      const usuario = dadosUsuario.user;

      // Descobre a extensão do avatar atual a partir da URL salva
      const caminhoSemQuery = avatarUrl.split('?')[0];
      const extensao =
        caminhoSemQuery.split('.').pop() ?? 'jpg';
      const caminhoAvatar =
        `${usuario.id}/avatar.${extensao}`;

      const { error: erroRemocao } = await supabase.storage
        .from('avatars')
        .remove([caminhoAvatar]);

      if (erroRemocao) {
        throw erroRemocao;
      }

      const { error: erroPerfil } =
        await supabase.auth.updateUser({
          data: {
            avatar_url: null,
          },
        });

      if (erroPerfil) {
        throw erroPerfil;
      }

      setAvatarUrl(null);

      setAviso({
        titulo: 'Foto removida',
        descricao:
          'Seu perfil voltou a usar a inicial do seu nome.',
      });
    } catch (erro) {
      console.log('Erro ao remover avatar:', erro);

      setAviso({
        titulo: 'Não foi possível remover',
        descricao:
          'Tente novamente em alguns instantes.',
      });
    } finally {
      setAlterandoAvatar(false);
    }
  }

  // Valida e salva o novo nome no user_metadata do Supabase
  async function salvarPerfil() {
    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      setAviso({
        titulo: 'Digite seu nome',
        descricao: 'O nome do perfil não pode ficar vazio.',
      });
      return;
    }

    if (nomeLimpo.length < 2) {
      setAviso({
        titulo: 'Nome muito curto',
        descricao: 'Digite pelo menos 2 caracteres.',
      });
      return;
    }

    // Não envia uma atualização se nada foi alterado
    if (nomeLimpo === nomeOriginal) {
      router.back();
      return;
    }

    try {
      setSalvando(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          nome: nomeLimpo,
        },
      });

      if (error) {
        throw error;
      }

      setNome(nomeLimpo);
      setNomeOriginal(nomeLimpo);

      setAviso({
        titulo: 'Perfil atualizado',
        descricao: 'Seu nome foi salvo com sucesso.',
        voltarAoFechar: true,
      });
    } catch (erro) {
      console.log('Erro ao atualizar perfil:', erro);

      setAviso({
        titulo: 'Não foi possível salvar',
        descricao: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setSalvando(false);
    }
  }

  // Fecha o modal e volta após uma atualização concluída
  function fecharAviso() {
    const deveVoltar = aviso?.voltarAoFechar === true;
    setAviso(null);

    if (deveVoltar) {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Cabeçalho seguindo o padrão das outras telas */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={router.back}
          accessibilityLabel="Voltar"
          disabled={salvando || alterandoAvatar}
        >
          <Ionicons name="chevron-back" size={26} color="#E91E63" />
        </TouchableOpacity>

        <Text style={styles.tituloCabecalho}>Editar perfil</Text>
        <View style={styles.botaoCabecalho} />
      </View>

      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.textoEstado}>Carregando perfil...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.areaFlexivel}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conteudo}
          >
            {/* Avatar: tocar na imagem abre a galeria do aparelho */}
            <View style={styles.areaAvatar}>
              <TouchableOpacity
                style={styles.bordaAvatar}
                activeOpacity={0.8}
                onPress={escolherAvatar}
                disabled={alterandoAvatar || salvando}
                accessibilityLabel="Escolher foto de perfil"
              >
                {alterandoAvatar ? (
                  <View style={styles.avatarPadrao}>
                    <ActivityIndicator
                      size="small"
                      color="#E91E63"
                    />
                  </View>
                ) : avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.imagemAvatar}
                  />
                ) : (
                  <View style={styles.avatarPadrao}>
                    <Text style={styles.inicialAvatar}>
                      {(nome.trim().charAt(0) || '?').toUpperCase()}
                    </Text>
                  </View>
                )}

                {/* Pequeno botão visual indicando que a foto pode ser alterada */}
                {!alterandoAvatar && (
                  <View style={styles.botaoCamera}>
                    <Ionicons
                      name="camera-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={escolherAvatar}
                disabled={alterandoAvatar || salvando}
              >
                <Text style={styles.textoTrocarFoto}>
                  {avatarUrl ? 'Trocar foto' : 'Adicionar foto'}
                </Text>
              </TouchableOpacity>

              {/* Só mostra a remoção quando existe uma foto salva */}
              {avatarUrl && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={removerAvatar}
                  disabled={alterandoAvatar || salvando}
                >
                  <Text style={styles.textoRemoverFoto}>
                    Remover foto
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Campo responsável pelo nome exibido no Perfil */}
            <Text style={styles.rotuloCampo}>Nome</Text>

            <View style={styles.campo}>
              <Ionicons name="person-outline" size={19} color="#F48FB1" />

              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor="#666666"
                maxLength={50}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={salvarPerfil}
                editable={!salvando && !alterandoAvatar}
              />
            </View>

            <Text style={styles.ajudaCampo}>
              Esse é o nome exibido no seu Perfil.
            </Text>

            {/* Salva a alteração diretamente no usuário autenticado */}
            <TouchableOpacity
              style={[
                styles.botaoSalvar,
                salvando && styles.botaoSalvarDesabilitado,
              ]}
              activeOpacity={0.8}
              onPress={salvarPerfil}
              disabled={salvando || alterandoAvatar}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.textoBotaoSalvar}>
                    Salvar alterações
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Modal usado para validações, erros e confirmação de sucesso */}
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