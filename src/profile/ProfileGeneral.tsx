import React, { useState, useEffect } from "react";
import { Button, Form, Row, Col, Alert } from "react-bootstrap";
import { User, UserAPIError } from "../shared/types"
import { useAuth } from "../auth/AuthProvider";
import { useToast } from "../shared/ToastContext";
import ERRORS from "../shared/errors";

export interface ChangedUser {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_editor?: boolean;
  writer_name?: string;
}

const ProfileGeneral = ({ user } : { user: User }) => {
  const auth = useAuth();
  const toast = useToast();

  const [changedUser, setChangedUser] = useState<ChangedUser>({});
  const [errors, setErrors] = useState<UserAPIError>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState<string>(`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`);

  useEffect(() => {
    setName(`${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`);
  }, [user.first_name, user.last_name]);

  const onChange = (evt: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = evt.currentTarget;
    setChangedUser(_prevState => {
      const prevState = Object.assign(_prevState);
      switch (name) {
        case "email": {
          // check validity
          const newErrors: string[] = [];

          if (!/^\S+@\S+(\.[a-z]+)+$/.test(value)) {
            newErrors.push("USER.EMAIL.INVALID");
          }

          setErrors(prevErrors => ({
            ...prevErrors,
            email: newErrors
          }));
          prevState.email = value;
          break;
        }
        case "name": {
          const names = value.split(" ");
          if (names.length > 1) {
            prevState.first_name = names.slice(0, -1).join(" ");
            prevState.last_name = names[names.length - 1];
          } else {
            prevState.first_name = names[0];
            prevState.last_name = "";
          }
          break;
        }
        case "writer_name":
          setErrors(prevErrors => ({
            ...prevErrors,
            writer_name: value.length ? ["USER.WRITER_NAME.EMPTY"] : []
          }));
          prevState.writer_name = value;
          break;
      }
      return prevState;
    });
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

    auth.post<ChangedUser>("user/update", changedUser, user.username === auth.user?.username)
      .then(() => {
        toast.addToasts([
          {
            id: Math.random().toString(),
            body: "Profile saved!",
            delay: 3000
          }
        ]);
        setLoading(false);
        setGeneralErrors([]);
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
      <h2>General settings</h2>

      {generalErrors.length > 0 && generalErrors.map(err => <Alert key={err} variant="danger">{ERRORS[err]}</Alert>)}

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
            isInvalid={errors.email && errors.email.length > 0} />
          <Form.Control.Feedback type="invalid">
            <ul>
              {errors.email?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
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
            onChange={onChange}
            isInvalid={errors.writer_name && errors.writer_name.length > 0}/>
          <Form.Control.Feedback type="invalid">
            <ul>
              {errors.writer_name?.map((msg) => <li key={msg}>{ERRORS[msg]}</li>)}
            </ul>
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save"}
      </Button>
    </Form>
  );
};

export default ProfileGeneral;
