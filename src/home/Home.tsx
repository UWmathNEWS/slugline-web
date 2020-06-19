import React from "react";
import Visor from "../shared/components/Visor";
import { RouteComponentProps } from "../shared/types";

const Home: React.FC<RouteComponentProps> = (props) => {
  return (
    <>
      <Visor title={props.route.title} />
      <span>HOME CONTENT</span>
    </>
  );
};

export default Home;
