// PÁGINA DE HISTÓRICO DE EPISÓDIOS ASSISTIDOS

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  buscarPaginaHistoricoAssistido,
  contarEpisodiosAssistidos,
  type RegistroEpisodioAssistido,
} from '../services/episodios-assistidos.service';
import { buscarMinhaLista } from '../services/minha-lista.service';
import { buscarDetalhesSerie } from '../services/tmdb.service';
import { styles } from '../styles/historico-episodios.styles';

interface ItemHistorico extends RegistroEpisodioAssistido {
  nomeSerie: string;
}

interface GrupoHistorico {
  titulo: string;
  dados: ItemHistorico[];
}

function formatarDataHora(data: string): string {
  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return '';
  }

  return valor.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function chaveDia(data: string): string {
  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return 'Sem data';
  }

  return valor.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function HistoricoEpisodios() {
  const router = useRouter();

  const [itens, setItens] = useState<ItemHistorico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [totalHistorico, setTotalHistorico] = useState(0);

  const nomesPorSerieRef = useRef(new Map<number, string>());
  const paginaAtivaRef = useRef(true);
  const carregandoMaisRef = useRef(false);

  const TAMANHO_PAGINA = 100;

  const preencherNomes = useCallback(
    async (
      historico: RegistroEpisodioAssistido[]
    ): Promise<ItemHistorico[]> => {
      const mapa = nomesPorSerieRef.current;

      const idsFaltantes = Array.from(
        new Set(
          historico
            .map((item) => Number(item.serie_id))
            .filter((serieId) => !mapa.has(serieId))
        )
      );

      await Promise.all(
        idsFaltantes.map(async (serieId) => {
          try {
            const detalhes = await buscarDetalhesSerie(serieId);
            mapa.set(serieId, detalhes.name);
          } catch (erro) {
            console.log(
              `Erro ao buscar nome da série ${serieId} no histórico:`,
              erro
            );
            mapa.set(serieId, 'Série');
          }
        })
      );

      return historico.map((item) => ({
        ...item,
        nomeSerie:
          mapa.get(Number(item.serie_id)) ?? 'Série',
      }));
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      paginaAtivaRef.current = true;

      async function carregarPrimeiraPagina() {
        try {
          setCarregando(true);
          setMensagemErro('');
          setPaginaAtual(0);
          setTemMais(true);

          // Minha Lista fornece a maioria dos nomes sem chamadas extras ao TMDB.
          // A contagem total é leve e não baixa todos os episódios.
          const [pagina, minhaLista, total] = await Promise.all([
            buscarPaginaHistoricoAssistido(0, TAMANHO_PAGINA),
            buscarMinhaLista(),
            contarEpisodiosAssistidos(),
          ]);

          if (!paginaAtivaRef.current) {
            return;
          }

          nomesPorSerieRef.current = new Map(
            minhaLista.map((serie) => [
              Number(serie.serie_id),
              serie.nome,
            ])
          );

          // Mostra a primeira página antes de resolver nomes raros que não
          // estejam mais presentes na Minha Lista.
          setItens(
            pagina.dados.map((item) => ({
              ...item,
              nomeSerie:
                nomesPorSerieRef.current.get(
                  Number(item.serie_id)
                ) ?? 'Série',
            }))
          );
          setTotalHistorico(total);
          setTemMais(pagina.temMais);
          setCarregando(false);

          const completos = await preencherNomes(pagina.dados);

          if (paginaAtivaRef.current) {
            setItens(completos);
          }
        } catch (erro) {
          console.log(
            'Erro ao carregar histórico de episódios:',
            erro
          );

          if (paginaAtivaRef.current) {
            setItens([]);
            setMensagemErro(
              'Não foi possível carregar seu histórico.'
            );
          }
        } finally {
          if (paginaAtivaRef.current) {
            setCarregando(false);
          }
        }
      }

      carregarPrimeiraPagina();

      return () => {
        paginaAtivaRef.current = false;
      };
    }, [tentativa, preencherNomes])
  );

  const carregarMais = useCallback(async () => {
    if (
      carregando ||
      carregandoMaisRef.current ||
      !temMais
    ) {
      return;
    }

    carregandoMaisRef.current = true;
    setCarregandoMais(true);

    const proximaPagina = paginaAtual + 1;

    try {
      const pagina = await buscarPaginaHistoricoAssistido(
        proximaPagina,
        TAMANHO_PAGINA
      );

      if (!paginaAtivaRef.current) {
        return;
      }

      // Acrescenta a página imediatamente; nomes ausentes são completados
      // depois sem bloquear a rolagem nem a navegação.
      const novosBasicos: ItemHistorico[] =
        pagina.dados.map((item) => ({
          ...item,
          nomeSerie:
            nomesPorSerieRef.current.get(
              Number(item.serie_id)
            ) ?? 'Série',
        }));

      setItens((atuais) => [...atuais, ...novosBasicos]);
      setPaginaAtual(proximaPagina);
      setTemMais(pagina.temMais);

      const novosCompletos =
        await preencherNomes(pagina.dados);

      if (paginaAtivaRef.current) {
        const completosPorId = new Map(
          novosCompletos.map((item) => [item.id, item])
        );

        setItens((atuais) =>
          atuais.map(
            (item) => completosPorId.get(item.id) ?? item
          )
        );
      }
    } catch (erro) {
      console.log(
        'Erro ao carregar mais episódios do histórico:',
        erro
      );
    } finally {
      carregandoMaisRef.current = false;

      if (paginaAtivaRef.current) {
        setCarregandoMais(false);
      }
    }
  }, [
    carregando,
    paginaAtual,
    preencherNomes,
    temMais,
  ]);

  const grupos = useMemo<GrupoHistorico[]>(() => {
    const mapa = new Map<string, ItemHistorico[]>();

    itens.forEach((item) => {
      const titulo = chaveDia(item.assistido_em);
      const atuais = mapa.get(titulo) ?? [];
      atuais.push(item);
      mapa.set(titulo, atuais);
    });

    return Array.from(mapa.entries()).map(([titulo, dados]) => ({
      titulo,
      dados,
    }));
  }, [itens]);

  const dadosFlat = useMemo(() => {
    return grupos.flatMap((grupo) => [
      { tipo: 'grupo' as const, titulo: grupo.titulo },
      ...grupo.dados.map((item) => ({
        tipo: 'episodio' as const,
        item,
      })),
    ]);
  }, [grupos]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={() => router.replace('/perfil')}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color="#E91E63" />
        </TouchableOpacity>

        <View>
          <Text style={styles.titulo}>Histórico de episódios</Text>
          <Text style={styles.subtitulo}>
            {totalHistorico} {totalHistorico === 1 ? 'episódio assistido' : 'episódios assistidos'}
          </Text>
        </View>
      </View>

      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.textoEstado}>
            Carregando seu histórico...
          </Text>
        </View>
      ) : mensagemErro ? (
        <View style={styles.estadoCentralizado}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color="#F48FB1"
          />

          <Text style={styles.textoEstado}>{mensagemErro}</Text>

          <TouchableOpacity
            style={styles.botaoTentar}
            activeOpacity={0.8}
            onPress={() => setTentativa((valor) => valor + 1)}
          >
            <Text style={styles.textoBotaoTentar}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : itens.length === 0 ? (
        <View style={styles.estadoVazio}>
          <Ionicons
            name="time-outline"
            size={52}
            color="#E91E63"
          />

          <Text style={styles.tituloVazio}>
            Nenhum episódio no histórico
          </Text>

          <Text style={styles.textoVazio}>
            Quando você marcar episódios como assistidos, eles aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dadosFlat}
          keyExtractor={(registro, indice) =>
            registro.tipo === 'grupo'
              ? `grupo-${registro.titulo}`
              : `episodio-${registro.item.id}-${indice}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}
          onEndReached={carregarMais}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            carregandoMais ? (
              <View style={{ paddingVertical: 18 }}>
                <ActivityIndicator
                  size="small"
                  color="#E91E63"
                />
              </View>
            ) : null
          }
          renderItem={({ item: registro }) => {
            if (registro.tipo === 'grupo') {
              return (
                <Text style={styles.tituloGrupo}>
                  {registro.titulo}
                </Text>
              );
            }

            const item = registro.item;

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.82}
                onPress={() =>
                  router.push({
                    pathname: '/serie/[id]',
                    params: {
                      id: String(item.serie_id),
                      temporada: String(item.temporada_numero),
                    },
                  })
                }
              >
                <View style={styles.iconeHistorico}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#5DD39E"
                  />
                </View>

                <View style={styles.dados}>
                  <Text
                    style={styles.nomeEpisodio}
                    numberOfLines={2}
                  >
                    {item.episodio_numero}. {item.episodio_nome}
                  </Text>

                  <Text style={styles.referencia}>
                    {item.nomeSerie} • T{item.temporada_numero} E{item.episodio_numero}
                  </Text>

                  <Text style={styles.data}>
                    Marcado em {formatarDataHora(item.assistido_em)}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#666666"
                />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
