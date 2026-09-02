// PÁGINA QUE EXIBE AS SÉRIES LANÇADAS RECENTEMENTE

// Hooks utilizados para carregar e paginar os resultados
import {
  useEffect,
  useState,
} from 'react';
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
// Serviço responsável por buscar os lançamentos recentes
import {
  buscarLancamentosRecentes,
} from '../services/tmdb.service';
// Tipo utilizado para representar uma série
import type { Serie } from '../types/serie';
// Card já utilizado nas outras páginas do Gabiflix
import { CardSerie } from '../components/card-serie/CardSerie';
// Estilos exclusivos da listagem
import { styles } from '../styles/listagem-series.styles';


// Página responsável por mostrar séries que estrearam recentemente
export default function Lancamentos() {
  // Permite retornar para a página anterior
  const router = useRouter();

  // Guarda todos os resultados já carregados
  const [series, setSeries] =
    useState<Serie[]>([]);

  // Guarda a página atual do TMDB
  const [pagina, setPagina] =
    useState(1);

  // Informa quantas páginas existem
  const [totalPaginas, setTotalPaginas] =
    useState(1);

  // Controla o primeiro carregamento
  const [carregando, setCarregando] =
    useState(true);

  // Controla o botão Carregar mais
  const [carregandoMais, setCarregandoMais] =
    useState(false);

  // Guarda uma mensagem caso a consulta falhe
  const [erro, setErro] =
    useState('');
  const [tentativa, setTentativa] =
    useState(0);

  // Carrega a primeira página quando a tela for aberta
  useEffect(() => {
    let telaAtiva = true;

    async function carregarPrimeiraPagina() {
      try {
        setCarregando(true);
        setErro('');

        const resposta =
          await buscarLancamentosRecentes(1);

        if (!telaAtiva) {
          return;
        }

        setSeries(resposta.results);
        setPagina(resposta.page);
        setTotalPaginas(
          resposta.total_pages
        );
      } catch (erroConsulta) {
        console.log(
          'Erro ao carregar lançamentos:',
          erroConsulta
        );

        if (telaAtiva) {
          setSeries([]);
          setErro(
            'Não foi possível carregar os lançamentos recentes.'
          );
        }
      } finally {
        if (telaAtiva) {
          setCarregando(false);
        }
      }
    }

    carregarPrimeiraPagina();

    return () => {
      telaAtiva = false;
    };
  }, [tentativa]);

  // Busca a próxima página sem apagar os resultados anteriores
  async function carregarMais() {
    if (
      carregandoMais ||
      pagina >= totalPaginas
    ) {
      return;
    }

    try {
      setCarregandoMais(true);

      const proximaPagina =
        pagina + 1;

      const resposta =
        await buscarLancamentosRecentes(
          proximaPagina
        );

      // Evita cards duplicados caso a API repita algum resultado
      setSeries((seriesAtuais) => {
        const idsAtuais =
          new Set(
            seriesAtuais.map(
              (serie) => serie.id
            )
          );

        const novosResultados =
          resposta.results.filter(
            (serie) =>
              !idsAtuais.has(serie.id)
          );

        return [
          ...seriesAtuais,
          ...novosResultados,
        ];
      });

      setPagina(resposta.page);
      setTotalPaginas(
        resposta.total_pages
      );
    } catch (erroConsulta) {
      console.log(
        'Erro ao carregar mais lançamentos:',
        erroConsulta
      );
    } finally {
      setCarregandoMais(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Cabeçalho da página */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          activeOpacity={0.7}
          onPress={router.back}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#E91E63"
          />
        </TouchableOpacity>

        <View style={styles.areaTitulo}>
          <Text style={styles.titulo}>
            Lançamentos recentes
          </Text>

          <Text style={styles.subtitulo}>
            Séries que estrearam nos últimos 30 dias
          </Text>
        </View>

        <View
          style={
            styles.espacoCabecalho
          }
        />
      </View>

      {carregando ? (
        <View
          style={
            styles.estadoCentralizado
          }
        >
          <ActivityIndicator
            size="large"
            color="#E91E63"
          />

          <Text
            style={styles.textoEstado}
          >
            Buscando lançamentos...
          </Text>
        </View>
      ) : erro ? (
        <View
          style={
            styles.estadoCentralizado
          }
        >
          <Ionicons
            name="cloud-offline-outline"
            size={40}
            color="#F48FB1"
          />

          <Text
            style={styles.textoErro}
          >
            {erro}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.conteudo
          }
        >
          {/* Grade completa utilizando o mesmo CardSerie das outras telas */}
          <View style={styles.grade}>
            {series.map((serie) => (
              <View
                key={serie.id}
                style={styles.itemGrade}
              >
                <CardSerie
                  serie={serie}
                />
              </View>
            ))}
          </View>

          {/* Permite acessar outras páginas de resultados do TMDB */}
          {pagina < totalPaginas && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={carregarMais}
              disabled={carregandoMais}
              style={{
                alignSelf: 'center',
                minWidth: 150,
                minHeight: 42,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E91E63',
                borderRadius: 22,
                marginTop: 8,
                paddingHorizontal: 18,
              }}
            >
              {carregandoMais ? (
                <ActivityIndicator
                  size="small"
                  color="#E91E63"
                />
              ) : (
                <Text
                  style={{
                    color: '#E91E63',
                    fontFamily:
                      'Poppins_600SemiBold',
                    fontSize: 11,
                  }}
                >
                  Carregar mais
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
