import React, { useEffect, useState } from "react";
import { User, UserAPIError } from "../shared/types";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { FormContextValues, useForm } from "react-hook-form";
import Field from "../shared/form/Field";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import nanoid from "nanoid";
import { cleanFormData, setServerErrors } from "../shared/form/util";
import { useDebouncedCallback } from "../shared/hooks";
import NonFieldErrors from "../shared/form/NonFieldErrors";
import api from "../api/api";
import { useAuth } from "../auth/Auth";

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
  const context = useForm<ProfileFormVals>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    validateCriteriaMode: "all",
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      is_editor: false,
      writer_name: "",
      cur_password: "",
      password: "",
    },
  });

  const { reset } = context;

  useEffect(() => {
    reset({
      username: user?.username,
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      is_editor: user?.is_editor || false,
      writer_name: user?.writer_name,
      cur_password: "",
      password: "",
    });
  }, [user, reset]);

  return context;
};

const validateUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const resp = await api.users.query({ username: username });
  return resp.success;
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

  const { register } = props.context;

  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const [generalErrors, setGeneralErrors] = useState<string[] | undefined>(
    undefined
  );

  // manually register the is_editor field since we handle it with a select
  useEffect(() => {
    register({
      name: "is_editor",
    });
  }, [register]);

  // we need a new password if we're creating a new user
  const newPasswordRequired = props.user === undefined;
  // require confirm if we're creating a new editor or changing password/role
  const passwordConfirmRequired =
    (newPasswordRequired && props.context.getValues().is_editor) ||
    (props.user &&
      (props.context.getValues().password ||
        props.context.getValues().is_editor !== props.user?.is_editor));

  const [validateUserNameDebounced] = useDebouncedCallback(
    validateUsernameAvailable,
    250
  );

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const submit = async (vals: ProfileFormVals) => {
    const cleaned = cleanFormData(vals);

    const editingMe = props.user?.username === auth.user?.username;
    if (props.user === undefined) {
      const resp = await api.users.create({
        body: cleaned,
        csrf: auth.csrfToken || "",
      });
      return resp;
    } else {
      const resp = await (editingMe
        ? await api.me.patch({ body: cleaned, csrf: auth.csrfToken || "" })
        : await api.users.patch({
            id: props.user.username,
            body: cleaned,
            csrf: auth.csrfToken || "",
          }));
      return resp;
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
      <NonFieldErrors errors={generalErrors || []} />
      <Form
        id={props.formId}
        onSubmit={props.context.handleSubmit(async (vals) => {
          const resp = await submit(vals);
          if (resp.success) {
            setSuccessMessage(
              props.user
                ? `User ${vals.username} saved successfully.`
                : `User ${vals.username} created successfully.`
            );
            setGeneralErrors(undefined);
            setShowPassword(false);
            if (props.onSubmitSuccessful) {
              await props.onSubmitSuccessful(vals);
            }
            props.context.reset();
          } else {
            setServerErrors(props.context, resp.error);
            setSuccessMessage(undefined);
            setGeneralErrors(resp.error.detail);
            if (props.onSubmitFailed) {
              await props.onSubmitFailed(vals, resp.error);
            }
          }
        })}
      >
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
                  if (
                    username.length &&
                    !(await validateUserNameDebounced(username))
                  ) {
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
              placeholder="Last Name (optional)"
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
                custom
              >
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
              </Form.Control>
            </Col>
          </Form.Group>
        )}
        <Form.Group as={Form.Row} controlId="password">
          <Form.Label column sm={2}>
            New Password
          </Form.Label>
          <Col sm={10}>
            <Form.Row>
              <Col sm="auto">
                <Button
                  className="w-100"
                  variant="secondary"
                  onClick={() => {
                    props.context.setValue("password", nanoid(), true);
                    // set the password visible so you can see what you get
                    setShowPassword(true);
                  }}
                >
                  Generate
                </Button>
              </Col>
              <Col>
                <Field
                  errors={props.context.errors}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  ref={props.context.register({
                    minLength: {
                      value: 8,
                      message: "USER.PASSWORD.TOO_SHORT.8",
                    },
                    required: newPasswordRequired
                      ? "USER.PASSWORD.NEW_REQUIRED"
                      : undefined,
                    validate: (password?: string) => {
                      // the pattern argument doesn't let us return an error if the value FAILS a regex,
                      // so we'll do it ourselves
                      if (password && /^\d*$/.test(password)) {
                        return "USER.PASSWORD.ENTIRELY_NUMERIC";
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
            </Form.Row>
          </Col>
        </Form.Group>
        {passwordConfirmRequired && (
          <>
            <hr />
            <Form.Group>
              <Form.Label>Confirm with your password to save:</Form.Label>
              <Field
                errors={props.context.errors}
                type="password"
                name="cur_password"
                ref={props.context.register({
                  required: passwordConfirmRequired
                    ? "USER.PASSWORD.CURRENT_REQUIRED"
                    : undefined,
                })}
                onChange={() => {
                  props.context.triggerValidation("cur_password");
                }}
              />
            </Form.Group>
          </>
        )}
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
