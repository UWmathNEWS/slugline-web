import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useIssueList, useCreateIssue, useLatestIssue } from "../../api/hooks";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useForm, DeepPartial } from "react-hook-form";

import "./DashIssuesPage.scss";
import Field from "../../shared/form/Field";
import ERRORS from "../../shared/errors";
import { Issue } from "../../shared/types";

interface IssueCreateModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  latestIssue: Issue;
}

interface IssueCreateFormVals {
  issueCode: string;
  volumeNum: number;
}

const ISSUES_PER_VOLUME = 6;

// Attempt to predict the next issue from the latest to prefill the new issue form
const predictNextIssue = (
  volumeNum: number,
  issueCode: string
): DeepPartial<IssueCreateFormVals> => {
  const issueNum = Number(issueCode);
  if (issueNum !== NaN) {
    return {
      volumeNum: issueNum <= ISSUES_PER_VOLUME ? volumeNum + 1 : volumeNum,
      issueCode: ((issueNum + 1) % ISSUES_PER_VOLUME).toString(),
    };
  }
  // the issue code is a string, just punt on it
  else {
    return {
      volumeNum: undefined,
      issueCode: undefined,
    };
  }
};

const IssueCreateModal: React.FC<IssueCreateModalProps> = (
  props: IssueCreateModalProps
) => {
  const { handleSubmit, register, errors } = useForm<IssueCreateFormVals>({
    defaultValues: predictNextIssue(
      props.latestIssue.volume_num,
      props.latestIssue.issue_code
    ),
  });

  const history = useHistory();

  const [createIssue, ,] = useCreateIssue();

  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

  const closeModal = () => {
    setNonFieldErrors([]);
    props.setShow(false);
  };

  const onSubmit = async (vals: IssueCreateFormVals) => {
    const resp = await createIssue({
      issue_code: vals.issueCode,
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
    <Modal show={props.show} onHide={closeModal}>
      <Modal.Header closeButton>Create New Issue</Modal.Header>
      <Modal.Body>
        <Form.Label>Issue Name:</Form.Label>
        <Form id="createIssueForm" onSubmit={handleSubmit(onSubmit)} inline>
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
            name="issueCode"
            className="issue-code-input"
            type="text"
            maxLength={1}
            ref={register({
              required: true,
              pattern: /[0-9A-Z]{1}/,
              min: 0,
              maxLength: 1,
            })}
            errors={errors}
            hideErrorMessage
          />
        </Form>
        <NonFieldErrors errors={nonFieldErrors} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="createIssueForm">
          Create Issue
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const DashIssuesPage = () => {
  const [resp] = useIssueList();

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [latestIssue, ,] = useLatestIssue();

  if (!latestIssue) {
    return <Spinner animation="border" />;
  }

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
        <thead>
          <tr>
            <th>Issue</th>
            <th>Published</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {resp.page?.results.map((issue) => (
            <tr
              key={issue.id}
              className={issue.id === latestIssue.id ? "issue-latest" : ""}
            >
              <td>
                <Link
                  to={`/dash/issues/${issue.id}`}
                >{`v${issue.volume_num}i${issue.issue_code}`}</Link>
              </td>
              <td>{issue.publish_date ? "Y" : "N"}</td>
              <td>{issue.pdf || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <IssueCreateModal
        show={showCreateModal}
        setShow={setShowCreateModal}
        latestIssue={latestIssue}
      />
    </>
  );
};

export default DashIssuesPage;
