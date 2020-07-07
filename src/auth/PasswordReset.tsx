import React, { useCallback, useEffect, useState, useMemo } from "react";
import { RouteComponentProps, User } from "../shared/types";
import api from "../api/api";
import { Alert, Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { RequestState, useAPILazy, useAPILazyUnsafe } from "../api/hooks";
import { setServerErrors } from "../shared/form/util";
import Visor from "../shared/components/Visor";
import { Link, Redirect } from "react-router-dom";
import Loader from "../shared/components/Loader";
import ERRORS from "../shared/errors";
import { useAuth } from "./Auth";
import PasswordField from "../shared/form/PasswordField";

const PasswordResetForm: React.FC<{ token: string; user: User }> = ({
  token,
  user,
}) => {
  const context = useForm<{ password: string }>({
    mode: "onChange",
    reValidateMode: "onChange",
    validateCriteriaMode: "all",
    defaultValues: {
      password: "",
    },
  });
  const [submit, submitInfo] = useAPILazyUnsafe(api.users.resetPassword.reset);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <>
        <h1>Password reset successful.</h1>
        <p className="lead">
          You're all set to <Link to={"/login/"}>login</Link> as{" "}
          <span className="text-monospace">{user.username}</span> with your new
          password.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Reset password for {user.username}</h1>
      <Form
        onSubmit={context.handleSubmit(async ({ password }) => {
          const resp = await submit({
            body: {
              token,
              password,
            },
          });

          if (resp.success) {
            setDone(true);
          } else {
            setServerErrors(context, resp.error);
          }
        })}
      >
        <Form.Group controlId="password">
          <Form.Label>New password</Form.Label>
          <PasswordField name="password" context={context} />
        </Form.Group>
        <Button type="submit">
          {submitInfo.state !== RequestState.Running
            ? "Submit"
            : "Submitting..."}
        </Button>
      </Form>
    </>
  );
};

const PasswordReset: React.FC<RouteComponentProps> = ({ route, location }) => {
  const auth = useAuth();
  const params = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);
  const [token, setToken] = useState(params.get("token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string[]>([]);
  const [getUser, reqInfo] = useAPILazy(api.users.resetPassword.get);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const resp = await getUser({ params: { token } });
      if (resp.success) {
        setUser(resp.data);
      } else {
        setError(resp.error.detail || []);
      }
    },
    [token, getUser]
  );

  useEffect(() => {
    if (params.get("token")) {
      getUser({ params: { token: params.get("token")! } }).then((resp) => {
        if (resp.success) {
          setUser(resp.data);
        } else {
          setError(resp.error.detail || []);
        }
      });
    }
  }, [params, getUser]);

  if (auth.isAuthenticated()) {
    return <Redirect to="/" />;
  }

  return (
    <>
      <Visor title={route.title} location={location.pathname} />
      {user ? (
        <PasswordResetForm token={token} user={user} />
      ) : (
        <Form onSubmit={onSubmit}>
          <h1>Reset Password</h1>
          {error &&
            error.map((err) => (
              <Alert variant="danger" key={err}>
                {ERRORS[err]}
              </Alert>
            ))}
          <Form.Control
            value={token}
            placeholder="Token"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setToken(e.currentTarget.value);
            }}
          />
          <Button
            type="submit"
            disabled={reqInfo.state === RequestState.Running}
          >
            {reqInfo.state === RequestState.Running ? (
              <Loader variant="spinner" />
            ) : (
              "Submit"
            )}
          </Button>
        </Form>
      )}
    </>
  );
};

export default PasswordReset;
