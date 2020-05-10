const errorFactory = (templ: (...prop: string[]) => string) =>
  new Proxy(
    {},
    {
      get(_, prop: string) {
        return templ(...prop.replace("_", " ").split(","));
      },
      has(_, prop) {
        return true;
      },
    }
  );

const errors = {
  REQUEST: {
    DID_NOT_SUCCEED: "Request did not succeed.",
    NEEDS_AUTHENTICATION: "Request requires authentication.",
  },
  FORMS: {
    NOT_YET_VALID: "Please correct the errors in the form before submitting.",
  },
  AUTH: {
    CREDENTIALS_NONEXISTENT: "Username and password are required.",
    CREDENTIALS_INVALID: "Invalid username or password.",
  },
  ISSUE: {
    ALREADY_EXISTS: "This issue already exists.",
  },
  USER: {
    DOES_NOT_EXIST: "User does not exist.",
    COULD_NOT_CREATE: "Could not create user.",
    COULD_NOT_UPDATE: "Could not update profile.",
    COULD_NOT_DELETE: "Could not delete user.",
    INSUFFICIENT_PRIVILEGES: "Not enough privileges to change field.",
    REQUIRED: errorFactory((attr) => `Must provide a ${attr}.`),
    USERNAME: {
      ALREADY_EXISTS: "Username already exists.",
      CANNOT_CHANGE: "You cannot change your username after registration.",
      TOO_LONG: "Username is too long.",
    },
    FIRST_NAME: {
      TOO_LONG: errorFactory(
        (len) => `Your first name must be less than ${len} characters long.`
      ),
    },
    LAST_NAME: {
      TOO_LONG: errorFactory(
        (len) => `Your last name must be less than ${len} characters long.`
      ),
    },
    EMAIL: {
      INVALID: "Email must be valid.",
    },
    PASSWORD: {
      CURRENT_INCORRECT: "Current password incorrect.",
      CURRENT_REQUIRED:
        "Please enter your old password to change your password.",
      TOO_SHORT: errorFactory(
        (len) => `Password must be at least ${len} characters long.`
      ),
      TOO_COMMON: "Password is too common.",
      TOO_SIMILAR: errorFactory(
        (attr) => `Password is too similar to ${attr}.`
      ),
      ENTIRELY_NUMERIC: "Password must contain at least one letter or symbol.",
      MUST_MATCH: "Passwords must match.",
    },
  },
};

interface ErrorsProxy {
  [key: string]: string | any;
}

const errorsFactory = (): ErrorsProxy => {
  let memo: ErrorsProxy = {};

  return new Proxy(errors, {
    get(_, prop: string) {
      if (prop.includes(" ")) return prop;
      if (prop in memo) return memo[prop];

      const parts = prop.split(".");
      const res = parts.reduce<ErrorsProxy | string>((acc, key, index) => {
        if (typeof acc !== "string" && key in acc) return acc[key];
        else
          throw new ReferenceError(
            `Error ${parts.slice(0, index + 1).join(".")} does not exist.`
          );
      }, errors);

      if (typeof res === "string") memo[prop] = res;

      return res;
    },
    set(_, prop, value) {
      throw new Error("Cannot assign to errors.");
    },
  });
};

const ERRORS = errorsFactory();

export default ERRORS;
