import React, { useState, useRef } from "react";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useForm, DeepPartial } from "react-hook-form";

import "./DashIssuesPage.scss";
import Field from "../../shared/form/Field";
import NonFieldErrors from "../../shared/form/NonFieldErrors";
import { Issue } from "../../shared/types";
import { RichTable, Column } from "../../shared/components/RichTable";
import { useAPILazyCSRF, useAPI } from "../../api/hooks";
import api from "../../api/api";

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
  if (isNaN(issueNum)) {
    // the issue code is a string, just punt on it
    return {
      volumeNum: undefined,
      issueCode: undefined,
    };
  } else {
    return {
      volumeNum: issueNum <= ISSUES_PER_VOLUME ? volumeNum + 1 : volumeNum,
      issueCode: ((issueNum + 1) % ISSUES_PER_VOLUME).toString(),
    };
  }
};

const columns: Column<Issue>[] = [
  {
    header: "Issue",
    key: "id",
    render(_: any, issue) {
      return (
        <Link
          to={`/dash/issues/${issue.id}`}
        >{`v${issue.volume_num}i${issue.issue_code}`}</Link>
      );
    },
  },
  {
    header: "Published",
    key: "publish_date",
    render(cell) {
      return cell ? "Y" : "N";
    },
  },
  {
    header: "PDF",
    key: "pdf",
    render(cell) {
      return cell || "N/A";
    },
  },
];

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

  const [createIssue] = useAPILazyCSRF(api.issues.create);

  const [nonFieldErrors, setNonFieldErrors] = useState<string[]>([]);

  const closeModal = () => {
    setNonFieldErrors([]);
    props.setShow(false);
  };

  const onSubmit = async (vals: IssueCreateFormVals) => {
    const resp = await createIssue({
      body: { issue_code: vals.issueCode, volume_num: vals.volumeNum },
    });
    if (resp.success) {
      setNonFieldErrors([]);
      history.push(`/dash/issues/${resp.data.id}`);
    } else {
      setNonFieldErrors(resp.error.non_field_errors || []);
    }
  };

  const issueFieldRef = useRef<HTMLInputElement>();

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
              pattern: /[1-9]\d{0,2}/,
              min: 0,
              maxLength: 3,
            })}
            onChange={(e) => {
              if (e.currentTarget.value.length === 3) {
                issueFieldRef.current?.focus();
              }
            }}
            errors={errors}
            hideErrorMessage
          />
          <Form.Label>i</Form.Label>
          <Field
            name="issueCode"
            className="issue-code-input"
            type="text"
            maxLength={1}
            ref={(ref) => {
              const inputRef = ref as HTMLInputElement;
              issueFieldRef.current = inputRef;
              register(inputRef, {
                required: true,
                pattern: /[0-9A-Z]/,
                min: 0,
                maxLength: 1,
              });
            }}
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
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [latestIssue] = useAPI(api.issues.latest);

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
      <RichTable
        columns={columns}
        list={api.issues.list}
        paginated
        searchable
      />
      <IssueCreateModal
        show={showCreateModal}
        setShow={setShowCreateModal}
        latestIssue={latestIssue}
      />
    </>
  );
};

export default DashIssuesPage;
