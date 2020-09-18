import { FormContextValues } from "react-hook-form";
import { APIError } from "../types";

export const cleanFormData = <T extends {}>(data: T): Partial<T> => {
  let ret: Partial<T> = {};
  for (const key in data) {
    if (data.hasOwnProperty(key) && ((data[key] as unknown) as string) !== "") {
      ret[key] = data[key];
    }
  }
  return ret;
};

export const setServerErrors = <T, E extends APIError>(
  context: FormContextValues<T>,
  apiError: E
) => {
  for (const [name, errArray] of Object.entries(apiError)) {
    if (name === "detail" || name === "status_code") continue;
    context.setError(
      errArray.map((message: string) => ({
        name,
        type: "server_error",
        message,
      })) || []
    );
  }
};
