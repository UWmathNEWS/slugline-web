import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import Profile from "../profile/Profile";

const AdminPanel = () => {
  const auth = useAuth();

  return <Profile user={auth.user!} />;
};

export default AdminPanel;
