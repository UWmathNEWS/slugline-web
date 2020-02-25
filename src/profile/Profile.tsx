import React, { useState, useEffect } from "react";
import { Form, Tab, Row, Col, Nav, OverlayTrigger, Popover } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";

interface ChangedPassword {
  cur_password?: string;
  new_password?: string;
  repeat_password?: string;
}

const password_info = (<Popover id="password_info">
  <Popover.Title>Password requirements</Popover.Title>
  <Popover.Content>
    Passwords must:
    <ul>
      <li>Be at least 8 characters long</li>
      <li>Contain at least one letter or symbol</li>
      <li>Not contain the username, name, writer name or email</li>
    </ul>
  </Popover.Content>
</Popover>);

const Profile = ({ user } : { user: User }) => {
  const auth = useAuth();

  const [changedUser, setChangedUser] = useState<User>(user);
  const [changedPassword, setChangedPassword] = useState<ChangedPassword>({});
  const [errors, setErrors] = useState<UserAPIError>({});
  const [name, setName] = useState<string>(`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`);

  useEffect(() => {
    setName(`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`);
  });


  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    setChangedUser(prevState => {
      const value = evt.currentTarget.value;
      switch (evt.currentTarget.name) {
        case "email":
          prevState.email = value;
          break;
        case "name": {
          const names = value.split("");
          prevState.first_name = names.slice(0, -1).join(" ");
          prevState.last_name = names[names.length - 1];
          break;
        }
        case "writer_name":
          prevState.writer_name = value;
          break;
      }
      return prevState;
    })
  };

  const onPasswordChange = (evt: React.FormEvent<HTMLInputElement>) => {
    setChangedPassword(prevState => {
      const value = evt.currentTarget.value;
      switch (evt.currentTarget.name) {
        case "cur_password":
          prevState.cur_password = value;
          break;
        case "new_password": {
          const newErrors: Set<string> = new Set(errors.password);

          if (value.length < 8) {
            newErrors.add("Password must be at least 8 characters long.");
          } else {
            newErrors.delete("Password must be at least 8 characters long.");
          }

          if (/^\d*$/.test(value)) {
            newErrors.add("Password must contain at least one letter or symbol.");
          } else {
            newErrors.delete("Password must contain at least one letter or symbol.");
          }

          if (newErrors.size) {
            setErrors(prevErrors => ({
              ...prevErrors,
              password: Array.from(newErrors)
            }));
          } else {
            prevState.new_password = value;
          }
          break;
        }
        case "repeat_password": {
          const newErrors: Set<string> = new Set(errors.password);

          if (value !== prevState.new_password) {
            newErrors.add("Passwords must match.");
          } else {
            newErrors.delete("Passwords must match.");
          }

          if (newErrors.size) {
            setErrors(prevErrors => ({
              ...prevErrors,
              password: Array.from(newErrors)
            }));
          } else {
            prevState.repeat_password = value;
          }
          break;
        }
      }
      return prevState;
    })
  };

  return <Form>
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

              <Form.Group as={Row} controlId="profileUsername">
                <Form.Label column sm={2}>Username</Form.Label>
                <Col sm={10}>
                  <Form.Control readOnly defaultValue={user.username} />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="profileEmail">
                <Form.Label column sm={2}>Email</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="email"
                    name="email"
                    required
                    placeholder="example@example.com"
                    defaultValue={user.email}
                    onChange={onChange} />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="profileFirstLastName">
                <Form.Label column sm={2}>Name</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    name="name"
                    placeholder="e.g. Johnny Appleseed"
                    defaultValue={name}
                    onChange={onChange} />
                </Col>
              </Form.Group>

              <Form.Group as={Row} controlId="profileWriterName">
                <Form.Label column sm={2}>Writer name</Form.Label>
                <Col sm={10}>
                  <Form.Control
                    name="writer_name"
                    placeholder="e.g. Grower of Apples"
                    defaultValue={user.writer_name}
                    onChange={onChange} />
                </Col>
              </Form.Group>
            </Tab.Pane>
            <Tab.Pane eventKey="security">
              <h2>Security</h2>

              <h3>Change password</h3>

              <Form.Group as={Row} controlId="profileCurPassword">
                <Form.Label column sm={4}>Current password</Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="password"
                    name="cur_password"
                    placeholder="Current password"
                    onChange={onPasswordChange} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="profileNewPassword">
                <Form.Label column sm={4}>
                  New password
                  <OverlayTrigger trigger="hover" placement="right" overlay={password_info}>
                    <a href="#">(i)</a>
                  </OverlayTrigger>
                </Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="password"
                    name="new_password"
                    placeholder="New password"
                    onChange={onPasswordChange} />
                </Col>
              </Form.Group>
              <Form.Group as={Row} controlId="profileRepeatPassword">
                <Form.Label column sm={4}>Repeat password</Form.Label>
                <Col sm={8}>
                  <Form.Control
                    type="password"
                    name="repeat_password"
                    placeholder="Repeat password"
                    onChange={onPasswordChange} />
                </Col>
              </Form.Group>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  </Form>
};

export default Profile;
