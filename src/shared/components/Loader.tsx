import React from "react";
import { Spinner } from "react-bootstrap";
import "./styles/Loader.scss";

interface LoaderProps {
  variant: "spinner" | "linear";
  layout?: "display" | "block" | "inline";
  className?: string;
  hideFromScreenreaders?: boolean;
  lines?: number;
}

/**
 * Skeleton components to show loading state.
 *
 * @param props -
 * @param props.variant - The type of loader to display
 * @param props.layout - The way the loader should be displayed
 * @param props.className - Additional classes to attach to the loader
 * @param props.hideFromScreenreaders - Should the loader be hidden from screenreaders?
 * @param props.lines - How many lines the loader should have. Only has an effect when variant is linear.
 */
const Loader: React.FC<LoaderProps> = ({
  variant,
  layout = "block",
  className = "",
  hideFromScreenreaders,
  lines,
}) => {
  if (variant === "spinner") {
    return (
      <div className={`Loader Loader--spinner Loader--${layout} ${className}`}>
        <Spinner animation="border" role="status">
          {!hideFromScreenreaders && (
            <span className="sr-only">Loading...</span>
          )}
        </Spinner>
      </div>
    );
  } else if (variant === "linear") {
    return (
      <div className={`Loader Loader--linear Loader--${layout} ${className}`}>
        <div className="Loader_item" role="status">
          {!hideFromScreenreaders && (
            <span className="sr-only">Loading...</span>
          )}
        </div>
        {lines &&
          lines > 1 &&
          new Array(lines - 1)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="Loader_item" role="status" />
            ))}
      </div>
    );
  }
  return null;
};

export default Loader;
