import React from "react";
import { useAuth } from "../auth/AuthProvider";
import ArticleEditor from "../articles/Editor";

const Dash = () => {
  const auth = useAuth();
  // just cram the article editor in here for now
  return (
    <>
      <h1>{`Welcome ${auth.user?.username}`}</h1>
      <ArticleEditor />
    </>
  );
};

export default Dash;
