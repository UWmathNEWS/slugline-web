import { FormContextValues } from "react-hook-form";
import { APIError } from "../types";

export const cleanFormData = <T>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== "")
  );
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
