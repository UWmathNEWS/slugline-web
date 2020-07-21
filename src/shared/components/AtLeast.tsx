import React from "react";
import { atLeast } from "../helpers/user";
import { UserRole } from "../types";
import { useAuth } from "../../auth/Auth";

const AtLeast: React.FC<{
  role: UserRole;
  errorComponent?: React.ReactElement;
}> = ({ role, errorComponent, children }) => {
  const auth = useAuth();

  if (!atLeast(auth.user, role)) {
    return errorComponent || <></>;
  }

  return <>{children}</>;
};

export default AtLeast;
