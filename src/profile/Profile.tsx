import React from "react";
import { useAuth } from "../auth/Auth";
import ProfileForm from "./ProfileForm";

const Profile = () => {
  const { user } = useAuth();
  if (!user) {
    return <></>;
  }

  return (
    <>
      <h2>Your Profile</h2>
      <ProfileForm user={user} formId="profileForm" />
    </>
  );
};

export default Profile;
