import React, { useMemo, useReducer, useRef, useState } from "react";
import { getApiUrl } from "../api/api";
import { Modal, Button } from "react-bootstrap";

import { User } from "../shared/types";
import ProfileForm from "../profile/ProfileForm";

import "./UserList.scss";
import { useAuth } from "../auth/AuthProvider";
import ERRORS from "../shared/errors";
import RichTable, { Column, RichTableBag } from "../shared/components/RichTable";

interface State {
  allUsers: User[];
  filteredUsers: User[] | undefined;
  currentUser: User | undefined;
  showEditUser: boolean;
  showCreateUser: boolean;
}

type Action =
  { type: 'set edit user', data: User | undefined } |
  { type: 'show edit user', data: boolean } |
  { type: 'show create user', data: boolean };

const columns: Column<User>[] = [
  {
    Header: "Username",
    key: "username",
    sortable: true,
    width: 15,
  },
  {
    Header: "Name",
    key: "name",
    width: 20,
    accessor: (user: User) => `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
  },
  {
    Header: "Writer Name",
    key: "writer_name",
    width: 20,
  },
  {
    Header: "Email",
    key: "email",
    width: 25,
  },
  {
    Header: "Role",
    key: "role",
    accessor: (user: User) => user.is_staff ? "Staff" : user.is_editor ? "Editor" : "Contributor"
  }
];

const UserList = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editUserErrors, setEditUserErrors] = useState(false);
  const [createUserErrors, setCreateUserErrors] = useState(false);
  const tableBagRef = useRef<RichTableBag<User> | null>(null);
  const editUserRef = useRef({ submit: () => Promise.resolve() });
  const createUserRef = useRef({ submit: () => Promise.resolve() });

  const [state, dispatch] = useReducer((state: State, action: Action): State => {
    switch (action.type) {
    case 'set edit user':
      return {
        ...state,
        currentUser: action.data,
        showEditUser: true
      };
    case 'show edit user':
      return {
        ...state,
        showEditUser: action.data
      };
    case 'show create user':
      return {
        ...state,
        showCreateUser: action.data
      };
    }
    return state;
  }, {
    allUsers: [],
    filteredUsers: undefined,
    currentUser: undefined,
    showEditUser: false,
    showCreateUser: false
  });

  return <div>
    <h1>
      Users{" "}
      <Button
        variant="secondary"
        onClick={() => { dispatch({ type: 'show create user', data: true }) }}
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
            dispatch({ type: 'show create user', data: true });
            return Promise.resolve();
          }
        },
        {
          name: "Edit",
          bulk: false,
          triggers: ["click"],
          call({ makeRequest }, data: User) {
            return makeRequest<User>("get", data)
              .then(user => {
                dispatch({ type: 'set edit user', data: user });
              });
          }
        },
        {
          name: "Delete",
          bulk: false,
          call({ makeRequest, executeAction }, data: User) {
            if (window.confirm(`You are deleting user ${data.username}. Are you sure you want to continue?`)) {
              return auth.delete(`users/${data.username}/`)
                .then(() => {
                  executeAction("refresh");
                  alert(`Successfully deleted user ${data.username}`);
                  dispatch({ type: 'show edit user', data: false });
                }, (err: string[] | string) => {
                  alert(typeof err === "string" ? ERRORS[err] : err.map(e => ERRORS[e]));
                })
            }

            return Promise.reject();
          }
        }
      ]}
      bagRef={(bag) => {
        tableBagRef.current = bag;
      }}
    />
    <Modal
      show={state.showEditUser}
      onHide={() => { dispatch({ type: 'show edit user', data: false }); }}
      dialogClassName="UserList_modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editing {state.currentUser?.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProfileForm user={state.currentUser} ref={editUserRef} renderFooter={(isLoading, hasErrors) => {
          setIsLoading(isLoading);
          setEditUserErrors(hasErrors);
          return <></>;
        }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={() => { dispatch({ type: 'show edit user', data: false }); }}>
          Close without saving
        </Button>
        <Button variant="outline-danger" onClick={() => {
          if (window.confirm(`You are deleting user ${state.currentUser?.username}. Are you sure you want to continue?`)) {
            if (tableBagRef.current) {
              tableBagRef.current.executeAction("Delete");
            }
          }
        }}>Delete user</Button>
        <Button
          type="submit"
          disabled={isLoading || editUserErrors}
          className="ml-auto"
          onClick={() => {
            editUserRef.current.submit().then(() => {
              if (tableBagRef.current) {
                tableBagRef.current.executeAction("refresh");
                tableBagRef.current.makeRequest<User>("get", state.currentUser)
                  .then(user => {
                    dispatch({ type: 'set edit user', data: user });
                  });
              }
            }, () => {});
          }}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
    <Modal
      show={state.showCreateUser}
      onHide={() => { dispatch({ type: 'show create user', data: false }) }}
      dialogClassName="UserList_modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProfileForm ref={createUserRef} renderFooter={(isLoading, hasErrors) => {
          setIsLoading(isLoading);
          setCreateUserErrors(hasErrors);
          return <></>;
        }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { dispatch({ type: 'show create user', data: false }) }}>
          Close without saving
        </Button>
        <Button
          type="submit"
          disabled={isLoading || createUserErrors}
          className="ml-auto"
          onClick={() => {
            createUserRef.current.submit().then(() => {
              if (tableBagRef.current) {
                tableBagRef.current.executeAction("refresh");
              }
            }, () => {});
          }}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  </div>;
};

export default UserList;
