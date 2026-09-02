// ESTRUTURA E FUNCIONAMENTO DA PÁGINA PRINCIPAL

// Hooks utilizados para verificar a sessão, preparar o destaque e controlar o menu
import { useEffect, useMemo, useState } from 'react';
// Componentes utilizados na tela
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
  buscarHistoricoAssistido,
  type RegistroEpisodioAssistido,
} from '../services/episodios-assistidos.service';
import { buscarMinhaLista } from '../services/minha-lista.service';
import {
  buscarDetalhesSerie,
  buscarDetalhesTemporada,
  buscarSeriesEmAlta,
  obterUrlCapa,
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

interface ItemContinuarHome {
  serieId: number;
  nome: string;
  posterPath: string | null;
  temporadaNumero: number;
  proximoEpisodioNumero: number;
  quantidadeAssistida: number;
  totalEpisodios: number;
}

function episodioFoiLancado(data: string | null): boolean {
  if (!data) return false;
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEpisodio = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return dataEpisodio <= hoje;
}

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

  // Séries com episódio lançado ainda não assistido.
  const [continuarHome, setContinuarHome] = useState<ItemContinuarHome[]>([]);
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

  // Busca somente o necessário para a Home.
  useEffect(() => {
    if (!sessaoValida) return;

    let telaAtiva = true;

    async function carregarSeries() {
      try {
        setCarregandoSeries(true);
        setErroSeries('');

        const respostaEmAlta = await buscarSeriesEmAlta();

        if (telaAtiva) {
          setSeriesEmAlta(respostaEmAlta.results);
        }
      } catch (erro) {
        console.log('Erro ao buscar séries em alta:', erro);

        if (telaAtiva) {
          setSeriesEmAlta([]);
          setErroSeries('Não foi possível carregar as séries do TMDB.');
        }
      } finally {
        if (telaAtiva) setCarregandoSeries(false);
      }
    }

    carregarSeries();

    return () => {
      telaAtiva = false;
    };
  }, [sessaoValida, tentativaSeries]);

  // Prepara os cards pessoais de Continuar assistindo.
  useEffect(() => {
    if (!sessaoValida) return;

    let telaAtiva = true;

    async function carregarContinuarAssistindo() {
      try {
        const [historico, minhaLista] = await Promise.all([
          buscarHistoricoAssistido(),
          buscarMinhaLista(),
        ]);

        const idsAcompanhadas = new Set(
          minhaLista
            .filter(
              (item) =>
                item.status_usuario === 'assistindo' ||
                item.status_usuario === 'reassistindo'
            )
            .map((item) => item.serie_id)
        );

        const registrosPorSerie = new Map<number, RegistroEpisodioAssistido[]>();

        historico.forEach((registro) => {
          if (!idsAcompanhadas.has(registro.serie_id)) return;
          const atuais = registrosPorSerie.get(registro.serie_id) ?? [];
          atuais.push(registro);
          registrosPorSerie.set(registro.serie_id, atuais);
        });

        const resultados = await Promise.all(
          Array.from(registrosPorSerie.entries()).map(async ([serieId, registros]) => {
            try {
              const detalhes = await buscarDetalhesSerie(serieId);
              const idsAssistidos = new Set(registros.map((registro) => registro.episodio_id));

              const temporadas = detalhes.seasons
                .filter((temporada) => temporada.season_number > 0 && temporada.episode_count > 0)
                .sort((a, b) => a.season_number - b.season_number);

              for (const temporada of temporadas) {
                const detalhesTemporada = await buscarDetalhesTemporada(
                  serieId,
                  temporada.season_number
                );

                const proximo = detalhesTemporada.episodes.find(
                  (episodio) =>
                    !idsAssistidos.has(episodio.id) &&
                    episodioFoiLancado(episodio.air_date)
                );

                if (proximo) {
                  const assistidosNaTemporada = registros.filter(
                    (registro) => registro.temporada_numero === temporada.season_number
                  ).length;

                  return {
                    serieId,
                    nome: detalhes.name,
                    posterPath: detalhes.poster_path,
                    temporadaNumero: temporada.season_number,
                    proximoEpisodioNumero: proximo.episode_number,
                    quantidadeAssistida: assistidosNaTemporada,
                    totalEpisodios: detalhesTemporada.episodes.length,
                  } satisfies ItemContinuarHome;
                }
              }

              return null;
            } catch (erro) {
              console.log(`Erro ao preparar série ${serieId} na Home:`, erro);
              return null;
            }
          })
        );

        if (telaAtiva) {
          setContinuarHome(
            resultados.filter((item): item is ItemContinuarHome => item !== null).slice(0, 8)
          );
        }
      } catch (erro) {
        console.log('Erro ao carregar Continuar assistindo na Home:', erro);
        if (telaAtiva) setContinuarHome([]);
      }
    }

    carregarContinuarAssistindo();

    return () => {
      telaAtiva = false;
    };
  }, [sessaoValida]);

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

            {/* Refaz a consulta da seção Em alta sem exigir reiniciar o app */}
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

            {/* Continuar assistindo aparece primeiro e usa o progresso real da conta */}
            <View style={styles.cabecalhoSecao}>
              <Text style={styles.tituloSecao}>Continuar assistindo</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/continuar-assistindo')}
              >
                <Text style={styles.verTudo}>Ver tudo ›</Text>
              </TouchableOpacity>
            </View>

            {continuarHome.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listaContinuar}
              >
                {continuarHome.map((item) => {
                  const urlCapa = obterUrlCapa(item.posterPath);
                  const percentual = item.totalEpisodios
                    ? Math.min(
                        (item.quantidadeAssistida / item.totalEpisodios) * 100,
                        100
                      )
                    : 0;

                  return (
                    <TouchableOpacity
                      key={item.serieId}
                      style={styles.cardContinuar}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: '/temporadas/[id]',
                          params: {
                            id: String(item.serieId),
                            temporada: String(item.temporadaNumero),
                          },
                        })
                      }
                    >
                      {urlCapa ? (
                        <Image source={{ uri: urlCapa }} style={styles.capaContinuar} />
                      ) : (
                        <View style={[styles.capaContinuar, styles.semCapaContinuar]}>
                          <Ionicons name="image-outline" size={28} color="#777777" />
                        </View>
                      )}

                      <Text style={styles.nomeContinuar} numberOfLines={1}>
                        {item.nome}
                      </Text>

                      <Text style={styles.episodioContinuar}>
                        T{item.temporadaNumero} • E{item.proximoEpisodioNumero}
                      </Text>

                      <View style={styles.trilhoContinuar}>
                        <View
                          style={[
                            styles.barraContinuar,
                            { width: `${percentual}%` as `${number}%` },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TouchableOpacity
                style={styles.continuarVazio}
                activeOpacity={0.8}
                onPress={() => router.push('/continuar-assistindo')}
              >
                <Ionicons name="checkmark-circle-outline" size={22} color="#E91E63" />
                <Text style={styles.textoContinuarVazio}>
                  Você está em dia com suas séries.
                </Text>
              </TouchableOpacity>
            )}

            {/* Em alta permanece como seção de descoberta da Home */}
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