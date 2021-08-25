/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2021  Terry Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Methods for managing global theming.
 *
 * This module contains a mix of declarative methods and methods that "go around" React. This is because, for the most
 * part, we do theming via CSS variables. Styling is not supposed to depend on the specific colours used, and so it
 * would be pointless to store these themes in state. On the other hand, light/dark mode influences colour choices
 * (e.g. colour combination A might be used in light mode and combination B in dark mode), and so these are exposed
 * declaratively via a context.
 */

import React, { createContext, useContext, useState } from "react";
import type { Theme } from "../types";

// Respect the user's preferred colour scheme
type ColorScheme = "light" | "dark";

const preferredMode: ColorScheme = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches
  ? "dark"
  : "light";

const inverseMode = {
  light: "dark" as const,
  dark: "light" as const,
};

// CSS variables for theming

const themeNameMap: Theme = {
  primaryBg: "--primary-bg",
  primaryText: "--primary-text",
  primaryLink: "--primary-link",
  secondaryBg: "--secondary-bg",
  secondaryText: "--secondary-text",
  secondaryLink: "--secondary-link",
};

const defaultLightTheme: Theme = {
  primaryBg: "var(--white)",
  primaryText: "var(--gray-900)",
  primaryLink: "var(--pink-700)",
  secondaryBg: "var(--gray-200)",
  secondaryText: "var(--gray-900)",
  secondaryLink: "var(--pink-700)",
};

const defaultDarkTheme: Theme = {
  primaryBg: "var(--black)",
  primaryText: "var(--white)",
  primaryLink: "var(--pink-300)",
  secondaryBg: "var(--gray-900)",
  secondaryText: "var(--white)",
  secondaryLink: "var(--pink-300)",
};

let defaultTheme =
  preferredMode === "light" ? defaultLightTheme : defaultDarkTheme;
let baseTheme = { ...defaultTheme };
let theme = { ...baseTheme };

const styleSheet = document.querySelector<HTMLStyleElement>("style#theme")!
  .sheet!;

/**
 * Set theme variables. Updates the document stylesheet.
 *
 * @param newTheme Object with key:value pairs consisting of variables and their desired values.
 */
const setThemeVariables = (newTheme: Partial<Theme>) => {
  theme = { ...theme, ...newTheme };
  for (const prop_ in theme) {
    const prop = prop_ as keyof Theme;
    // Set for light/no preference mode
    (styleSheet.cssRules[0] as CSSStyleRule).style.setProperty(
      themeNameMap[prop],
      theme[prop]
    );
    // Set for dark mode
    ((styleSheet.cssRules[1] as CSSMediaRule)
      .cssRules[0] as CSSStyleRule).style.setProperty(
      themeNameMap[prop],
      theme[prop]
    );
  }
};

/**
 * Reset theme variables to the base theme.
 */
const resetThemeVariables = () => setThemeVariables(baseTheme);

/**
 * Set base theme.
 *
 * Use this to set a site-wide theme (e.g. colour of the latest issue)
 *
 * @param newTheme Object with key:value pairs consisting of variables and their desired values.
 */
const setBaseThemeVariables = (newTheme: Partial<Theme>) => {
  baseTheme = { ...baseTheme, ...newTheme };
};

/**
 * Reset base theme variables to the default theme for the current colour scheme.
 */
const resetBaseThemeVariables = () => setBaseThemeVariables(defaultTheme);

// Light/dark mode context

interface ThemeManager {
  mode: ColorScheme;

  /**
   * Set the colour scheme.
   *
   * @param mode The desired colour scheme.
   */
  setMode(mode: ColorScheme): void;

  /**
   * Reset the colour scheme to the user's preferred scheme.
   */
  resetMode(): void;
}

const ThemeContext = createContext<ThemeManager>({
  mode: preferredMode,
  setMode: () => {},
  resetMode: () => {},
});

const ThemeProvider: React.FC = (props) => {
  const [mode, setMode_] = useState<ColorScheme>(preferredMode);

  const setMode = (newMode: ColorScheme) => {
    defaultTheme = newMode === "light" ? defaultLightTheme : defaultDarkTheme;
    resetBaseThemeVariables();
    resetThemeVariables();
    setMode_(newMode);
  };
  const resetMode = () => setMode(preferredMode);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        resetMode,
      }}
    >
      {props.children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => useContext(ThemeContext);

export {
  inverseMode,
  setThemeVariables,
  resetThemeVariables,
  setBaseThemeVariables,
  resetBaseThemeVariables,
  ThemeProvider,
  useTheme,
};
