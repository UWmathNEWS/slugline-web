/**
 * goosePRESS is a news publishing platform.
 * Copyright (C) 2020-2021  Terry Chen
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

import React from "react";
import type { ForwardAttributes } from "../types";

import "./styles/Hero.scss";

export interface HeroProps {
  variant: "primary" | "light" | "dark" | "custom" | "theme";
}

/**
 * Build a themeable hero component to place at the top of a page.
 *
 * @param variant The theme that the hero can take
 * @param className Additional classes to give to the hero
 * @param children The contents of the hero
 */
const Hero: React.FC<HeroProps & ForwardAttributes> = ({
  variant,
  className,
  children,
}) => {
  return (
    <div className={`Hero Hero--${variant} ${className || ""}`}>
      <div className="Hero_container container">{children}</div>
    </div>
  );
};

export default Hero;
