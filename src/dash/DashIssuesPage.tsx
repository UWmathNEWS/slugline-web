import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useIssueList } from "../api/hooks";
import { Table } from "react-bootstrap";

const DashIssuesPage = () => {
  const [resp] = useIssueList();

  return (
    <>
      <h1>Issues</h1>
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
            <td>{`v${issue.volume_num}i${issue.issue_num}`}</td>
            <td>{issue.publish_date !== undefined ? "Y" : "N"}</td>
            <td>{issue.pdf || "N/A"}</td>
          </tr>
        ))}
      </Table>
    </>
  );
};

export default DashIssuesPage;
