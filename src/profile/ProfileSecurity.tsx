import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, OverlayTrigger, Popover, Alert } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../shared/ToastContext";
import ERRORS from "../shared/errors";

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

const ProfileSecurity = ({ user } : { user: User }) => {
  const auth = useAuth();
  const toast = useToast();

  const [changedPassword, setChangedPassword] = useState<ChangedPassword>({});
  const [errors, setErrors] = useState<UserAPIError>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);

  const onPasswordChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = evt.currentTarget;
    setChangedPassword(prevState => {
      switch (name) {
        case "cur_password":
          setErrors(prevErrors => ({
            ...prevErrors,
            user: []
          }));
          prevState.cur_password = value;
          break;
        case "new_password": {
          const newErrors: string[] = [];

          if (value.length < 8) {
            newErrors.push("USER.PASSWORD.TOO_SHORT.8");
          }

          if (/^\d*$/.test(value)) {
            newErrors.push("USER.PASSWORD.ENTIRELY_NUMERIC");
          }

          if (value !== prevState.repeat_password && prevState.repeat_password?.length) {
            newErrors.push("USER.PASSWORD.MUST_MATCH");
          }

          setErrors(prevErrors => ({
            ...prevErrors,
            password: newErrors
          }));
          prevState.new_password = value;
          break;
        }
        case "repeat_password": {
          setErrors(prevErrors => ({
            ...prevErrors,
            password: value != prevState.new_password ? ["USER.PASSWORD.MUST_MATCH"] : []
          }));
          prevState.repeat_password = value;
          break;
        }
      }
      return prevState;
    })
  };

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (Object.values(errors).flat().length) {
      toast.addToasts([{
        id: Math.random().toString(),
        body: ERRORS.FORMS.NOT_YET_VALID,
        delay: 3000
      }]);
      return;
    }

    setLoading(true);

    auth.post<ChangedPassword>("user/update", changedPassword, true)
      .then(() => {
        toast.addToasts([
          {
            id: Math.random().toString(),
            body: "Password saved!",
            delay: 3000
          }
        ]);
        setLoading(false);
        setGeneralErrors([]);
        setChangedPassword({});
      }, (err: UserAPIError | string[]) => {
        if (Array.isArray(err)) {
          setGeneralErrors(err);
        } else {
          setGeneralErrors([]);
          setErrors(err);
        }
        setLoading(false);
      });
  };

  return (
    <Form noValidate onSubmit={onSubmit}>
      <h2>Security</h2>

      {generalErrors.length > 0 && generalErrors.map(err => <Alert key={err} variant="danger">{ERRORS[err]}</Alert>)}

      <h3>Change password</h3>

      <Form.Group as={Row} controlId="profileCurPassword">
        <Form.Label column sm={3}>Current password</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="cur_password"
            onChange={onPasswordChange}
            isInvalid={errors.user && errors.user.length > 0}
            value={changedPassword?.cur_password ?? ''} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {errors.user?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="profileNewPassword">
        <Form.Label column sm={3}>
          New password
          <OverlayTrigger trigger="hover" placement="right" overlay={password_info}>
            <span>(i)</span>
          </OverlayTrigger>
        </Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="new_password"
            onChange={onPasswordChange}
            isInvalid={errors.password && errors.password.length > 0}
            value={changedPassword?.new_password ?? ''} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {errors.password?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="profileRepeatPassword">
        <Form.Label column sm={3}>Repeat password</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="repeat_password"
            onChange={onPasswordChange}
            isInvalid={errors.password && errors.password.includes("USER.PASSWORD.MUST_MATCH")}
            value={changedPassword?.repeat_password ?? ''} />
        </Col>
      </Form.Group>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </Form>
  );
};

export default ProfileSecurity;
