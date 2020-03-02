import React from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import ProfileGeneral from "./ProfileGeneral";
import ProfileSecurity from "./ProfileSecurity";

export interface ProfileState {
  errors: UserAPIError,
  generalErrors: string[],
  isLoading: boolean
}

export type ProfileAction<T> =
  { type: 'is loading' } |
  { type: 'done loading success' } |
  { type: 'done loading error', errors: UserAPIError | string | string[] } |
  { type: 'set error', errors: UserAPIError } |
  { type: 'set general error', errors: string[] } |
  { type: 'set data', data: T, errors?: UserAPIError };

export const profileReducer = <T extends ProfileState, U>(state: T, action: ProfileAction<U>): T => {
  switch (action.type) {
  case 'is loading':
    return { ...state, isLoading: true };
  case 'done loading success':
    return { ...state, isLoading: false, generalErrors: [] };
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
  }
  return state;
};

const Profile = ({ user } : { user: User }) => {
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
              <ProfileGeneral user={user} />
            </Tab.Pane>
            <Tab.Pane eventKey="security">
              <ProfileSecurity user={user} />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
};

export default Profile;
