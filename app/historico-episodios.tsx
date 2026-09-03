// PÁGINA DE HISTÓRICO DE EPISÓDIOS ASSISTIDOS

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  buscarHistoricoAssistido,
  type RegistroEpisodioAssistido,
} from '../services/episodios-assistidos.service';
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
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let paginaAtiva = true;

      async function carregarHistorico() {
        try {
          setCarregando(true);
          setMensagemErro('');

          const historico = await buscarHistoricoAssistido();

          const idsSeries = Array.from(
            new Set(historico.map((item) => item.serie_id))
          );

          const nomesPorSerie = new Map<number, string>();

          await Promise.all(
            idsSeries.map(async (serieId) => {
              try {
                const detalhes = await buscarDetalhesSerie(serieId);
                nomesPorSerie.set(serieId, detalhes.name);
              } catch (erro) {
                console.log(
                  `Erro ao buscar nome da série ${serieId} no histórico:`,
                  erro
                );
                nomesPorSerie.set(serieId, 'Série');
              }
            })
          );

          if (!paginaAtiva) {
            return;
          }

          const resultado: ItemHistorico[] = historico.map((item) => ({
            ...item,
            nomeSerie: nomesPorSerie.get(item.serie_id) ?? 'Série',
          }));

          setItens(resultado);
        } catch (erro) {
          console.log('Erro ao carregar histórico de episódios:', erro);

          if (paginaAtiva) {
            setItens([]);
            setMensagemErro('Não foi possível carregar seu histórico.');
          }
        } finally {
          if (paginaAtiva) {
            setCarregando(false);
          }
        }
      }

      carregarHistorico();

      return () => {
        paginaAtiva = false;
      };
    }, [tentativa])
  );

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
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={26} color="#E91E63" />
        </TouchableOpacity>

        <View>
          <Text style={styles.titulo}>Histórico de episódios</Text>
          <Text style={styles.subtitulo}>
            {itens.length} {itens.length === 1 ? 'episódio assistido' : 'episódios assistidos'}
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
