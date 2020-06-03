import React, { useEffect } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { makeTitle } from "../helpers";

const Error404: React.FC<Partial<RouteComponentProps>> = ({
  staticContext = {},
}) => {
  staticContext.statusCode = 404;

  useEffect(() => {
    document.title = makeTitle("Page Not Found");
  }, []);

  return (
    <div>
      <h1 className="display-1">404</h1>
      <h1>Page not found</h1>
      <p>
        Well, one of us made a mistake. I'll give you the benefit of the doubt
        and let you try again at the <Link to="/">home page.</Link>
      </p>
    </div>
  );
};

export default Error404;
