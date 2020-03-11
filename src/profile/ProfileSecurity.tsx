import React, { useReducer } from "react";
import { Button, Form, Row, Col, OverlayTrigger, Popover, Alert } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import ERRORS from "../shared/errors";
import { ProfileAction, profileReducer, ProfileState } from "./Profile";

interface ChangedPassword {
  cur_password?: string;
  new_password?: string;
  repeat_password?: string;
}

interface ProfileSecurityState extends ProfileState {
  changedPassword: ChangedPassword;
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

  const [state, dispatch] = useReducer((state: ProfileSecurityState, action: ProfileAction<ChangedPassword>) => {
    switch (action.type) {
    case 'done loading success':
      return {
        ...state,
        isLoading: false,
        generalErrors: [],
        successMessage: "Password successfully changed!",
        changedPassword: {}
      };
    case 'set data':
      return {
        ...state,
        changedPassword: { ...state.changedPassword, ...action.data },
        errors: { ...state.errors, ...action.errors }
      };
    default:
      return profileReducer(state, action);
    }
  }, {
    changedPassword: {},
    errors: {},
    generalErrors: [],
    successMessage: "",
    isLoading: false
  });

  const onPasswordChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = evt.currentTarget;
    switch (name) {
      case "cur_password":
        dispatch({
          type: 'set data',
          data: { cur_password: value },
          errors: { user: [] }
        });
        break;
      case "new_password": {
        let newErrors: string[] = [];

        if (value.length < 8) {
          newErrors.push("USER.PASSWORD.TOO_SHORT.8");
        }

        if (/^\d*$/.test(value)) {
          newErrors.push("USER.PASSWORD.ENTIRELY_NUMERIC");
        }

        if (value !== state.changedPassword.repeat_password && state.changedPassword.repeat_password?.length) {
          newErrors.push("USER.PASSWORD.MUST_MATCH");
        }

        dispatch({
          type: 'set data',
          data: { new_password: value },
          errors: { password: newErrors }
        });
        break;
      }
      case "repeat_password": {
        let errors = new Set(state.errors.password);

        if (value !== state.changedPassword.new_password) {
          errors.add("USER.PASSWORD.MUST_MATCH");
        } else {
          errors.delete("USER.PASSWORD.MUST_MATCH");
        }

        dispatch({
          type: 'set data',
          data: {repeat_password: value},
          errors: {
            password: Array.from(errors)
          }
        });
        break;
      }
    }
  };

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (Object.values(state.errors).flat().length) {
      dispatch({ type: 'set general error', errors: [ERRORS.FORMS.NOT_YET_VALID] });
      return;
    }

    dispatch({ type: 'is loading' });

    auth.post<ChangedPassword>("user/update", state.changedPassword, true)
      .then(() => {
        dispatch({ type: 'done loading success' });
      }, (err: UserAPIError | string | string[]) => {
        dispatch({ type: 'done loading error', errors: err });
      });
  };

  return (
    <Form noValidate onSubmit={onSubmit}>
      {state.generalErrors.length > 0 && state.generalErrors.map(err =>
        <Alert key={err} variant="danger">{ERRORS[err]}</Alert>)}

      {state.successMessage.length > 0 &&
      <Alert variant="success" onClose={() => dispatch({ type: 'set success message', message: '' })} dismissible>
        {state.successMessage}
      </Alert>}

      <h3>Change password</h3>

      <Form.Group as={Row} controlId="profileCurPassword">
        <Form.Label column sm={3}>Current password</Form.Label>
        <Col sm={9}>
          <Form.Control
            type="password"
            name="cur_password"
            onChange={onPasswordChange}
            isInvalid={state.errors.user && state.errors.user.length > 0}
            value={state.changedPassword?.cur_password ?? ''} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.user?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
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
            isInvalid={state.errors.password && state.errors.password.length > 0}
            value={state.changedPassword?.new_password ?? ''} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.password?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
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
            isInvalid={state.errors.password && state.errors.password.includes("USER.PASSWORD.MUST_MATCH")}
            value={state.changedPassword?.repeat_password ?? ''} />
        </Col>
      </Form.Group>

      <Button type="submit" disabled={
        state.isLoading ||
        Object.values(state.errors).flat().length > 0 ||
        state.changedPassword.cur_password === undefined ||
        state.changedPassword.cur_password?.length == 0
      }>
        {state.isLoading ? "Saving..." : "Save"}
      </Button>
    </Form>
  );
};

export default ProfileSecurity;
