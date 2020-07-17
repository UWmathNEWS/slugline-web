import React from "react";
import { render, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import PasswordField, { validatePassword } from "../PasswordField";
import { useForm } from "react-hook-form";

interface TestFormVals {
  password: string;
}

describe("validatePassword", () => {
  describe("minLength", () => {
    it("returns nothing on empty password", () => {
      expect(validatePassword.minLength("")).toBeUndefined();
    });

    it("returns error on password of insufficient length", () => {
      expect(validatePassword.minLength("abc")).toBe(
        "USER.PASSWORD.TOO_SHORT.8"
      );
      expect(validatePassword.minLength("abcdefgh")).toBeUndefined();
    });
  });

  describe("numeric", () => {
    it("returns nothing on empty password", () => {
      expect(validatePassword.numeric("")).toBeUndefined();
    });

    it("returns error on completely numeric password", () => {
      expect(validatePassword.numeric("1973")).toBe(
        "USER.PASSWORD.ENTIRELY_NUMERIC"
      );
      expect(validatePassword.numeric("ca1973")).toBeUndefined();
    });
  });
});

describe("PasswordField", () => {
  let result: any;

  beforeEach(() => {
    result = renderHook(() => useForm<TestFormVals>()).result;
  });

  it("button changes masking", () => {
    const { getByRole, getByTestId } = render(
      <PasswordField name="password" context={result.current} data-testid="t" />
    );

    expect(getByTestId("t").getAttribute("type")).toBe("password");

    act(() => {
      userEvent.click(getByRole("button"));
    });

    expect(getByTestId("t").getAttribute("type")).toBe("text");

    act(() => {
      userEvent.click(getByRole("button"));
    });

    expect(getByTestId("t").getAttribute("type")).toBe("password");
  });

  it("button has distinct visual and accessible states", () => {
    const { getByRole } = render(
      <PasswordField name="password" context={result.current} data-testid="t" />
    );

    expect(getByRole("button").getAttribute("title")).toMatch(/show/i);
    expect(getByRole("button").className).toMatch(/outline-secondary/i);
    expect(
      getByRole("img", { hidden: true }).classList.contains("fa-eye")
    ).toBeTruthy();

    act(() => {
      userEvent.click(getByRole("button"));
    });

    expect(getByRole("button").getAttribute("title")).toMatch(/mask/i);
    expect(getByRole("button").className).toMatch(/outline-primary/i);
    expect(
      getByRole("img", { hidden: true }).classList.contains("fa-eye-slash")
    ).toBeTruthy();
  });

  it("accepts external state", () => {
    const testState = true;
    const testSetState = jest.fn();
    const { getByRole, getByTestId } = render(
      <PasswordField
        name="password"
        context={result.current}
        state={[testState, testSetState]}
        data-testid="t"
      />
    );

    expect(getByTestId("t").getAttribute("type")).toBe("text");

    act(() => {
      userEvent.click(getByRole("button"));
    });

    expect(testSetState).toHaveBeenCalled();
  });

  it("forwards refs", async () => {
    const testRef = jest.fn();
    const { getByTestId } = render(
      <PasswordField
        name="password"
        context={result.current}
        data-testid="t"
        ref={testRef}
      />
    );

    expect(testRef).toHaveBeenCalledWith(getByTestId("t"));
  });
});
