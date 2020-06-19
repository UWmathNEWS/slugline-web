import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import Visor from "../components/Visor";

const Error404: React.FC<Partial<RouteComponentProps>> = ({
  staticContext = {},
}) => {
  staticContext.statusCode = 404;

  return (
    <div>
      <Visor title="Page Not Found" />
      <h1 className="display-1">404</h1>
      <h1>Page Not Found</h1>
      <p>
        Well, one of us made a mistake. I'll give you the benefit of the doubt
        and let you try again at the <Link to="/">home page.</Link>
      </p>
    </div>
  );
};

export default Error404;
