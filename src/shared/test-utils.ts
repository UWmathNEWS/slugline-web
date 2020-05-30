import { APIResponseFailure, APIResponseSuccess, APIError } from "./types";

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

export const makeTestError = (code: number, error: any) => ({
  code,
  response: {
    data: {
      success: false,
      error,
    },
  },
});

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
    status_code: 500,
  },
};

export const MOCK_PARAMS = {
  p: "p",
  q: 15,
};
