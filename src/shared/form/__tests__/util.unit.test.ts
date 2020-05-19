import "core-js";
import * as _ from "../util";
import ERRORS from "../../errors";

describe("cleanFormData", () => {
  it("cleans data", () => {
    const testData = {
      a: "",
      b: "abc",
      c: null,
      d: 6,
      e: undefined,
    };
    const cleaned = {
      b: "abc",
      c: null,
      d: 6,
      e: undefined,
    };

    expect(_.cleanFormData(testData)).toEqual(cleaned);
  });
});

describe("setServerErrors", () => {
  let errors: { [name: string]: { name: string, type: string, message: string }[] };
  let ctx: any;

  beforeEach(() => {
    errors = {};
    ctx = {
      setError: jest.fn((errArray) => {
        if (errArray.length) {
          errors[errArray[0].name] = errArray;
        }
      })
    }
  });

  it("sets only non-empty fields that are not detail or status_code", () => {
    const error = {
      status_code: 500,
      detail: [ERRORS.__TESTING],
      empty: [],
      single: [ERRORS.__TESTING],
      multiple: [ERRORS.__TESTING, ERRORS.__TEST.__NESTED],
    };

    _.setServerErrors(ctx, error);

    expect(errors.status_code).toBeUndefined();
    expect(errors.detail).toBeUndefined();
    expect(errors.empty).toBeUndefined();

    expect(errors.single).toEqual([
      {
        name: "single",
        type: "server_error",
        message: ERRORS.__TESTING,
      }
    ]);
    expect(errors.multiple).toEqual([
      {
        name: "multiple",
        type: "server_error",
        message: ERRORS.__TESTING,
      },
      {
        name: "multiple",
        type: "server_error",
        message: ERRORS.__TEST.__NESTED,
      }
    ]);
  });
});
