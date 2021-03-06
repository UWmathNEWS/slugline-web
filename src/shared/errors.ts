interface ErrorsProxy {
  [key: string]: string | any;
}

const errorsProxyFactory = (errors: { [key: string]: any }): ErrorsProxy => {
  let proxiedErrors: ErrorsProxy = {};
  let memo: ErrorsProxy = {};

  for (const key in errors) {
    if (typeof errors[key] === "string" || errors[key].__typeof__ === "proxy")
      proxiedErrors[key] = errors[key];
    else
      proxiedErrors[key] = errorsProxyFactory(errors[key]);
  }

  return new Proxy(proxiedErrors, {
    get(_, prop: string) {
      if (prop === "__typeof__") return "proxy";
      // HACK: react-refresh scans every export and uses $$typeof to determine
      // if it's a React component that it needs to process. Without this, we'll
      // throw an error here which breaks initialization.
      // TODO: Consider returning undefined instead of throwing an error in the "not found" case.
      if (prop === "$$typeof") return undefined;
      if (prop.includes(" ")) return prop;
      if (prop in memo) return memo[prop];

      const parts = prop.split(".");

      const res = parts.reduce<ErrorsProxy | string>((acc, key, index) => {
        if (typeof acc !== "string" && key in acc) return acc[key];
        else
          throw new ReferenceError(
            `Error ${parts.slice(0, index + 1).join(".")} does not exist.`
          );
      }, proxiedErrors);

      if (typeof res === "string") memo[prop] = res;

      return res;
    },
    set(_, prop, value) {
      throw new Error("Cannot assign to errors.");
    },
  });
};

const errorFactory = (templ: (...prop: string[]) => string) =>
  new Proxy(
    {},
    {
      get(_, prop: string) {
        if (prop === "__typeof__") return "proxy";
        return templ(...prop.replace(/_/g, " ").split(","));
      },
      has(_, prop) {
        return true;
      },
    }
  );

let errors = {
  __TESTING: "Error thrown in testing.",
  __TEST: {
    __NESTED: "$",
    __FUNC: errorFactory(a => a),
  },
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
    THROTTLED: errorFactory((wait) =>
      `You've tried logging in too many times. Please wait ${wait} seconds.`
    )
  },
  ISSUE: {
    ALREADY_EXISTS: "This issue already exists.",
  },
  REQUIRED: errorFactory((attr) =>
    `Must provide ${"aeiou".includes(attr[0]) ? "an" : "a"} ${attr}.`
  ),
  RESET: {
    INVALID_TOKEN: "Password reset token is invalid",
  },
  USER: {
    DOES_NOT_EXIST: "User does not exist.",
    COULD_NOT_CREATE: "Could not create user.",
    COULD_NOT_UPDATE: "Could not update profile.",
    COULD_NOT_DELETE: "Could not delete user.",
    INSUFFICIENT_PRIVILEGES: "Not enough privileges to change field.",
    REQUIRED: errorFactory((attr) => {
      console.warn("Using ERRORS.USER.REQUIRED is deprecated. Use ERRORS.REQUIRED instead.");
      return `Must provide ${"aeiou".includes(attr[0]) ? "an" : "a"} ${attr}.`;
    }),
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
      TOO_LONG: errorFactory(
        (len) => `Your email must be less than ${len} characters long.`
      ),
    },
    PASSWORD: {
      CURRENT_INCORRECT: "Current password incorrect.",
      CURRENT_REQUIRED: "Please enter your password to confirm.",
      NEW_REQUIRED: "Please enter a new password",
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


const ERRORS = errorsProxyFactory(errors);

export default ERRORS;
