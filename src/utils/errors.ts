import createError from "http-errors";
import { Error } from "../types";

function buildError(error: Error, other_errors = null) {
  const e = createError(error.status, error.message, {
    code: error.code,
  });

  if (other_errors) e.append(other_errors);

  return e;
}

export const errors = {
  INVALID_TOKEN: (e: any  = undefined) => {
    return buildError(
      {
        status: 403,
        code: "INVALID_TOKEN",
        message: "Invalid or expired token.",
      },
      e
    );
  },
  isError(e: any): boolean {
    return (
      e &&
      typeof e === "object" &&
      "status" in e &&
      "code" in e &&
      "message" in e &&
      typeof e.status === "number" &&
      typeof e.code === "string" &&
      typeof e.message === "string"
    );
  },
};
