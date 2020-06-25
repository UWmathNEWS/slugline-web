import {
  RouteComponentProps as _RouteComponentProps,
  RouteProps as _RouteProps,
  StaticRouterContext,
} from "react-router";
import React from "react";

declare global {
  interface Window {
    __SSR_DIRECTIVES__: any;
  }
}

export enum ArticleType {
  Wordpress = "wordpress",
  Slate = "slate",
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  sub_title: string;
  author: string;
  is_article_of_issue: boolean;
  is_promo: boolean;
  article_type: ArticleType;
  issue: number;
  user: number;
}

export interface ArticleContent {
  content_raw: string;
}

export interface Issue {
  id?: number;
  publish_date?: string;
  volume_num: number;
  issue_code: string;
  pdf?: string;
}

export interface User {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_staff: boolean;
  writer_name: string;
}

export type UserRole = "Editor" | "Copyeditor" | "Contributor";

export interface APIError {
  detail?: string[];
}

export interface APIResponseSuccess<T> {
  success: true;
  data: T;
}

export interface APIResponseFailure<T extends APIError> {
  success: false;
  error: T;
}

export type APIResponse<T, U extends APIError = APIError> = {
  statusCode: number;
} & (APIResponseSuccess<T> | APIResponseFailure<U>);

export interface Pagination<T> {
  count: number;
  page: number;
  num_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserAPIError extends APIError {
  user?: string[];
  username?: string[];
  email?: string[];
  cur_password?: string[];
  password?: string[];
  writer_name?: string[];
}

export interface IssueAPIError extends APIError {
  non_field_errors?: string[];
}

export interface StaticRouterContextWithData<T = any>
  extends StaticRouterContext {
  data?: T;
}

interface RouteBaseProps extends Omit<_RouteProps, "render" | "component"> {
  title: string;
  key?: string | number;
  routeComponent?: React.ComponentType;
  routeProps?: any;
  loadData?: (args: { params: any; headers: any }) => Promise<APIResponse<any>>;
}

export type RouteProps = RouteBaseProps &
  (
    | {
        render: (props: RouteComponentProps) => React.ReactNode;
      }
    | {
        component:
          | React.ComponentType<RouteComponentProps>
          | React.ComponentType<any>;
      }
  );

export type RouteComponentProps<P = any, T = any> = _RouteComponentProps<
  P,
  StaticRouterContextWithData<T>
> & {
  route: RouteProps;
};
