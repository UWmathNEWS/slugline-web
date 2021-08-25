/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Kevin Trieu, Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import type {
  RouteComponentProps as _RouteComponentProps,
  RouteProps as _RouteProps,
  StaticRouterContext,
} from "react-router";
import type React from "react";

declare global {
  interface Window {
    __SSR_DIRECTIVES__: any;
  }
}

export type ForwardAttributes = {
  className?: string;
  style?: any;
};

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

export type Colour =
  | "blastoff-blue"
  | "celestial-blue"
  | "cosmic-orange"
  | "fireball-fuchsia"
  | "galaxy-gold"
  | "gamma-green"
  | "gravity-grape"
  | "liftoff-lemon"
  | "lunar-blue"
  | "martian-green"
  | "orbit-orange"
  | "outrageous-orchid"
  | "planetary-purple"
  | "pulsar-pink"
  | "reentry-red"
  | "rocket-red"
  | "sunburst-yellow"
  | "terra-green"
  | "terrestrial-teal"
  | "venus-violet"
  | "pastel-blue"
  | "pastel-buff"
  | "pastel-canary"
  | "pastel-goldenrod"
  | "pastel-grey"
  | "pastel-green"
  | "pastel-orchid"
  | "pastel-pink"
  | "pastel-salmon"
  | "paper";

export interface Issue {
  id?: number;
  publish_date?: string;
  volume_num: number;
  issue_code: string;
  pdf?: string;
  // TODO: make these required once we implement a form component for creating issues
  title?: string;
  description?: string;
  colour?: Colour;
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

interface RouteBaseProps<T = any>
  extends Omit<_RouteProps, "render" | "component"> {
  title: string;
  key?: string | number;
  routeComponent?: React.ComponentType;
  routeProps?: any;
  loadData?: (args: {
    url?: string;
    params?: Record<string, string>;
    query?: Record<string, any>;
    headers?: any;
  }) => Promise<APIResponse<T>>;
}

export type RouteProps<T = any> = RouteBaseProps<T> &
  (
    | {
        render: (props: RouteComponentProps<T>) => React.ReactNode;
      }
    | {
        component:
          | React.ComponentType<RouteComponentProps<T>>
          | React.ComponentType<any>;
      }
  );

export type RouteComponentProps<P = any, T = any> = _RouteComponentProps<
  P,
  StaticRouterContextWithData<T>
> & {
  route: RouteProps<T>;
};

export interface Theme {
  primaryBg: string;
  primaryText: string;
  primaryLink: string;
  secondaryBg: string;
  secondaryText: string;
  secondaryLink: string;
}
