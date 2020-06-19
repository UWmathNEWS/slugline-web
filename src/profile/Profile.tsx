import React from "react";
import { useAuth } from "../auth/Auth";
import ProfileForm from "./ProfileForm";
import { RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";

const Profile: React.FC<RouteComponentProps> = (props) => {
  const { user } = useAuth();
  if (!user) {
    return <></>;
  }

  return (
    <>
      <Visor
        title={props.route.title}
        location={props.location.pathname}
      />
      <h2>Your Profile</h2>
      <ProfileForm user={user} formId="profileForm" />
    </>
  );
};

export default Profile;
