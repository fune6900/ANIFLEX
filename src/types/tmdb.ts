// TMDb API の型定義

export interface TMDbAnime {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
}

export interface TMDbSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDbPerson {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface TMDbPersonDetail extends TMDbPerson {
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
}

export interface TMDbTVDetail extends TMDbAnime {
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
}
