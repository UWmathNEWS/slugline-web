import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import axios from "axios";
import { getApiUrl } from "../api/api";
import { Modal, Button } from "react-bootstrap";

import { User, PaginatedAPIResponse } from "../shared/types";
import ProfileForm from "../profile/ProfileForm";

import "./UserList.scss";
import { useAuth } from "../auth/AuthProvider";
import ERRORS from "../shared/errors";
import RichTable, { Column } from "../shared/components/RichTable";

const getUserList = (): Promise<User[]> => {
  return axios.get<PaginatedAPIResponse<User>>(getApiUrl("users/"))
    .then(resp => {
      if (resp.data.success)
        return resp.data.data.results;
      else
        throw resp.data.error ?? [ERRORS.REQUEST.DID_NOT_SUCCEED];
    })
};

interface State {
  allUsers: User[];
  filteredUsers: User[] | undefined;
  currentUser: User | undefined;
  showEditUser: boolean;
  showCreateUser: boolean;
}

type Action =
  { type: 'get users' } |
  { type: 'set users', data: User[] } |
  { type: 'filter users', data: User[] | undefined } |
  { type: 'set edit user', data: User | undefined } |
  { type: 'show edit user', data: boolean } |
  { type: 'submit edit user' } |
  { type: 'show create user', data: boolean } |
  { type: 'submit create user' };

const UserList = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [editUserErrors, setEditUserErrors] = useState(false);
  const [createUserErrors, setCreateUserErrors] = useState(false);
  const editUserRef = useRef({ submit: () => Promise.resolve() });
  const createUserRef = useRef({ submit: () => Promise.resolve() });

  const columns = useMemo<Column<User>[]>(
    () => [
      {
        Header: "Username",
        key: "username",
        sortable: true
      },
      {
        Header: "Name",
        key: "name",
        accessor: (user: User) => `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      },
      {
        Header: "Writer Name",
        key: "writer_name"
      },
      {
        Header: "Email",
        key: "email"
      },
      {
        Header: "Role",
        key: "role",
        accessor: (user: User) => user.is_staff ? "Staff" : user.is_editor ? "Editor" : "Contributor"
      }
    ],
    []
  );

  const [state, dispatch] = useReducer((state: State, action: Action): State => {
    switch (action.type) {
    case 'get users':
      getUserList().then(users => dispatch({ type: 'set users', data: users }));
      return {
        ...state,
        allUsers: []
      };
    case 'set users':
      return {
        ...state,
        allUsers: action.data
      };
    case 'filter users':
      return {
        ...state,
        filteredUsers: action.data
      };
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
    case 'submit edit user':
      getUserList().then(users => {
        dispatch({
          type: 'set edit user',
          data: Object.values(users).find(u => u.username === state.currentUser?.username)
        });
        dispatch({ type: 'set users', data: users });
      });
      return {
        ...state,
        allUsers: []
      };
    case 'show create user':
      return {
        ...state,
        showCreateUser: action.data
      };
    case 'submit create user':
      getUserList().then(users => dispatch({ type: 'set users', data: users }));
      return {
        ...state,
        allUsers: []
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

  const deleteUser = (username: string) => {
    auth.delete(`users/${username}/`)
      .then(() => {
        alert(`Successfully deleted user ${username}`);
        dispatch({ type: 'submit edit user' });
        dispatch({ type: 'show edit user', data: false });
      }, (err: string[] | string) => {
        alert(typeof err === "string" ? ERRORS[err] : err.map(e => ERRORS[e]));
      })
  };

  useEffect(() => {
    getUserList().then(users => dispatch({ type: 'set users', data: users }));
  }, []);

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
          call(_: any, data: User) {
            dispatch({ type: 'set edit user', data });
            return Promise.resolve();
          }
        }
      ]}
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
          if (window.confirm(`You are deleting user ${state.currentUser?.username}. Are you sure you want to continue?`))
            deleteUser(state.currentUser?.username ?? "");
        }}>Delete user</Button>
        <Button
          type="submit"
          disabled={isLoading || editUserErrors}
          className="ml-auto"
          onClick={() => {
            editUserRef.current.submit().then(() => {
              dispatch({ type: 'submit edit user' });
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
              dispatch({ type: 'submit create user' });
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
