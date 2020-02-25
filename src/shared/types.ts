export interface Article {
  id: number;
  title: string;
  slug: string;
  sub_title: string;
  author: string;
  content_html: string;
  is_article_of_issue: boolean;
  is_promo: boolean;
  issue: number;
  user: number;
}

export interface Issue {
  id: number;
  publish_date: string;
  volume_num: number;
  issue_num: number;
  pdf: string;
}

export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_editor: boolean;
  writer_name: string;
}

export interface UserAPIError {
  detail?: string[];
  username?: string[];
  email?: string[];
  password?: string[];
}

export interface UserAPIResponse {
  success: boolean;
  user?: User;
  error?: UserAPIError | string;
}

export interface AuthContext {
  user?: User;
  csrfToken?: string;
  check: (force?: boolean) => Promise<void> | undefined;
  isAuthenticated: () => boolean;
  isEditor: () => boolean;
  post: <T>(endpoint: string, post_data: T) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface AuthResponse {
  user?: User;
  is_authenticated: boolean;
}
