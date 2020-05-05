import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  useIssueList,
  useCreateArticle,
  useCreateIssue,
} from "../../api/hooks";
import { Table, Button, Modal, Form, Row, FormGroup } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useForm, ErrorMessage } from "react-hook-form";

import "./DashIssuesPage.scss";
import Field from "../../shared/form/Field";
import ERRORS from "../../shared/errors";

interface IssueCreateModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

interface IssueCreateFormVals {
  issueNum: number;
  volumeNum: number;
}

const IssueCreateModal: React.FC<IssueCreateModalProps> = (
  props: IssueCreateModalProps
) => {
  const { triggerValidation, handleSubmit, register, errors } = useForm<
    IssueCreateFormVals
  >();

  const history = useHistory();

  const [createIssue, ,] = useCreateIssue();

  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

  const onSubmit = async (vals: IssueCreateFormVals) => {
    const resp = await createIssue({
      issue_num: vals.issueNum,
      volume_num: vals.volumeNum,
    });
    if (resp.success) {
      setNonFieldErrors([]);
      history.push(`issues/${resp.data.id}`);
    } else {
      setNonFieldErrors(resp.error.non_field_errors || []);
    }
  };

  return (
    <Modal
      show={props.show}
      onHide={() => {
        props.setShow(false);
      }}
    >
      <Modal.Header closeButton>Create New Issue</Modal.Header>
      <Modal.Body>
        <Form
          id="createIssueForm"
          className="create-issue-form"
          onSubmit={handleSubmit(onSubmit)}
          inline
        >
          <Form.Label>v</Form.Label>
          <Field
            name="volumeNum"
            className="volume-num-input"
            type="text"
            maxLength={3}
            ref={register({
              required: true,
              pattern: /[0-9]{3}/,
              min: 0,
              maxLength: 3,
            })}
            errors={errors}
            hideErrorMessage
          />
          <Form.Label>i</Form.Label>
          <Field
            name="issueNum"
            className="issue-num-input"
            type="text"
            maxLength={1}
            ref={register({
              required: true,
              pattern: /[0-9]{1}/,
              min: 0,
              maxLength: 1,
            })}
            errors={errors}
            hideErrorMessage
          />
          {nonFieldErrors?.map((error, idx) => (
            <small key={idx} className="invalid-feedback d-block">
              {error}
            </small>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="createIssueForm">
          Create Issue
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            props.setShow(false);
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DashIssuesPage = () => {
  const [resp] = useIssueList();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  return (
    <>
      <h1>Issues</h1>
      <Button
        variant="primary"
        onClick={() => {
          setShowCreateModal(true);
        }}
      >
        New Issue
      </Button>
      <div className="table-header">
        <FontAwesomeIcon
          onClick={() => {
            if (resp.previous) {
              resp.previous();
            }
          }}
          className="pagination-icon"
          icon="chevron-left"
        />
        <span className="pagination-text">{`${resp.page?.page} / ${resp.page?.num_pages}`}</span>
        <FontAwesomeIcon
          onClick={() => {
            if (resp.next) {
              resp.next();
            }
          }}
          className="pagination-icon"
          icon="chevron-right"
        />
      </div>
      <Table>
        <tr>
          <th>Issue</th>
          <th>Published</th>
          <th>PDF</th>
        </tr>
        {resp.page?.results.map((issue) => (
          <tr>
            <td>
              <Link
                to={`issues/${issue.id}`}
              >{`v${issue.volume_num}i${issue.issue_num}`}</Link>
            </td>
            <td>{issue.publish_date !== undefined ? "Y" : "N"}</td>
            <td>{issue.pdf || "N/A"}</td>
          </tr>
        ))}
      </Table>
      <IssueCreateModal show={showCreateModal} setShow={setShowCreateModal} />
    </>
  );
};

export default DashIssuesPage;
