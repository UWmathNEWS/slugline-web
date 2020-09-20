import React from "react";
import type { ForwardAttributes } from "../types";

import "./styles/Hero.scss";

export interface HeroProps {
  variant: "primary" | "light" | "dark" | "custom";
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
