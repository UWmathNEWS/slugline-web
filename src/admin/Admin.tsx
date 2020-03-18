import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import Profile from "../profile/Profile";
import UserList from "./UserList";

const AdminPanel = () => {
  const auth = useAuth();

  return <>
    <UserList/>
  </>;
};

export default AdminPanel;
