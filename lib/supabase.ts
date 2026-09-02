// BANCO DE DADOS

// Adiciona compatibilidade de URLs ao React Native
import 'react-native-url-polyfill/auto';
// Armazenamento utilizado para manter a sessão no celular
import AsyncStorage from '@react-native-async-storage/async-storage';
// Ferramenta oficial para criar a conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
// Componentes usados para controlar a atualização da sessão
import { AppState, Platform } from 'react-native';

// Lê as configurações que estão no arquivo .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// Interrompe a execução se alguma configuração estiver ausente
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'As configurações do Supabase não foram encontradas no arquivo .env.'
  );
}

// Cria e exporta o cliente utilizado em todo o Gabiflix
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      // Guarda a sessão do usuário no próprio celular
      storage: AsyncStorage,

      // Renova o token da sessão automaticamente
      autoRefreshToken: true,

      // Mantém o usuário conectado ao fechar o aplicativo
      persistSession: true,

      // Desativa detecção de sessão pela URL no aplicativo móvel
      detectSessionInUrl: false,
    },
  }
);

// Controla a renovação da sessão conforme o aplicativo fica ativo
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}