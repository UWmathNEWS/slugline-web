import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import Visor from "../components/Visor";

const Error500: React.FC<Partial<RouteComponentProps>> = ({
  staticContext = {},
}) => {
  staticContext.statusCode = 500;

  return (
    <div>
      <Visor title="Server Error" />
      <h1 className="display-1">500</h1>
      <h1>Server Error</h1>
      <p>
        Something has broken. One of the editors is on their way with a wrench
        and some tape to fix it. In the meantime, why not head back to the{" "}
        <Link to="/">homepage?</Link>
      </p>
    </div>
  );
};

export default Error500;
