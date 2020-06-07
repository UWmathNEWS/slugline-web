import React, { useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import { useAuth } from "./Auth";
import { useHistory } from "react-router-dom";
import { useToast } from "../shared/contexts/ToastContext";
import ERRORS from "../shared/errors";
import { RouteComponentProps } from "../shared/types";
import Visor from "../shared/components/Visor";

const Login: React.FC<RouteComponentProps> = (props) => {
  const auth = useAuth();
  const toast = useToast();
  const history = useHistory();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.currentTarget.name === "username") {
      setUsername(evt.currentTarget.value);
    } else if (evt.currentTarget.name === "password") {
      setPassword(evt.currentTarget.value);
    }
  };

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    auth.login(username, password).then((resp) => {
      if (resp.success) {
        history.push("/");
        toast.addToasts([
          {
            id: Math.random().toString(),
            body: `Logged in as ${resp.data?.username}.`,
            delay: 3000,
          },
        ]);
      } else {
        setErrors(resp.error.detail || []);
      }
    });
  };

  return (
    <>
      <Visor title={props.route.title} location={props.location.pathname} />

      <h1>LOGIN:</h1>

      {errors.map((err) => (
        <Alert key={err} variant="danger">
          {ERRORS[err]}
        </Alert>
      ))}

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="loginUsername">
          <Form.Label>Username:</Form.Label>
          <Form.Control
            type="text"
            name="username"
            required
            value={username}
            onChange={onChange}
          />
        </Form.Group>
        <Form.Group controlId="loginPassword">
          <Form.Label>Password:</Form.Label>
          <Form.Control
            type="password"
            name="password"
            required
            value={password}
            onChange={onChange}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </>
  );
};

export default Login;
