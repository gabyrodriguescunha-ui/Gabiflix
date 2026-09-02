// CABEÇALHO DA PÁGINA PRINCIPAL

// Importa os ícones utilizados nos botões
import { Ionicons } from '@expo/vector-icons';
// Importa os componentes visuais e de interação
import { Text, TouchableOpacity, View } from 'react-native';
// Cria o degradê aplicado ao nome Gabiflix
import { LinearGradient } from 'expo-linear-gradient';
// Limita o degradê ao formato das letras
import MaskedView from '@react-native-masked-view/masked-view';
// Permite navegar para a página de busca
import { useRouter } from 'expo-router';
// Importa os estilos exclusivos do cabeçalho
import { styles } from './Cabecalho.styles';

// Informações que o cabeçalho recebe da página principal
interface CabecalhoProps {
  onAbrirMenu: () => void;
}

// Cabeçalho exibido na parte superior da página principal
export function Cabecalho({ onAbrirMenu }: CabecalhoProps) {
  // Permite abrir outras páginas a partir dos botões do cabeçalho
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão que abre o menu lateral */}
      <TouchableOpacity
        style={styles.botaoIcone}
        activeOpacity={0.7}
        onPress={onAbrirMenu}
        accessibilityLabel="Abrir menu"
      >
        <Ionicons name="menu" size={26} color="#E91E63" />
      </TouchableOpacity>

      {/* Nome do aplicativo centralizado e com degradê */}
      <MaskedView
        style={styles.areaLogo}
        maskElement={<Text style={styles.logo}>Gabiflix</Text>}
      >
        <LinearGradient
          colors={['#F48FB1', '#E91E63', '#C44C81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.logo, styles.logoInvisivel]}>
            Gabiflix
          </Text>
        </LinearGradient>
      </MaskedView>

      {/* Área do botão de pesquisa */}
      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.botaoIcone}
          activeOpacity={0.7}
          onPress={() => router.push('/busca')}
          accessibilityLabel="Pesquisar"
        >
          <Ionicons name="search-outline" size={23} color="#E91E63" />
        </TouchableOpacity>

      </View>
    </View>
  );
}