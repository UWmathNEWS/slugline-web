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

export interface APIError {
  detail?: string[];
  [key: string]: string[] | undefined;
}

export interface APIResponse<T, U extends APIError> {
  success: boolean;
  data?: T;
  error?: U | string;
}

export interface UserAPIError extends APIError {
  user?: string[];
  username?: string[];
  email?: string[];
  password?: string[];
  writer_name?: string[];
}

export interface UserAPIResponse extends APIResponse<User, UserAPIError> {
  user?: User;
}

export interface AuthContext {
  user: User | null;
  csrfToken: string | null;
  check: (force?: boolean) => Promise<void> | undefined;
  isAuthenticated: () => boolean;
  isEditor: () => boolean;
  post: <T>(endpoint: string, data: T, setCurUser?: boolean) => Promise<User | undefined>;
  put: <T>(endpoint: string, data: T, setCurUser?: boolean) => Promise<User | undefined>;
  patch: <T>(endpoint: string, data: T, setCurUser?: boolean) => Promise<User | undefined>;
  delete: (endpoint: string) => Promise<User | undefined>;
  login: (username: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
}

export interface AuthResponse {
  user?: User;
  is_authenticated: boolean;
}
