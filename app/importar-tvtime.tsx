// PÁGINA DE IMPORTAÇÃO DO ARQUIVO EXPORTADO PELO TV TIME

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalConfirmacao } from '../components/modal-confirmacao/ModalConfirmacao';
import {
  importarTvTimeParaGabiflix,
  type ResumoImportacaoFinal,
} from '../services/importacao-gravacao.service';
import {
  buscarCandidatosRevisaoManual,
  identificarSeriesTvTimeNoTmdb,
  type ResumoIdentificacaoTvTime,
  type SerieIdentificadaTvTime,
} from '../services/importacao-identificacao.service';
import {
  lerExportacaoTvTime,
  type LeituraTvTime,
} from '../services/importacao-tvtime.service';
import { styles } from '../styles/importar-tvtime.styles';
import type { Serie } from '../types/serie';

// Tela responsável apenas por validar e revisar o arquivo.
// Nenhum dado é salvo no Gabiflix nesta primeira etapa.
export default function ImportarTvTime() {
  const router = useRouter();

  // Resultado calculado depois que o ZIP é lido
  const [leitura, setLeitura] =
    useState<LeituraTvTime | null>(null);

  // Nome original do arquivo escolhido pelo usuário
  const [nomeArquivo, setNomeArquivo] =
    useState('');

  // Controla o feedback visual enquanto o ZIP está sendo processado
  const [carregando, setCarregando] =
    useState(false);

  // Controla a etapa de correspondência TV Time -> TMDB
  const [identificando, setIdentificando] =
    useState(false);

  // Progresso numérico durante as consultas ao TMDB
  const [progressoIdentificacao, setProgressoIdentificacao] =
    useState({
      processadas: 0,
      total: 0,
    });

  // Guarda o resultado da revisão automática
  const [resultadoIdentificacao, setResultadoIdentificacao] =
    useState<SerieIdentificadaTvTime[]>([]);

  // Resumo da etapa de associação
  const [resumoIdentificacao, setResumoIdentificacao] =
    useState<ResumoIdentificacaoTvTime | null>(null);

  // Série pendente que está sendo revisada no momento
  const [serieEmRevisao, setSerieEmRevisao] =
    useState<SerieIdentificadaTvTime | null>(null);

  // Resultados retornados pela pesquisa manual no TMDB
  const [candidatosManuais, setCandidatosManuais] =
    useState<Serie[]>([]);

  const [buscandoCandidatos, setBuscandoCandidatos] =
    useState(false);

  // Guarda as decisões manuais sem alterar o resultado automático original
  const [resolvidasManualmente, setResolvidasManualmente] =
    useState<Record<string, Serie>>({});

  const [ignoradas, setIgnoradas] =
    useState<Record<string, boolean>>({});

  // Controla a gravação definitiva no Supabase
  const [importando, setImportando] =
    useState(false);

  const [progressoImportacao, setProgressoImportacao] =
    useState({
      atual: 0,
      total: 0,
      descricao: '',
    });

  const [resumoImportacaoFinal, setResumoImportacaoFinal] =
    useState<ResumoImportacaoFinal | null>(null);

  // Avisos seguem o padrão visual do Gabiflix
  const [aviso, setAviso] = useState<{
    titulo: string;
    descricao: string;
  } | null>(null);

  // Abre o seletor de arquivos do aparelho e processa o ZIP localmente
  async function selecionarArquivo() {
    try {
      const resultado =
        await DocumentPicker.getDocumentAsync({
          // Alguns aparelhos Android identificam ZIPs do TV Time
          // com MIME genérico. Por isso mostramos todos os arquivos
          // e validamos a extensão logo abaixo.
          type: '*/*',
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (resultado.canceled) {
        return;
      }

      const arquivo = resultado.assets[0];

      if (!arquivo?.uri) {
        throw new Error(
          'Arquivo selecionado sem endereço válido.'
        );
      }

      // O TV Time pode fornecer o arquivo de séries diretamente
      // em JSON ou dentro de um ZIP. Aceitamos os dois formatos.
      const nomeSelecionado =
        arquivo.name?.toLowerCase() ?? '';

      const formatoValido =
        nomeSelecionado.endsWith('.json') ||
        nomeSelecionado.endsWith('.zip');

      if (!formatoValido) {
        throw new Error(
          'Selecione o arquivo .json ou .zip exportado pelo TV Time.'
        );
      }

      setCarregando(true);
      setLeitura(null);
      setResultadoIdentificacao([]);
      setResumoIdentificacao(null);
      setResolvidasManualmente({});
      setIgnoradas({});
      setSerieEmRevisao(null);
      setCandidatosManuais([]);
      setImportando(false);
      setResumoImportacaoFinal(null);
      setProgressoImportacao({
        atual: 0,
        total: 0,
        descricao: '',
      });
      setProgressoIdentificacao({
        processadas: 0,
        total: 0,
      });
      setNomeArquivo(arquivo.name ?? 'Exportação TV Time');

      const resultadoLeitura =
        await lerExportacaoTvTime(
          arquivo.uri,
          arquivo.name
        );

      setLeitura(resultadoLeitura);
    } catch (erro) {
      console.log(
        'Erro ao ler exportação do TV Time:',
        erro
      );

      setAviso({
        titulo: 'Não foi possível ler o arquivo',
        descricao:
          erro instanceof Error
            ? erro.message
            : 'Escolha novamente o arquivo JSON ou ZIP exportado pelo TV Time.',
      });
    } finally {
      setCarregando(false);
    }
  }

  // Remove a leitura atual sem apagar nenhum arquivo do aparelho
  function limparArquivo() {
    setLeitura(null);
    setNomeArquivo('');
    setResultadoIdentificacao([]);
    setResumoIdentificacao(null);
    setResolvidasManualmente({});
    setIgnoradas({});
    setSerieEmRevisao(null);
    setCandidatosManuais([]);
    setImportando(false);
    setResumoImportacaoFinal(null);
    setProgressoImportacao({
      atual: 0,
      total: 0,
      descricao: '',
    });
    setProgressoIdentificacao({
      processadas: 0,
      total: 0,
    });
  }

  // Identifica todas as séries pelo TVDB ID antes de qualquer gravação.
  // Esta etapa pode levar alguns minutos porque consulta o TMDB em lotes.
  async function continuarImportacao() {
    if (!leitura || identificando) {
      return;
    }

    try {
      setIdentificando(true);
      setResultadoIdentificacao([]);
      setResumoIdentificacao(null);
      setProgressoIdentificacao({
        processadas: 0,
        total: leitura.series.length,
      });

      const resultado =
        await identificarSeriesTvTimeNoTmdb(
          leitura.series,
          (progresso) => {
            setProgressoIdentificacao(progresso);
          }
        );

      setResultadoIdentificacao(
        resultado.resultados
      );
      setResumoIdentificacao(
        resultado.resumo
      );
    } catch (erro) {
      console.log(
        'Erro ao identificar séries no TMDB:',
        erro
      );

      setAviso({
        titulo: 'Não foi possível identificar',
        descricao:
          'A associação com o TMDB foi interrompida. Tente novamente.',
      });
    } finally {
      setIdentificando(false);
    }
  }


  // Abre a revisão de uma série pendente e pesquisa candidatos no TMDB.
  async function abrirRevisaoManual(
    item: SerieIdentificadaTvTime
  ) {
    try {
      setSerieEmRevisao(item);
      setCandidatosManuais([]);
      setBuscandoCandidatos(true);

      const candidatos =
        await buscarCandidatosRevisaoManual(
          item.serieTvTime.title
        );

      setCandidatosManuais(candidatos);
    } catch (erro) {
      console.log(
        'Erro ao buscar candidatos manuais:',
        erro
      );

      setAviso({
        titulo: 'Não foi possível pesquisar',
        descricao:
          'Não foi possível buscar candidatos no TMDB agora. Tente novamente.',
      });
    } finally {
      setBuscandoCandidatos(false);
    }
  }

  // Confirma a série escolhida pelo usuário para esta pendência.
  function escolherCandidatoManual(
    candidato: Serie
  ) {
    if (!serieEmRevisao) {
      return;
    }

    const uuid = serieEmRevisao.serieTvTime.uuid;

    setResolvidasManualmente((atual) => ({
      ...atual,
      [uuid]: candidato,
    }));

    setIgnoradas((atual) => {
      const copia = { ...atual };
      delete copia[uuid];
      return copia;
    });

    setSerieEmRevisao(null);
    setCandidatosManuais([]);
  }

  // Permite continuar a futura importação sem uma série que não tenha
  // correspondência confiável no TMDB.
  function ignorarSerieEmRevisao() {
    if (!serieEmRevisao) {
      return;
    }

    const uuid = serieEmRevisao.serieTvTime.uuid;

    setIgnoradas((atual) => ({
      ...atual,
      [uuid]: true,
    }));

    setResolvidasManualmente((atual) => {
      const copia = { ...atual };
      delete copia[uuid];
      return copia;
    });

    setSerieEmRevisao(null);
    setCandidatosManuais([]);
  }


  // Grava os dados somente depois que todas as pendências
  // tiverem sido resolvidas ou ignoradas pelo usuário.
  async function executarImportacaoFinal() {
    if (
      importando ||
      !resumoIdentificacao
    ) {
      return;
    }

    if (totalAguardandoRevisao > 0) {
      setAviso({
        titulo: 'Revisão pendente',
        descricao:
          `Resolva ou ignore as ${totalAguardandoRevisao} séries restantes antes de importar.`,
      });
      return;
    }

    try {
      setImportando(true);
      setResumoImportacaoFinal(null);
      setProgressoImportacao({
        atual: 0,
        total: 0,
        descricao:
          'Preparando importação...',
      });

      const resultado =
        await importarTvTimeParaGabiflix(
          resultadoIdentificacao,
          resolvidasManualmente,
          ignoradas,
          (progresso) => {
            setProgressoImportacao({
              atual: progresso.atual,
              total: progresso.total,
              descricao:
                progresso.descricao,
            });
          }
        );

      setResumoImportacaoFinal(
        resultado
      );

      setAviso({
        titulo: 'Importação concluída',
        descricao:
          `${resultado.seriesNovas} séries novas e ${resultado.episodiosNovos} episódios foram importados para o Gabiflix.`,
      });
    } catch (erro) {
      console.log(
        'Erro ao importar TV Time:',
        erro
      );

      setAviso({
        titulo: 'Importação interrompida',
        descricao:
          erro instanceof Error
            ? erro.message
            : 'Não foi possível concluir a importação. Os dados já salvos não serão apagados.',
      });
    } finally {
      setImportando(false);
    }
  }

  const resumo = leitura?.resumo;

  // Mostra somente alguns casos pendentes na primeira revisão visual
  const todasSeriesPendentes =
    resultadoIdentificacao.filter(
      (item) =>
        item.status !== 'encontrada_tvdb' &&
        item.status !== 'encontrada_titulo'
    );

  const seriesPendentes =
    todasSeriesPendentes.filter(
      (item) =>
        !resolvidasManualmente[item.serieTvTime.uuid] &&
        !ignoradas[item.serieTvTime.uuid]
    );

  const totalResolvidasManualmente =
    Object.keys(resolvidasManualmente).length;

  const totalIgnoradas =
    Object.keys(ignoradas).length;

  const totalAguardandoRevisao =
    seriesPendentes.length;

  const percentualIdentificacao =
    progressoIdentificacao.total > 0
      ? Math.round(
          (progressoIdentificacao.processadas /
            progressoIdentificacao.total) *
            100
        )
      : 0;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      {/* Cabeçalho */}
      <View style={styles.cabecalho}>
        <TouchableOpacity
          style={styles.botaoCabecalho}
          activeOpacity={0.7}
          onPress={router.back}
          accessibilityLabel="Voltar"
          disabled={carregando || identificando}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#E91E63"
          />
        </TouchableOpacity>

        <Text style={styles.tituloCabecalho}>
          Importar do TV Time
        </Text>

        <View style={styles.botaoCabecalho} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        {/* Explica o que acontece antes que o usuário selecione o arquivo */}
        <View style={styles.introducao}>
          <View style={styles.iconeDestaque}>
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color="#E91E63"
            />
          </View>

          <Text style={styles.tituloIntroducao}>
            Traga seu histórico
          </Text>

          <Text style={styles.textoIntroducao}>
            Selecione o arquivo JSON ou ZIP exportado pelo TV Time. Nesta etapa o Gabiflix apenas lê e confere os dados — nada será importado automaticamente.
          </Text>
        </View>

        {/* Área utilizada para escolher ou trocar o arquivo */}
        <TouchableOpacity
          style={styles.areaArquivo}
          activeOpacity={0.8}
          onPress={selecionarArquivo}
          disabled={carregando || identificando}
        >
          {carregando ? (
            <ActivityIndicator
              size="large"
              color="#E91E63"
            />
          ) : (
            <>
              <Ionicons
                name={
                  leitura
                    ? 'checkmark-circle-outline'
                    : 'document-attach-outline'
                }
                size={31}
                color={
                  leitura
                    ? '#5DD39E'
                    : '#F48FB1'
                }
              />

              <Text style={styles.tituloArquivo}>
                {leitura
                  ? 'Arquivo lido com sucesso'
                  : 'Selecionar exportação'}
              </Text>

              <Text
                style={styles.nomeArquivo}
                numberOfLines={2}
              >
                {nomeArquivo ||
                  'tvtime-series-AAAA-MM-DD.json'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Só apresenta números depois que o formato do arquivo foi validado */}
        {resumo && (
          <>
            <Text style={styles.tituloSecao}>
              Prévia da importação
            </Text>

            <View style={styles.gradeResumo}>
              <View style={styles.cardResumo}>
                <Ionicons
                  name="tv-outline"
                  size={20}
                  color="#E91E63"
                />
                <Text style={styles.valorResumo}>
                  {resumo.totalSeries}
                </Text>
                <Text style={styles.rotuloResumo}>
                  Séries
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#E91E63"
                />
                <Text style={styles.valorResumo}>
                  {resumo.episodiosAssistidos}
                </Text>
                <Text style={styles.rotuloResumo}>
                  Episódios vistos
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#E91E63"
                />
                <Text style={styles.valorResumo}>
                  {resumo.seriesComProgresso}
                </Text>
                <Text style={styles.rotuloResumo}>
                  Com progresso
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#E91E63"
                />
                <Text style={styles.valorResumo}>
                  {resumo.totalFavoritas}
                </Text>
                <Text style={styles.rotuloResumo}>
                  Favoritas
                </Text>
              </View>
            </View>

            {/* Mostra os status exatamente como existem no arquivo do TV Time */}
            <Text style={styles.tituloSecao}>
              Status encontrados
            </Text>

            <View style={styles.cardStatus}>
              {Object.entries(
                resumo.statusEncontrados
              )
                .sort((a, b) =>
                  a[0].localeCompare(b[0])
                )
                .map(([status, quantidade]) => (
                  <View
                    key={status}
                    style={styles.linhaStatus}
                  >
                    <Text style={styles.nomeStatus}>
                      {status}
                    </Text>

                    <Text style={styles.quantidadeStatus}>
                      {quantidade}
                    </Text>
                  </View>
                ))}
            </View>

            <View style={styles.informacao}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#F48FB1"
              />

              <Text style={styles.textoInformacao}>
                O arquivo interno reconhecido foi {resumo.nomeArquivoJson}. A associação com o TMDB ainda será revisada antes da importação.
              </Text>
            </View>

            {/* Durante a identificação mostramos o progresso real */}
            {identificando && (
              <View style={styles.cardIdentificacao}>
                <ActivityIndicator
                  size="small"
                  color="#E91E63"
                />

                <Text style={styles.tituloIdentificacao}>
                  Identificando séries no TMDB...
                </Text>

                <Text style={styles.textoIdentificacao}>
                  {progressoIdentificacao.processadas} de{' '}
                  {progressoIdentificacao.total} séries
                </Text>

                <View style={styles.trilhoProgresso}>
                  <View
                    style={[
                      styles.barraProgresso,
                      {
                        width:
                          `${percentualIdentificacao}%` as `${number}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.percentualIdentificacao}>
                  {percentualIdentificacao}%
                </Text>
              </View>
            )}

            {/* Resultado da associação automática, ainda sem salvar no Supabase */}
            {resumoIdentificacao && (
              <>
                <Text style={styles.tituloSecao}>
                  Revisão TMDB
                </Text>

                <View style={styles.cardStatus}>
                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Encontradas pelo TVDB
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {resumoIdentificacao.encontradasTvdb}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Encontradas pelo título
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {resumoIdentificacao.encontradasTitulo}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Total identificadas
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {resumoIdentificacao.encontradasTotal}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Não encontradas
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {resumoIdentificacao.naoEncontradas}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Sem TVDB ID
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {resumoIdentificacao.semTvdb}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Falhas de consulta
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {resumoIdentificacao.comErro}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tituloSecao}>
                  Revisão manual
                </Text>

                <View style={styles.cardStatus}>
                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Resolvidas manualmente
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {totalResolvidasManualmente}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Aguardando revisão
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {totalAguardandoRevisao}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Ignoradas
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {totalIgnoradas}
                    </Text>
                  </View>
                </View>

                {seriesPendentes.length > 0 && (
                  <>
                    <Text style={styles.tituloSecao}>
                      Precisam de revisão
                    </Text>

                    <View style={styles.cardPendencias}>
                      {seriesPendentes.map((item) => (
                        <TouchableOpacity
                          key={item.serieTvTime.uuid}
                          style={styles.linhaPendencia}
                          activeOpacity={0.75}
                          onPress={() =>
                            abrirRevisaoManual(item)
                          }
                        >
                          <Ionicons
                            name="help-circle-outline"
                            size={17}
                            color="#F48FB1"
                          />

                          <View style={styles.textosPendencia}>
                            <Text
                              style={styles.nomePendencia}
                              numberOfLines={1}
                            >
                              {item.serieTvTime.title}
                            </Text>

                            <Text
                              style={styles.motivoPendencia}
                              numberOfLines={2}
                            >
                              {item.mensagem ??
                                'Correspondência pendente.'}
                            </Text>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#777777"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <View style={styles.informacao}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#5DD39E"
                  />

                  <Text style={styles.textoInformacao}>
                    Nenhuma série ou episódio foi salvo. O Gabiflix tentou primeiro o TVDB ID e, quando necessário, uma correspondência segura pelo título.
                  </Text>
                </View>
              </>
            )}

            {/* Só inicia a associação se ela ainda não tiver sido concluída */}
            {!resumoIdentificacao && (
              <TouchableOpacity
                style={[
                  styles.botaoContinuar,
                  identificando &&
                    styles.botaoContinuarDesabilitado,
                ]}
                activeOpacity={0.8}
                onPress={continuarImportacao}
                disabled={identificando}
              >
                <Text style={styles.textoBotaoContinuar}>
                  {identificando
                    ? 'Identificando...'
                    : 'Identificar no TMDB'}
                </Text>

                {!identificando && (
                  <Ionicons
                    name="arrow-forward-outline"
                    size={19}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            )}

            {/* A importação final só é liberada quando todas as pendências
                foram resolvidas manualmente ou ignoradas. */}
            {resumoIdentificacao &&
              totalAguardandoRevisao === 0 &&
              !resumoImportacaoFinal && (
                <>
                  {importando && (
                    <View style={styles.cardImportacaoFinal}>
                      <ActivityIndicator
                        size="small"
                        color="#E91E63"
                      />

                      <Text style={styles.tituloImportacaoFinal}>
                        Importando para o Gabiflix...
                      </Text>

                      <Text style={styles.textoImportacaoFinal}>
                        {progressoImportacao.descricao}
                      </Text>

                      {progressoImportacao.total > 0 && (
                        <Text style={styles.contadorImportacaoFinal}>
                          {progressoImportacao.atual} de{' '}
                          {progressoImportacao.total}
                        </Text>
                      )}
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.botaoImportarFinal,
                      importando &&
                        styles.botaoContinuarDesabilitado,
                    ]}
                    activeOpacity={0.8}
                    onPress={executarImportacaoFinal}
                    disabled={importando}
                  >
                    <Ionicons
                      name="cloud-download-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.textoBotaoImportarFinal}>
                      {importando
                        ? 'Importando...'
                        : 'Importar para o Gabiflix'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

            {/* Resumo exibido depois da gravação definitiva */}
            {resumoImportacaoFinal && (
              <>
                <Text style={styles.tituloSecao}>
                  Importação concluída
                </Text>

                <View style={styles.cardStatus}>
                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Séries novas
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {resumoImportacaoFinal.seriesNovas}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Séries já existentes
                    </Text>
                    <Text style={styles.quantidadeStatus}>
                      {resumoImportacaoFinal.seriesJaExistentes}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Episódios novos
                    </Text>
                    <Text style={styles.quantidadeSucesso}>
                      {resumoImportacaoFinal.episodiosNovos}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Episódios já existentes
                    </Text>
                    <Text style={styles.quantidadeStatus}>
                      {resumoImportacaoFinal.episodiosJaExistentes}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Episódios não correspondidos
                    </Text>
                    <Text style={styles.quantidadePendente}>
                      {resumoImportacaoFinal.episodiosNaoCorrespondidos}
                    </Text>
                  </View>

                  <View style={styles.linhaStatus}>
                    <Text style={styles.nomeStatus}>
                      Séries ignoradas
                    </Text>
                    <Text style={styles.quantidadeStatus}>
                      {resumoImportacaoFinal.seriesIgnoradas}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.botaoVerMinhaLista}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.replace('/minha-lista')
                  }
                >
                  <Text style={styles.textoBotaoVerMinhaLista}>
                    Ver Minha Lista
                  </Text>

                  <Ionicons
                    name="arrow-forward-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.botaoTrocar}
              activeOpacity={0.7}
              onPress={limparArquivo}
            >
              <Text style={styles.textoBotaoTrocar}>
                Remover arquivo
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Modal de revisão manual de uma série não identificada */}
      <Modal
        visible={Boolean(serieEmRevisao)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!buscandoCandidatos) {
            setSerieEmRevisao(null);
            setCandidatosManuais([]);
          }
        }}
      >
        <View style={styles.sobreposicaoRevisao}>
          <View style={styles.modalRevisao}>
            <View style={styles.cabecalhoRevisao}>
              <View style={styles.titulosRevisao}>
                <Text style={styles.tituloModalRevisao}>
                  Escolher correspondência
                </Text>

                <Text
                  style={styles.serieOriginalRevisao}
                  numberOfLines={2}
                >
                  {serieEmRevisao?.serieTvTime.title ?? ''}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.botaoFecharRevisao}
                onPress={() => {
                  setSerieEmRevisao(null);
                  setCandidatosManuais([]);
                }}
                disabled={buscandoCandidatos}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {buscandoCandidatos ? (
              <View style={styles.carregandoRevisao}>
                <ActivityIndicator
                  size="small"
                  color="#E91E63"
                />
                <Text style={styles.textoCarregandoRevisao}>
                  Pesquisando no TMDB...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.listaCandidatos}
                showsVerticalScrollIndicator={false}
              >
                {candidatosManuais.length > 0 ? (
                  candidatosManuais.map((candidato) => (
                    <TouchableOpacity
                      key={candidato.id}
                      style={styles.cardCandidato}
                      activeOpacity={0.75}
                      onPress={() =>
                        escolherCandidatoManual(candidato)
                      }
                    >
                      {candidato.poster_path ? (
                        <Image
                          source={{
                            uri: `https://image.tmdb.org/t/p/w185${candidato.poster_path}`,
                          }}
                          style={styles.posterCandidato}
                        />
                      ) : (
                        <View style={styles.posterVazio}>
                          <Ionicons
                            name="image-outline"
                            size={24}
                            color="#777777"
                          />
                        </View>
                      )}

                      <View style={styles.dadosCandidato}>
                        <Text
                          style={styles.nomeCandidato}
                          numberOfLines={2}
                        >
                          {candidato.name}
                        </Text>

                        <Text style={styles.anoCandidato}>
                          {candidato.first_air_date
                            ?.substring(0, 4) || 'Ano desconhecido'}
                        </Text>

                        <Text style={styles.usarCandidato}>
                          Usar esta série
                        </Text>
                      </View>

                      <Ionicons
                        name="checkmark-circle-outline"
                        size={22}
                        color="#E91E63"
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.semCandidatos}>
                    <Ionicons
                      name="search-outline"
                      size={26}
                      color="#777777"
                    />
                    <Text style={styles.textoSemCandidatos}>
                      Nenhum candidato foi encontrado no TMDB.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {!buscandoCandidatos && (
              <TouchableOpacity
                style={styles.botaoIgnorarRevisao}
                activeOpacity={0.8}
                onPress={ignorarSerieEmRevisao}
              >
                <Ionicons
                  name="remove-circle-outline"
                  size={18}
                  color="#F48FB1"
                />
                <Text style={styles.textoIgnorarRevisao}>
                  Ignorar esta série na importação
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

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