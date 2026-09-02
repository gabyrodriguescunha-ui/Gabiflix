// PÁGINA QUE EXIBE UMA LISTA COMPLETA DE SÉRIES

// Hooks utilizados para carregar as séries
import { useEffect, useState } from 'react';
// Componentes utilizados na tela
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones utilizados no cabeçalho e estados da página
import { Ionicons } from '@expo/vector-icons';
// Recurso utilizado para navegação
import { useRouter } from 'expo-router';
// Mantém o conteúdo distante das barras do aparelho
import { SafeAreaView } from 'react-native-safe-area-context';
// Serviço responsável por buscar as séries populares
import { buscarSeriesPopulares } from '../services/tmdb.service';
// Tipo utilizado para representar uma série
import type { Serie } from '../types/serie';
// Card já utilizado na página inicial
import { CardSerie } from '../components/card-serie/CardSerie';
// Estilos exclusivos da listagem
import { styles } from '../styles/listagem-series.styles';


export default function Populares() {
  const router = useRouter();

  // Guarda as séries recebidas do TMDB
  const [series, setSeries] = useState<Serie[]>([]);

  // Controla carregamento e erro
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);

  // Busca as séries quando a página for aberta
  useEffect(() => {
    let telaAtiva = true;

    async function carregarSeries() {
      try {
        setCarregando(true);
        setErro('');

        const resposta = await buscarSeriesPopulares();

        if (telaAtiva) {
          setSeries(resposta.results);
        }
      } catch (erroConsulta) {
        console.log('Erro ao carregar Populares:', erroConsulta);

        if (telaAtiva) {
          setSeries([]);
          setErro('Não foi possível carregar as séries.');
        }
      } finally {
        if (telaAtiva) {
          setCarregando(false);
        }
      }
    }

    carregarSeries();

    return () => {
      telaAtiva = false;
    };
  }, [tentativa]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={router.back}
        >
          <Ionicons name="chevron-back" size={27} color="#E91E63" />
        </TouchableOpacity>

        <View style={styles.areaTitulo}>
          <Text style={styles.titulo}>Populares</Text>
          <Text style={styles.subtitulo}>Séries mais populares</Text>
        </View>

        <View style={styles.espacoCabecalho} />
      </View>

      {carregando ? (
        <View style={styles.estadoCentralizado}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.textoEstado}>Buscando séries...</Text>
        </View>
      ) : erro ? (
        <View style={styles.estadoCentralizado}>
          <Ionicons name="cloud-offline-outline" size={40} color="#F48FB1" />
          <Text style={styles.textoErro}>{erro}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setTentativa((valor) => valor + 1)
            }
            style={{
              minHeight: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: '#E91E63',
              borderRadius: 19,
              marginTop: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                color: '#E91E63',
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conteudo}
        >
          {/* Grade completa utilizando o mesmo CardSerie da página inicial */}
          <View style={styles.grade}>
            {series.map((serie) => (
              <View key={serie.id} style={styles.itemGrade}>
                <CardSerie serie={serie} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
