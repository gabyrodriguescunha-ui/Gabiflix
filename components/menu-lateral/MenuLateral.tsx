// MENU LATERAL DA PÁGINA PRINCIPAL

// Importa os hooks utilizados na animação do menu
import { useEffect, useRef, useState } from 'react';
// Importa somente o tipo utilizado pelos nomes dos ícones
import type { ComponentProps } from 'react';
// Importa os ícones do projeto Expo
import { Ionicons } from '@expo/vector-icons';
// Importa os componentes visuais e a ferramenta de animação
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Evita que o menu fique atrás das barras do celular
import { SafeAreaView } from 'react-native-safe-area-context';
// Permite navegar para as páginas selecionadas no menu
import { useRouter } from 'expo-router';
// Importa os estilos exclusivos do menu
// Cliente utilizado para recuperar nome e avatar atuais da conta
import { supabase } from '../../lib/supabase';
import { styles } from './MenuLateral.styles';


// Tipo aceito pelos ícones do Ionicons
type NomeIcone = ComponentProps<typeof Ionicons>['name'];

type RotaMenu =
  | '/inicio'
  | '/minha-lista'
  | '/continuar-assistindo'
  | '/busca'
  | '/perfil'
  | '/calendario'
  | '/configuracoes';

// Propriedades recebidas pelo menu lateral
interface MenuLateralProps {
  visivel: boolean;
  nomeUsuario: string;
  onFechar: () => void;
  onSair: () => void;
}

// Opções exibidas no menu
const opcoes: {
  titulo: string;
  icone: NomeIcone;
  ativo?: boolean;
  rota?: RotaMenu;
}[] = [
  { titulo: 'Início', icone: 'home-outline', ativo: true, rota: '/inicio' },
  {
    titulo: 'Minha lista',
    icone: 'add-circle-outline',
    rota: '/minha-lista',
  },
  {
    titulo: 'Continuar assistindo',
    icone: 'play-circle-outline',
    rota: '/continuar-assistindo',
  },
  {
    titulo: 'Explorar',
    icone: 'compass-outline',
    rota: '/busca',
  },
  { titulo: 'Calendário', icone: 'calendar-outline', rota: '/calendario' },
  { titulo: 'Configurações', icone: 'settings-outline', rota: '/configuracoes' },
];

// Menu que aparece sobre a página principal
export function MenuLateral({
  visivel,
  nomeUsuario,
  onFechar,
  onSair,
}: MenuLateralProps) {
  // Controla a navegação realizada pelas opções do menu
  const router = useRouter();

  // Mantém os dados exibidos no menu sincronizados com a conta atual
  const [nomeMenu, setNomeMenu] = useState(nomeUsuario);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Guarda o deslocamento horizontal utilizado na animação
  const deslocamento = useRef(
    new Animated.Value(-Dimensions.get('window').width)
  ).current;

  // Busca novamente nome e avatar sempre que o menu for aberto
  useEffect(() => {
    if (!visivel) {
      return;
    }

    let menuAtivo = true;

    async function carregarDadosUsuario() {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user || !menuAtivo) {
          return;
        }

        const usuario = data.user;
        const nomeMetadata = usuario.user_metadata?.nome;
        const nomeEmail =
          usuario.email?.split('@')[0] ?? nomeUsuario;

        const nomeAtual =
          typeof nomeMetadata === 'string' && nomeMetadata.trim()
            ? nomeMetadata.trim()
            : nomeEmail;

        const avatarMetadata =
          usuario.user_metadata?.avatar_url;

        setNomeMenu(nomeAtual);
        setAvatarUrl(
          typeof avatarMetadata === 'string' && avatarMetadata.trim()
            ? avatarMetadata
            : null
        );
      } catch (erro) {
        console.log(
          'Erro ao carregar dados do menu lateral:',
          erro
        );

        // Mantém ao menos o nome recebido da Home se a consulta falhar
        if (menuAtivo) {
          setNomeMenu(nomeUsuario);
        }
      }
    }

    carregarDadosUsuario();

    return () => {
      menuAtivo = false;
    };
  }, [visivel, nomeUsuario]);

  // Faz o painel deslizar da esquerda quando for aberto
  useEffect(() => {
    if (visivel) {
      Animated.timing(deslocamento, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    } else {
      deslocamento.setValue(-Dimensions.get('window').width);
    }
  }, [deslocamento, visivel]);

  // Fecha o menu e abre a rota quando a opção já possui uma página
  function selecionarOpcao(rota?: RotaMenu) {
    onFechar();

    if (rota) {
      router.push(rota);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onFechar}
    >
      <View style={styles.sobreposicao}>
        {/* Tocar na área escura também fecha o menu */}
        <Pressable style={styles.areaExterna} onPress={onFechar} />

        <Animated.View
          style={[
            styles.painel,
            { transform: [{ translateX: deslocamento }] },
          ]}
        >
          <SafeAreaView style={styles.areaSegura}>
            {/* Botão para fechar o menu */}
            <TouchableOpacity
              style={styles.botaoFechar}
              activeOpacity={0.7}
              onPress={onFechar}
              accessibilityLabel="Fechar menu"
            >
              <Ionicons name="close-outline" size={32} color="#E91E63" />
            </TouchableOpacity>

            {/* Resumo do usuário conectado e atalho para a página de perfil */}
            <TouchableOpacity
              style={styles.perfil}
              activeOpacity={0.8}
              onPress={() => selecionarOpcao('/perfil')}
              accessibilityLabel="Abrir perfil"
            >
              <View style={styles.avatar}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImagem}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={36}
                    color="#BDBDBD"
                  />
                )}
              </View>

              <View style={styles.dadosPerfil}>
                <Text style={styles.nomeUsuario}>Olá, {nomeMenu}!</Text>
                <Text style={styles.linkPerfil}>Ver perfil</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#E91E63"
              />
            </TouchableOpacity>

            {/* Lista principal de opções */}
            <View style={styles.listaOpcoes}>
              {opcoes.map((opcao) => (
                <TouchableOpacity
                  key={opcao.titulo}
                  style={[styles.opcao, opcao.ativo && styles.opcaoAtiva]}
                  activeOpacity={0.7}
                  onPress={() => selecionarOpcao(opcao.rota)}
                >
                  <Ionicons
                    name={opcao.icone}
                    size={25}
                    color={opcao.ativo ? '#E91E63' : '#FFFFFF'}
                  />

                  <Text
                    style={[
                      styles.textoOpcao,
                      opcao.ativo && styles.textoOpcaoAtiva,
                    ]}
                  >
                    {opcao.titulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botão de encerramento da sessão */}
            <TouchableOpacity
              style={styles.botaoSair}
              activeOpacity={0.7}
              onPress={onSair}
            >
              <Ionicons name="log-out-outline" size={25} color="#FFFFFF" />
              <Text style={styles.textoSair}>Sair</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}