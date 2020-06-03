import React, { useEffect } from "react";
import { makeTitle } from "../shared/helpers";

const Home = (props: any) => {
  useEffect(() => {
    document.title = makeTitle(props.route?.title);
  }, []);

  return <span>HOME CONTENT</span>;
};

export default Home;
