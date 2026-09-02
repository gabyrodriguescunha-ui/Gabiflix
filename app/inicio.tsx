// ESTRUTURA E FUNCIONAMENTO DA PÁGINA PRINCIPAL

// Hooks utilizados para verificar a sessão, preparar o destaque e controlar o menu
import { useEffect, useMemo, useState } from 'react';
// Componentes utilizados na tela
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
// Importa os ícones utilizados nos atalhos e informações
import { Ionicons } from '@expo/vector-icons';
// Cria o degradê aplicado sobre a imagem da série em destaque
import { LinearGradient } from 'expo-linear-gradient';
// Recurso de navegação
import { useRouter } from 'expo-router';
// Evita que o conteúdo fique atrás das barras do celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Cliente responsável pela autenticação
import { supabase } from '../lib/supabase';
// Serviço responsável por buscar as séries e imagens no TMDB
import {
  buscarLancamentosRecentes,
  buscarSeriesEmAlta,
  buscarSeriesPopulares,
  obterUrlFundo,
} from '../services/tmdb.service';
// Tipo utilizado para representar uma série
import type { Serie } from '../types/serie';
// Modal personalizado para avisos e confirmações
import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
// Estilos da página
import { styles } from '../styles/inicio.styles';
// Cabeçalho do Gabiflix
import { Cabecalho } from '../components/cabecalho/Cabecalho';
// Menu aberto pelo ícone de hambúrguer
import { MenuLateral } from '../components/menu-lateral/MenuLateral';
// Card utilizado para exibir cada série popular
import { CardSerie } from '../components/card-serie/CardSerie';

// Página principal do aplicativo
export default function Inicio() {
  // Permite navegar entre as páginas
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

  // Impede que a página apareça antes de verificar a sessão
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  // Controla a abertura e o fechamento do menu
  const [menuVisivel, setMenuVisivel] = useState(false);
  // Guarda o nome cadastrado pelo usuário
  const [nomeUsuario, setNomeUsuario] = useState('Usuária');
  // Informa que a conta possui uma sessão válida
  const [sessaoValida, setSessaoValida] = useState(false);
  // Guarda as séries que estão em tendência durante a semana
  const [seriesEmAlta, setSeriesEmAlta] = useState<Serie[]>([]);

  // Guarda as séries que estrearam recentemente
  const [lancamentosRecentes, setLancamentosRecentes] = useState<Serie[]>([]);

  // Guarda as séries populares recebidas do TMDB
  const [seriesPopulares, setSeriesPopulares] = useState<Serie[]>([]);
  // Controla o carregamento dos dados do TMDB
  const [carregandoSeries, setCarregandoSeries] = useState(true);
  // Guarda uma mensagem caso a requisição apresente erro
  const [erroSeries, setErroSeries] = useState('');
  // Incrementado pelo botão Tentar novamente para repetir a consulta ao TMDB
  const [tentativaSeries, setTentativaSeries] = useState(0);

  // Verifica a sessão e recupera os dados da conta conectada
  useEffect(() => {
    let telaAtiva = true;

    async function verificarSessao() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!telaAtiva) {
          return;
        }

        if (error || !data.session) {
          router.replace('/');
          return;
        }

        setSessaoValida(true);

        // Prioriza o nome informado no cadastro
        const nomeCadastrado = data.session.user.user_metadata?.nome;
        const nomeDoEmail = data.session.user.email?.split('@')[0];

        if (typeof nomeCadastrado === 'string' && nomeCadastrado.trim()) {
          setNomeUsuario(nomeCadastrado.trim());
        } else if (nomeDoEmail) {
          setNomeUsuario(nomeDoEmail);
        }
      } catch (erro) {
        console.log('Erro inesperado ao verificar sessão:', erro);
        router.replace('/');
      } finally {
        if (telaAtiva) {
          setVerificandoSessao(false);
        }
      }
    }

    verificarSessao();

    return () => {
      telaAtiva = false;
    };
  }, []);

  // Busca as séries somente depois de confirmar a sessão do usuário
  useEffect(() => {
    if (!sessaoValida) {
      return;
    }

    let telaAtiva = true;

    async function carregarSeries() {
      try {
        setCarregandoSeries(true);
        setErroSeries('');

        // Carrega as três seções da página ao mesmo tempo
        const [
          respostaEmAlta,
          respostaLancamentos,
          respostaPopulares,
        ] = await Promise.all([
          buscarSeriesEmAlta(),
          buscarLancamentosRecentes(),
          buscarSeriesPopulares(),
        ]);

        if (telaAtiva) {
          setSeriesEmAlta(respostaEmAlta.results);
          setLancamentosRecentes(respostaLancamentos.results);
          setSeriesPopulares(respostaPopulares.results);
        }
      } catch (erro) {
        console.log('Erro ao buscar séries:', erro);

        if (telaAtiva) {
          setSeriesEmAlta([]);
          setLancamentosRecentes([]);
          setSeriesPopulares([]);
          setErroSeries(
            'Não foi possível carregar as séries do TMDB.'
          );
        }
      } finally {
        if (telaAtiva) {
          setCarregandoSeries(false);
        }
      }
    }

    carregarSeries();

    return () => {
      telaAtiva = false;
    };
  }, [sessaoValida, tentativaSeries]);

  // Mantém poucos destaques para o carrossel ficar leve e objetivo.
  const destaquesEmAlta = useMemo(
    () => seriesEmAlta.slice(0, 5),
    [seriesEmAlta]
  );

  const [indiceDestaque, setIndiceDestaque] = useState(0);

  const larguraDestaque =
    Dimensions.get('window').width - 40;

  function atualizarIndiceDestaque(
    evento: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const deslocamento =
      evento.nativeEvent.contentOffset.x;

    const novoIndice = Math.round(
      deslocamento / larguraDestaque
    );

    setIndiceDestaque(
      Math.max(
        0,
        Math.min(
          novoIndice,
          destaquesEmAlta.length - 1
        )
      )
    );
  }

  // Encerra a sessão e retorna para o login
  async function sair() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      mostrarAviso('Não foi possível sair', 'Tente novamente em alguns instantes.');
      return;
    }

    setMenuVisivel(false);
    router.replace('/');
  }

  // Abre a página de detalhes da série selecionada
  function abrirSerie(serie: Serie) {
    router.push({
      pathname: '/serie/[id]',
      params: {
        id: String(serie.id),
      },
    });
  }

  // Mostra um indicador enquanto a sessão é verificada
  if (verificandoSessao) {
    return (
      <View style={styles.carregamento}>
        <ActivityIndicator size="large" color="#E91E63" />

        <Text style={styles.textoCarregamento}>
          Verificando sua sessão...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Cabeçalho com o botão responsável por abrir o menu */}
      <Cabecalho onAbrirMenu={() => setMenuVisivel(true)} />

      {/* Conteúdo principal preenchido com os dados do TMDB */}
      <View style={styles.conteudo}>
        {carregandoSeries ? (
          // Estado apresentado enquanto as séries estão sendo carregadas
          <View style={styles.estadoCarregamento}>
            <ActivityIndicator size="small" color="#E91E63" />

            <Text style={styles.textoEstado}>
              Buscando séries no TMDB...
            </Text>
          </View>
        ) : erroSeries ? (
          // Estado apresentado caso a comunicação com o TMDB apresente erro
          <View style={styles.estadoCarregamento}>
            <Ionicons
              name="cloud-offline-outline"
              size={34}
              color="#F48FB1"
            />

            <Text style={styles.textoErro}>
              {erroSeries}
            </Text>

            {/* Refaz as três consultas da página sem exigir que o usuário reinicie o app */}
            <TouchableOpacity
              style={{
                marginTop: 18,
                minHeight: 42,
                paddingHorizontal: 20,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: '#E91E63',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.8}
              onPress={() =>
                setTentativaSeries((valorAtual) => valorAtual + 1)
              }
            >
              <Text
                style={{
                  color: '#E91E63',
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 12,
                }}
              >
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollConteudo}
          >
            {/* Apresenta uma saudação antes das seções principais */}
            <View style={styles.boasVindas}>
              <Text style={styles.saudacao}>
                Olá, {nomeUsuario} 👋
              </Text>

              <Text style={styles.subtituloSaudacao}>
                O que vamos assistir hoje?
              </Text>
            </View>

            {/* Título da seção utilizada para acessar o próximo episódio */}
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.tituloSecao}>
                Continuar assistindo
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/continuar-assistindo')}
              >
                <Text style={styles.verTudo}>
                  Ver tudo ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Atalho para a página que calcula o próximo episódio de cada série */}
            <TouchableOpacity
              style={styles.continuarAssistindo}
              activeOpacity={0.85}
              onPress={() => router.push('/continuar-assistindo')}
            >
              {/* Ícone destacado utilizado como referência para continuar a reprodução */}
              <View style={styles.continuarIcone}>
                <Ionicons
                  name="play"
                  size={19}
                  color="#FFFFFF"
                />
              </View>

              {/* Explica rapidamente o objetivo do atalho */}
              <View style={styles.continuarConteudo}>
                <Text style={styles.continuarTitulo}>
                  Retome de onde parou
                </Text>

                <Text style={styles.continuarTexto}>
                  Veja seu próximo episódio disponível
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color="#E91E63"
              />
            </TouchableOpacity>

            {/* Título da seção que destaca uma das séries populares */}
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.tituloSecao}>
                Em alta
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/em-alta')}
              >
                <Text style={styles.verTudo}>
                  Ver tudo ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Carrossel com as principais séries em alta */}
            {destaquesEmAlta.length > 0 && (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carrosselDestaque}
                  onMomentumScrollEnd={atualizarIndiceDestaque}
                  snapToInterval={larguraDestaque}
                  snapToAlignment="start"
                >
                  {destaquesEmAlta.map((serieEmAlta) => {
                    const fundoDestaque =
                      obterUrlFundo(
                        serieEmAlta.backdrop_path
                      );

                    return (
                      <TouchableOpacity
                        key={serieEmAlta.id}
                        style={[
                          styles.destaque,
                          {
                            width: larguraDestaque,
                          },
                        ]}
                        activeOpacity={0.9}
                        onPress={() =>
                          abrirSerie(serieEmAlta)
                        }
                      >
                        {fundoDestaque ? (
                          <ImageBackground
                            source={{
                              uri: fundoDestaque,
                            }}
                            style={styles.imagemDestaque}
                            imageStyle={
                              styles.imagemDestaqueInterna
                            }
                          >
                            <LinearGradient
                              colors={[
                                'rgba(18,18,18,0)',
                                'rgba(18,18,18,0.32)',
                                'rgba(18,18,18,0.96)',
                              ]}
                              locations={[0, 0.42, 1]}
                              style={
                                styles.gradienteDestaque
                              }
                            >
                              <View
                                style={styles.seloEmAlta}
                              >
                                <Ionicons
                                  name="flame"
                                  size={13}
                                  color="#E91E63"
                                />

                                <Text
                                  style={
                                    styles.textoSeloEmAlta
                                  }
                                >
                                  EM ALTA
                                </Text>
                              </View>

                              <View
                                style={
                                  styles.conteudoDestaque
                                }
                              >
                                <Text
                                  style={
                                    styles.tituloDestaque
                                  }
                                  numberOfLines={2}
                                >
                                  {serieEmAlta.name}
                                </Text>

                                <View
                                  style={
                                    styles.metaDestaque
                                  }
                                >
                                  <View
                                    style={
                                      styles.avaliacaoDestaque
                                    }
                                  >
                                    <Ionicons
                                      name="star"
                                      size={13}
                                      color="#E91E63"
                                    />

                                    <Text
                                      style={
                                        styles.notaDestaque
                                      }
                                    >
                                      {serieEmAlta.vote_average >
                                      0
                                        ? serieEmAlta.vote_average.toFixed(
                                            1
                                          )
                                        : 'Sem nota'}
                                    </Text>
                                  </View>

                                  <View
                                    style={styles.ponto}
                                  />

                                  <Text
                                    style={
                                      styles.anoDestaque
                                    }
                                  >
                                    {serieEmAlta.first_air_date?.substring(
                                      0,
                                      4
                                    ) || '—'}
                                  </Text>
                                </View>

                                <Text
                                  style={
                                    styles.sinopseDestaque
                                  }
                                  numberOfLines={2}
                                >
                                  {serieEmAlta.overview ||
                                    'Uma das séries mais populares do momento.'}
                                </Text>

                                <View
                                  style={
                                    styles.botaoDetalhes
                                  }
                                >
                                  <Ionicons
                                    name="information-circle-outline"
                                    size={17}
                                    color="#FFFFFF"
                                  />

                                  <Text
                                    style={
                                      styles.textoBotaoDetalhes
                                    }
                                  >
                                    Ver detalhes
                                  </Text>
                                </View>
                              </View>
                            </LinearGradient>
                          </ImageBackground>
                        ) : (
                          <LinearGradient
                            colors={[
                              '#242424',
                              '#121212',
                            ]}
                            style={
                              styles.imagemDestaque
                            }
                          >
                            <View
                              style={
                                styles.conteudoSemDestaque
                              }
                            >
                              <Text
                                style={
                                  styles.tituloDestaque
                                }
                              >
                                {serieEmAlta.name}
                              </Text>
                            </View>
                          </LinearGradient>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {destaquesEmAlta.length > 1 && (
                  <View
                    style={
                      styles.indicadoresDestaque
                    }
                  >
                    {destaquesEmAlta.map(
                      (item, indice) => (
                        <View
                          key={item.id}
                          style={[
                            styles.indicadorDestaque,
                            indice ===
                              indiceDestaque &&
                              styles.indicadorDestaqueAtivo,
                          ]}
                        />
                      )
                    )}
                  </View>
                )}
              </>
            )}

            {/* Título da seção que apresenta séries lançadas recentemente */}
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.tituloSecao}>
                Lançamentos recentes
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/lancamentos')}
              >
                <Text style={styles.verTudo}>
                  Ver tudo ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Carrossel horizontal com séries que estrearam nos últimos 30 dias */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaSeries}
            >
              {lancamentosRecentes.slice(0, 10).map((serie) => (
                <CardSerie
                  key={serie.id}
                  serie={serie}
                />
              ))}
            </ScrollView>

            {/* Título da seção que mantém o carrossel de séries populares */}
            <View
              style={[
                styles.cabecalhoSecao,
                styles.cabecalhoPopulares,
              ]}
            >
              <Text style={styles.tituloSecao}>
                Populares
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/populares')}
              >
                <Text style={styles.verTudo}>
                  Ver tudo ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Carrossel horizontal preenchido com as demais séries populares */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaSeries}
            >
              {seriesPopulares.map((serie) => (
                <CardSerie
                  key={serie.id}
                  serie={serie}
                />
              ))}
            </ScrollView>
          </ScrollView>
        )}
      </View>

      {/* Menu exibido sobre a página quando o botão for tocado */}
      <MenuLateral
        visivel={menuVisivel}
        nomeUsuario={nomeUsuario}
        onFechar={() => setMenuVisivel(false)}
        onSair={sair}
      />
    
      {/* Avisos e erros seguem o mesmo padrão visual das confirmações */}
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