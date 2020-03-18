import axios from "axios";
import React, { forwardRef, useImperativeHandle, useReducer, useRef, useState } from "react";
import { Button, Form, Row, Col, Alert, OverlayTrigger, Popover, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import nanoid from "nanoid";

import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import ERRORS from "../shared/errors";
import { getApiUrl } from "../api/api";

interface ChangedUser {
  username?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_editor?: boolean;
  writer_name?: string;
  cur_password?: string;
  password?: string;
}

interface ProfileState {
  errors: UserAPIError;
  generalErrors: string[];
  successMessage: string;
  isLoading: boolean;
  isChecking: boolean;
  changedUser: ChangedUser;
}

type ProfileAction =
  { type: 'is loading' } |
  { type: 'is checking' } |
  { type: 'done checking' } |
  { type: 'done loading success' } |
  { type: 'done loading error', errors: UserAPIError | string } |
  { type: 'set error', errors: UserAPIError } |
  { type: 'set general error', errors: string[] } |
  { type: 'set success message', message: string } |
  { type: 'set data', data: ChangedUser, errors?: UserAPIError };

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
  case 'is loading':
    return { ...state, isLoading: true };
  case 'is checking':
    return { ...state, isChecking: true };
  case 'done checking':
    return { ...state, isChecking: false };
  case 'done loading success':
    return {
      ...state,
      isLoading: false,
      isChecking: false,
      generalErrors: [],
      successMessage: "Profile successfully saved!",
      changedUser: 'is_editor' in state.changedUser ? { is_editor: state.changedUser.is_editor } : {}
    };
  case 'done loading error':
    if (typeof action.errors === 'string') {
      // definitely a authentication error; this is the only time we'd throw a string
      // TODO: insert login flow
      return { ...state, isLoading: false, isChecking: false, };
    } else {
      const { detail, ...errors } = action.errors;
      return { ...state, isLoading: false, isChecking: false, generalErrors: detail ?? [], errors };
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
  case 'set data':
    return {
      ...state,
      isChecking: false,
      changedUser: { ...state.changedUser, ...action.data },
      errors: { ...state.errors, ...action.errors }
    };
  }
  return state;
};

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

const ProfileForm: React.FC<{
  user?: User,
  renderFooter?: (isLoading: boolean, hasErrors: boolean) => React.ReactNode
}> = (
  { user, renderFooter },
  ref: React.RefObject<unknown>
) => {
  const auth = useAuth();
  const checkUsernameRef = useRef<number>();
  const [showPassword, setShowPassword] = useState(false);
  const [state, dispatch] = useReducer(profileReducer, {
    changedUser: auth.isEditor() ? { is_editor: user?.is_editor ?? false } : {},
    errors: {},
    generalErrors: [],
    successMessage: "",
    isLoading: false,
    isChecking: false
  });

  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = evt.currentTarget;
    switch (name) {
    case "username": {
      if (user === undefined) {
        dispatch({ type: 'is checking' });
        window.clearTimeout(checkUsernameRef.current);

        if (value.length > 0 && value.length <= 150) {
          dispatch({
            type: 'set data',
            data: { username: value }
          });
          checkUsernameRef.current = window.setTimeout(() => {
            axios.get<{ success: boolean }>(getApiUrl(`users/${value}/query/`))
              .then(resp => {
                if (resp.data.success) {
                  dispatch({
                    type: 'set error',
                    errors: { username: [] }
                  });
                } else {
                  dispatch({
                    type: 'set error',
                    errors: { username: ["USER.USERNAME.ALREADY_EXISTS"] }
                  });
                }
              });
          }, 200);
        } else {
          dispatch({
            type: 'set data',
            data: { username: value.slice(0, 150) },
            errors: { username: value.length > 150 ? ["USER.USERNAME.TOO_LONG"] : [] }
          });
        }
        break;
      } else {
        dispatch({
          type: 'set error',
          errors: { email: ["USER.USERNAME.CANNOT_CHANGE"] }
        });
        break;
      }
    }
    case "email": {
      // check validity
      let newErrors: string[] = [];

      if (!/^\S+@\S+(\.[a-z]+)+$/.test(value)) {
        newErrors.push("USER.EMAIL.INVALID");
      }

      dispatch({
        type: 'set data',
        data: { email: value },
        errors: { email: newErrors }
      });
      break;
    }
    case "name": {
      const names = value.split(" ");
      if (names.length > 1) {
        dispatch({
          type: 'set data',
          data: {
            name: value,
            first_name: names.slice(0, -1).join(" "),
            last_name: names[names.length - 1]
          }
        });
      } else {
        dispatch({
          type: 'set data',
          data: {
            name: value,
            first_name: names[0],
            last_name: ""
          }
        });
      }
      break;
    }
    case "writer_name":
      dispatch({
        type: 'set data',
        data: { writer_name: value },
        errors: { writer_name: value.length === 0 ? ["USER.REQUIRED.writer_name"] : [] }
      });
      break;
    case "is_editor":
      dispatch({
        type: 'set data',
        data: { is_editor: value === "true" }
      });
      break;
    case "cur_password":
      dispatch({
        type: 'set data',
        data: { cur_password: value },
        errors: { user: [] }
      });
      break;
    case "password": {
      let newErrors: string[] = [];

      if (value.length === 0) {
        dispatch({
          type: 'set data',
          data: { password: undefined },
          errors: { password: [] }
        });
        break;
      }

      if (value.length < 8) {
        newErrors.push("USER.PASSWORD.TOO_SHORT.8");
      }

      if (/^\d*$/.test(value)) {
        newErrors.push("USER.PASSWORD.ENTIRELY_NUMERIC");
      }

      dispatch({
        type: 'set data',
        data: { password: value },
        errors: { password: newErrors }
      });
      break;
    }
    }
  };

  const onSubmit = (evt?: React.FormEvent<HTMLFormElement>) => {
    evt?.preventDefault();

    if ((Object.keys(state.changedUser) as Array<keyof ChangedUser>).every((k) =>
        state.changedUser[k] === undefined || (k == 'is_editor' && state.changedUser[k] == user?.is_editor))) {
      return Promise.resolve();
    }

    if (Object.values(state.errors).flat().length) {
      dispatch({ type: 'set general error', errors: [ERRORS.FORMS.NOT_YET_VALID] });
      return Promise.reject();
    }

    dispatch({ type: 'is loading' });

    return (user === undefined ?
      auth.post<ChangedUser>(
        "users/",
        state.changedUser,
      ) :
      auth.patch<ChangedUser>(
        user === auth.user ?
          "me/" :
          `users/${user?.username}/`,
        state.changedUser,
        user === auth.user
      )
    )
      .then(() => {
        dispatch({ type: 'done loading success' });
      }, (err: UserAPIError | string) => {
        dispatch({ type: 'done loading error', errors: err });
      });
  };

  useImperativeHandle(ref, () => ({
    submit: onSubmit
  }));

  return (
    <Form noValidate onSubmit={onSubmit}>
      {state.generalErrors.length > 0 && state.generalErrors.map(err =>
        <Alert key={err} variant="danger">{ERRORS[err]}</Alert>)}

      {state.successMessage.length > 0 &&
      <Alert variant="success" onClose={() => dispatch({ type: 'set success message', message: '' })} dismissible>
        {state.successMessage}
      </Alert>}

      <Form.Group as={Row} controlId="profileUsername">
        <Form.Label column sm={2}>Username</Form.Label>
        <Col sm={10}>
          {user !== undefined ?
            <Form.Control readOnly defaultValue={user?.username} /> :
            <>
              <Form.Control
                name="username"
                required
                value={state.changedUser.username ?? ""}
                onChange={onChange}
                isValid={(state.changedUser.username?.length ?? 0) > 0 && state.errors.username?.length === 0}
                isInvalid={state.errors.username && state.errors.username.length > 0} />
              <Form.Control.Feedback>Username is valid and is available.</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                <ul>
                  {state.errors.username?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
                </ul>
              </Form.Control.Feedback>
            </>}
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
            value={state.changedUser.email ?? user?.email ?? ""}
            onChange={onChange}
            isValid={(state.changedUser.email?.length ?? 0) > 0}
            isInvalid={state.errors.email && state.errors.email.length > 0} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.email?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="profileFirstLastName">
        <Form.Label column sm={2}>Name</Form.Label>
        <Col sm={10}>
          <Form.Control
            name="name"
            placeholder="e.g. Johnny Appleseed"
            value={state.changedUser.name ?? (user ?
              `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}` :
              "")}
            onChange={onChange}
            isValid={'first_name' in state.changedUser} />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="profileWriterName">
        <Form.Label column sm={2}>Writer name</Form.Label>
        <Col sm={10}>
          <Form.Control
            name="writer_name"
            placeholder="e.g. Grower of Apples"
            value={state.changedUser.writer_name ?? user?.writer_name ?? ""}
            onChange={onChange}
            isValid={(state.changedUser.writer_name?.length ?? 0) > 0}
            isInvalid={state.errors.writer_name && state.errors.writer_name.length > 0}/>
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.writer_name?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      {auth.isEditor() &&
      <Form.Group as={Row} controlId="profileIsEditor">
        <Form.Label column sm={2}>Role</Form.Label>
        <Col sm={10}>
          {/* NOTE: The custom attribute hasn't landed yet; it's here for future-compat. In the meantime, we add a
              custom class instead. */}
          <Form.Control
            as="select"
            name="is_editor"
            onChange={onChange}
            value={state.changedUser.is_editor?.toString()}
            disabled={auth.user?.username === user?.username && !user?.is_staff}
            className="custom-select"
            custom
          >
            <option value="false">Contributor</option>
            <option value="true">Editor</option>
          </Form.Control>
        </Col>
      </Form.Group>}

      <h3>Change password</h3>

      {auth.user === user &&
      <Form.Group as={Row} controlId="profileCurPassword">
        <Form.Label column sm={2}>Current password</Form.Label>
        <Col sm={10}>
          <Form.Control
            type="password"
            name="cur_password"
            onChange={onChange}
            isInvalid={state.errors.user && state.errors.user.length > 0}
            value={state.changedUser?.cur_password ?? ''} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.user?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>}

      <Form.Group as={Row} controlId="profileNewPassword">
        <Form.Label column sm={2}>
          New password
          <OverlayTrigger placement="right" overlay={password_info}>
            <span>(i)</span>
          </OverlayTrigger>
        </Form.Label>
        <Col sm={10}>
          <Form.Row>
            <Col sm="auto">
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch({
                    type: 'set data',
                    data: { password: nanoid() },
                    errors: { password: [] }
                  });
                  setShowPassword(true);
                }}
              >
                Generate
              </Button>
            </Col>
            <Col>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  onChange={onChange}
                  isInvalid={state.errors.password && state.errors.password.length > 0}
                  value={state.changedUser?.password ?? ''} />
                <InputGroup.Append>
                  <Button
                    variant={showPassword ? "primary" : "outline-secondary"}
                    onClick={() => { setShowPassword(s => !s) }}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                </InputGroup.Append>
              </InputGroup>
              <Form.Control
                type="hidden"
                isInvalid={state.errors.password && state.errors.password.length > 0}
                value={state.changedUser?.password} />
              <Form.Control.Feedback type="invalid">
                <ul>
                  {state.errors.password?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
                </ul>
              </Form.Control.Feedback>
            </Col>
          </Form.Row>
        </Col>
      </Form.Group>

      {renderFooter ?
        renderFooter(state.isLoading, state.isChecking || Object.values(state.errors).flat().length > 0) :
        <Button
          type="submit"
          disabled={state.isLoading || state.isChecking || Object.values(state.errors).flat().length > 0}
        >
          {state.isLoading ? "Saving..." : "Save"}
        </Button>}
    </Form>
  );
};

export default forwardRef(ProfileForm);
