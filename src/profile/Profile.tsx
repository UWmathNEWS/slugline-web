import React, { useState, useEffect } from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import ProfileGeneral from "./ProfileGeneral";
import ProfileSecurity from "./ProfileSecurity";

const Profile = ({ user } : { user: User | undefined }) => {
  const auth = useAuth();

  const [errors, setErrors] = useState<UserAPIError>({});

  if (user === undefined) return <></>;

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
