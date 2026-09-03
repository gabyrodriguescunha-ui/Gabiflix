// TIPOS UTILIZADOS PELOS DADOS DE SÉRIES DO TMDB

// Representa as informações resumidas de uma série retornada pela API
export interface Serie {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

// Representa a resposta paginada enviada pelo TMDB
export interface RespostaSeries {
  page: number;
  results: Serie[];
  total_pages: number;
  total_results: number;
}

// Representa um gênero associado à série
export interface Genero {
  id: number;
  name: string;
}

// Representa uma temporada retornada nos detalhes
export interface TemporadaResumo {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

// Representa os dados completos da série selecionada
export interface DetalhesSerie {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: Genero[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  seasons: TemporadaResumo[];
}

// Representa um episódio de uma temporada
export interface Episodio {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;

  // Duração do episódio em minutos quando o TMDB disponibilizar
  runtime: number | null;
}

// Representa os dados completos de uma temporada
export interface DetalhesTemporada {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  episodes: Episodio[];
}