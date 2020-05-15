import ERRORS from "../errors";

describe("ERRORS", () => {
  it("returns valid errors requested via dot queries", () => {
    const err = ERRORS.__TEST.__NESTED;
    expect(err).toBe("");
  });

  it("returns valid errors requested via array queries", () => {
    const err = ERRORS["__TEST.__NESTED"];
    expect(err).toBe("");
  });

  it("returns cached error messages correctly", () => {
    const testErr = ERRORS.__TESTING;
    expect(ERRORS.__TESTING).toBe(testErr);
  });

  it("returns functional errors", () => {
    const err = ERRORS.__TEST.__FUNC;
    expect(err.test).toBe("test");
    expect(err.test_string_with_spaces).toBe("test string with spaces");
  });

  it("returns error messages with spaces verbatim", () => {
    const err = "a b c";
    expect(ERRORS[err]).toBe(err);
  });

  it("throws an error upon attempting to access an invalid error requested via dot queries", () => {
    try {
      ERRORS.__TEST.__INVALID_ERROR_MESSAGE;
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(ReferenceError);
      expect(e.message).not.toMatch("Error was not thrown by ErrorsProxy");
    }
  });

  it("throws an error upon attempting to access an invalid error requested via array queries", () => {
    try {
      ERRORS["__TEST.__INVALID_ERROR_MESSAGE"];
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(ReferenceError);
      expect(e.message).not.toMatch("Error was not thrown by ErrorsProxy");
    }
  });

  it("rejects modifying any top-level errors", () => {
    try {
      ERRORS.__TESTING = "Bad!";
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e.message).not.toMatch("Error was not thrown by ErrorsProxy");
    }
  });

  it("rejects modifying any nested errors requested via dot queries", () => {
    try {
      ERRORS.__TEST.__NEST_1.__NEST_2 = "Bad!";
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e.message).not.toMatch("Error was not thrown by ErrorsProxy");
    }
  });

  it("rejects adding additional errors to the top level", () => {
    try {
      ERRORS.__ASDFUHFAI = "?";
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e.message.includes("Error was not thrown by ErrorsProxy")).toBe(false);
    }
  });

  it("rejects adding additional errors to nested levels", () => {
    try {
      ERRORS.__TEST.__ASDFUHFAI = "?";
      expect("Error was not thrown by ErrorsProxy").toBe(false);
    } catch (e) {
      expect(e.message.includes("Error was not thrown by ErrorsProxy")).toBe(false);
    }
  });

  describe("USER.REQUIRED", () => {
    it("uses correct a/an form", () => {
      expect(ERRORS.USER.REQUIRED.email).toMatch(/\ban\b/);
      expect(ERRORS.USER.REQUIRED.password).toMatch(/\ba\b/);
    })
  });
});
