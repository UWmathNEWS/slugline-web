import React, { useRef, useState } from "react";
import { getApiUrl } from "../api/api";
import { Modal, Button } from "react-bootstrap";

import { User } from "../shared/types";
import { ProfileFormConsumer, useProfileForm } from "../profile/ProfileForm";

import "./UserList.scss";
import { useAuth } from "../auth/AuthProvider";
import ERRORS from "../shared/errors";
import {
  RichTable,
  Column,
  RichTableBag,
} from "../shared/components/RichTable";

interface UserEditModalProps {
  user?: User;
  show: boolean;
  setShow: (show: boolean) => void;
  refreshTable: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = (
  props: UserEditModalProps
) => {
  const context = useProfileForm(props.user);

  // grab a reference to the form state here, or else it won't update properly
  const formState = context.formState;

  return (
    <Modal
      show={props.show}
      onHide={() => {
        props.setShow(false);
      }}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title>{props.user ? "Edit User" : "Create User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProfileFormConsumer
          context={context}
          formId="editUserForm"
          user={props.user}
          onSubmit={async () => {
            props.refreshTable();
            props.setShow(false);
          }}
          hideSubmit
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShow(false);
          }}
        >
          Close without saving
        </Button>
        <Button
          type="submit"
          disabled={formState.isSubmitting || !formState.isValid}
          form="editUserForm"
        >
          {formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const columns: Column<User>[] = [
  {
    header: "Username",
    key: "username",
    sortable: true,
    width: 15,
  },
  {
    header: "Name",
    key: "name",
    width: 20,
    accessor: (user: User) =>
      `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`,
  },
  {
    header: "Writer Name",
    key: "writer_name",
    width: 20,
  },
  {
    header: "Email",
    key: "email",
    width: 25,
  },
  {
    header: "Role",
    key: "role",
    accessor: (user: User) =>
      user.is_staff ? "Staff" : user.is_editor ? "Editor" : "Contributor",
  },
];

const UserList = () => {
  const auth = useAuth();
  const tableBagRef = useRef<RichTableBag<User> | null>(null);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<User | undefined>(undefined);

  return (
    <div>
      <h1>
        Users{" "}
        <Button
          variant="secondary"
          onClick={() => {
            setEditedUser(undefined);
            setShowEditModal(true);
          }}
        >
          New User
        </Button>
      </h1>
      <RichTable<User>
        columns={columns}
        url={getApiUrl("users/")}
        pk="username"
        paginated
        selectable
        searchable
        actions={[
          {
            name: "New User",
            call(_: any) {
              setEditedUser(undefined);
              setShowEditModal(true);
              return Promise.resolve();
            },
          },
          {
            name: "Edit",
            bulk: false,
            triggers: ["click"],
            call({ makeRequest }, data: User) {
              return makeRequest<User>("get", data).then((user) => {
                setEditedUser(user);
                setShowEditModal(true);
              });
            },
          },
          {
            name: "Delete",
            bulk: false,
            call({ makeRequest, executeAction }, data: User) {
              if (
                window.confirm(
                  `You are deleting user ${data.username}. Are you sure you want to continue?`
                )
              ) {
                return auth.delete(`users/${data.username}/`).then(
                  () => {
                    executeAction("refresh");
                    alert(`Successfully deleted user ${data.username}`);
                  },
                  (err: string[] | string) => {
                    alert(
                      typeof err === "string"
                        ? ERRORS[err]
                        : err.map((e) => ERRORS[e])
                    );
                  }
                );
              }

              return Promise.reject();
            },
          },
        ]}
        bagRef={(bag) => {
          tableBagRef.current = bag;
        }}
      />
      <UserEditModal
        user={editedUser}
        show={showEditModal}
        setShow={setShowEditModal}
        refreshTable={() => {
          tableBagRef.current?.executeAction("refresh");
        }}
      />
    </div>
  );
};

export default UserList;
