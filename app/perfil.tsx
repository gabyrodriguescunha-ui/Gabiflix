// PÁGINA DE PERFIL DO USUÁRIO

// Hooks utilizados para carregar novamente os dados ao retornar para a página
import { useCallback, useState } from 'react';
// Componentes visuais utilizados na página
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones utilizados nas informações e atalhos
import { Ionicons } from '@expo/vector-icons';
// Navegação e evento disparado quando a página recebe foco
import { useFocusEffect, useRouter } from 'expo-router';
// Mantém o conteúdo distante das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Cliente responsável pela autenticação e dados da conta
import { supabase } from '../lib/supabase';
// Recupera as séries armazenadas na lista pessoal
import {
  buscarMinhaLista,
  type ItemMinhaLista,
} from '../services/minha-lista.service';
// Recupera todo o histórico de episódios assistidos
import {
  contarEpisodiosAssistidos,
} from '../services/episodios-assistidos.service';
// Estilos exclusivos da página
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import { styles } from '../styles/perfil.styles';


// Estrutura utilizada para guardar os números apresentados no perfil
interface EstatisticasPerfil {
  totalSeries: number;
  assistindo: number;
  queroAssistir: number;
  pausadas: number;
  reassistindo: number;
  abandonadas: number;
  episodiosAssistidos: number;
}

// Valores utilizados antes do carregamento dos dados reais
const estatisticasIniciais: EstatisticasPerfil = {
  totalSeries: 0,
  assistindo: 0,
  queroAssistir: 0,
  pausadas: 0,
  reassistindo: 0,
  abandonadas: 0,
  episodiosAssistidos: 0,
};

// Página responsável por apresentar os dados pessoais e estatísticas do usuário
export default function Perfil() {
  // Permite navegar pelas áreas relacionadas à conta
  const router = useRouter();

  // Guarda os dados básicos da conta autenticada
  const [nomeUsuario, setNomeUsuario] = useState('Usuária');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [nomePerfil, setNomePerfil] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [membroDesde, setMembroDesde] = useState('');

  // Guarda os valores calculados a partir dos registros do Supabase
  const [estatisticas, setEstatisticas] =
    useState<EstatisticasPerfil>(estatisticasIniciais);

  // Controla os estados da consulta
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [modalSaidaVisivel, setModalSaidaVisivel] = useState(false);
  const [erroSaida, setErroSaida] = useState<string | null>(null);

  // Calcula os números apresentados na página utilizando apenas dados reais
  function calcularEstatisticas(
    lista: ItemMinhaLista[],
    totalEpisodiosAssistidos: number
  ): EstatisticasPerfil {
    return {
      totalSeries: lista.length,
      assistindo: lista.filter(
        (item) => item.status_usuario === 'assistindo'
      ).length,
      queroAssistir: lista.filter(
        (item) => item.status_usuario === 'quero_assistir'
      ).length,
      pausadas: lista.filter(
        (item) => item.status_usuario === 'pausada'
      ).length,
      reassistindo: lista.filter(
        (item) => item.status_usuario === 'reassistindo'
      ).length,
      abandonadas: lista.filter(
        (item) => item.status_usuario === 'abandonada'
      ).length,
      episodiosAssistidos: totalEpisodiosAssistidos,
    };
  }

  // Converte a data da conta em um texto curto para o perfil
  function formatarDataMembro(data: string | undefined): string {
    if (!data) {
      return 'Data não disponível';
    }

    const dataConta = new Date(data);

    const texto = dataConta.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // Carrega novamente o perfil sempre que o usuário entrar ou retornar à página
  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarPerfil() {
        try {
          setCarregando(true);
          setMensagemErro('');

          // Recupera a conta conectada
          const {
            data: dadosUsuario,
            error: erroUsuario,
          } = await supabase.auth.getUser();

          if (erroUsuario || !dadosUsuario.user) {
            throw new Error('Não foi possível carregar sua conta.');
          }

          // Carrega a lista e apenas a contagem de episódios simultaneamente.
          // O Perfil não precisa baixar milhares de registros do histórico para
          // exibir somente a quantidade total de episódios assistidos.
          const [lista, totalEpisodiosAssistidos] = await Promise.all([
            buscarMinhaLista(),
            contarEpisodiosAssistidos(),
          ]);

          if (!paginaAtiva) {
            return;
          }

          const usuario = dadosUsuario.user;

          // Prioriza o nome salvo nos metadados do cadastro
          const nomeCadastrado = usuario.user_metadata?.nome;
          const nomeDoEmail = usuario.email?.split('@')[0] ?? 'usuario';

          const nomeExibicao =
            typeof nomeCadastrado === 'string' && nomeCadastrado.trim()
              ? nomeCadastrado.trim()
              : nomeDoEmail;

          // Recupera o avatar salvo nos metadados, quando existir
          const imagemAvatar =
            typeof usuario.user_metadata?.avatar_url === 'string'
              ? usuario.user_metadata.avatar_url
              : null;

          setNomeUsuario(nomeExibicao);
          setEmailUsuario(usuario.email ?? '');
          setNomePerfil(nomeDoEmail);
          setAvatarUrl(imagemAvatar);
          setMembroDesde(formatarDataMembro(usuario.created_at));
          setEstatisticas(
            calcularEstatisticas(
              lista,
              totalEpisodiosAssistidos
            )
          );
        } catch (erro) {
          console.log('Erro ao carregar perfil:', erro);

          if (paginaAtiva) {
            setEstatisticas(estatisticasIniciais);
            setMensagemErro('Não foi possível carregar seu perfil.');
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

  // Abre o modal personalizado do Gabiflix.
  function confirmarSaida() {
    setModalSaidaVisivel(true);
  }

  // Encerra a sessão somente depois que a pessoa toca em "Sair".
  async function sairDaConta() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setModalSaidaVisivel(false);
        setErroSaida('Tente novamente.');
        return;
      }

      setModalSaidaVisivel(false);
      router.replace('/');
    } catch {
      setModalSaidaVisivel(false);
      setErroSaida('Tente novamente.');
    }
  }

  // Exibe um estado centralizado enquanto os dados são preparados
  if (carregando) {
    return (
      <View style={styles.estadoCentralizado}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.textoEstado}>Carregando seu perfil...</Text>
      </View>
    );
  }

  // Exibe uma mensagem quando não for possível consultar os dados
  if (mensagemErro) {
    return (
      <SafeAreaView
        style={styles.estadoCentralizado}
        edges={['top', 'bottom']}
      >
        <Ionicons
          name="alert-circle-outline"
          size={44}
          color="#F48FB1"
        />

        <Text style={styles.textoErro}>{mensagemErro}</Text>

        <TouchableOpacity
          style={styles.botaoVoltarErro}
          activeOpacity={0.8}
          onPress={() => router.replace('/inicio')}
        >
          <Text style={styles.textoBotaoVoltarErro}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={() => router.replace('/inicio')}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color="#E91E63" />
        </TouchableOpacity>

        <Text style={styles.tituloCabecalho}>Perfil</Text>

        {/* Engrenagem que abre a página própria de configurações */}
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={() => router.push('/configuracoes')}
          accessibilityLabel="Configurações"
        >
          <Ionicons name="settings-outline" size={22} color="#E91E63" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        {/* Área principal com avatar e identificação da conta */}
        <View style={styles.perfilPrincipal}>
          <View style={styles.bordaAvatar}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImagem}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPadrao}>
                <Text style={styles.inicialAvatar}>
                  {nomeUsuario.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.nomeUsuario}>{nomeUsuario} 💕</Text>
          <Text style={styles.nomePerfil}>@{nomePerfil}</Text>

          {emailUsuario ? (
            <Text style={styles.email}>{emailUsuario}</Text>
          ) : null}

          <View style={styles.seloMembro}>
            <Text style={styles.textoSeloMembro}>
              Membro desde {membroDesde}
            </Text>
          </View>
        </View>

        {/* Resumo rápido inspirado na referência visual */}
        <View style={styles.resumoRapido}>
          <View style={styles.itemResumo}>
            <Text style={styles.numeroResumo}>{estatisticas.assistindo}</Text>
            <Text style={styles.textoResumo}>Assistindo</Text>
          </View>

          <View style={styles.divisorResumo} />

          <View style={styles.itemResumo}>
            <Text style={styles.numeroResumo}>
              {estatisticas.queroAssistir}
            </Text>
            <Text style={styles.textoResumo}>Quero assistir</Text>
          </View>


        </View>

        {/* Cabeçalho da área de estatísticas */}
        <View style={styles.cabecalhoEstatisticas}>
          <Text style={styles.tituloSecao}>Estatísticas</Text>
        </View>

        {/* Cards calculados com informações reais já disponíveis no Supabase */}
        <View style={styles.gradeEstatisticas}>
          <View style={styles.cardEstatistica}>
            <View style={styles.iconeEstatistica}>
              <Ionicons name="tv-outline" size={20} color="#E91E63" />
            </View>
            <Text style={styles.rotuloEstatistica}>Séries</Text>
            <Text style={styles.valorEstatistica}>
              {estatisticas.totalSeries}
            </Text>
          </View>

          <View style={styles.cardEstatistica}>
            <View style={styles.iconeEstatistica}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#E91E63"
              />
            </View>
            <Text style={styles.rotuloEstatistica}>Episódios</Text>
            <Text style={styles.valorEstatistica}>
              {estatisticas.episodiosAssistidos}
            </Text>
          </View>

          <View style={styles.cardEstatistica}>
            <View style={styles.iconeEstatistica}>
              <Ionicons
                name="pause-circle-outline"
                size={20}
                color="#E91E63"
              />
            </View>
            <Text style={styles.rotuloEstatistica}>Pausadas</Text>
            <Text style={styles.valorEstatistica}>
              {estatisticas.pausadas}
            </Text>
          </View>

          <View style={styles.cardEstatistica}>
            <View style={styles.iconeEstatistica}>
              <Ionicons name="refresh-outline" size={20} color="#E91E63" />
            </View>
            <Text style={styles.rotuloEstatistica}>Reassistindo</Text>
            <Text style={styles.valorEstatistica}>
              {estatisticas.reassistindo}
            </Text>
          </View>
        </View>

        {/* Informação complementar sem ocupar os cards principais */}
        <View style={styles.cardSecundario}>
          <View style={styles.cardSecundarioEsquerda}>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color="#F48FB1"
            />
            <Text style={styles.textoCardSecundario}>
              Séries abandonadas
            </Text>
          </View>

          <Text style={styles.valorCardSecundario}>
            {estatisticas.abandonadas}
          </Text>
        </View>

        {/* Atalhos relacionados à atividade do usuário e à conta */}
        <View style={styles.acoesConta}>
          <TouchableOpacity
            style={styles.botaoConta}
            activeOpacity={0.8}
            onPress={() => router.push('/historico-episodios')}
          >
            <Ionicons
              name="time-outline"
              size={21}
              color="#F48FB1"
            />

            <Text style={styles.textoBotaoConta}>
              Histórico de episódios
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#666666"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoConta, styles.botaoSair]}
            activeOpacity={0.8}
            onPress={confirmarSaida}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#FF6B81"
            />
            <Text style={styles.textoBotaoSair}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ModalConfirmacao
        visivel={modalSaidaVisivel}
        titulo="Sair do Gabiflix?"
        descricao="Você precisará entrar novamente para acessar sua conta."
        onFechar={() => setModalSaidaVisivel(false)}
        acoes={[
          {
            texto: 'Cancelar',
            tipo: 'cancelar',
            onPress: () => setModalSaidaVisivel(false),
          },
          {
            texto: 'Sair',
            tipo: 'principal',
            onPress: sairDaConta,
          },
        ]}
      />

      <ModalConfirmacao
        visivel={Boolean(erroSaida)}
        titulo="Não foi possível sair"
        descricao={erroSaida ?? ''}
        onFechar={() => setErroSaida(null)}
        acoes={[
          {
            texto: 'Entendi',
            tipo: 'principal',
            onPress: () => setErroSaida(null),
          },
        ]}
      />
    </SafeAreaView>
  );
}