// FUNÇÕES AUXILIARES DE NAVEGAÇÃO

import { router } from 'expo-router';

// Volta para a tela anterior quando existir histórico de navegação.
// Se a tela tiver sido aberta diretamente, retorna para a Home.
export function voltarOuInicio(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/inicio');
}
