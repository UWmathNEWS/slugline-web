import {
  APIResponseFailure,
  APIResponseSuccess,
  APIError,
  APIResponse,
} from "./types";
import { History } from "history";
import { useAuth } from "../auth/Auth";
import React from "react";

export const testUser = {
  username: "test",
  first_name: "test",
  last_name: "tester",
  email: "test@example.com",
  is_staff: false,
  is_editor: false,
  writer_name: "testy mctestface",
};

export const testAdmin = {
  username: "tset",
  first_name: "tset",
  last_name: "retsest",
  email: "admin@example.com",
  is_staff: true,
  is_editor: true,
  writer_name: "ytsest ecaftsetcm",
};

export const MOCK_BODY = {
  data: "bingo bango bongo",
};

export const MOCK_CSRF = "bingobangobongo";

export const MOCK_RESPONSE: APIResponseSuccess<string> = {
  success: true,
  data: "bingo bango bongo",
};

export const MOCK_ERROR: APIResponseFailure<APIError> = {
  success: false,
  error: {
    detail: ["__TESTING"],
  },
};

export const withStatus = <TResp, TError extends APIError = APIError>(
  statusCode: number,
  resp: APIResponseSuccess<TResp> | APIResponseFailure<TError>
): APIResponse<TResp, TError> => {
  return {
    statusCode: statusCode,
    ...resp,
  };
};

export const MOCK_PARAMS = {
  p: "p",
  q: 15,
};

export const ForceCheck = ({ history }: { history: History }) => {
  const auth = useAuth();

  React.useEffect(() => {
    const unlisten = history.listen(() => {
      auth.check(true).catch(() => {});
    });

    return () => {
      unlisten();
    };
  }, [history, auth]);

  return <></>;
};

