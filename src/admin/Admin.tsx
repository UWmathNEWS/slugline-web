import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Profile from "../profile/Profile";

const AdminPanel = () => {
  const auth = useAuth();

  const [errors, setErrors] = useState<String[]>([]);

  return (auth.user ? <Profile user={auth.user} /> : <Redirect to="/login" /> );
};

export default AdminPanel;
