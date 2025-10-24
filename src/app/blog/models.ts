
export interface Tag {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  body: string;
  timestamp: string; // ISO string date
  author_username: string;
}

export interface Post {
  id?: number; // Optionnel car non présent lors de la création
  title: string;
  slug: string;
  content: string;
  content_preview?: string; // Pour la liste des articles
  pub_date?: string; // ISO string date
  author_username?: string;
  tags?: string[]; // Noms des tags
  comments?: Comment[];
  comment_count?: number; // Pour la liste des articles
  description?: string,
  postImg?: string,
  author?: string,
  published?: boolean,
  draft?: boolean,
  views_count?: number; // Kept to match our current API response

}

export interface ApiResponse<T> {
  message: number | string;
  data?: T;
  post_id?: number; // Pour la création d'article
  slug?: string; // Pour la création d'article
  user_id?: number; // Pour l'authentification
  token?: string; // Pour l'authentification
}

// Interface for the pagination data
export interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

// Interface for the complete API response
export interface BlogResponse {
  posts: Post[];
  pagination: Pagination;
}