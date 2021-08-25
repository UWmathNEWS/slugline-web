/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Terry Chen
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

import React from "react";
import { RequestState } from "../../api/hooks";
import { useSSRData } from "../hooks";
import type { RequestInfo } from "../../api/hooks";
import ErrorPage from "../errors/ErrorPage";
import { APIResponse } from "../types";

// Default error component to reduce boilerplate
const WithSSRError: React.FC<{
  reqInfo: RequestInfo;
}> = ({ reqInfo }) => {
  return <ErrorPage statusCode={reqInfo.statusCode || 500} />;
};

type SSRDataParams<TData, TResp, TError> = [
  () => Promise<APIResponse<TResp, TError>>,
  TData | undefined,
  ((resp: TResp) => TData)?
];

/**
 * Wraps the components used in a standard SSR data request flow.
 *
 * @remarks
 *
 * This HOC separates the logic for each state of a request from the request itself, and consequently reduces
 * boilerplate logic that would otherwise be present.
 *
 * @param ssrParams - Array of parameters to pass to useSSRData.
 * @param PageComponent - Component to render when data is complete. Takes parameters:
 *   - data: The data returned by the request.
 *   - isLoading: If LoadingComponent is not defined, whether the request is loading.
 * @param ErrorComponent - Optional component to render on error. Takes parameters:
 *   - error: The error returned by the endpoint
 *   - reqInfo: Details about the request
 * @param LoadingComponent - Optional component to render during the loading state. Takes parameters:
 *   - data: The data returned by the previous request, or undefined if this is the first request made by this
 *           component. Useful to preserve pagination.
 *
 * @returns A component that takes the following parameters:
 */
// FIXME: Sometimes we'll get the "state updated on unmounted component" error and it traces back here. It seems to be
//  a race condition with request timings as it's inconsistent.
const withSSRData: {
  <TData, TResp, TError, PageProps>(
    ssrParams: SSRDataParams<TData, TResp, TError>,
    PageComponent: React.ComponentType<
      { data: TData; isLoading: boolean } & PageProps
    >,
    ErrorComponent?: React.ComponentType<{
      error: TError;
      reqInfo: RequestInfo;
    }>
  ): React.ComponentType<Omit<PageProps, "data" | "isLoading">>;
  <TData, TResp, TError, PageProps, LoadingProps>(
    ssrParams: SSRDataParams<TData, TResp, TError>,
    PageComponent: React.ComponentType<{ data: TData } & PageProps>,
    ErrorComponent:
      | React.ComponentType<{
          error: TError;
          reqInfo: RequestInfo;
        }>
      | undefined, // set as undefined if we want to use the default error component
    LoadingComponent: React.ComponentType<
      { data: TData | undefined } & LoadingProps
    >
  ): React.ComponentType<Omit<PageProps, "data"> & Omit<LoadingProps, "data">>;
} = (
  ssrParams: SSRDataParams<any, any, any>,
  PageComponent: any,
  ErrorComponent: any = WithSSRError,
  LoadingComponent?: any
) =>
  // return a named function for debugging purposes
  function WithSSRDataComponent(props: any) {
    const [data, reqInfo, error] = useSSRData(
      ssrParams[0],
      ssrParams[1],
      // non-null assertion is a bad hack to allow this to be an optional parameter
      // technically ssrParams[2] may be undefined, but then that is treated as if no third parameter was
      // passed in, which is what we want
      ssrParams[2]!
    );
    if (error) {
      // fail
      return <ErrorComponent error={error} reqInfo={reqInfo} />;
    } else {
      if (LoadingComponent && data && reqInfo.state !== RequestState.Running) {
        return <PageComponent data={data} {...props} />;
      } else if (LoadingComponent) {
        return <LoadingComponent data={data} {...props} />;
      } else {
        return (
          <PageComponent
            data={data}
            isLoading={!data || reqInfo.state === RequestState.Running}
            {...props}
          />
        );
      }
    }
  };

export { withSSRData };
