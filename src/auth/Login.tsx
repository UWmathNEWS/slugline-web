import React, { useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import { useAuth } from "./AuthProvider";
import { useHistory } from "react-router-dom";
import { useToast } from "../shared/contexts/ToastContext";
import ERRORS from "../shared/errors";
import { APIError } from "../shared/types";

const Login: React.FC = () => {
  const auth = useAuth();
  const toast = useToast();
  const history = useHistory();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);

  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    if (evt.currentTarget.name === "username") {
      setUsername(evt.currentTarget.value);
    } else if (evt.currentTarget.name === "password") {
      setPassword(evt.currentTarget.value);
    }
  };

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    auth.login(username, password).then(
      (user) => {
        history.push("/");
        toast.addToasts([
          {
            id: Math.random().toString(),
            body: `Logged in as ${user?.username}.`,
            delay: 3000,
          },
        ]);
      },
      (errors: APIError) => {
        setErrors(errors.detail || []);
      }
    );
  };

  return (
    <>
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
