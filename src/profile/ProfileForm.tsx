import React, { useEffect, useState } from "react";
import { User, APIResponse, AuthContext, UserAPIError } from "../shared/types";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";
import { FormContextValues, useForm } from "react-hook-form";
import Field from "../shared/form/Field";

import axios, { AxiosError } from "axios";
import { getApiUrl } from "../api/api";
import { useAuth } from "../auth/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import nanoid from "nanoid";
import { cleanFormData } from "../shared/form/util";

export interface ProfileFormVals {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_editor?: boolean;
  writer_name?: string;
  cur_password?: string;
  password?: string;
}

export const useProfileForm = (user?: User) => {
  return useForm<ProfileFormVals>({
    mode: "onBlur",
    reValidateMode: "onBlur",
  });
};

const validateUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const resp = await axios.get<APIResponse<void>>(
    getApiUrl(`users/${username}/query/`),
    {
      validateStatus: () => true,
    }
  );
  return resp.data.success;
};

interface ProfileFormProps {
  user?: User;
  formId?: string;
  context: FormContextValues<ProfileFormVals>;
  onSubmit?: (
    vals: ProfileFormVals,
    e?: React.BaseSyntheticEvent
  ) => Promise<void>;
  hideSubmit?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = (props: ProfileFormProps) => {
  const auth = useAuth();

  // react-hook-form caches default values when the first time you call useForm.
  // So, we have to manually replicate the defaultValues behaviour by resetting the form values ourselves
  // whenever user changes
  useEffect(() => {
    props.context.reset({
      username: props.user?.username,
      first_name: props.user?.first_name,
      last_name: props.user?.last_name,
      email: props.user?.email,
      is_editor: props.user?.is_editor || false,
      writer_name: props.user?.writer_name,
    });
  }, [props.user, props.context.reset]);

  // manually register the is_editor field since we handle it with a select
  useEffect(() => {
    props.context.register({
      name: "is_editor",
    });
  }, []);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const submit = async (vals: ProfileFormVals) => {
    const cleaned = cleanFormData(vals);

    const editingMe = props.user?.username === auth.user?.username;
    try {
      if (props.user === undefined) {
        await auth.post<ProfileFormVals>("users/", cleaned);
      } else {
        await auth.patch<ProfileFormVals>(
          editingMe ? "me/" : `users/${vals?.username}/`,
          cleaned,
          editingMe
        );
      }
    } catch (err) {
      const apiErrors = err as UserAPIError;
      props.context.setError(
        apiErrors.cur_password.map((error) => ({
          name: "cur_password",
          type: "server_error",
          message: error,
        }))
      );
    }

    if (props.onSubmit) {
      await props.onSubmit(vals);
    }
  };

  return (
    <Form id={props.formId} onSubmit={props.context.handleSubmit(submit)}>
      <Form.Group as={Row} controlId="username">
        <Form.Label column sm={2}>
          Username:
        </Form.Label>
        <Col sm={10}>
          <Field
            errors={props.context.errors}
            type="text"
            name="username"
            disabled={props.user !== undefined}
            validMessage={"This username is valid."}
            isValid={
              props.context.formState.dirtyFields.has("username") &&
              !props.context.errors["username"]
            }
            ref={props.context.register({
              maxLength: {
                value: 150,
                message: "USER.USERNAME.TOO_LONG",
              },
              required: true,
              validate: async (username: string) => {
                if (props.user !== undefined) {
                  // if we're editing a user the field is disabled anyway, don't validate
                  return;
                }
                if (!(await validateUsernameAvailable(username))) {
                  return Promise.resolve("USER.USERNAME.ALREADY_EXISTS");
                }
              },
            })}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm={2}>
          Name:
        </Form.Label>
        <Col sm={5}>
          <Field
            errors={props.context.errors}
            type="text"
            name="first_name"
            placeholder="First Name"
            ref={props.context.register({
              maxLength: {
                value: 30,
                message: "USER.FIRST_NAME.TOO_LONG.30",
              },
              required: true,
            })}
          />
        </Col>
        <Col sm={5}>
          <Field
            errors={props.context.errors}
            type="text"
            name="last_name"
            placeholder="Last Name"
            ref={props.context.register({
              maxLength: {
                value: 150,
                message: "USER.LAST_NAME.TOO_LONG.150",
              },
              required: true,
            })}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="email">
        <Form.Label column sm={2}>
          Email:
        </Form.Label>
        <Col sm={10}>
          <Field
            errors={props.context.errors}
            type="email"
            name="email"
            ref={props.context.register({
              required: "USER.REQUIRED.EMAIL",
              maxLength: {
                value: 254,
                message: "USER.EMAIL.TOO_LONG.254",
              },
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "USER.EMAIL.INVALID",
              },
            })}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId="writerName">
        <Form.Label column sm={2}>
          Writer Name:
        </Form.Label>
        <Col sm={10}>
          <Field
            errors={props.context.errors}
            type="text"
            name="writer_name"
            ref={props.context.register}
          />
        </Col>
      </Form.Group>
      {auth.user?.is_editor && (
        <Form.Group as={Row} controlId="isEditor">
          <Form.Label column sm={2}>
            Status:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                if (e.currentTarget.value === "editor") {
                  props.context.setValue("is_editor", true);
                } else if (e.currentTarget.value === "contributor") {
                  props.context.setValue("is_editor", false);
                }
              }}
              value={
                props.context.getValues().is_editor ? "editor" : "contributor"
              }
            >
              <option value="contributor">Contributor</option>
              <option value="editor">Editor</option>
            </Form.Control>
          </Col>
        </Form.Group>
      )}
      {props.user !== undefined && !auth.user?.is_editor && (
        <>
          <h3>Change Password</h3>
          <Form.Group as={Row} controlId="curPassword">
            <Form.Label column sm={2}>
              Current Password:
            </Form.Label>
            <Col sm={10}>
              <Field
                errors={props.context.errors}
                type="password"
                name="cur_password"
                ref={props.context.register({
                  validate: (password: string) => {
                    if (
                      props.user !== undefined &&
                      props.context.getValues().password &&
                      !props.context.getValues().cur_password
                    ) {
                      return "USER.PASSWORD.CURRENT_REQUIRED";
                    }
                  },
                })}
              />
            </Col>
          </Form.Group>
        </>
      )}
      <Form.Group as={Form.Row} controlId="password">
        <Form.Label column sm={2}>
          New Password:
        </Form.Label>
        <Col sm={2}>
          <Button
            className="w-100"
            onClick={() => {
              props.context.setValue("password", nanoid());
              // set the password visible so you can see what you get
              setShowPassword(true);
            }}
          >
            Generate
          </Button>
        </Col>
        <Col sm={8}>
          <InputGroup>
            <Field
              errors={props.context.errors}
              type={showPassword ? "text" : "password"}
              name="password"
              ref={props.context.register({
                minLength: {
                  value: 8,
                  message: "USER.PASSWORD.TOO_SHORT.8",
                },
                validate: (password?: string) => {
                  // the pattern argument doesn't let us return an error if the value FAILS a regex,
                  // so we'll do it ourselves
                  if (password && /^\d*$/.test(password)) {
                    return "USER.PASSWORD.ENTIRELY_NUMERIC";
                  }
                },
              })}
            />
            <Button
              onClick={() => {
                setShowPassword((show) => !show);
              }}
            >
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </Button>
          </InputGroup>
        </Col>
      </Form.Group>
      {!props.hideSubmit && (
        <Button type="submit" disabled={props.context.formState.isSubmitting}>
          {props.context.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      )}
    </Form>
  );
};

export default ProfileForm;
