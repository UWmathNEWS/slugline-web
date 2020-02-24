import React from "react";
import { useAuth } from "../auth/AuthProvider";
import SluglineEditor from "../editor/SluglineEditor";

const Dash = () => {
  const auth = useAuth();
  // just cram the article editor in here for now
  return (
    <>
      <SluglineEditor />
    </>
  );
};

export default Dash;
