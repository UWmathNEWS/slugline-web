import React, { useEffect, useState } from "react";
import { User, APIResponse, UserAPIError } from "../shared/types";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { FormContextValues, useForm } from "react-hook-form";
import Field from "../shared/form/Field";

import axios from "axios";
import { getApiUrl } from "../api/api";
import { useAuth } from "../auth/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import nanoid from "nanoid";
import { cleanFormData } from "../shared/form/util";
import { useDebouncedCallback } from "../shared/hooks";
import NonFieldErrors from "../shared/form/NonFieldErrors";

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
  onSubmitSuccessful?: (vals: ProfileFormVals) => void | Promise<void>;
  onSubmitFailed?: (
    vals: ProfileFormVals,
    error: UserAPIError
  ) => void | Promise<void>;
  hideSubmit?: boolean;
}

interface ProfileConsumerFormProps extends ProfileFormProps {
  context: FormContextValues<ProfileFormVals>;
}

export const ProfileFormConsumer: React.FC<ProfileConsumerFormProps> = (
  props: ProfileConsumerFormProps
) => {
  const auth = useAuth();

  const { reset, register } = props.context;

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [generalErrors, setGeneralErrors] = useState<string[] | undefined>(
    undefined
  );

  // react-hook-form caches default values when the first time you call useForm.
  // So, we have to manually replicate the defaultValues behaviour by resetting the form values ourselves
  // whenever user changes
  useEffect(() => {
    reset({
      username: props.user?.username,
      first_name: props.user?.first_name,
      last_name: props.user?.last_name,
      email: props.user?.email,
      is_editor: props.user?.is_editor || false,
      writer_name: props.user?.writer_name,
    });
  }, [props.user, reset]);

  // manually register the is_editor field since we handle it with a select
  useEffect(() => {
    register({
      name: "is_editor",
    });
  }, [register]);

  const [validateUserNameDebounced] = useDebouncedCallback(
    validateUsernameAvailable,
    250
  );

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const submit = async (vals: ProfileFormVals) => {
    const cleaned = cleanFormData(vals);

    const editingMe = props.user?.username === auth.user?.username;
    try {
      if (props.user === undefined) {
        await auth.post<ProfileFormVals>("users/", cleaned);
        setSuccessMessage(`User ${vals.username} created successfully.`);
        // refresh the form so we can add a new user
        props.context.reset();
      } else {
        await auth.patch<ProfileFormVals>(
          editingMe ? "me/" : `users/${vals?.username}/`,
          cleaned,
          editingMe
        );
        setSuccessMessage(`User ${vals.username} saved successfully.`);
      }
      setGeneralErrors(undefined);
      if (props.onSubmitSuccessful) {
        await props.onSubmitSuccessful(vals);
      }
    } catch (err) {
      const apiErrors = err as UserAPIError;
      props.context.setError(
        apiErrors.cur_password?.map((error) => ({
          name: "cur_password",
          type: "server_error",
          message: error,
        })) || []
      );
      props.context.setError(
        apiErrors.password?.map((error) => ({
          name: "password",
          type: "server_error",
          message: error,
        })) || []
      );
      setSuccessMessage(undefined);
      setGeneralErrors(apiErrors.detail);
      if (props.onSubmitFailed) {
        await props.onSubmitFailed(vals, apiErrors);
      }
    }
  };

  return (
    <>
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => {
            setSuccessMessage(undefined);
          }}
        >
          {successMessage}
        </Alert>
      )}
      <Form id={props.formId} onSubmit={props.context.handleSubmit(submit)}>
        <Form.Group as={Row} controlId="username">
          <Form.Label column sm={2}>
            Username
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
              onChange={async () => {
                await props.context.triggerValidation("username");
              }}
              ref={props.context.register({
                maxLength: {
                  value: 150,
                  message: "USER.USERNAME.TOO_LONG",
                },
                required: "USER.REQUIRED.username",
                validate: async (username: string) => {
                  if (props.user !== undefined) {
                    // if we're editing a user the field is disabled anyway, don't validate
                    return;
                  }
                  if (!(await validateUserNameDebounced(username))) {
                    return Promise.resolve("USER.USERNAME.ALREADY_EXISTS");
                  }
                },
              })}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm={2}>
            Name
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
                required: "USER.REQUIRED.first_name",
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
              })}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="email">
          <Form.Label column sm={2}>
            Email
          </Form.Label>
          <Col sm={10}>
            <Field
              errors={props.context.errors}
              type="email"
              name="email"
              ref={props.context.register({
                required: "USER.REQUIRED.email",
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
            Writer Name
          </Form.Label>
          <Col sm={10}>
            <Field
              errors={props.context.errors}
              type="text"
              name="writer_name"
              ref={props.context.register({
                required: "USER.REQUIRED.writer_name",
              })}
            />
          </Col>
        </Form.Group>
        {auth.isEditor() && (
          <Form.Group as={Row} controlId="isEditor">
            <Form.Label column sm={2}>
              Role
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
                className="custom-select"
                custom
              >
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
              </Form.Control>
            </Col>
          </Form.Group>
        )}
        {(props.user !== undefined && !auth.user?.is_editor) ||
          (props.user?.username === auth.user?.username && (
            <>
              <h3>Change Password</h3>
              <Form.Group as={Row} controlId="curPassword">
                <Form.Label column sm={2}>
                  Current Password
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
          ))}
        <Form.Group as={Form.Row} controlId="password">
          <Form.Label column sm={2}>
            New Password
          </Form.Label>
          <Col sm={2}>
            <Button
              className="w-100"
              variant="secondary"
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
                  if (props.context.getValues().cur_password && !password) {
                    return "USER.PASSWORD.NEW_REQUIRED";
                  }
                },
              })}
              onChange={async () => {
                await props.context.triggerValidation("password");
              }}
              append={
                <Button
                  variant={
                    showPassword ? "outline-primary" : "outline-secondary"
                  }
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
              }
            />
          </Col>
        </Form.Group>
        <NonFieldErrors errors={generalErrors || []} />
        {!props.hideSubmit && (
          <Button
            type="submit"
            disabled={
              props.context.formState.isSubmitting ||
              !props.context.formState.isValid
            }
          >
            {props.context.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        )}
      </Form>
    </>
  );
};

const ProfileForm: React.FC<ProfileFormProps> = (props: ProfileFormProps) => {
  const context = useProfileForm(props.user);
  return <ProfileFormConsumer {...props} context={context} />;
};

export default ProfileForm;
