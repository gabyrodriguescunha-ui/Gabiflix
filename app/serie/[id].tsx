// PÁGINA DE DETALHES DE UMA SÉRIE

// Hooks utilizados para buscar e guardar os detalhes
import { useEffect, useState } from 'react';
// Componentes visuais utilizados na página
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Ícones dos botões e informações
import { Ionicons } from '@expo/vector-icons';
// Recursos da rota dinâmica e da navegação
import { useLocalSearchParams, useRouter } from 'expo-router';
// Protege o conteúdo das barras do celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Busca os detalhes, temporadas e monta as URLs das imagens
import {
  buscarDetalhesSerie,
  buscarDetalhesTemporada,
  buscarElencoPrincipal,
  obterUrlCapa,
  obterUrlEpisodio,
  obterUrlPerfil,
  type PessoaElenco,
} from '../../services/tmdb.service';
// Funções responsáveis por adicionar, consultar e remover séries da lista
import {
  adicionarSerieNaLista,
  atualizarStatusSerie,
  buscarSerieNaLista,
  removerSerieDaLista,
  type StatusUsuario,
} from '../../services/minha-lista.service';
// Funções responsáveis pelo progresso dos episódios
import {
  buscarEpisodiosAssistidos,
  buscarTodosEpisodiosAssistidosDaSerie,
  desmarcarEpisodioAssistido,
  desmarcarEpisodiosSeguintes,
  marcarEpisodiosAssistidos,
  seriePossuiEpisodiosAssistidos,
} from '../../services/episodios-assistidos.service';
// Tipos utilizados pela página
import type {
  DetalhesSerie,
  DetalhesTemporada,
  Episodio,
} from '../../types/serie';
// Modal personalizado utilizado nas confirmações
import { ModalConfirmacao } from '../../components/modal-confirmacao/ModalConfirmacao';
// Estilos exclusivos da página
import { styles } from '../../styles/detalhes-serie.styles';


// Converte a data do TMDB e informa se a estreia já aconteceu
function formatarDataEstreia(data: string | null): string {
  if (!data) {
    return 'Data de estreia ainda não divulgada';
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEstreia = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  const dataFormatada = dataEstreia.toLocaleDateString('pt-BR');

  return dataEstreia > hoje
    ? `Estreia prevista para ${dataFormatada}`
    : `Estreou em ${dataFormatada}`;
}

// Traduz o status retornado pelo TMDB para o texto apresentado no aplicativo
function obterStatusSerie(status: string) {
  switch (status) {
    case 'Ended':
      return {
        texto: 'Finalizada',
        icone: 'checkmark' as const,
        tipo: 'finalizada',
      };

    case 'Canceled':
      return {
        texto: 'Cancelada',
        icone: 'close' as const,
        tipo: 'cancelada',
      };

    case 'Returning Series':
      return {
        texto: 'Renovada',
        icone: 'refresh' as const,
        tipo: 'renovada',
      };

    case 'In Production':
      return {
        texto: 'Em produção',
        icone: 'videocam-outline' as const,
        tipo: 'renovada',
      };

    case 'Planned':
      return {
        texto: 'Planejada',
        icone: 'time-outline' as const,
        tipo: 'planejada',
      };

    case 'Pilot':
      return {
        texto: 'Piloto',
        icone: 'tv-outline' as const,
        tipo: 'planejada',
      };

    default:
      return {
        texto: status || 'Status não informado',
        icone: 'information-circle-outline' as const,
        tipo: 'padrao',
      };
  }
}

// Informa se a data do episódio já chegou
function episodioFoiLancado(data: string | null): boolean {
  if (!data) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEpisodio = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  return dataEpisodio <= hoje;
}

// Converte a data futura do episódio para o formato utilizado no Brasil
function formatarDataEpisodio(data: string | null): string {
  if (!data) {
    return 'Data ainda não divulgada';
  }

  const [ano, mes, dia] = data.split('-').map(Number);
  const dataEpisodio = new Date(ano, mes - 1, dia);

  return dataEpisodio.toLocaleDateString('pt-BR');
}

// Converte a duração recebida em minutos para um texto mais legível
function formatarDuracao(minutos: number | null): string | null {
  if (!minutos) {
    return null;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) {
    return `${minutosRestantes} min`;
  }

  if (minutosRestantes === 0) {
    return `${horas}h`;
  }

  return `${horas}h ${minutosRestantes}min`;
}

// Página aberta quando o usuário toca em um card
export default function DetalhesDaSerie() {
  // Recupera o ID presente no endereço /serie/[id]
  const { id } = useLocalSearchParams<{ id: string }>();
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


  const idSerie = Number(id);

  // Guarda os dados e os estados da requisição
  const [serie, setSerie] = useState<DetalhesSerie | null>(null);
  const [temporada, setTemporada] =
    useState<DetalhesTemporada | null>(null);

  // Elenco principal retornado pelo TMDB.
  const [elencoPrincipal, setElencoPrincipal] =
    useState<PessoaElenco[]>([]);

  const [numeroTemporada, setNumeroTemporada] = useState(1);

  const [carregando, setCarregando] = useState(true);
  const [carregandoTemporada, setCarregandoTemporada] =
    useState(false);

  const [mensagemErro, setMensagemErro] = useState('');
  // Permite refazer a consulta principal quando ocorrer uma falha
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);

  // Guarda separadamente uma falha ocorrida ao carregar os episódios
  const [mensagemErroTemporada, setMensagemErroTemporada] = useState('');

  // Permite tentar carregar novamente somente a temporada atual
  const [tentativaTemporada, setTentativaTemporada] = useState(0);

  const [serieSalva, setSerieSalva] = useState(false);

  // Guarda o status atual da série dentro da Minha lista
  const [statusUsuario, setStatusUsuario] =
    useState<StatusUsuario | null>(null);

  const [alterandoLista, setAlterandoLista] = useState(false);

  const [episodiosAssistidos, setEpisodiosAssistidos] =
    useState<Set<number>>(new Set());

  // Guarda o progresso de todas as temporadas mesmo quando estão fechadas.
  const [progressoTemporadas, setProgressoTemporadas] =
    useState<Record<number, number>>({});

  const [episodioSendoAlterado, setEpisodioSendoAlterado] =
    useState<number | null>(null);

  // Controla qual temporada está expandida e ações de temporada inteira
  const [temporadaExpandida, setTemporadaExpandida] = useState<number | null>(1);
  const [alterandoTemporadaInteira, setAlterandoTemporadaInteira] =
    useState(false);

  // Controla a abertura do modal para marcar episódios anteriores
  const [
    modalMarcarAnterioresVisivel,
    setModalMarcarAnterioresVisivel,
  ] = useState(false);

  // Guarda temporariamente o episódio selecionado pelo usuário
  const [
    episodioSelecionado,
    setEpisodioSelecionado,
  ] = useState<Episodio | null>(null);

  // Guarda os episódios anteriores que ainda não foram assistidos
  const [
    episodiosAnterioresPendentes,
    setEpisodiosAnterioresPendentes,
  ] = useState<Episodio[]>([]);

  // Controla a abertura do modal para desmarcar episódios seguintes
  const [
    modalDesmarcarSeguintesVisivel,
    setModalDesmarcarSeguintesVisivel,
  ] = useState(false);

  // Guarda os episódios seguintes que já estavam marcados como assistidos
  const [
    episodiosSeguintesAssistidos,
    setEpisodiosSeguintesAssistidos,
  ] = useState<Episodio[]>([]);

  // Busca os detalhes sempre que o ID da rota mudar
  useEffect(() => {
    let telaAtiva = true;

    async function carregarDetalhes() {
      if (
        !Number.isInteger(idSerie) ||
        idSerie <= 0
      ) {
        setMensagemErro('O código da série é inválido.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setMensagemErro('');

        const resultado = await buscarDetalhesSerie(idSerie);

        if (!telaAtiva) {
          return;
        }

        setSerie(resultado);

        // O elenco é complementar: uma falha aqui não impede a abertura da série.
        try {
          const elenco =
            await buscarElencoPrincipal(idSerie, 8);

          if (telaAtiva) {
            setElencoPrincipal(elenco);
          }
        } catch (erro) {
          console.log(
            'Erro ao carregar elenco principal:',
            erro
          );

          if (telaAtiva) {
            setElencoPrincipal([]);
          }
        }

        // Carrega a quantidade assistida de todas as temporadas para que
        // cada cabeçalho mostre seu progresso mesmo quando estiver recolhido.
        const temporadasRegulares =
          resultado.seasons.filter(
            (item) =>
              item.season_number > 0 &&
              item.episode_count > 0
          );

        const progressoCarregado =
          await Promise.all(
            temporadasRegulares.map(async (item) => {
              try {
                const assistidos =
                  await buscarEpisodiosAssistidos(
                    idSerie,
                    item.season_number
                  );

                return [
                  item.season_number,
                  assistidos.length,
                ] as const;
              } catch (erro) {
                console.log(
                  `Erro ao carregar progresso da temporada ${item.season_number}:`,
                  erro
                );

                return [
                  item.season_number,
                  0,
                ] as const;
              }
            })
          );

        if (!telaAtiva) {
          return;
        }

        setProgressoTemporadas(
          Object.fromEntries(progressoCarregado)
        );

        // Ignora especiais e evita selecionar uma temporada futura vazia
        // quando já existe uma temporada comum com episódios.
        const primeiraTemporada =
          resultado.seasons.find(
            (item) =>
              item.season_number > 0 &&
              item.episode_count > 0
          ) ??
          resultado.seasons.find(
            (item) => item.season_number > 0
          );

        if (primeiraTemporada) {
          setNumeroTemporada(
            primeiraTemporada.season_number
          );
          setTemporadaExpandida(
            primeiraTemporada.season_number
          );
        }
      } catch (erro) {
        console.log('Erro ao buscar detalhes:', erro);

        if (telaAtiva) {
          setMensagemErro(
            'Não foi possível carregar os detalhes da série.'
          );
        }
      } finally {
        if (telaAtiva) {
          setCarregando(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      telaAtiva = false;
    };
  }, [idSerie, tentativaCarregamento]);

  // Confere no Supabase se a série carregada já pertence à lista do usuário
  useEffect(() => {
    if (!serie) {
      return;
    }

    async function consultarMinhaLista() {
      try {
        const itemSalvo =
          await buscarSerieNaLista(serie!.id);

        setSerieSalva(Boolean(itemSalvo));
        setStatusUsuario(
          itemSalvo?.status_usuario ?? null
        );
      } catch (erro) {
        console.log(
          'Erro ao verificar Minha lista:',
          erro
        );
      }
    }

    consultarMinhaLista();
  }, [serie]);

  // Busca os episódios quando o usuário escolhe outra temporada
  useEffect(() => {
    if (!serie || !idSerie) {
      return;
    }

    let telaAtiva = true;

    async function carregarTemporada() {
      try {
        setCarregandoTemporada(true);
        setMensagemErroTemporada('');
        setTemporada(null);
        setEpisodiosAssistidos(new Set());

        // Busca os episódios no TMDB e o progresso no Supabase simultaneamente
        const [resultado, assistidos] = await Promise.all([
          buscarDetalhesTemporada(idSerie, numeroTemporada),
          buscarEpisodiosAssistidos(idSerie, numeroTemporada),
        ]);

        if (!telaAtiva) {
          return;
        }

        setTemporada(resultado);
        setEpisodiosAssistidos(new Set(assistidos));
        setProgressoTemporadas((estadoAtual) => ({
          ...estadoAtual,
          [numeroTemporada]: assistidos.length,
        }));
      } catch (erro) {
        console.log('Erro ao carregar temporada:', erro);

        if (telaAtiva) {
          setMensagemErroTemporada(
            'Não foi possível carregar os episódios desta temporada.'
          );
        }
      } finally {
        if (telaAtiva) {
          setCarregandoTemporada(false);
        }
      }
    }

    carregarTemporada();

    return () => {
      telaAtiva = false;
    };
  }, [serie, idSerie, numeroTemporada, tentativaTemporada]);

  // Alterna entre adicionar e remover a série da lista pessoal
  async function alternarMinhaLista() {
    if (!serie || alterandoLista) {
      return;
    }

    try {
      setAlterandoLista(true);

      if (serieSalva) {
        await removerSerieDaLista(serie.id);
        setSerieSalva(false);
        setStatusUsuario(null);
      } else {
        await adicionarSerieNaLista(serie);
        setSerieSalva(true);

        // Novas séries entram inicialmente como Quero assistir
        setStatusUsuario('quero_assistir');
      }
    } catch (erro) {
      console.log('Erro ao alterar Minha lista:', erro);

      mostrarAviso('Não foi possível concluir', 'Verifique sua conexão e tente novamente.');
    } finally {
      setAlterandoLista(false);
    }
  }

  // Mantém o status da Minha lista sincronizado após remover progresso.
  // Se uma série finalizada perder um episódio assistido, ela volta para
  // Assistindo. Se não restar nenhum progresso, volta para Quero assistir.
  async function sincronizarStatusAposDesmarcar() {
    if (!serieSalva) {
      return;
    }

    const aindaPossuiEpisodios =
      await seriePossuiEpisodiosAssistidos(
        idSerie
      );

    if (!aindaPossuiEpisodios) {
      if (
        statusUsuario === 'assistindo' ||
        statusUsuario === 'finalizada'
      ) {
        await atualizarStatusSerie(
          idSerie,
          'quero_assistir'
        );

        setStatusUsuario('quero_assistir');
      }

      return;
    }

    if (statusUsuario === 'finalizada') {
      await atualizarStatusSerie(
        idSerie,
        'assistindo'
      );

      setStatusUsuario('assistindo');
    }
  }

  // Ajusta o status quando o usuário volta a assistir uma série.
  // Reassistindo é preservado, pois representa um fluxo diferente.
  async function sincronizarStatusAposMarcar() {
    if (!serie) {
      return;
    }

    if (!serieSalva) {
      await adicionarSerieNaLista(serie);
      await atualizarStatusSerie(
        idSerie,
        'assistindo'
      );

      setSerieSalva(true);
      setStatusUsuario('assistindo');
      return;
    }

    if (
      statusUsuario === 'quero_assistir' ||
      statusUsuario === 'pausada' ||
      statusUsuario === 'abandonada'
    ) {
      await atualizarStatusSerie(
        idSerie,
        'assistindo'
      );

      setStatusUsuario('assistindo');
    }
  }

  // Verifica se todos os episódios JÁ LANÇADOS das temporadas comuns
  // de uma série encerrada/cancelada foram assistidos.
  // Temporadas especiais (0), temporadas vazias e episódios futuros
  // não impedem a conclusão automática.
  async function verificarFinalizacaoAutomatica() {
    if (
      !serie ||
      (serie.status !== 'Ended' &&
        serie.status !== 'Canceled')
    ) {
      return;
    }

    const temporadasComEpisodios =
      serie.seasons.filter(
        (item) =>
          item.season_number > 0 &&
          item.episode_count > 0
      );

    if (temporadasComEpisodios.length === 0) {
      return;
    }

    const [
      detalhesTemporadas,
      idsAssistidos,
    ] = await Promise.all([
      Promise.all(
        temporadasComEpisodios.map((item) =>
          buscarDetalhesTemporada(
            idSerie,
            item.season_number
          )
        )
      ),
      buscarTodosEpisodiosAssistidosDaSerie(
        idSerie
      ),
    ]);

    const idsAssistidosSet =
      new Set(idsAssistidos);

    const episodiosLancados =
      detalhesTemporadas.flatMap(
        (detalhes) =>
          detalhes.episodes.filter(
            (episodio) =>
              episodioFoiLancado(
                episodio.air_date
              )
          )
      );

    if (episodiosLancados.length === 0) {
      return;
    }

    const todosAssistidos =
      episodiosLancados.every(
        (episodio) =>
          idsAssistidosSet.has(episodio.id)
      );

    if (!todosAssistidos) {
      return;
    }

    await atualizarStatusSerie(
      idSerie,
      'finalizada'
    );

    setStatusUsuario('finalizada');
  }

  // Salva um ou vários episódios como assistidos
  async function salvarEpisodiosComoAssistidos(
    episodios: Episodio[]
  ) {
    if (episodios.length === 0) {
      return;
    }

    try {
      setEpisodioSendoAlterado(
        episodios[episodios.length - 1].id
      );

      await marcarEpisodiosAssistidos(
        idSerie,
        numeroTemporada,
        episodios
      );

      await sincronizarStatusAposMarcar();

      // A checagem de conclusão é complementar ao salvamento do episódio.
      // Se o TMDB falhar aqui, o progresso já salvo continua válido.
      try {
        await verificarFinalizacaoAutomatica();
      } catch (erro) {
        console.log(
          'Erro ao verificar finalização automática:',
          erro
        );
      }

      setEpisodiosAssistidos((estadoAtual) => {
        const novoEstado = new Set(estadoAtual);

        episodios.forEach((episodio) => {
          novoEstado.add(episodio.id);
        });

        setProgressoTemporadas((progressoAtual) => ({
          ...progressoAtual,
          [numeroTemporada]: novoEstado.size,
        }));

        return novoEstado;
      });
    } catch (erro) {
      console.log('Erro ao salvar episódio:', erro);

      mostrarAviso('Não foi possível salvar', 'Verifique sua conexão e tente novamente.');
    } finally {
      setEpisodioSendoAlterado(null);
    }
  }

  // Remove um único episódio e mantém status/progresso sincronizados.
  async function desmarcarUmEpisodio(
    episodio: Episodio
  ) {
    setEpisodioSendoAlterado(episodio.id);

    try {
      await desmarcarEpisodioAssistido(
        episodio.id
      );

      await sincronizarStatusAposDesmarcar();

      setEpisodiosAssistidos((estadoAtual) => {
        const novoEstado = new Set(
          estadoAtual
        );

        novoEstado.delete(episodio.id);

        setProgressoTemporadas((progressoAtual) => ({
          ...progressoAtual,
          [numeroTemporada]: novoEstado.size,
        }));

        return novoEstado;
      });
    } finally {
      setEpisodioSendoAlterado(null);
    }
  }

  // Fecha o modal utilizado para marcar episódios anteriores
  function fecharModalMarcarAnteriores() {
    setModalMarcarAnterioresVisivel(false);
    setEpisodioSelecionado(null);
    setEpisodiosAnterioresPendentes([]);
  }

  // Fecha o modal utilizado para desmarcar episódios seguintes
  function fecharModalDesmarcarSeguintes() {
    setModalDesmarcarSeguintesVisivel(false);
    setEpisodioSelecionado(null);
    setEpisodiosSeguintesAssistidos([]);
  }

  // Marca somente o episódio escolhido pelo usuário
  async function marcarSomenteEpisodioSelecionado() {
    if (!episodioSelecionado) {
      return;
    }

    const episodio = episodioSelecionado;

    fecharModalMarcarAnteriores();

    await salvarEpisodiosComoAssistidos([
      episodio,
    ]);
  }

  // Marca o episódio escolhido junto com os anteriores que ainda estavam pendentes
  async function marcarEpisodioEAnteriores() {
    if (!episodioSelecionado) {
      return;
    }

    const episodios = [
      ...episodiosAnterioresPendentes,
      episodioSelecionado,
    ];

    fecharModalMarcarAnteriores();

    await salvarEpisodiosComoAssistidos(
      episodios
    );
  }

  // Remove somente o episódio escolhido da lista de assistidos
  async function desmarcarSomenteEpisodioSelecionado() {
    if (!episodioSelecionado) {
      return;
    }

    const episodio = episodioSelecionado;

    fecharModalDesmarcarSeguintes();

    try {
      await desmarcarUmEpisodio(episodio);
    } catch (erro) {
      console.log(
        'Erro ao desmarcar episódio:',
        erro
      );

      mostrarAviso(
        'Não foi possível desmarcar',
        'Tente novamente.'
      );
    }
  }

  // Remove o episódio escolhido e todos os seguintes que já estavam assistidos
  async function desmarcarEpisodioESeguintes() {
    if (!episodioSelecionado) {
      return;
    }

    const episodioInicial =
      episodioSelecionado;

    const episodiosParaDesmarcar = [
      episodioInicial,
      ...episodiosSeguintesAssistidos,
    ];

    fecharModalDesmarcarSeguintes();

    try {
      setEpisodioSendoAlterado(
        episodioInicial.id
      );

      // Remove o episódio selecionado e todos os seguintes
      // com uma única operação no Supabase.
      await desmarcarEpisodiosSeguintes(
        idSerie,
        numeroTemporada,
        episodioInicial.episode_number
      );

      await sincronizarStatusAposDesmarcar();

      setEpisodiosAssistidos((estadoAtual) => {
        const novoEstado = new Set(
          estadoAtual
        );

        episodiosParaDesmarcar.forEach(
          (episodio) => {
            novoEstado.delete(
              episodio.id
            );
          }
        );

        setProgressoTemporadas((progressoAtual) => ({
          ...progressoAtual,
          [numeroTemporada]: novoEstado.size,
        }));

        return novoEstado;
      });
    } catch (erro) {
      console.log(
        'Erro ao desmarcar episódios:',
        erro
      );

      mostrarAviso('Não foi possível desmarcar', 'Tente novamente.');
    } finally {
      setEpisodioSendoAlterado(null);
    }
  }

  // Marca ou desmarca todos os episódios JÁ LANÇADOS de qualquer temporada.
  // Funciona mesmo quando a temporada está recolhida.
  async function alternarTemporadaInteira(
    temporadaNumero: number
  ) {
    if (alterandoTemporadaInteira) {
      return;
    }

    try {
      setAlterandoTemporadaInteira(true);

      const detalhes =
        temporadaNumero === numeroTemporada && temporada
          ? temporada
          : await buscarDetalhesTemporada(
              idSerie,
              temporadaNumero
            );

      const episodiosLancados =
        detalhes.episodes.filter(
          (episodio) =>
            episodioFoiLancado(
              episodio.air_date
            )
        );

      if (episodiosLancados.length === 0) {
        mostrarAviso(
          'Nenhum episódio disponível',
          'Esta temporada ainda não possui episódios lançados.'
        );
        return;
      }

      const idsAssistidos =
        temporadaNumero === numeroTemporada
          ? episodiosAssistidos
          : new Set(
              await buscarEpisodiosAssistidos(
                idSerie,
                temporadaNumero
              )
            );

      const todosAssistidos =
        episodiosLancados.every(
          (episodio) =>
            idsAssistidos.has(episodio.id)
        );

      if (todosAssistidos) {
        await Promise.all(
          episodiosLancados.map((episodio) =>
            desmarcarEpisodioAssistido(
              episodio.id
            )
          )
        );

        setProgressoTemporadas(
          (estadoAtual) => ({
            ...estadoAtual,
            [temporadaNumero]: 0,
          })
        );

        if (
          temporadaNumero ===
          numeroTemporada
        ) {
          setEpisodiosAssistidos(new Set());
        }

        await sincronizarStatusAposDesmarcar();
      } else {
        const pendentes =
          episodiosLancados.filter(
            (episodio) =>
              !idsAssistidos.has(
                episodio.id
              )
          );

        await marcarEpisodiosAssistidos(
          idSerie,
          temporadaNumero,
          pendentes
        );

        setProgressoTemporadas(
          (estadoAtual) => ({
            ...estadoAtual,
            [temporadaNumero]:
              episodiosLancados.length,
          })
        );

        if (
          temporadaNumero ===
          numeroTemporada
        ) {
          setEpisodiosAssistidos(
            new Set(
              episodiosLancados.map(
                (episodio) =>
                  episodio.id
              )
            )
          );
        }

        await sincronizarStatusAposMarcar();

        try {
          await verificarFinalizacaoAutomatica();
        } catch (erro) {
          console.log(
            'Erro ao verificar finalização automática:',
            erro
          );
        }
      }
    } catch (erro) {
      console.log(
        'Erro ao alterar temporada inteira:',
        erro
      );

      mostrarAviso(
        'Não foi possível alterar a temporada',
        'Verifique sua conexão e tente novamente.'
      );
    } finally {
      setAlterandoTemporadaInteira(false);
    }
  }

  // Marca, desmarca ou abre uma confirmação quando existirem episódios relacionados
  async function alternarEpisodio(episodio: Episodio) {
    if (
      episodioSendoAlterado !== null ||
      !episodioFoiLancado(episodio.air_date)
    ) {
      return;
    }

    // Quando o episódio já foi assistido, procura episódios seguintes também assistidos
    if (episodiosAssistidos.has(episodio.id)) {
      const seguintesAssistidos =
        (temporada?.episodes ?? []).filter(
          (item) =>
            item.episode_number >
              episodio.episode_number &&
            episodiosAssistidos.has(item.id)
        );

      // Se não houver episódios seguintes assistidos, remove somente o episódio selecionado
      if (
        seguintesAssistidos.length === 0
      ) {
        try {
          await desmarcarUmEpisodio(
            episodio
          );
        } catch (erro) {
          console.log(
            'Erro ao desmarcar episódio:',
            erro
          );

          mostrarAviso(
            'Não foi possível desmarcar',
            'Tente novamente.'
          );
        }

        return;
      }

      // Guarda os dados necessários e abre o modal personalizado
      setEpisodioSelecionado(episodio);

      setEpisodiosSeguintesAssistidos(
        seguintesAssistidos
      );

      setModalDesmarcarSeguintesVisivel(
        true
      );

      return;
    }

    // Seleciona episódios anteriores que ainda não foram assistidos
    const anterioresNaoAssistidos =
      (temporada?.episodes ?? []).filter(
        (item) =>
          item.episode_number <
            episodio.episode_number &&
          episodioFoiLancado(
            item.air_date
          ) &&
          !episodiosAssistidos.has(
            item.id
          )
      );

    // Quando não existem episódios anteriores pendentes, marca somente o selecionado
    if (
      anterioresNaoAssistidos.length ===
      0
    ) {
      await salvarEpisodiosComoAssistidos([
        episodio,
      ]);

      return;
    }

    // Guarda os dados necessários e abre o modal personalizado
    setEpisodioSelecionado(episodio);

    setEpisodiosAnterioresPendentes(
      anterioresNaoAssistidos
    );

    setModalMarcarAnterioresVisivel(true);
  }

  // Exibe um indicador enquanto os dados são carregados
  if (carregando) {
    return (
      <View style={styles.estadoCentralizado}>
        <ActivityIndicator
          size="large"
          color="#E91E63"
        />

        <Text style={styles.textoEstado}>
          Carregando detalhes...
        </Text>
      </View>
    );
  }

  // Exibe uma mensagem caso a API não retorne a série
  if (mensagemErro || !serie) {
    return (
      <SafeAreaView style={styles.estadoCentralizado}>
        <Ionicons
          name="alert-circle-outline"
          size={46}
          color="#F48FB1"
        />

        <Text style={styles.textoErro}>
          {mensagemErro || 'Não foi possível carregar a série.'}
        </Text>

        {/* Refaz a consulta dos detalhes sem sair da página */}
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
            setTentativaCarregamento((valorAtual) => valorAtual + 1)
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

        <TouchableOpacity
          style={styles.botaoVoltarErro}
          onPress={router.back}
        >
          <Text style={styles.textoBotaoVoltar}>
            Voltar
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Prepara informações utilizadas pela interface
  const urlCapa = obterUrlCapa(serie.poster_path);
  const ano = serie.first_air_date?.substring(0, 4) || '—';
  const textoDataEstreia =
    formatarDataEstreia(serie.first_air_date);

  const statusSerie = obterStatusSerie(serie.status);

  // Remove a temporada zero porque ela normalmente representa especiais
  const temporadasComuns = serie.seasons.filter(
    (item) => item.season_number > 0
  );

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

        <Text style={styles.tituloCabecalho}>
          Detalhes
        </Text>

        <View style={styles.espacoCabecalho} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        {/* Capa e informações principais */}
        <View style={styles.apresentacao}>
          {urlCapa ? (
            <Image
              source={{ uri: urlCapa }}
              style={styles.capa}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.capaAusente}>
              <Ionicons
                name="image-outline"
                size={34}
                color="#777777"
              />
            </View>
          )}

          <View style={styles.informacoesPrincipais}>
            <Text
              style={styles.nome}
              numberOfLines={3}
            >
              {serie.name}
            </Text>

            {/* Nota, ano e primeiro gênero */}
            <View style={styles.linhaInformacoes}>
              <Ionicons
                name="star"
                size={15}
                color="#E91E63"
              />

              <Text style={styles.nota}>
                {serie.vote_average > 0
                  ? serie.vote_average.toFixed(1)
                  : '—'}
              </Text>

              <Text style={styles.separador}>
                •
              </Text>

              <Text style={styles.informacao}>
                {ano}
              </Text>

              {serie.genres[0] && (
                <>
                  <Text style={styles.separador}>
                    •
                  </Text>

                  <Text
                    style={styles.informacao}
                    numberOfLines={1}
                  >
                    {serie.genres[0].name}
                  </Text>
                </>
              )}
            </View>

            <Text style={styles.informacaoMaior}>
              {serie.number_of_seasons}{' '}
              {serie.number_of_seasons === 1
                ? 'temporada'
                : 'temporadas'}{' '}
              • {serie.number_of_episodes} episódios
            </Text>

            <Text style={styles.informacaoMaior}>
              {textoDataEstreia}
            </Text>

            {/* Situação oficial da produção recebida do TMDB */}
            <View
              style={[
                styles.statusSerie,

                statusSerie.tipo === 'cancelada' &&
                  styles.statusCancelada,

                statusSerie.tipo === 'renovada' &&
                  styles.statusRenovada,

                statusSerie.tipo === 'planejada' &&
                  styles.statusPlanejada,
              ]}
            >
              <Ionicons
                name={statusSerie.icone}
                size={15}
                color={
                  statusSerie.tipo === 'cancelada'
                    ? '#F48FB1'
                    : '#E91E63'
                }
              />

              <Text
                style={[
                  styles.textoStatusSerie,

                  statusSerie.tipo === 'cancelada' &&
                    styles.textoStatusCancelada,
                ]}
              >
                {statusSerie.texto}
              </Text>
            </View>
          </View>
        </View>

        {/* Gêneros associados à série */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.generos}
        >
          {serie.genres.map((genero) => (
            <View
              key={genero.id}
              style={styles.genero}
            >
              <Text style={styles.textoGenero}>
                {genero.name}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Sinopse recebida em português */}
        <Text style={styles.tituloSecao}>
          Sinopse
        </Text>

        <Text style={styles.sinopse}>
          {serie.overview ||
            'Sinopse não disponível em português.'}
        </Text>

        {/* Elenco principal da série */}
        {elencoPrincipal.length > 0 && (
          <View style={styles.secaoElenco}>
            <View style={styles.cabecalhoElenco}>
              <Text style={styles.tituloSecao}>
                Elenco principal
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaElenco}
            >
              {elencoPrincipal.map((pessoa) => {
                const foto =
                  obterUrlPerfil(
                    pessoa.profile_path
                  );

                return (
                  <View
                    key={pessoa.id}
                    style={styles.pessoaElenco}
                  >
                    {foto ? (
                      <Image
                        source={{ uri: foto }}
                        style={styles.fotoElenco}
                      />
                    ) : (
                      <View
                        style={
                          styles.fotoElencoAusente
                        }
                      >
                        <Ionicons
                          name="person"
                          size={24}
                          color="#777777"
                        />
                      </View>
                    )}

                    <Text
                      style={styles.nomeElenco}
                      numberOfLines={2}
                    >
                      {pessoa.name}
                    </Text>

                    <Text
                      style={styles.personagemElenco}
                      numberOfLines={2}
                    >
                      {pessoa.character ||
                        'Personagem não informado'}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Botão que adiciona ou remove a produção da lista */}
        <TouchableOpacity
          style={[
            styles.botaoMinhaLista,
            serieSalva && styles.botaoMinhaListaAtivo,
          ]}
          activeOpacity={0.8}
          disabled={alterandoLista}
          onPress={alternarMinhaLista}
        >
          {alterandoLista ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name={
                serieSalva
                  ? 'checkmark'
                  : 'add'
              }
              size={20}
              color="#FFFFFF"
            />
          )}

          <Text style={styles.textoBotaoMinhaLista}>
            {alterandoLista
              ? 'Aguarde...'
              : serieSalva
                ? 'Na minha lista'
                : 'Adicionar à minha lista'}
          </Text>
        </TouchableOpacity>

        {/* Temporadas em formato de acordeão */}
        <View style={styles.tituloComEspaco}>
          <Text style={styles.tituloSecao}>Temporadas</Text>
        </View>

        <View style={styles.listaTemporadasAcordeao}>
          {temporadasComuns.map((item) => {
            const expandida = temporadaExpandida === item.season_number;
            const temporadaAtual =
              numeroTemporada === item.season_number;

            const quantidadeAssistidos =
              progressoTemporadas[
                item.season_number
              ] ?? 0;

            const temporadaCompleta =
              item.episode_count > 0 &&
              quantidadeAssistidos >=
                item.episode_count;

            return (
              <View
                key={item.id}
                style={[
                  styles.blocoTemporada,
                  expandida && styles.blocoTemporadaAtivo,
                ]}
              >
                <View style={styles.cabecalhoTemporadaAcordeao}>
                  <TouchableOpacity
                    style={styles.areaAbrirTemporada}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (expandida) {
                        setTemporadaExpandida(null);
                        return;
                      }
                      setNumeroTemporada(item.season_number);
                      setTemporadaExpandida(item.season_number);
                    }}
                  >
                    <View style={styles.textosCabecalhoTemporada}>
                      <Text style={styles.nomeTemporadaAcordeao}>
                        Temporada {item.season_number}
                      </Text>
                      <Text style={styles.resumoTemporada}>
                        {item.episode_count}{' '}
                        {item.episode_count === 1
                          ? 'episódio'
                          : 'episódios'}
                        {' · '}
                        {quantidadeAssistidos}/
                        {item.episode_count} assistidos
                      </Text>
                    </View>
                    <Ionicons
                      name={expandida ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#BDBDBD"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.botaoMarcarTemporada,
                      temporadaCompleta && styles.botaoMarcarTemporadaAtivo,
                    ]}
                    activeOpacity={0.75}
                    disabled={
                      alterandoTemporadaInteira
                    }
                    onPress={() =>
                      alternarTemporadaInteira(
                        item.season_number
                      )
                    }
                  >
                    {alterandoTemporadaInteira ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={temporadaCompleta ? 'checkmark' : 'ellipse-outline'}
                        size={25}
                        color={
                          temporadaCompleta
                            ? '#FFFFFF'
                            : '#E91E63'
                        }
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {expandida && temporadaAtual && (
                  <View style={styles.conteudoTemporadaExpandida}>
        {/* Indicador enquanto troca de temporada */}
        {carregandoTemporada ? (
          <View style={styles.carregandoTemporada}>
            <ActivityIndicator
              size="small"
              color="#E91E63"
            />

            <Text style={styles.textoEstado}>
              Carregando episódios...
            </Text>
          </View>
        ) : mensagemErroTemporada ? (
          <View style={styles.carregandoTemporada}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color="#F48FB1"
            />

            <Text
              style={[
                styles.textoEstado,
                {
                  textAlign: 'center',
                  paddingHorizontal: 20,
                },
              ]}
            >
              {mensagemErroTemporada}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setTentativaTemporada(
                  (valorAtual) => valorAtual + 1
                )
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
                  fontFamily: 'Poppins_600SemiBold',
                  fontSize: 10.5,
                }}
              >
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listaEpisodios}>
            {temporada?.episodes.map((episodio) => {
              const urlImagem =
                obterUrlEpisodio(
                  episodio.still_path
                );

              const disponivel =
                episodioFoiLancado(
                  episodio.air_date
                );

              const assistido =
                episodiosAssistidos.has(
                  episodio.id
                );

              const duracao =
                formatarDuracao(
                  episodio.runtime
                );

              return (
                <TouchableOpacity
                  key={episodio.id}
                  style={styles.cardEpisodio}
                  activeOpacity={
                    disponivel ? 0.75 : 1
                  }
                  disabled={!disponivel}
                  onPress={() =>
                    alternarEpisodio(episodio)
                  }
                >
                  {/* Imagem horizontal do episódio */}
                  <View style={styles.areaImagemEpisodio}>
                    {urlImagem ? (
                      <Image
                        source={{
                          uri: urlImagem,
                        }}
                        style={
                          styles.imagemEpisodio
                        }
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={
                          styles.imagemEpisodioAusente
                        }
                      >
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="#777777"
                        />
                      </View>
                    )}

                    {/* Indicador visual no centro da imagem */}
                    {disponivel && (
                      <View
                        style={
                          styles.iconeEpisodio
                        }
                      >
                        {assistido ? (
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color="#FFFFFF"
                          />
                        ) : (
                          <Ionicons
                            name="play"
                            size={15}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                    )}

                    {/* Pequena barra rosa indica episódios já assistidos */}
                    {assistido && (
                      <View
                        style={
                          styles.barraAssistido
                        }
                      />
                    )}
                  </View>

                  {/* Nome, duração ou data do episódio */}
                  <View
                    style={
                      styles.dadosEpisodio
                    }
                  >
                    <Text
                      style={
                        styles.nomeEpisodio
                      }
                      numberOfLines={2}
                    >
                      {episodio.episode_number}.{' '}
                      {episodio.name}
                    </Text>

                    {disponivel ? (
                      <Text
                        style={
                          styles.detalheEpisodio
                        }
                      >
                        {duracao ||
                          (assistido
                            ? 'Assistido'
                            : 'Disponível')}
                      </Text>
                    ) : (
                      <View
                        style={
                          styles.dataEpisodio
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#F48FB1"
                        />

                        <Text
                          style={
                            styles.textoDataEpisodio
                          }
                        >
                          {formatarDataEpisodio(
                            episodio.air_date
                          )}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Estado atual do episódio */}
                  {disponivel && (
                    <View
                      style={
                        styles.estadoEpisodio
                      }
                    >
                      {episodioSendoAlterado ===
                      episodio.id ? (
                        <ActivityIndicator
                          size="small"
                          color="#E91E63"
                        />
                      ) : (
                        <Ionicons
                          name={
                            assistido
                              ? 'checkmark-circle'
                              : 'ellipse-outline'
                          }
                          size={23}
                          color={
                            assistido
                              ? '#E91E63'
                              : '#777777'
                          }
                        />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Modal exibido quando existem episódios anteriores ainda não assistidos */}
      <ModalConfirmacao
        visivel={
          modalMarcarAnterioresVisivel
        }
        titulo="Marcar episódios anteriores?"
        descricao={
          episodioSelecionado
            ? `Deseja marcar apenas o episódio ${episodioSelecionado.episode_number} ou também os episódios anteriores ainda não assistidos?`
            : ''
        }
        onFechar={
          fecharModalMarcarAnteriores
        }
        acoes={[
          {
            texto: 'Este e os anteriores',
            tipo: 'principal',
            onPress:
              marcarEpisodioEAnteriores,
          },
          {
            texto: 'Só este',
            tipo: 'secundario',
            onPress:
              marcarSomenteEpisodioSelecionado,
          },
          {
            texto: 'Cancelar',
            tipo: 'cancelar',
            onPress:
              fecharModalMarcarAnteriores,
          },
        ]}
      />

      {/* Modal exibido quando existem episódios seguintes já assistidos */}
      <ModalConfirmacao
        visivel={
          modalDesmarcarSeguintesVisivel
        }
        titulo="Desmarcar episódios seguintes?"
        descricao={
          episodioSelecionado
            ? `Deseja desmarcar apenas o episódio ${episodioSelecionado.episode_number} ou também os episódios seguintes já assistidos?`
            : ''
        }
        onFechar={
          fecharModalDesmarcarSeguintes
        }
        acoes={[
          {
            texto: 'Este e os seguintes',
            tipo: 'principal',
            onPress:
              desmarcarEpisodioESeguintes,
          },
          {
            texto: 'Só este',
            tipo: 'secundario',
            onPress:
              desmarcarSomenteEpisodioSelecionado,
          },
          {
            texto: 'Cancelar',
            tipo: 'cancelar',
            onPress:
              fecharModalDesmarcarSeguintes,
          },
        ]}
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