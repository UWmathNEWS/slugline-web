import React from "react";
import { Link } from "react-router-dom";

const Error404: React.FC = () => {
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
