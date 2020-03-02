import React, { useReducer } from "react";
import { Button, Form, Row, Col, Alert } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../shared/ToastContext";
import ERRORS from "../shared/errors";
import { ProfileAction, profileReducer, ProfileState } from "./Profile";

interface ChangedUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_editor?: boolean;
  writer_name?: string;
}

interface ProfileGeneralState extends ProfileState {
  changedUser: ChangedUser;
}

const ProfileGeneral = ({ user } : { user: User }) => {
  const auth = useAuth();
  const toast = useToast();

  const [state, dispatch] = useReducer((state: ProfileGeneralState, action: ProfileAction<ChangedUser>) => {
    switch (action.type) {
    case 'set data':
      return {
        ...state,
        changedUser: { ...state.changedUser, ...action.data },
        errors: { ...state.errors, ...action.errors }
      };
    default:
      return profileReducer(state, action);
    }
  }, {
    changedUser: { is_editor: user.is_editor },
    errors: {},
    generalErrors: [],
    isLoading: false
  });

  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const { name, value, checked } = evt.currentTarget;
    switch (name) {
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
              first_name: names.slice(0, -1).join(" "),
              last_name: names[names.length - 1]
            }
          });
        } else {
          dispatch({
            type: 'set data',
            data: {
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
          errors: { writer_name: value.length ? ["USER.WRITER_NAME.EMPTY"] : [] }
        });
        break;
      case "is_editor":
        dispatch({
          type: 'set data',
          data: { is_editor: checked }
        });
        break;
    }
  };

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (Object.values(state.errors).flat().length) {
      toast.addToasts([{
        id: Math.random().toString(),
        body: ERRORS.FORMS.NOT_YET_VALID,
        delay: 3000
      }]);
      return;
    }

    dispatch({ type: 'is loading' });

    auth.post<ChangedUser>("user/update", state.changedUser, user.username === auth.user?.username)
      .then(() => {
        toast.addToasts([
          {
            id: Math.random().toString(),
            body: "Profile saved!",
            delay: 3000
          }
        ]);
        dispatch({ type: 'done loading success' });
      }, (err: UserAPIError | string | string[]) => {
        dispatch({ type: 'done loading error', errors: err });
      });
  };

  return (
    <Form noValidate onSubmit={onSubmit}>
      <h2>General settings</h2>

      {state.generalErrors.length > 0 && state.generalErrors.map(err =>
        <Alert key={err} variant="danger">{ERRORS[err]}</Alert>)}

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
            onChange={onChange}
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
            defaultValue={`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`}
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
            onChange={onChange}
            isInvalid={state.errors.writer_name && state.errors.writer_name.length > 0}/>
          <Form.Control.Feedback type="invalid">
            <ul>
              {state.errors.writer_name?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      {auth.isEditor() && <Form.Group as={Row} controlId="profileIsEditor">
        <Form.Label column sm={2}>Editor privileges</Form.Label>
        <Col sm={10}>
          <Form.Check
            name="is_editor"
            aria-label="Editor privileges"
            onChange={onChange}
            checked={state.changedUser.is_editor}
            disabled={auth.user === user && !user.is_staff} />
        </Col>
      </Form.Group>}

      <Button type="submit" disabled={state.isLoading}>
        {state.isLoading ? "Saving..." : "Save"}
      </Button>
    </Form>
  );
};

export default ProfileGeneral;
