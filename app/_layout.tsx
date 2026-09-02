// Define a estrutura geral e a navegação do aplicativo com Expo Router

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import {
  Stack,
  usePathname,
  useRouter,
} from 'expo-router';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles/_layout.styles';

type RotaPrincipal =
  | '/inicio'
  | '/busca'
  | '/minha-lista'
  | '/perfil';

const itensBarra: {
  rota: RotaPrincipal;
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  iconeAtivo: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    rota: '/inicio',
    titulo: 'Início',
    icone: 'home-outline',
    iconeAtivo: 'home',
  },
  {
    rota: '/busca',
    titulo: 'Explorar',
    icone: 'search-outline',
    iconeAtivo: 'search',
  },
  {
    rota: '/minha-lista',
    titulo: 'Minha Lista',
    icone: 'bookmark-outline',
    iconeAtivo: 'bookmark',
  },
  {
    rota: '/perfil',
    titulo: 'Perfil',
    icone: 'person-outline',
    iconeAtivo: 'person',
  },
];

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const [fontesCarregadas] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontesCarregadas) {
    return (
      <View style={styles.carregamento}>
        <ActivityIndicator
          size="large"
          color="#E91E63"
        />
      </View>
    );
  }

  const mostrarBarra = itensBarra.some(
    (item) => item.rota === pathname
  );

  function navegar(rota: RotaPrincipal) {
    if (pathname === rota) {
      return;
    }

    // Replace evita empilhar várias telas principais ao alternar pela barra.
    router.replace(rota);
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#121212"
      />

      <View style={styles.areaNavegacao}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#121212',
            },
          }}
        />
      </View>

      {mostrarBarra && (
        <View
          style={[
            styles.barraInferior,
            {
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          {itensBarra.map((item) => {
            const ativo = pathname === item.rota;

            return (
              <TouchableOpacity
                key={item.rota}
                style={styles.itemBarra}
                activeOpacity={0.7}
                onPress={() => navegar(item.rota)}
                accessibilityRole="button"
                accessibilityLabel={item.titulo}
                accessibilityState={{ selected: ativo }}
              >
                <Ionicons
                  name={
                    ativo
                      ? item.iconeAtivo
                      : item.icone
                  }
                  size={22}
                  color={
                    ativo
                      ? '#E91E63'
                      : '#8D8D8D'
                  }
                />

                <Text
                  style={[
                    styles.textoBarra,
                    ativo &&
                      styles.textoBarraAtivo,
                  ]}
                  numberOfLines={1}
                >
                  {item.titulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
