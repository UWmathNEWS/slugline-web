import React from "react";
import { useAuth } from "../auth/AuthProvider";
import ProfileForm, { useProfileForm } from "./ProfileForm";

const Profile = () => {
  const { user } = useAuth();
  const context = useProfileForm(user || undefined);

  if (!user) {
    return <></>;
  }

  return (
    <>
      <h2>Your Profile</h2>
      <ProfileForm context={context} user={user} formId="profileForm" />
    </>
  );
};

export default Profile;
