import React, { useEffect, useRef, useState } from "react";
import { useUsersList } from "../api/api";
import { Row, InputGroup, Form, Table, Modal, Button } from "react-bootstrap";
import { User } from "../shared/types";
import ProfileGeneral from "../profile/ProfileGeneral";

import "./UserList.scss";
import ProfileSecurity from "../profile/ProfileSecurity";

const UserList = () => {
  const usersList: User[] | undefined = useUsersList();
  const [filteredUsers, setFilteredUsers] = useState<User[] | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generalErrors, setGeneralErrors] = useState<boolean>(false);
  const [securityErrors, setSecurityErrors] = useState<boolean>(false);
  const generalRef = useRef({ submit: () => {} });
  const securityRef = useRef({ submit: () => {} });

  const search = (evt: React.FormEvent<HTMLInputElement>) => {
    // TODO: make better w/ memoization, etc
    const { value } = evt.currentTarget;
    if (value.length) {
      setFilteredUsers(usersList?.filter(user => {
        return user.username.includes(value)
          || user.email.includes(value)
          || `${user.first_name} ${user.last_name}`.includes(value)
          || user.writer_name.includes(value)
      }))
    } else {
      setFilteredUsers(undefined);
    }
  };

  useEffect(() => {
    setFilteredUsers(usersList ?? []);
  }, [usersList]);

  return <div>
    <InputGroup className="mb-3">
      <Form.Control placeholder="Search..." onChange={search} />
    </InputGroup>
    <Table striped hover>
      <thead>
        <tr>
          <th>Username</th>
          <th>Name</th>
          <th>Writer Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
      {filteredUsers && (filteredUsers.length ? filteredUsers.map(user => <tr key={user.username} onClick={() => {
        setCurrentUser(user);
      }}>
        <td>{user.username}</td>
        <td>{`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`}</td>
        <td>{user.writer_name}</td>
        <td>{user.email}</td>
        <td>{user.is_editor ? "Editor" : "Contributor"}</td>
      </tr>) : <tr><td colSpan={5}>No results found.</td></tr>)}
      {usersList ? usersList.map(user => <tr key={user.username} onClick={() => {
        setCurrentUser(user);
      }} className={filteredUsers ? 'd-none' : ''}>
        <td>{user.username}</td>
        <td>{`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`}</td>
        <td>{user.writer_name}</td>
        <td>{user.email}</td>
        <td>{user.is_editor ? "Editor" : "Contributor"}</td>
      </tr>) : <tr><td colSpan={5}>Loading...</td></tr>}
      </tbody>
    </Table>
    <Modal
      show={currentUser !== undefined}
      onHide={() => { setCurrentUser(undefined); }}
      dialogClassName="UserList_modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editing {currentUser?.username}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProfileGeneral user={currentUser} ref={generalRef} renderFooter={(isLoading, hasErrors) => {
          setIsLoading(isLoading);
          setGeneralErrors(hasErrors);
          return <></>;
        }} />
        <ProfileSecurity user={currentUser} ref={securityRef} renderFooter={(isLoading, hasErrors) => {
          setIsLoading(isLoading);
          setSecurityErrors(hasErrors);
          return <></>;
        }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => { setCurrentUser(undefined); }} className="ml-3">
          Close without saving
        </Button>
        <Button
          type="submit"
          disabled={isLoading || generalErrors || securityErrors}
          className="ml-auto mr-3"
          onClick={() => {
            generalRef.current.submit();
            securityRef.current.submit();
          }}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  </div>;
};

export default UserList;
