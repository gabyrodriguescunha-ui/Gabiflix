// PÁGINA DE CONFIGURAÇÕES DO GABIFLIX

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/configuracoes.styles';


// Componente principal responsável por exibir e controlar as configurações
export default function Configuracoes() {
  // Permite voltar para o Perfil e redirecionar após o logout
  const router = useRouter();

  // Guarda o e-mail da conta autenticada para exibição
  const [emailUsuario, setEmailUsuario] = useState('');
  // Controla o indicador exibido enquanto os dados da conta são carregados
  const [carregando, setCarregando] = useState(true);
  // Controla o modal que pede confirmação antes de sair da conta
  const [modalSaidaVisivel, setModalSaidaVisivel] = useState(false);
  // Guarda avisos simples exibidos através do modal personalizado
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
  } | null>(null);

  // Atualiza as informações da conta sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarConta() {
        try {
          setCarregando(true);

          const { data, error } =
            await supabase.auth.getUser();

          if (error || !data.user) {
            throw new Error(
              'Não foi possível carregar sua conta.'
            );
          }

          if (paginaAtiva) {
            setEmailUsuario(data.user.email ?? '');
          }
        } catch (erro) {
          console.log(
            'Erro ao carregar configurações:',
            erro
          );

          if (paginaAtiva) {
            setAviso({
              titulo: 'Não foi possível carregar',
              descricao:
                'Tente abrir as configurações novamente.',
            });
          }
        } finally {
          if (paginaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarConta();

      // Monta a interface principal da página
  return () => {
        paginaAtiva = false;
      };
    }, [])
  );

  // Exibe um aviso temporário para recursos que serão implementados depois
  function mostrarEmBreve(titulo: string) {
    setAviso({
      titulo,
      descricao:
        'Essa opção será adicionada em uma próxima etapa.',
    });
  }

  // Encerra a sessão atual no Supabase após a confirmação do usuário
  async function sairDaConta() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      setModalSaidaVisivel(false);
      setAviso({
        titulo: 'Não foi possível sair',
        descricao: 'Tente novamente.',
      });
      return;
    }

    setModalSaidaVisivel(false);
    router.replace('/');
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Cabeçalho com botão de voltar e título centralizado */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={router.back}
          accessibilityLabel="Voltar"
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#E91E63"
          />
        </TouchableOpacity>

        <Text style={styles.tituloCabecalho}>
          Configurações
        </Text>

        <View style={styles.botaoCabecalho} />
      </View>

      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator
            size="large"
            color="#E91E63"
          />
          <Text style={styles.textoEstado}>
            Carregando configurações...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conteudo}
        >
          {/* Opções relacionadas à conta e ao perfil do usuário */}
          <Text style={styles.tituloSecao}>Conta</Text>

          <View style={styles.grupo}>
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.75}
              onPress={() =>
                router.push('/editar-perfil')
              }
            >
              <View style={styles.iconeItem}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  Editar perfil
                </Text>
                <Text style={styles.descricaoItem}>
                  Nome e foto de perfil
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#777777"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.75}
              onPress={() =>
                router.push('/alterar-senha')
              }
            >
              <View style={styles.iconeItem}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  Alterar senha
                </Text>
                <Text style={styles.descricaoItem}>
                  Atualize sua senha de acesso
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#777777"
              />
            </TouchableOpacity>

            <View style={[styles.item, styles.ultimoItem]}>
              <View style={styles.iconeItem}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  E-mail
                </Text>
                <Text
                  style={styles.descricaoItem}
                  numberOfLines={1}
                >
                  {emailUsuario || 'Não disponível'}
                </Text>
              </View>
            </View>
          </View>

          {/* Área reservada para importação e gerenciamento de dados */}
          <Text style={styles.tituloSecao}>Dados</Text>

          <View style={styles.grupo}>
            <TouchableOpacity
              style={[styles.item, styles.ultimoItem]}
              activeOpacity={0.75}
              // Abre a primeira opção de importação já disponível: TV Time
              onPress={() =>
                router.push('/importar-tvtime')
              }
            >
              <View style={styles.iconeItem}>
                <Ionicons
                  name="cloud-download-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  Importar minhas séries
                </Text>
                <Text style={styles.descricaoItem}>
                  Importe seu histórico do TV Time
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#777777"
              />
            </TouchableOpacity>
          </View>

          {/* Informações gerais sobre o aplicativo */}
          <Text style={styles.tituloSecao}>
            Aplicativo
          </Text>

          <View style={styles.grupo}>
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.75}
              onPress={() =>
                setAviso({
                  titulo: 'Sobre o Gabiflix',
                  descricao:
                    'Seu espaço para acompanhar séries e animes.',
                })
              }
            >
              <View style={styles.iconeItem}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  Sobre o Gabiflix
                </Text>
                <Text style={styles.descricaoItem}>
                  Conheça o aplicativo
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#777777"
              />
            </TouchableOpacity>

            <View style={[styles.item, styles.ultimoItem]}>
              <View style={styles.iconeItem}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#F48FB1"
                />
              </View>
              <View style={styles.textosItem}>
                <Text style={styles.tituloItem}>
                  Versão
                </Text>
                <Text style={styles.descricaoItem}>
                  1.0.0
                </Text>
              </View>
            </View>
          </View>

          {/* Ação destacada para encerrar a sessão */}
          <TouchableOpacity
            style={styles.botaoSair}
            activeOpacity={0.8}
            onPress={() =>
              setModalSaidaVisivel(true)
            }
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#FF6B81"
            />
            <Text style={styles.textoSair}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Confirmação necessária antes de desconectar a conta */}
      <ModalConfirmacao
        visivel={modalSaidaVisivel}
        titulo="Sair do Gabiflix?"
        descricao="Você precisará entrar novamente para acessar sua conta."
        onFechar={() =>
          setModalSaidaVisivel(false)
        }
        acoes={[
          {
            texto: 'Sair',
            tipo: 'principal',
            onPress: sairDaConta,
          },
          {
            texto: 'Cancelar',
            tipo: 'cancelar',
            onPress: () =>
              setModalSaidaVisivel(false),
          },
        ]}
      />

      {/* Modal reutilizado para avisos e recursos ainda não disponíveis */}
      <ModalConfirmacao
        visivel={Boolean(aviso)}
        titulo={aviso?.titulo ?? ''}
        descricao={aviso?.descricao ?? ''}
        onFechar={() => setAviso(null)}
        acoes={[
          {
            texto: 'Entendi',
            tipo: 'principal',
            onPress: () => setAviso(null),
          },
        ]}
      />
    </SafeAreaView>
  );
}