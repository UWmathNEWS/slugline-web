import React from "react";
import { useAuth } from "../auth/AuthProvider";

const Dash = () => {
  const auth = useAuth();
  return <h1>{`Welcome ${auth.user?.username}`}</h1>;
};

export default Dash;
