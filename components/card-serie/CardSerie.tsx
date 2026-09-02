// CARD UTILIZADO PARA EXIBIR UMA SÉRIE

// Importa os elementos visuais do React Native
import {
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Importa os ícones utilizados na avaliação e no espaço sem imagem
import { Ionicons } from '@expo/vector-icons';
// Permite abrir a página de detalhes
import { useRouter } from 'expo-router';
// Importa o tipo que representa uma série
import type { Serie } from '../../types/serie';
// Importa a função que monta o endereço completo da capa
import { obterUrlCapa } from '../../services/tmdb.service';
// Importa os estilos exclusivos do card
import { styles } from './CardSerie.styles';

// Dados que precisam ser enviados para o componente
interface CardSerieProps {
  serie: Serie;
}

// Card individual apresentado no carrossel
export function CardSerie({ serie }: CardSerieProps) {
  // Recurso utilizado para navegar entre as páginas
  const router = useRouter();
  // Converte o caminho recebido do TMDB em uma URL completa
  const urlCapa = obterUrlCapa(serie.poster_path);

  // Obtém somente o ano da primeira exibição
  const ano = serie.first_air_date
    ? serie.first_air_date.substring(0, 4)
    : '—';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() =>
        router.push({
          pathname: '/serie/[id]',
          params: {
            id: String(serie.id),
          },
        })
      }
    >
      {/* Agrupa a capa e a avaliação para permitir a sobreposição da nota */}
      <View style={styles.areaCapa}>
        {/* Exibe a capa ou um espaço reservado quando ela não existir */}
        {urlCapa ? (
          <Image
            source={{
              uri: urlCapa,
            }}
            style={styles.capa}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.semCapa}>
            <Ionicons
              name="image-outline"
              size={28}
              color="#777777"
            />
          </View>
        )}

        {/* Apresenta a avaliação do TMDB sobre a parte inferior da imagem */}
        <View style={styles.seloNota}>
          <Ionicons
            name="star"
            size={10}
            color="#E91E63"
          />

          <Text style={styles.nota}>
            {serie.vote_average > 0
              ? serie.vote_average.toFixed(1)
              : '—'}
          </Text>
        </View>
      </View>

      {/* Nome da série limitado a duas linhas */}
      <Text
        style={styles.nome}
        numberOfLines={2}
      >
        {serie.name}
      </Text>

      {/* Ano e tipo de conteúdo apresentados abaixo do nome */}
      <View style={styles.informacoes}>
        <Text style={styles.ano}>
          {ano}
        </Text>

        <View style={styles.ponto} />

        <Text style={styles.tipo}>
          Série
        </Text>
      </View>
    </TouchableOpacity>
  );
}