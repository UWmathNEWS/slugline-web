import React from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import { UserAPIError } from "../shared/types"
import ProfileGeneral from "./ProfileGeneral";
import ProfileSecurity from "./ProfileSecurity";
import { useAuth } from "../auth/AuthProvider";

export interface ProfileState {
  errors: UserAPIError,
  generalErrors: string[],
  successMessage: string,
  isLoading: boolean
}

export type ProfileAction<T> =
  { type: 'is loading' } |
  { type: 'done loading success', message?: string } |
  { type: 'done loading error', errors: UserAPIError | string | string[] } |
  { type: 'set error', errors: UserAPIError } |
  { type: 'set general error', errors: string[] } |
  { type: 'set success message', message: string } |
  { type: 'set data', data: T, errors?: UserAPIError };

export const profileReducer = <T extends ProfileState, U>(state: T, action: ProfileAction<U>): T => {
  switch (action.type) {
  case 'is loading':
    return { ...state, isLoading: true };
  case 'done loading success':
    return {
      ...state,
      isLoading: false,
      generalErrors: [],
      successMessage: action.message ?? "Profile successfully saved!"
    };
  case 'done loading error':
    if (typeof action.errors === 'string') {
      // definitely a authentication error; this is the only time we'd throw a string
      // TODO: insert login flow
      return { ...state, isLoading: false };
    } else if (Array.isArray(action.errors)) {
      return { ...state, isLoading: false, generalErrors: action.errors };
    } else {
      return { ...state, isLoading: false, generalErrors: [], errors: action.errors };
    }
  case 'set error':
    return {
      ...state,
      errors: { ...state.errors, ...action.errors }
    };
  case 'set general error':
    return {
      ...state,
      generalErrors: state.generalErrors.concat(action.errors)
    };
  case 'set success message':
    return {
      ...state,
      successMessage: action.message
    };
  }
  return state;
};

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <></>;
  }

  return (
    <Tab.Container defaultActiveKey="general">
      <Row>
        <Col sm={2}>
          <Nav className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="general">General</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="security">Security</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col sm={10}>
          <Tab.Content>
            <Tab.Pane eventKey="general">
              <h2>General settings</h2>
              <ProfileGeneral user={user} />
            </Tab.Pane>
            <Tab.Pane eventKey="security">
              <h2>Security</h2>
              <ProfileSecurity user={user} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
};

export default Profile;
