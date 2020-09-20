import React from "react";
import type { ForwardAttributes } from "../types";

import "./styles/Hero.scss";

export interface HeroProps {
  variant: "primary" | "light" | "dark" | "custom";
}

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
