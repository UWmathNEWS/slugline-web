import React from "react";
import { useAuth } from "../auth/AuthProvider";
import ProfileForm from "./ProfileForm";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <></>;
  }

  return <>
    <h2>Your Profile</h2>
    <ProfileForm user={user} />
  </>;
};

export default Profile;
