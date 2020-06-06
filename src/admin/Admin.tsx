import React from "react";
import UserList from "./UserList";
import Visor from "../shared/components/Visor";
import { RouteComponentProps } from "../shared/types";

const AdminPanel: React.FC<RouteComponentProps> = (props) => {
  return (
    <>
      <Visor
        title={props.route.title}
        location={props.location.pathname}
      />
      <UserList />
    </>
  );
};

export default AdminPanel;
